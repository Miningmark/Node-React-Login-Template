import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Models } from "../modelController.js";
import { sendMail } from "../../mail/mailer.js";
import generateUUID from "../../uuid/generateUUID.js";

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Alle Eingaben erforderlich" });
        }

        const foundUser = await Models.User.findOne({ where: { username } });
        if (!foundUser) {
            return res.status(401).json({ message: "Dieser Benutzer existiert nicht" });
        }

        if (foundUser.isDisabled) {
            return res.status(401).json({ message: "Benutzer ist gesperrt" });
        }

        if (!foundUser.isActive) {
            return res.status(401).json({ message: "Benutzer ist noch nicht aktiviert" });
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

const passwordForgotten = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email erforderlich" });
        }

        const foundUser = await Models.User.findOne({ where: { email } });
        if (!foundUser) {
            return res.status(401).json({ message: "Es existiert kein Benutzer mit dieser Email" });
        }

        if (foundUser.isDisabled) {
            return res.status(401).json({ message: "Benutzer ist gesperrt, kein zurücksetzten des Passworts möglich" });
        }

        if (!foundUser.isActive) {
            return res.status(401).json({ message: "Benutzer ist noch nicht aktiviert, bitte zuerst die Email bestätigen" });
        }

        const existingToken = await Models.UserToken.findOne({
            where: {
                userId: foundUser.id,
                type: "passwordForgotten"
            }
        });

        console.log(existingToken);

        if (existingToken) {
            console.log("destoryed");
            existingToken.destroy();
        }

        const token = generateUUID();
        const expiresAt = new Date(Date.now() + parseInt(process.env.PASSWORD_FORGOTTEN_TOKEN_EXPIRE_AT) * 1000);

        await Models.UserToken.create({ userId: foundUser.id, token, type: "passwordForgotten", expiresAt });

        sendMail(
            email,
            "Passwort vergessen ?",
            "Unter dem nachfolgenden Link kannst du dein Passwort bis " +
                expiresAt +
                " zurück setzten: " +
                process.env.FRONTEND_WEBADRESS_PASSWORD_FORGOTTEN_TOKEN +
                token
        );

        return res.status(200).json({ message: "Email zum Passwort ändern wurde versandt" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

export { login, passwordForgotten };
