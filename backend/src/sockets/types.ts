export interface ServerToClientEvents {
    "user:update": (data: Record<string, any>) => void;
}

export interface ClientToServerEvents {}
