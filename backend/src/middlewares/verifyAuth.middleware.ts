import jwt, { JwtPayload } from "jsonwebtoken";
import { ForbiddenError, ValidationError } from "@/errors/errorClasses";
import { NextFunction, Request, Response } from "express";
import { ENV } from "@/config/env";
import UserToken, { UserTokenType } from "@/models/userToken.model";

export const verifyAuth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.headers.authorization?.split(" ")[1];
            if (!accessToken) throw new ValidationError("Kein AccessToken vorhanden");

            const foundAccessToken = await UserToken.findOne({ where: { token: accessToken, type: UserTokenType.ACCESS_TOKEN } });
            if (foundAccessToken === null) throw new ForbiddenError("AccessToken nicht mehr gültig");

            try {
                const decodedPayload = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET) as JwtPayload;

                req.userId = decodedPayload.userId;
                req.username = decodedPayload.username;
                req.routeGroups = decodedPayload.routeGroups;

                next();
            } catch (error) {
                next(new ForbiddenError("AccessToken nicht gültig"));
            }
        } catch (error) {
            next(error);
        }
    };
};
