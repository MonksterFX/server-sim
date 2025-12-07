import type { Network } from "./flow";

export default class Game {
    private _currentTick: Engine.Tick = 0;
    tickRate: number = 100 // how many ms per tick

    private loopTimer?: number;

    get currentTick(){
        return this._currentTick;
    }

    start(network: Network) {
        this.gameLoop(network)
    }

    stop() {
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = undefined;
        }
    }
    
    simulate(network: Network, ticks: number) {
        for (let i = 0; i < ticks; i++) {       
            for (const node of network.iterateNodes()) {
                node.processOutgoing(this.currentTick);
            }
            this._currentTick += this.tickRate;
        }
    }

    private gameLoop(network: Network) {
        for (const node of network.iterateNodes()) {
            node.processOutgoing(this.currentTick);
        }
        this._currentTick += this.tickRate;

        // TODO: adjust tick rate dynamically
        this.loopTimer = setTimeout(() => this.gameLoop(network), this.tickRate);
    }
}