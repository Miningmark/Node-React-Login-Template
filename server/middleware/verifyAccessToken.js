import "dotenv/config";

import jwt from "jsonwebtoken";

export default (req, res, next) => {
    const authorizationHeader = req?.headers?.authorization?.split(" ");
    if (!authorizationHeader || authorizationHeader[0].toLowerCase() !== "bearer") {
        return res.status(409).json({ message: "Kein AccessToken vorhanden" });
    }
    const accessToken = authorizationHeader[1];

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "AccessToken ungültig" });

        req.username = decoded.UserInfo.username;
        //TODO: add roles and other usefull data to the payload of the object at creation and read it here
        next();
    });
};
