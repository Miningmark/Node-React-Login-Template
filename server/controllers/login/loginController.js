import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Models } from "../modelController.js";

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Alle Eingaben erforderlich" });
        }

        const foundUser = await Models.User.findOne({ where: { username } });
        if (!foundUser) {
            return res.status(401).json({ message: "Dieser Nutzer existiert nicht" });
        }

        if (!foundUser.isActive) {
            return res.status(401).json({ message: "Nutzer ist noch nicht aktiviert" });
        }
        if (foundUser.isDisabled) {
            return res.status(401).json({ message: "Nutzer ist gesperrt" });
        }

        const isPasswordMatching = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordMatching) {
            return res.status(401).json({ message: "Passwort nicht korrekt" });
        }

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username
                    //TODO: add additional information to paylpoad (roles, etc.)
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRATION) }
        );

        const refreshToken = jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username
                    //TODO: add additional information to paylpoad (roles, etc.)
                }
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRATION) }
        );

        const expiresAt = new Date(Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRATION) * 1000);
        await Models.UserToken.create({ userId: foundUser.id, token: accessToken, type: "refreshToken", expiresAt });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            /*secure: true,*/ //TODO:
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ accessToken: accessToken });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

export { login };
