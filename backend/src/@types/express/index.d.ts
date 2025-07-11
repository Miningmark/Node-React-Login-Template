import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            userId?: number;
            username?: string;
            routeGroups?: string[];
        }
    }
}

declare module "jsonwebtoken" {
    export interface JwtPayload {
        userId: number;
        routeGroups: string[];
    }
}

declare module "socket.io" {
    export interface Socket {
        userId: number;
        routeGroups: string[];
    }
}
