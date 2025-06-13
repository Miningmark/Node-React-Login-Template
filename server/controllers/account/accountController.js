import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Models } from "../modelController.js";
import { sendMail } from "../../mail/mailer.js";
import generateUUID from "../../uuid/generateUUID.js";

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{5,15}$/;
const EMAIL_REGEX = /^(?=^.{0,36}$)[\w-.]+@([\w-]+.)+[\w-]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;

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

        const userToken = await Models.UserToken.findOne({
            where: {
                userId: foundUser.id,
                type: "refreshToken"
            }
        });

        if (userToken) {
            userToken.destroy();
        }

        await Models.UserToken.create({ userId: foundUser.id, token: accessToken, type: "refreshToken", expiresAt });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            /*secure: true,*/ //TODO:
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRATION) * 1000
        });

        return res.status(200).json({ accessToken: accessToken });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

const register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: "Alle Eingaben erforderlich" });
        }

        if (!USERNAME_REGEX.test(username) || !EMAIL_REGEX.test(email) || !PASSWORD_REGEX.test(password)) {
            return res.status(401).json({ message: "Eingaben entsprechen nicht den Anforderungen!" });
        }

        const duplicateUsername = await Models.User.findOne({ where: { username } });
        const duplicateEmail = await Models.User.findOne({ where: { email } });

        if (duplicateUsername) {
            return res.status(409).json({ message: "Benutzername bereits vergeben!", reason: "username" });
        }

        if (duplicateEmail) {
            return res.status(409).json({ message: "Email bereits registriert!", reason: "email" });
        }

        //TODO: should do it with an transaction if Role could not beeing added
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Models.User.create({ username, email, password: hashedPassword });
        const role = await Models.Role.findOne({ where: { name: "User" } });

        await user.addRole(role);

        const token = generateUUID();
        const expiresAt = new Date(Date.now() + parseInt(process.env.REGISTER_TOKEN_EXPIRE_AT) * 1000);

        await Models.UserToken.create({ userId: user.id, token, type: "registration", expiresAt });

        sendMail(
            email,
            "Abschluss deiner Registrierung",
            "Unter dem nachfolgenden Link kannst du deine Registrierung auf " +
                process.env.FRONTEND_WEBADRESS +
                " bis " +
                expiresAt +
                " abschließen: " +
                process.env.FRONTEND_WEBADRESS_REGISTER_TOKEN +
                token
        );

        return res.status(201).json({ message: "Benutzer wurde erfolgreich registriert" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

const accountActivation = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token nicht vorhanden" });
        }

        const userToken = await Models.UserToken.findOne({
            where: {
                token,
                type: "registration"
            },
            include: Models.User
        });

        if (!userToken) {
            return res.status(400).json({ message: "Token nicht vorhanden" });
        }

        if (new Date(Date.now()) > userToken.expiresAt) {
            await userToken.User.destroy();
            return res.status(400).json({ message: "Token abgelaufen, bitte neu registrieren", redirect: "/register" });
        }

        userToken.User.isActive = true;
        await userToken.User.save();

        await userToken.destroy();

        return res.status(201).json({ message: "Benutzer erfolgreich freigeschaltet!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

const requestPasswordReset = async (req, res, next) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Benutzername erforderlich" });
        }

        const foundUser = await Models.User.findOne({ where: { username: username } });
        if (!foundUser) {
            return res.status(401).json({ message: "Es existiert kein Benutzer mit dieser Nutzername" });
        }

        if (foundUser.isDisabled) {
            return res.status(401).json({ message: "Benutzer ist gesperrt, kein zurücksetzten des Passworts möglich" });
        }

        const userToken = await Models.UserToken.findOne({
            where: {
                userId: foundUser.id,
                type: "passwordReset"
            }
        });

        if (userToken) {
            userToken.destroy();
        }

        const token = generateUUID();
        const expiresAt = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRE_AT) * 1000);

        await Models.UserToken.create({ userId: foundUser.id, token, type: "passwordReset", expiresAt });

        sendMail(
            foundUser.email,
            "Passwort vergessen ?",
            "Unter dem nachfolgenden Link kannst du dein Passwort bis " +
                expiresAt +
                " zurück setzten: " +
                process.env.FRONTEND_WEBADRESS_PASSWORD_RESET_TOKEN +
                token
        );

        const { doNotSendRespone } = req.body;
        if (!doNotSendRespone) {
            return res.status(200).json({ message: "Email zum Passwort ändern wurde versandt" });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

const passwordReset = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(401).json({ message: "Benutzername und Token erforderlich!" });
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(401).json({ message: "Passwort entspricht nicht den Anforderungen" });
        }

        const userToken = await Models.UserToken.findOne({ where: { token: token, type: "passwordReset" }, include: Models.User });

        if (!userToken) {
            return res.status(401).json({ message: "Token nicht vorhanden" });
        }

        if (new Date(Date.now()) > userToken.expiresAt) {
            req.body.doNotSendRespone = true;
            req.body.username = userToken.User.username;
            requestPasswordReset(req, res);

            return res.status(400).json({ message: "Token bereits abgelaufen, neuer Token wurde an deine Email gesendet" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        userToken.User.password = hashedPassword;
        userToken.User.save();

        userToken.destroy();

        return res.status(200).json({ message: "Neues Passwort erfolgreich gesetzt" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

export { login, register, accountActivation, requestPasswordReset, passwordReset };
