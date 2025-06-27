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
