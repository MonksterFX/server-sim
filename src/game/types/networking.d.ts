namespace Networking {
    type Request = {
        uuid: string;
        type: Networking.ConnectionType;

        // method: 'GET' | 'POST';

        // response: Response | null;

        // tracability
        startedAt: number;
        endedAt?: number;
        success: boolean;
        subrequests?: Networking.Request[];
    }

    type RequestWithResponse = Request & {
        response: Response;
    }

    type Response = {
        uuid: string;
        target: string;
        request: Request
    }

    type ConnectionType = 'StaticFile' | 'ApiRequest' | 'Database' | 'Event' | 'FaultRequest'
}

