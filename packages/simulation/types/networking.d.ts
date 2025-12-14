namespace Networking {
    type Request = {
        uuid: string;
        type: Networking.RequestType;
        action: Networking.RequestAction;
        target?: string;

        // tracability
        startedAt: number;
        endedAt?: number;
        success: boolean;

        // TODO: track generated subrequests
        // subrequests?: Networking.Request[];

        // TODO: link response
        // response: Response | null;

    }

    type RequestWithResponse = Request & {
        response: Response;
    }

    type Response = {
        uuid: string;
        target: string;
        request: Request
    }

    type RequestType = 'StaticFile' | 'ApiRequest' | 'Database' | 'Event' | 'FaultRequest'
    type RequestAction = 'READ' | 'WRITE' | 'EXECUTE' | 'ALL'
    type ConnectionType = `${RequestType}:${RequestAction}`
}

