export class BaseRequest implements Omit<Networking.Request, 'type'> {
    uuid: string = crypto.randomUUID();
    startedAt: number;
    success: boolean = false
    endedAt?: number;

    subrequests?: Networking.Request[];

    constructor(tick: Engine.Tick){
        this.startedAt = tick
    }
}

export class StaticRequest extends BaseRequest implements Networking.Request {
    type: Networking.ConnectionType = 'StaticFile'
}

export class DatabaseRequest extends BaseRequest implements Networking.Request {
    type: Networking.ConnectionType = 'Database'
}

export class ApiRequest  extends BaseRequest implements Networking.Request {
    type: Networking.ConnectionType = 'ApiRequest'
}

export class FaultyRequest  extends BaseRequest implements Networking.Request {
    type: Networking.ConnectionType = 'FaultRequest'
}