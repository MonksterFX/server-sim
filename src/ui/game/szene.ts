import { Network, Producer } from "../../game/flow";
import type { BaseNode } from "../../game/flow/network/base";

export class Szenario{
    readonly name: string;
    readonly description: string
    readonly network: Network;

    readonly availableNodes: BaseNode[] = [];

    constructor(name: string, description: string, availableNodes: BaseNode[], initialNetwork?: Network){
        this.name = name;
        this.description = description;
        this.network = initialNetwork ?? Network.create(new Producer(), []);
        this.availableNodes = availableNodes;
    }  
}