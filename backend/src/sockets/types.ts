export interface ServerToClientEvents {
    "user:create": (data: Record<string, any>) => void;
    "user:update": (data: Record<string, any>) => void;
    "user:remove": (data: Record<string, any>) => void;
}

export interface ClientToServerEvents {
    "subscribe:users:watchList": (data: Record<string, any>) => void;
}
