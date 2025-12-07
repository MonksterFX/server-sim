import type { BaseNode } from "./base";

/**
 * Represents a connection between two nodes in the game flow. Always in the direction of the request
 */
export class Connection {
    from: BaseNode;
    to: BaseNode;

    constructor(from: BaseNode, to: BaseNode) {
        // TODO: check if notes are connectable
        
        this.from = from;
        this.to = to;
    }
}