import { Stack } from "../models/stack"
import type { Connection } from "./connection"

export abstract class BaseNode {

    /* Static ID generator */
    private static nextId: number = 0;
    readonly id: number = BaseNode.nextId++;

    type: unknown
    name: string = `BaseNode:${this.id}`
    description: string = ''

    // optional target identifier for easier routing
    target?: string;

    requestCount: number = 0;

    /** Degradation level of the node, ranging from 0.0 (no degradation) to 1.0 (fully degraded). */
    degraded: number = 0.0 // 0.0 - 1.0

    /***********************
     * Routing properties   
    ***********************/ 
    /** The set of connection types this node supports */
    readonly consumes: Set<CTOR<Networking.Request>> = new Set()
    /** The set of connection types this node supports */
    readonly produces: Set<CTOR<Networking.Request>> = new Set()

    readonly incomingConnections: Set<Connection> = new Set()
    readonly outgoingConnections: Set<Connection> = new Set()

    /** Incoming Requests Queue */
    requests: Stack = new Stack()

    /**
     * Calculates the time in milliseconds an incoming request will take to process.
     * By default, this is set to 10ms.
     * @param request The incoming network request to process.
     * @returns The time in milliseconds the request will take to process.
     */
    calcRequestProcessingTime: (request: Networking.Request) => number = () => 10

    // callbacks for advanced use cases
    // onRequest: EventHandler<RequestEvent>
    // onResponse: EventHandler<ResponseEvent>
    // onEvent: EventHandler<Event>        

    /**
     * Adds a connection to the outgoing connections set.
     * @param con The connection to add to the outgoing connections set.
     */
    addConnection(con: Connection) {
        this.outgoingConnections.add(con)
    }

    /**
     * Removes a connection from the outgoing connections set.
     * @param con The connection to remove from the outgoing connections set.
     */
    removeConnection(con: Connection) {
        this.outgoingConnections.delete(con)
    }

    /**
     * Processes an incoming network request.
     * @param tick The current engine tick.
     * @param request The incoming network request to process.  
     */
    processIngoing(tick: Engine.Tick, request: Networking.Request) {
        const processingTime = this.calcRequestProcessingTime(request)
        this.requests.add({ executedAt: tick + processingTime, request })
    }

    /**
     * Processes a network request.
     * @param request The network request to process.
     * Override this method for custom processing logic.
     */
    processRequest(tick: Engine.Tick, request: Networking.Request): Networking.Request | Networking.Request[] {
        return request
    }

    /**
     * Processes outgoing network requests.
     * @param tick The current engine tick.
     */
    processOutgoing(tick: Engine.Tick) {
        // find all requests to execute
        const rawItems = this.requests.getNext(tick)

        // process requests (could result in multiple requests)
        const items = rawItems.map(item => {
            const processed = this.processRequest(tick, item.request)

            // clean up processed requests from the stack
            this.requests.remove(item)

            if (Array.isArray(processed)) {
                return processed.map(req => ({ executedAt: item.executedAt, request: req }))
            }
            return [{ executedAt: item.executedAt, request: processed }]

        }).flat()

        // process each request and send to connected nodes that can consume the request type
        for (const item of items) {
            // number of request send
            let send = 0

            for (const con of this.outgoingConnections) {
                if (con.to.consumes?.has(item.request.type)) {
                    con.to.processIngoing(tick, item.request)
                    send++
                }
            }

            if (send > 0) {
                this.requests.remove(item)
            } else {
                console.info(`no connection for item ${item.request.uuid} with type ${item.request.type}`)
            }
        }

    }

    removeNode(tick: Engine.Tick) {
        // clean connections
        this.outgoingConnections.forEach(con=>con.remove())
        this.incomingConnections.forEach(con=>con.remove())
        
        // end all requests
        this.requests.getAll().forEach((item)=>{
            item.request.success = false
            item.request.endedAt = tick
        })

        this.requests.clear()
    }
}