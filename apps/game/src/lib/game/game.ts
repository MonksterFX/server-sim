import type { Network } from "@server-sim/simulation";
import { Logger } from "@server-sim/simulation/utils/logger";
import { PerformanceMonitor } from "@server-sim/simulation/utils/performance";
import type { Szenario } from "./szenario";

export default class Game {
    private _logger = Logger.getLogger('Game');

    performance: PerformanceMonitor = new PerformanceMonitor();

    private _currentTick: Engine.Tick = 0;
    tickRate: number = 100 // how many ms per tick

    szenario?: Szenario
    
    private loopTimer?: number;
    
    get currentTick(){
        return this._currentTick;
    }

    start() {
        if(!this.szenario) {
            this._logger.warn("No szenario loaded, cannot start game");
            return false;
        }
        this._logger.info("starting game")
        this.gameLoop(this.szenario.network)
        return true;
    }

    stop() {
        this._logger.info("stopping game")
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = undefined;
        }
    }
    
    simulate(network: Network, ticks: number) {
        this._logger.info(`simulating ${ticks} ticks`)
        for (let i = 0; i < ticks; i++) {     
            for (const node of network.iterateNodes()) {
                node.processOutgoing(this.currentTick);
            }
            this._currentTick += this.tickRate;
        }
    }

    loadSzenario(szenario: Szenario){
        this.szenario = szenario
    }

    loadState(){
        throw new Error('not implemented')
    }

    saveState(){
        throw new Error('not implemented')
    }

    private gameLoop(network: Network) {

        this.performance.startTask();
        this.simulate(network, 1);
        this.performance.endTask();
      
        this._logger.debug(`Tick ${this.currentTick} processed in ${this.performance.last.toFixed(2)} ms (avg: ${this.performance.avg.toFixed(2)} ms)`);
        
        this._currentTick += this.tickRate;

        // TODO: adjust tick rate dynamically
        this.loopTimer = requestAnimationFrame(() => this.gameLoop(network));
    }

    render(){

    }
}