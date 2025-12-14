import { Editor } from "./editor";
import { createEditorNode } from "./editorNode";
import type { EditorNode } from "./types";
import type { Network } from "../../game/flow";
import type { BaseNode } from "../../game/flow/network/base";
import { Connection } from "../../game/flow/network/connection";

/**
 * Adapter that links the abstract Editor to the simulation Network.
 * Handles bidirectional mapping and synchronization between EditorNodes and BaseNodes.
 */
export class NetworkAdapter {
  // Bidirectional mapping
  private editorNodeMap: Map<string, BaseNode> = new Map(); // editor ID → simulation node
  private baseNodeMap: Map<BaseNode, string> = new Map(); // simulation node → editor ID

  private editor: Editor;
  private network: Network;
  private nodeFactory?: (type?: string) => BaseNode;

  /**
   * Creates a new NetworkAdapter
   * @param editor The editor instance to link
   * @param network The network instance to link
   * @param nodeFactory Optional factory function to create BaseNode instances from editor node type
   */
  constructor(
    editor: Editor,
    network: Network,
    nodeFactory?: (type?: string) => BaseNode
  ) {
    this.editor = editor;
    this.network = network;
    this.nodeFactory = nodeFactory;

    // Wire up editor callbacks
    this.setupEditorCallbacks();

    // Initial sync from network to editor
    this.syncNetworkToEditor();
  }

  /**
   * Sets up editor callbacks to sync changes to network
   */
  private setupEditorCallbacks(): void {
    this.editor.onNodeCreated = (id: string, x: number, y: number) => {
      this.handleNodeCreated(id, x, y);
    };

    this.editor.onNodeMoved = (id: string, x: number, y: number) => {
      // Position changes don't affect network, but we can handle them if needed
      // For now, positions are editor-only
    };

    this.editor.onNodeDeleted = (id: string) => {
      this.handleNodeDeleted(id);
    };

    this.editor.onConnectionCreated = (fromId: string, toId: string) => {
      return this.handleConnectionCreated(fromId, toId);
    };

    this.editor.onConnectionDeleted = (connectionId: string) => {
      this.handleConnectionDeleted(connectionId);
    };
  }

  /**
   * Handles node creation in editor
   */
  private handleNodeCreated(id: string, x: number, y: number): void {
    if (this.editorNodeMap.has(id)) {
      // Node already mapped, skip
      return;
    }

    // Create BaseNode instance using factory
    if (!this.nodeFactory) {
      console.warn("No node factory provided, cannot create simulation node");
      return;
    }

    const editorNode = this.editor.nodes.get(id);
    const baseNode = this.nodeFactory(editorNode?.type);

    if (!baseNode) {
      console.warn("Node factory returned null, cannot create simulation node");
      return;
    }

    // Link nodes
    this.linkEditorNodeToBaseNode(id, baseNode);

    // Add to network
    this.network.addNode(baseNode);
  }

  /**
   * Handles node deletion in editor
   */
  private handleNodeDeleted(id: string): void {
    const baseNode = this.editorNodeMap.get(id);
    if (baseNode) {
      // Remove from network (this will clean up connections)
      // Note: Network doesn't have a removeNode method, so we may need to handle this differently
      // For now, we'll just remove the mapping
      this.unlinkEditorNode(id);
    }
  }

  /**
   * Handles connection creation in editor
   */
  private handleConnectionCreated(fromId: string, toId: string): string {
    const fromBaseNode = this.editorNodeMap.get(fromId);
    const toBaseNode = this.editorNodeMap.get(toId);

    if (!fromBaseNode || !toBaseNode) {
      throw new Error("Cannot create connection: one or both nodes are not linked to BaseNodes");
    }

    // Create connection in network
    this.network.connect(fromBaseNode, toBaseNode);

    // Find the connection ID (network creates Connection, but we need to map it back)
    // Since Connection doesn't have an ID, we'll use a generated ID
    const connectionId = this.generateConnectionId(fromId, toId);
    return connectionId;
  }

