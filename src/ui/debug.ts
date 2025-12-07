import Game from '../game/game';
import { Network, Producer, Consumer, ApiRequest, StaticRequest, Node, DatabaseRequest, FaultyRequest } from '../game/flow/index';

const game = new Game()
const root = new Producer()
const network = Network.create(root, []);

// static server
const server = new Node()

server.consumes = new Set(['StaticFile', 'ApiRequest'])

server.processRequest = (tick, req) => {
    // if api request convert it to an database request
    if(req.type === 'ApiRequest'){
        req.subrequests = [new DatabaseRequest(tick)]

        return req.subrequests
    }

    return req
}

server.calcRequestProcessingTime = (req) => {
    if(req.type === 'StaticFile'){
        return 5 // 100ms for static files
    }

    return Math.floor(server.requests.getSize() / 2 + 50)
}

const storage= new Consumer(['StaticFile'])
const db = new Consumer(['Database'])

network.addNode(server)
network.addNode(storage)
network.addNode(db)

network.connect(root, server)
network.connect(server, storage)
network.connect(server, db)

storage.calcRequestProcessingTime = (req) => {
    // switch to hdd fallback if degraded
    const baseTime = storage.degraded > 0.5 ? 100 : 5
    return baseTime + baseTime * Math.floor(storage.requests.getSize() / 2)
}

for(let i = 0; i < 1000; i++){
    root.generate(game.currentTick, 1_000, [ApiRequest]);
    game.simulate(network, 100);
}

console.log('Network nodes:', network.getNodes());