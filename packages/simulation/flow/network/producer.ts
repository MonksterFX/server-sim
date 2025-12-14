import { BaseNode } from "./base";
import { randomSelectWeighted } from "../../utils";

export class Producer extends BaseNode {
    readonly type = 'producer';

    constructor(produces: CTOR<Networking.Request>[]){
        super()
        produces.forEach(type => this.produces.add(type))
    }

    // produces instantly process requests
    calcRequestProcessingTime = () => 0

    /**
     *  Generates a specified number of requests using the provided constructors and optional weights.
     * @param tick The current engine tick.
     * @param numberOfRequest The number of requests to generate.
     * @param weights Optional weights for selecting constructors.          
     */
    generate(tick: Engine.Tick, numberOfRequest: number, weights?: number[]){
        
        // assertions
        if(this.produces.size === 0) throw new Error('there must be at least one request constructor')
        if(weights && weights.length !== this.produces.size) throw new Error('weights length must match constructors length')

        const _weights = weights || Array(this.produces.size).fill(1);

        for(let a = 0; a < numberOfRequest; a++){
            const selected = randomSelectWeighted(Array.from(this.produces), _weights)
            const req = new selected()
            this.processIngoing(tick, req)
        }
    }
}