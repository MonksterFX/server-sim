import { Editor } from "./editor";
import { NetworkAdapter } from "./adapter";
import { Network, Producer } from "../../game/flow";
import type { BaseNode } from "../../game/flow/network/base";
import { Node } from "../../game/flow/network/node";
import { Consumer } from "../../game/flow/network/consumer";

/**
 * Example integration of the editor with a Network.
 * This demonstrates how to wire up the abstract editor to the simulation.
 */
export function createEditorExample(container: HTMLElement): { editor: Editor; adapter: NetworkAdapter } {
  // Create editor
  const editor = new Editor(container, { cellSize: 40 });

  // Create network (starting with just a root producer)
  const root = new Producer([]);
  const network = Network.create(root, []);

  // Create node factory function
  // This maps editor node types to BaseNode instances
  const nodeFactory = (type?: string): BaseNode => {
    switch (type) {
      case "producer":
        return new Producer([]);
      case "node":
        return new Node([], []);
      case "consumer":
        return new Consumer([]);
      default:
        // Default to Node if type not specified
        return new Node([], []);
    }
  };

  // Create adapter to link editor and network
  const adapter = new NetworkAdapter(editor, network, nodeFactory);

  return { editor, adapter };
}

