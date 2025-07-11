import { UnauthorizedError } from "@/errors/errorClasses.js";
import { NextFunction, Request, Response } from "express";

export const verifyPermission = (requiredRouteGroup: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.routeGroups || !req.routeGroups?.includes(requiredRouteGroup)) {
                throw new UnauthorizedError("Keine Berechtigung diese Route aufzurufen");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
