import { BaseNode } from "./base";

export class Consumer extends BaseNode {
    readonly type = 'consumer';

    constructor(consumes: CTOR<Networking.Request>[]){
        super()
        consumes.forEach(type => this.consumes.add(type))
    }

    // consumers do not process outgoing requests
    processOutgoing(tick: Engine.Tick): void {
        // TODO: score logic
        this.requestCount += this.requests.getSize();
        this.requests.clear()
    }
}