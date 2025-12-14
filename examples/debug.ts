import Game from '@server-sim/game/game';
import { Network, Producer } from '@server-sim/simulation';
import { Node } from '@server-sim/simulation/flow/network/node';
import { Consumer } from '@server-sim/simulation/flow/network/consumer';
import { ApiRequest, DatabaseRequest, StaticRequest } from '@server-sim/simulation/flow/network/request';
import { PerformanceMonitor } from '@server-sim/simulation/utils/performance';
import { Logger } from '@server-sim/simulation/utils/logger';

const game = new Game()
// Producer requires at least one request type
const root = new Producer([ApiRequest])
const network = Network.create(root, []);

// static server - Node needs consumes and produces types
const server = new Node([StaticRequest, ApiRequest], [StaticRequest, DatabaseRequest])

server.consumes = new Set([StaticRequest, ApiRequest])

server.processRequest = (tick: Engine.Tick, req: Networking.Request) => {
    // if api request convert it to an database request
    if (req.type === 'ApiRequest') {
        return [new DatabaseRequest(tick)]
    }

    return req
}

server.calcRequestProcessingTime = (req: Networking.Request) => {
    if (req.type === 'StaticFile') {
        return 5 // 5ms for static files
    }

    return Math.floor(server.requests.getSize() / 2 + 50)
}

const storage = new Consumer([StaticRequest])
const db = new Consumer([DatabaseRequest])

network.addNode(server)
network.addNode(storage)
network.addNode(db)

network.connect(root, server)
network.connect(server, storage)
network.connect(server, db)

storage.calcRequestProcessingTime = (_req: Networking.Request) => {
    // switch to hdd fallback if degraded
    const baseTime = storage.degraded > 0.5 ? 100 : 5
    return baseTime + baseTime * Math.floor(storage.requests.getSize() / 2)
}

Logger.logLevel = 'verbose';

const perMon = new PerformanceMonitor();
const perMon2 = new PerformanceMonitor();

console.log(`\n--- Run with ${100_000} requests for 2000 Ticks ---`)
const startTime = performance.now();
for (let i = 0; i < 2000; i++) {
    
    if(i % 1000 === 0){
        // debugger
        perMon.startTask();
        root.generate(game.currentTick, 100_000, [ApiRequest]);
        perMon.endTask();
    }


    perMon2.startTask();
    game.simulate(network, 1);
    perMon2.endTask();
}

console.log(`Total time: ${(performance.now() - startTime).toFixed(2)} ms`)
console.table([
    { name: 'Request generation', avgTime: perMon.avg.toFixed(), max: perMon.max.toFixed(), min: perMon.min.toFixed() },
    { name: 'Network simulation', avgTime: perMon2.avg.toFixed(), max: perMon2.max.toFixed(), min: perMon2.min.toFixed() }
])
console.log('Network nodes:', network.getNodes());

console.log('Request processed by all consumers:', storage.requestCount + db.requestCount);
