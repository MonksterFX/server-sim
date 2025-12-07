import { BaseNode } from "./base";
import { randomSelectWeighted } from "../../utils";

export class Producer extends BaseNode {
    readonly type = 'producer';

    // produces instantly process requests
    calcRequestProcessingTime = () => 0

    /**
     *  Generates a specified number of requests using the provided constructors and optional weights.
     * @param tick The current engine tick.
     * @param numberOfRequest The number of requests to generate.
     * @param constructors An array of request constructors.
     * @param weights Optional weights for selecting constructors.          
     */
    generate(tick: Engine.Tick, numberOfRequest: number, constructors: CTOR<Networking.Request>[], weights?: number[]){
        
        // assertions
        if(constructors.length === 0) throw new Error('there must be at least one request constructor')
        if(weights && weights.length !== constructors.length) throw new Error('weights length must match constructors length')

        const _weights = weights || Array(constructors.length).fill(1);

        for(let a = 0; a < numberOfRequest; a++){
            const selected = randomSelectWeighted(constructors, _weights)
            const req = new selected()
            this.processIngoing(tick, req)
        }
    }
}