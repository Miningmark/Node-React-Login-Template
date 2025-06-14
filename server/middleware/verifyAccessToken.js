import "dotenv/config";

import jwt from "jsonwebtoken";
import { Models } from "../controllers/modelController.js";
import { ForbiddenError, ValidationError } from "../errors/errorClasses.js";

export default async (req, res, next) => {
    try {
        console.log("VerifyAccessToken");
        const authorizationHeader = req?.headers?.authorization?.split(" ");
        if (!authorizationHeader || authorizationHeader[0].toLowerCase() !== "bearer") throw new ValidationError("Kein AccessToken vorhanden");

        const accessToken = authorizationHeader[1];

        const accessUserToken = await Models.UserToken.findOne({ where: { token: accessToken, type: "accessToken" } });
        if (!accessUserToken) throw new ForbiddenError("AccessToken ungültig");

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) throw new ForbiddenError("AccessToken ungültig");

            req.username = decoded.UserInfo.username;
            //TODO: add roles and other usefull data to the payload of the object at creation and read it here
            return next();
        });
    } catch (error) {
        next(error);
    }
};
