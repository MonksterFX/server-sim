type Request =  Networking.Request // override typing for request
type StackItem = {executedAt: Engine.Tick, request: Request}

export class Stack {

    private table: Map<string, StackItem> = new Map()

    add(item: StackItem){
        this.table.set(item.request.uuid, item)
    }

    remove(item:  StackItem){
        this.table.delete(item.request.uuid)
    }

    clear() {
        this.table.clear()
    }

    getNext(tick: Engine.Tick) {
        return  Array.from(this.table.values()).filter(item => item.executedAt <= tick)
    }

    getSize(){
        return this.table.size
    }

    getAll(){
        return Array.from(this.table.values())
    }
}