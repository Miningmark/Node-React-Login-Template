import { ENV } from "@/config/env.js";
import { ForbiddenError } from "@/errors/errorClasses.js";
import { protectedRateLimiter } from "@/middlewares/rateLimiter.middleware.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const verifyAuth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.headers.authorization?.split(" ")[1];
            if (accessToken === undefined) return;

            const databaseUserToken = await UserToken.findOne({
                where: { token: accessToken, type: UserTokenType.ACCESS_TOKEN }
            });
            if (databaseUserToken === null)
                throw new ForbiddenError("AccessToken nicht mehr gültig");

            try {
                const decodedPayload = jwt.verify(
                    accessToken,
                    ENV.ACCESS_TOKEN_SECRET
                ) as JwtPayload;

                req.userId = decodedPayload.userId;
                req.routeGroups = decodedPayload.routeGroups;

                next();
            } catch (error) {
                throw new ForbiddenError("AccessToken konnte nicht verifiziert werden");
            }
        } catch (error) {
            await protectedRateLimiter.consumeOnFail(req, res, next, error);
        }
    };
};
