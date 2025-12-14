import type { EditorNode, EditorConnection } from "./types";
import { createEditorNode } from "./editorNode";
import { createEditorConnection } from "./editorConnection";
import { snapToGrid, createGridPattern, type GridConfig, DEFAULT_GRID_CONFIG } from "./grid";

/**
 * Abstract node editor that is completely decoupled from simulation.
 * Works with generic EditorNode and EditorConnection entities.
 */
export class Editor {
  private container: HTMLElement;
  private svg: SVGElement;
  private defs: SVGDefsElement;
  private gridLayer: SVGGElement;
  private connectionsLayer: SVGGElement;
  private nodesLayer: SVGGElement;

  // State
  nodes: Map<string, EditorNode> = new Map();
  connections: Map<string, EditorConnection> = new Map();
  private selectedNodeId: string | null = null;
  private connectionMode: boolean = false;
  private deleteMode: boolean = false;
  private gridConfig: GridConfig = DEFAULT_GRID_CONFIG;

  // Dragging state
  private draggingNodeId: string | null = null;
  private dragOffset: { x: number; y: number } | null = null;

  // Callbacks (for decoupling)
  onNodeCreated?: (id: string, x: number, y: number) => void;
  onNodeMoved?: (id: string, x: number, y: number) => void;
  onNodeDeleted?: (id: string) => void;
  onConnectionCreated?: (fromId: string, toId: string) => string;
  onConnectionDeleted?: (connectionId: string) => void;
  onNodeSelected?: (id: string | null) => void;

  /**
   * Creates a new Editor instance
   * @param container HTML element to mount the editor
   * @param gridConfig Optional grid configuration
   */
  constructor(container: HTMLElement, gridConfig?: GridConfig) {
    this.container = container;
    if (gridConfig) {
      this.gridConfig = gridConfig;
    }

    // Create SVG structure
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("viewBox", "0 0 1000 800");
    this.svg.style.cursor = "default";

    // Create layers
    this.defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    this.gridLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.gridLayer.setAttribute("id", "grid-layer");
    this.connectionsLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.connectionsLayer.setAttribute("id", "connections-layer");
    this.nodesLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.nodesLayer.setAttribute("id", "nodes-layer");

    // Add grid pattern to defs
    this.defs.innerHTML = createGridPattern(this.gridConfig);

    // Add background with grid pattern
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", "url(#grid)");
    this.gridLayer.appendChild(background);

    // Assemble SVG
    this.svg.appendChild(this.defs);
    this.svg.appendChild(this.gridLayer);
    this.svg.appendChild(this.connectionsLayer);
    this.svg.appendChild(this.nodesLayer);

    // Mount to container
    this.container.appendChild(this.svg);

    // Setup event handlers
    this.setupEventHandlers();

    // Initial render
    this.render();
  }

  /**
   * Sets up event handlers for user interactions
   */
  private setupEventHandlers(): void {
    // Click handler for placing nodes and selecting/connecting
    this.svg.addEventListener("click", (e) => this.handleClick(e));

    // Mouse down for dragging
    this.svg.addEventListener("mousedown", (e) => this.handleMouseDown(e));

    // Mouse move for dragging
    this.svg.addEventListener("mousemove", (e) => this.handleMouseMove(e));

    // Mouse up for dragging
    this.svg.addEventListener("mouseup", () => this.handleMouseUp());

    // Prevent context menu on right click (could be used for delete later)
    this.svg.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }

  /**
   * Handles click events on the SVG
   */
  private handleClick(e: MouseEvent): void {
    if (this.draggingNodeId !== null) {
      // Don't trigger click if we were dragging
      return;
    }

    const point = this.getSVGPoint(e);
    const clickedNode = this.getNodeAtPoint(point.x, point.y);

    if (clickedNode) {
      this.handleNodeClick(clickedNode);
    } else {
      this.handleEmptyClick(point);
    }
  }

  /**
   * Handles click on a node
   */
  private handleNodeClick(nodeId: string): void {
    if (this.deleteMode) {
      // Delete the node
      this.removeNode(nodeId);
      return;
    }

    if (this.connectionMode && this.selectedNodeId && this.selectedNodeId !== nodeId) {
      // Create connection
      this.addConnection(this.selectedNodeId, nodeId);
      this.connectionMode = false;
      this.selectedNodeId = null;
      if (this.onNodeSelected) {
        this.onNodeSelected(null);
      }
    } else {
      // Select node
      this.selectedNodeId = nodeId;
      this.connectionMode = true;
      if (this.onNodeSelected) {
        this.onNodeSelected(nodeId);
      }
      this.render();
    }
  }

  /**
   * Handles click on empty space
   */
  private handleEmptyClick(point: { x: number; y: number }): void {
    // Exit connection mode and delete mode
    if (this.connectionMode) {
      this.connectionMode = false;
      this.selectedNodeId = null;
      if (this.onNodeSelected) {
        this.onNodeSelected(null);
      }
      this.render();
      return;
    }

    if (this.deleteMode) {
      // Check if clicked on a connection
      const clickedConnection = this.getConnectionAtPoint(point.x, point.y);
      if (clickedConnection) {
        this.removeConnection(clickedConnection);
      }
      return;
    }

    // Create new node at clicked position
    const [snappedX, snappedY] = snapToGrid(point.x, point.y, this.gridConfig);
    if (this.onNodeCreated) {
      this.onNodeCreated(this.generateId(), snappedX, snappedY);
    }
  }

  /**
   * Handles mouse down for dragging nodes
   */
  private handleMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return; // Only left mouse button

    const point = this.getSVGPoint(e);
    const nodeId = this.getNodeAtPoint(point.x, point.y);

    if (nodeId) {
      const node = this.nodes.get(nodeId);
      if (node) {
        this.draggingNodeId = nodeId;
        this.dragOffset = {
          x: point.x - node.x,
          y: point.y - node.y,
        };
        this.svg.style.cursor = "grabbing";
      }
    }
  }