  /**
   * Handles connection deletion in editor
   */
  private handleConnectionDeleted(connectionId: string): void {
    const connection = this.editor.connections.get(connectionId);
    if (!connection) return;

    const fromBaseNode = this.editorNodeMap.get(connection.fromId);
    const toBaseNode = this.editorNodeMap.get(connection.toId);

    if (!fromBaseNode || !toBaseNode) return;

    // Find and remove connection in network
    for (const conn of fromBaseNode.outgoingConnections) {
      if (conn.to === toBaseNode) {
        conn.remove();
        break;
      }
    }
  }

  /**
   * Links an EditorNode to a BaseNode
   */
  linkEditorNodeToBaseNode(editorId: string, baseNode: BaseNode): void {
    this.editorNodeMap.set(editorId, baseNode);
    this.baseNodeMap.set(baseNode, editorId);
  }

  /**
   * Unlinks an EditorNode from its BaseNode
   */
  private unlinkEditorNode(editorId: string): void {
    const baseNode = this.editorNodeMap.get(editorId);
    if (baseNode) {
      this.editorNodeMap.delete(editorId);
      this.baseNodeMap.delete(baseNode);
    }
  }

  /**
   * Gets the BaseNode linked to an editor ID
   */
  getBaseNode(editorId: string): BaseNode | undefined {
    return this.editorNodeMap.get(editorId);
  }

  /**
   * Gets the editor ID linked to a BaseNode
   */
  getEditorId(baseNode: BaseNode): string | undefined {
    return this.baseNodeMap.get(baseNode);
  }

  /**
   * Syncs editor state to network (applies editor changes to network)
   * This is called automatically via callbacks, but can be called manually if needed
   */
  syncEditorToNetwork(): void {
    // This is handled via callbacks, but we can add manual sync logic here if needed
  }

  /**
   * Syncs network state to editor (applies network changes to editor)
   */
  syncNetworkToEditor(): void {
    // Clear existing mappings (or preserve them?)
    // For now, we'll preserve existing mappings and only add new nodes

    const networkNodes = this.network.getNodes();

    for (const baseNode of networkNodes) {
      const existingEditorId = this.baseNodeMap.get(baseNode);

      if (!existingEditorId) {
        // Create editor node for this base node
        const editorId = this.generateEditorId(baseNode);
        const editorNode = createEditorNode(
          editorId,
          100, // Default position
          100, // Default position
          baseNode.name,
          String(baseNode.type)
        );

        this.editor.addNode(editorNode);
        this.linkEditorNodeToBaseNode(editorId, baseNode);
      } else {
        // Update existing editor node if needed
        const editorNode = this.editor.nodes.get(existingEditorId);
        if (editorNode) {
          editorNode.label = baseNode.name;
          editorNode.type = String(baseNode.type);
        }
      }
    }

    // Sync connections
    for (const baseNode of networkNodes) {
      const fromEditorId = this.baseNodeMap.get(baseNode);
      if (!fromEditorId) continue;

      for (const conn of baseNode.outgoingConnections) {
        const toEditorId = this.baseNodeMap.get(conn.to);
        if (!toEditorId) continue;

        // Check if connection already exists in editor
        let connectionExists = false;
        for (const editorConn of this.editor.connections.values()) {
          if (editorConn.fromId === fromEditorId && editorConn.toId === toEditorId) {
            connectionExists = true;
            break;
          }
        }

        if (!connectionExists) {
          this.editor.addConnection(fromEditorId, toEditorId);
        }
      }
    }

    this.editor.render();
  }

  /**
   * Generates an editor ID from a BaseNode
   */
  private generateEditorId(baseNode: BaseNode): string {
    return `editor-${baseNode.id}`;
  }

  /**
   * Generates a connection ID from node IDs
   */
  private generateConnectionId(fromId: string, toId: string): string {
    return `conn-${fromId}-${toId}`;
  }
}

