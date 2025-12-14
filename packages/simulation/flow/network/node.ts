import { BaseNode } from "./base";

export class Node extends BaseNode {
    readonly type = 'node'

    constructor(consumes: CTOR<Networking.Request>[], produces: CTOR<Networking.Request>[]){
        super()
        consumes.forEach(type => this.consumes.add(type))
        produces.forEach(type => this.produces.add(type))
    }
}