import { Network, Producer } from "@server-sim/simulation";
import type { BaseNode } from "@server-sim/simulation/flow/network/base";
import { ApiRequest } from "@server-sim/simulation/flow/network/request";

export class Szenario{
    readonly name: string;
    readonly description: string
    readonly network: Network;

    readonly availableNodes: BaseNode[] = [];

    constructor(name: string, description: string, availableNodes: BaseNode[], initialNetwork?: Network){
        this.name = name;
        this.description = description;
        // Producer requires at least one request type
        this.network = initialNetwork ?? Network.create(new Producer([ApiRequest]), []);
        this.availableNodes = availableNodes;
    }  
}