export interface ServerToClientEvents {
    "user:update": (data: Record<string, any>) => void;
    "users:create": (data: Record<string, any>) => void;
    "users:update": (data: Record<string, any>) => void;
    "serverLogs:create": (data: Record<string, any>) => void;
}

export interface ClientToServerEvents {
    "subscribe:users:watchList": (data: Record<string, any>) => void;
    "subscribe:serverLogs:watchList": (data: Record<string, any>) => void;
}
