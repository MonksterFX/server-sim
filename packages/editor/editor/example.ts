import { Editor } from "./editor";
import { NetworkAdapter } from "./adapter";
import { Network, Producer } from "../../game/flow";
import type { BaseNode } from "../../game/flow/network/base";
import { Node } from "../../game/flow/network/node";
import { Consumer } from "../../game/flow/network/consumer";
import { ApiRequest } from "../../game/flow/network/request";

/**
 * Example integration of the editor with a Network.
 * This demonstrates how to wire up the abstract editor to the simulation.
 */
export function createEditorExample(container: HTMLElement): { editor: Editor; adapter: NetworkAdapter } {
  // Create editor
  const editor = new Editor(container, { cellSize: 40 });

  // Create network (starting with just a root producer)
  // Producer requires at least one request type, using ApiRequest as default
  const root = new Producer([ApiRequest]);
  const network = Network.create(root, []);

  // Create node factory function
  // This maps editor node types to BaseNode instances
  // All nodes need at least one request type to function properly
  const nodeFactory = (type?: string): BaseNode => {
    switch (type) {
      case "producer":
        // Producer must have at least one produces type
        return new Producer([ApiRequest]);
      case "node":
        // Node needs at least one consumes and one produces type
        return new Node([ApiRequest], [ApiRequest]);
      case "consumer":
        // Consumer needs at least one consumes type
        return new Consumer([ApiRequest]);
      default:
        // Default to Node if type not specified
        return new Node([ApiRequest], [ApiRequest]);
    }
  };

  // Create adapter to link editor and network
  const adapter = new NetworkAdapter(editor, network, nodeFactory);

  return { editor, adapter };
}

