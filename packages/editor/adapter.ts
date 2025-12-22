import type { BaseNode, Connection } from "@server-sim/simulation";

export abstract class EditorNetworkAdapter {
    abstract getNodes(): BaseNode[];
    abstract createNode(type: string): void;
    abstract deleteNode(id: string): void;
    
    abstract getConnections(): Connection[];
    abstract isConnectable(fromId: string, toId: string): boolean;
    abstract createConnection(fromId: string, toId: string): void;
    abstract deleteConnection(id: string): void;
}