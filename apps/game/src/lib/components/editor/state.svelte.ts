import type { Edge, Node } from "@xyflow/svelte";

export default class EditorState {
  private _node = [
    {
      id: "1",
      position: { x: 0, y: 0 },
      data: { label: "Producer" },
      type: "producer",
    },
    {
      id: "2",
      position: { x: 100, y: 100 },
      data: { label: "BaseNode" },
      type: "base",
    },
    {
      id: "3",
      position: { x: 200, y: 200 },
      data: { label: "Consumer" },
      type: "consumer",
    },
  ];  

  private _edges: Edge[] = [];

  nodes = $state.raw<Node[]>(this._node);

  edges = $state.raw<Edge[]>(this._edges);

  addNode(node: Node) {
    this.nodes = [...this.nodes, node];
  }

  addEdge(edge: Edge) {
    this.edges = [...this.edges, edge];
  }

  saveState() {
    throw new Error("not implemented");
  }

  loadState(key: unknown) {
    throw new Error("not implemented");
  }
}
