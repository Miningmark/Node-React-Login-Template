export interface ServerToClientEvents {
    "users:create": (data: Record<string, any>) => void;
    "users:update": (data: Record<string, any>) => void;
    "users:remove": (data: Record<string, any>) => void;
}

export interface ClientToServerEvents {
    "subscribe:users:watchList": (data: Record<string, any>) => void;
}
