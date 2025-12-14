
import { BaseNode } from "./base";
import { Connection } from "./connection";
import { Producer } from "./producer";

type NodeConstructor = CTOR<BaseNode>;

export class Network {
    private nodes: Set<BaseNode>
    private rootNode: Producer
    private targetsList: Map<string, Set<BaseNode>> = new Map();

    private constructor(rootNode: Producer, nodes: BaseNode[]){
        this.rootNode = rootNode;
        this.nodes = new Set([rootNode, ...nodes]);
    }
    
    static create(rootNode: Producer, nodes: NodeConstructor[]){
        const nodeConstructors = nodes;
        
        const nodeSet = new Set<BaseNode>();

        nodeConstructors.forEach((node) => {
            const nodeInstance = new node();

            if(!(nodeInstance instanceof BaseNode)){
                throw new Error(`All nodes must be instances of BaseNode. Invalid node: ${node}`);
            }
            if(nodeSet.has(nodeInstance)){
                throw new Error(`Duplicate node detected: ${node}`);
            }
            
            nodeSet.add(nodeInstance);  
        });

        return new Network(rootNode, Array.from(nodeSet));
    }

    addNode(node: BaseNode){
        this.nodes.add(node);
        
        if(node.target){
            if(!this.targetsList.has(node.target)){
                this.targetsList.set(node.target, new Set());
            }
            this.targetsList.get(node.target)!.add(node);
        }   
    }

    getNodes(): BaseNode[] {
        return Array.from(this.nodes);  
    }

    getRootNode(): Producer {
        return this.rootNode;
    }

    connect(from: BaseNode, to: BaseNode){
        // check if you can connect nodes
        const con = new Connection(from, to)
        from.addConnection(con)
    }

    // traverse all nodes in the network and yield them one by one
    *iterateNodes() {
        // keep track of visited nodes to avoid cycles
        const visited = new Set<BaseNode>();
        
        // first one is always the root node
        yield this.rootNode;
        visited.add(this.rootNode);

        // iterate via connections
        const stack: BaseNode[] = [this.rootNode];

        while(stack.length > 0){
            const currentNode = stack.pop()!;
            
            // TODO: convert to for loop because of performance?
            for(const connection of currentNode.outgoingConnections){
                const nextNode = connection.to;
                if(!visited.has(nextNode)){
                    yield nextNode;
                    visited.add(nextNode);
                    stack.push(nextNode);
                }
            }
        }   
    }
}  