  /**
   * Handles mouse move for dragging nodes
   */
  private handleMouseMove(e: MouseEvent): void {
    if (this.draggingNodeId && this.dragOffset) {
      const point = this.getSVGPoint(e);
      const targetX = point.x - this.dragOffset.x;
      const targetY = point.y - this.dragOffset.y;
      const [snappedX, snappedY] = snapToGrid(targetX, targetY, this.gridConfig);

      this.moveNode(this.draggingNodeId, snappedX, snappedY);
    }
  }

  /**
   * Handles mouse up for ending drag
   */
  private handleMouseUp(): void {
    if (this.draggingNodeId) {
      this.draggingNodeId = null;
      this.dragOffset = null;
      this.svg.style.cursor = "default";
    }
  }

  /**
   * Gets SVG point from mouse event
   */
  private getSVGPoint(e: MouseEvent): { x: number; y: number } {
    const rect = this.svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert to SVG coordinates
    const viewBoxAttr = this.svg.getAttribute("viewBox");
    let scaleX = 1;
    let scaleY = 1;
    
    if (viewBoxAttr) {
      const [, , width, height] = viewBoxAttr.split(" ").map(Number);
      scaleX = width / rect.width;
      scaleY = height / rect.height;
    }

    return {
      x: clientX * scaleX,
      y: clientY * scaleY,
    };
  }

