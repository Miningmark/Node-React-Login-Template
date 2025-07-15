export interface ServerToClientEvents {
    "user:update": (data: Record<string, any>) => void;

    "userManagement:users:create": (data: Record<string, any>) => void;
    "userManagement:users:update": (data: Record<string, any>) => void;
    "userManagement:permissions:create": (data: Record<string, any>) => void;
    "userManagement:permissions:update": (data: Record<string, any>) => void;
    "userManagement:permissions:delete": (data: Record<string, any>) => void;

    "adminPage:serverLogs:create": (data: Record<string, any>) => void;
    "adminPage:permissions:create": (data: Record<string, any>) => void;
    "adminPage:permissions:update": (data: Record<string, any>) => void;
    "adminPage:permissions:delete": (data: Record<string, any>) => void;
}

export interface ClientToServerEvents {
    "subscribe:userManagement:users:watchList": (data: Record<string, any>) => void;
    "subscribe:userManagement:permissions:watchList": (data: Record<string, any>) => void;

    "subscribe:adminPage:serverLogs:watchList": (data: Record<string, any>) => void;
    "subscribe:adminPage:permissions:watchList": (data: Record<string, any>) => void;
}
