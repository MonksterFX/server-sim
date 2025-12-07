type Request =  Networking.Request // override typing for request
type StackItem = {executedAt: Engine.Tick, request: Request}

type StackTable = StackItem[]

export class Stack {

    private table: StackTable = []

    add(item: StackItem){
        this.table.push(item)
    }

    remove(item:  StackItem){
        this.table = this.table.filter((stackItem)=>stackItem.request.uuid !== item.request.uuid)
    }

    clear() {
        this.table = []
    }

    getNext(tick: Engine.Tick) {
        return  this.table.filter(item => item.executedAt <= tick)
    }

    getSize(){
        return this.table.length
    }
}