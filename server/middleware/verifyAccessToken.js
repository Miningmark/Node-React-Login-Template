import jwt from "jsonwebtoken";
import { Models } from "../controllers/modelController.js";
import { ForbiddenError, ValidationError } from "../errors/errorClasses.js";
import config from "../config/config.js";

export default async (req, res, next) => {
    try {
        const authorizationHeader = req?.headers?.authorization?.split(" ");
        if (!authorizationHeader || authorizationHeader[0].toLowerCase() !== "bearer") throw new ValidationError("Kein Token vorhanden");

        const accessToken = authorizationHeader[1];

        const accessUserToken = await Models.UserToken.findOne({ where: { token: accessToken, type: "accessToken" } });
        if (accessUserToken === null) throw new ForbiddenError("Kein Token vorhanden");

        jwt.verify(accessToken, config.accessTokenSecret, (error, decoded) => {
            if (error) throw new ForbiddenError("Ungültiger Token");

            req.userId = decoded.UserInfo.id;
            req.username = decoded.UserInfo.username;
            req.routeGroups = decoded.UserInfo.routeGroups;

            return next();
        });
    } catch (error) {
        next(error);
    }
};