  /**
   * Gets node ID at the given point, if any
   */
  private getNodeAtPoint(x: number, y: number): string | null {
    const NODE_SIZE = 60;
    const halfSize = NODE_SIZE / 2;

    for (const [id, node] of this.nodes.entries()) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx >= -halfSize && dx <= halfSize && dy >= -halfSize && dy <= halfSize) {
        return id;
      }
    }
    return null;
  }

  /**
   * Adds a node to the editor
   */
  addNode(node: EditorNode): void {
    this.nodes.set(node.id, node);
    this.render();
  }

  /**
   * Removes a node from the editor (and its connections)
   */
  removeNode(id: string): void {
    // Remove all connections involving this node
    const connectionsToRemove: string[] = [];
    for (const [connId, conn] of this.connections.entries()) {
      if (conn.fromId === id || conn.toId === id) {
        connectionsToRemove.push(connId);
      }
    }
    for (const connId of connectionsToRemove) {
      this.removeConnection(connId);
    }

    this.nodes.delete(id);
    if (this.selectedNodeId === id) {
      this.selectedNodeId = null;
      this.connectionMode = false;
    }
    if (this.onNodeDeleted) {
      this.onNodeDeleted(id);
    }
    this.render();
  }

  /**
   * Moves a node to a new position
   */
  moveNode(id: string, x: number, y: number): void {
    const node = this.nodes.get(id);
    if (node) {
      node.x = x;
      node.y = y;
      if (this.onNodeMoved) {
        this.onNodeMoved(id, x, y);
      }
      this.render();
    }
  }

  /**
   * Sets node position (for external updates)
   */
  setNodePosition(id: string, x: number, y: number): void {
    const node = this.nodes.get(id);
    if (node) {
      node.x = x;
      node.y = y;
      this.render();
    }
  }

  /**
   * Adds a connection between two nodes
   */
  addConnection(fromId: string, toId: string): string {
    // Check if nodes exist
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) {
      throw new Error("Cannot create connection: one or both nodes do not exist");
    }

    // Check if connection already exists
    for (const conn of this.connections.values()) {
      if (conn.fromId === fromId && conn.toId === toId) {
        return conn.id; // Return existing connection ID
      }
    }

    // Generate connection ID
    let connectionId: string;
    if (this.onConnectionCreated) {
      connectionId = this.onConnectionCreated(fromId, toId);
    } else {
      connectionId = this.generateId();
    }

    const connection = createEditorConnection(connectionId, fromId, toId);
    this.connections.set(connectionId, connection);
    this.render();
    return connectionId;
  }

  /**
   * Removes a connection
   */
  removeConnection(id: string): void {
    this.connections.delete(id);
    if (this.onConnectionDeleted) {
      this.onConnectionDeleted(id);
    }
    this.render();
  }

  /**
   * Renders all editor elements
   */
  render(): void {
    this.renderConnections();
    this.renderNodes();
  }

  /**
   * Renders connection paths
   */
  private renderConnections(): void {
    // Clear existing connections
    this.connectionsLayer.innerHTML = "";

    // Render each connection
    for (const connection of this.connections.values()) {
      const fromNode = this.nodes.get(connection.fromId);
      const toNode = this.nodes.get(connection.toId);

      if (!fromNode || !toNode) continue;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`;
      path.setAttribute("d", d);
      path.setAttribute("stroke", "#646cff");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");
      path.setAttribute("marker-end", "url(#arrowhead)");

      this.connectionsLayer.appendChild(path);
    }

    // Add arrowhead marker if connections exist
    if (this.connections.size > 0) {
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
      marker.setAttribute("id", "arrowhead");
      marker.setAttribute("markerWidth", "10");
      marker.setAttribute("markerHeight", "10");
      marker.setAttribute("refX", "9");
      marker.setAttribute("refY", "3");
      marker.setAttribute("orient", "auto");

      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", "0 0, 10 3, 0 6");
      polygon.setAttribute("fill", "#646cff");

      marker.appendChild(polygon);
      this.defs.appendChild(marker);
    }
  }

  /**
   * Renders all nodes
   */
  private renderNodes(): void {
    // Clear existing nodes
    this.nodesLayer.innerHTML = "";

    const NODE_SIZE = 60;
    const NODE_RADIUS = NODE_SIZE / 2;

    // Render each node
    for (const [id, node] of this.nodes.entries()) {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("id", `node-${id}`);

      // Node circle/rectangle
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", (node.x - NODE_RADIUS).toString());
      rect.setAttribute("y", (node.y - NODE_RADIUS).toString());
      rect.setAttribute("width", NODE_SIZE.toString());
      rect.setAttribute("height", NODE_SIZE.toString());
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");

      // Style based on selection
      if (id === this.selectedNodeId) {
        rect.setAttribute("fill", "#646cff");
        rect.setAttribute("stroke", "#535bf2");
        rect.setAttribute("stroke-width", "3");
      } else {
        rect.setAttribute("fill", "#1a1a1a");
        rect.setAttribute("stroke", "#646cff");
        rect.setAttribute("stroke-width", "2");
      }

      group.appendChild(rect);

      // Node label
      if (node.label) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", node.x.toString());
        text.setAttribute("y", (node.y + 5).toString());
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#ffffff");
        text.setAttribute("font-size", "12");
        text.setAttribute("font-family", "system-ui, sans-serif");
        text.textContent = node.label;
        group.appendChild(text);
      } else {
        // Default label with node ID
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", node.x.toString());
        text.setAttribute("y", (node.y + 5).toString());
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#ffffff");
        text.setAttribute("font-size", "12");
        text.setAttribute("font-family", "system-ui, sans-serif");
        text.textContent = id.substring(0, 8);
        group.appendChild(text);
      }

      // Make node interactive
      rect.style.cursor = "grab";

      this.nodesLayer.appendChild(group);
    }
  }

  /**
   * Generates a unique ID
   */
  private generateId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets the currently selected node ID
   */
  getSelectedNodeId(): string | null {
    return this.selectedNodeId;
  }

  /**
   * Creates a new node at the specified position
   * @param x X coordinate in pixels
   * @param y Y coordinate in pixels
   * @param label Optional node label
   * @param type Optional node type
   * @returns The ID of the created node
   */
  createNodeAt(x: number, y: number, label?: string, type?: string): string {
    const [snappedX, snappedY] = snapToGrid(x, y, this.gridConfig);
    const id = this.generateId();
    const node = createEditorNode(id, snappedX, snappedY, label, type);
    this.addNode(node);
    if (this.onNodeCreated) {
      this.onNodeCreated(id, snappedX, snappedY);
    }
    return id;
  }

  /**
   * Deletes the currently selected node
   */
  deleteSelectedNode(): void {
    if (this.selectedNodeId) {
      this.removeNode(this.selectedNodeId);
      this.selectedNodeId = null;
      this.connectionMode = false;
      if (this.onNodeSelected) {
        this.onNodeSelected(null);
      }
    }
  }

  /**
   * Sets the connection mode
   */
  setConnectionMode(enabled: boolean): void {
    this.connectionMode = enabled;
    this.deleteMode = false;
    if (!enabled) {
      this.selectedNodeId = null;
      if (this.onNodeSelected) {
        this.onNodeSelected(null);
      }
    }
    this.render();
  }

  /**
   * Sets the delete mode
   */
  setDeleteMode(enabled: boolean): void {
    this.deleteMode = enabled;
    this.connectionMode = false;
    if (enabled) {
      this.selectedNodeId = null;
      if (this.onNodeSelected) {
        this.onNodeSelected(null);
      }
    }
    this.render();
  }

  /**
   * Checks if connection mode is active
   */
  isConnectionMode(): boolean {
    return this.connectionMode;
  }

  /**
   * Checks if delete mode is active
   */
  isDeleteMode(): boolean {
    return this.deleteMode;
  }

  /**
   * Gets the connection at a given point, if any
   */
  private getConnectionAtPoint(x: number, y: number): string | null {
    const CONNECTION_HIT_TOLERANCE = 5; // pixels

    for (const [connId, connection] of this.connections.entries()) {
      const fromNode = this.nodes.get(connection.fromId);
      const toNode = this.nodes.get(connection.toId);

      if (!fromNode || !toNode) continue;

      // Calculate distance from point to line segment
      const distance = this.pointToLineDistance(
        x,
        y,
        fromNode.x,
        fromNode.y,
        toNode.x,
        toNode.y
      );

      if (distance <= CONNECTION_HIT_TOLERANCE) {
        return connId;
      }
    }
    return null;
  }

  /**
   * Calculates the distance from a point to a line segment
   */
  private pointToLineDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx: number, yy: number;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

