export class BaseRequest implements Omit<Networking.Request, 'type'> {
    uuid: string = crypto.randomUUID();

    action: Networking.RequestAction = 'ALL';

    startedAt: number;
    endedAt?: number;
    
    // TODO: add success property
    success: boolean = false

    // TODO: track generated subrequests
    // subrequests?: Networking.Request[];

    constructor(tick: Engine.Tick){
        this.startedAt = tick
    }
}

export class StaticRequest extends BaseRequest implements Networking.Request {
    type: Networking.RequestType = 'StaticFile'
}

export class DatabaseRequest extends BaseRequest implements Networking.Request {
    type: Networking.RequestType = 'Database'
}

export class ApiRequest  extends BaseRequest implements Networking.Request {
    type: Networking.RequestType = 'ApiRequest'
}

export class FaultyRequest  extends BaseRequest implements Networking.Request {
    type: Networking.RequestType = 'FaultRequest'
}