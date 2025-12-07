import { BaseNode } from "./base";

export class Consumer extends BaseNode {
    readonly type = 'consumer';

    constructor(consumes: Networking.ConnectionType[]){
        super()
        this.consumes = new Set(consumes)
    }

    // consumers do not process outgoing requests
    processOutgoing(tick: Engine.Tick): void {
        // TODO: score logic
        this.requests.clear()
    }
}