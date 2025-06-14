import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Models } from "./modelController.js";
import { sendMail } from "../mail/mailer.js";
import generateUUID from "../utils/generateUUID.js";
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "../errors/errorClasses.js";
import isDevMode from "../utils/env.js";

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{5,15}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) throw new ValidationError("Benutzername und Passwort erforderlich");

        const foundUser = await findUser(username);

        if (!foundUser) throw new ValidationError("Dieser Benutzer existiert nicht");
        if (foundUser.isDisabled) throw new ForbiddenError("Dieser Benutzer ist gesperrt");
        if (!foundUser.isActive) throw new ForbiddenError("Dieser Benutzer ist noch nicht aktiviert");

        const isPasswordMatching = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordMatching) throw new UnauthorizedError("Passwort nicht korrekt");

        const accessUserToken = await findUserToken(foundUser.id, null, "accessToken", null);
        const refreshUserToken = await findUserToken(foundUser.id, null, "refreshToken", null);

        if (accessUserToken) accessUserToken.destroy();
        if (refreshUserToken) refreshUserToken.destroy();

        const accessToken = generateJWT(foundUser.username, process.env.ACCESS_TOKEN_SECRET, parseInt(process.env.ACCESS_TOKEN_EXPIRATION));
        const refreshToken = generateJWT(foundUser.username, process.env.REFRESH_TOKEN_SECRET, parseInt(process.env.REFRESH_TOKEN_EXPIRATION));

        const accessTokenExpiresAt = new Date(Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRATION) * 1000);
        const refreshTokenExpiresAt = new Date(Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION) * 1000);

        await Models.UserToken.create({ userId: foundUser.id, token: accessToken, type: "accessToken", expiresAt: accessTokenExpiresAt });
        await Models.UserToken.create({ userId: foundUser.id, token: refreshToken, type: "refreshToken", expiresAt: refreshTokenExpiresAt });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            ...(!isDevMode() ? { secure: true } : {}),
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION) * 1000
        });

        return res.status(200).json({ accessToken: accessToken });
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) throw new ValidationError("Alle Eingaben erforderlich");

        if (!USERNAME_REGEX.test(username) || !EMAIL_REGEX.test(email) || !PASSWORD_REGEX.test(password))
            throw new ValidationError("Eingaben entsprechen nicht den Anforderungen");

        const duplicateUsername = await findUser(username, null);
        const duplicateEmail = await findUser(null, email);

        if (duplicateUsername) throw new ConflictError("Benutzername bereits vergeben!", "username");
        if (duplicateEmail) throw new ConflictError("Email bereits registriert!", "email");

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await Models.User.create({ username, email, password: hashedPassword });
        const role = await Models.Role.findOne({ where: { name: "User" } });

        const token = generateUUID();
        const expiresAt = new Date(Date.now() + parseInt(process.env.REGISTER_TOKEN_EXPIRE_AT) * 1000);

        await createdUser.addRole(role);
        await Models.UserToken.create({ userId: createdUser.id, token, type: "registration", expiresAt });

        //TODO: make it fancier
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
    } catch (error) {
        next(error);
    }
};

const accountActivation = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) throw new ValidationError("Token nicht vorhanden");

        const userToken = await findUserToken(null, token, "registration", true);
        if (!userToken) throw new ValidationError("Token nicht vorhanden");

        if (new Date(Date.now()) > userToken.expiresAt) {
            await userToken.User.destroy();
            throw new ValidationError("Token abgelaufen, bitte neu registrieren", "/register");
        }

        userToken.User.isActive = true;
        await userToken.User.save();

        await userToken.destroy();

        return res.status(201).json({ message: "Benutzer erfolgreich freigeschaltet!" });
    } catch (error) {
        next(error);
    }
};

const requestPasswordReset = async (req, res, next, sendResponse = true) => {
    try {
        const { username } = req.body;

        if (!username) throw new ValidationError("Benutzername erforderlich");

        const foundUser = await findUser(username, null);

        if (!foundUser) throw new ValidationError("Es existiert kein Benutzer mit dieser Nutzername");
        if (foundUser.isDisabled) throw new UnauthorizedError("Benutzer ist gesperrt, kein zurücksetzten des Passworts möglich");

        const userToken = await findUserToken(foundUser.id, null, "passwordReset");

        if (userToken) userToken.destroy();

        const token = generateUUID();
        const expiresAt = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRE_AT) * 1000);

        await Models.UserToken.create({ userId: foundUser.id, token, type: "passwordReset", expiresAt });

        //TODO: make it prettier
        sendMail(
            foundUser.email,
            "Passwort vergessen ?",
            "Unter dem nachfolgenden Link kannst du dein Passwort bis " +
                expiresAt +
                " zurück setzten: " +
                process.env.FRONTEND_WEBADRESS_PASSWORD_RESET_TOKEN +
                token
        );

        if (sendResponse) return res.status(200).json({ message: "Email zum Passwort ändern wurde versandt" });
    } catch (error) {
        next(error);
    }
};

const passwordReset = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) throw new ValidationError("Passwort und Token erforderlich!");
        if (!PASSWORD_REGEX.test(password)) throw new ValidationError("Passwort entspricht nicht den Anforderungen");

        const userToken = await findUserToken(null, token, "passwordReset", true);
        if (!userToken) throw new ValidationError("Token nicht vorhanden");

        if (new Date(Date.now()) > userToken.expiresAt) {
            req.body.username = userToken.User.username;
            requestPasswordReset(req, res, next, false);

            throw new ValidationError("Token bereits abgelaufen, neuer Token wurde an deine Email gesendet");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        userToken.User.password = hashedPassword;
        userToken.User.save();

        userToken.destroy();

        return res.status(200).json({ message: "Neues Passwort erfolgreich gespeichert" });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { username } = req;

        if (!username) throw new ValidationError("Nutzername erforderlich");

        const foundUser = await findUser(username, null);
        if (!foundUser) throw new ValidationError("Kein Nutzer mit diesem Benutzername gefunden");

        const refreshUserToken = await findUserToken(foundUser.id, null, "refreshToken");
        const accessUserToken = await findUserToken(foundUser.id, null, "accessToken");

        if (refreshUserToken) refreshUserToken.destroy();
        if (accessUserToken) accessUserToken.destroy();

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "None",
            ...(!isDevMode() ? { secure: true } : {})
        });

        res.status(200).json({ message: "Nutzer erfolgreich abgemeldet" });
    } catch (error) {
        next(error);
    }
};

const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) throw new ValidationError("Keinen Cookie für Erneuerung gefunden");

        const refreshUserToken = await findUserToken(null, refreshToken, "refreshToken", true);
        if (!refreshUserToken) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                sameSite: "None",
                ...(!isDevMode() ? { secure: true } : {})
            });

            throw new UnauthorizedError("Token nicht vorhanden, bitte neu anmelden");
        }

        const accessUserToken = await findUserToken(refreshUserToken.User.id, null, "accessToken", null);
        if (accessUserToken) accessUserToken.destroy();

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err || decoded.UserInfo.username !== refreshUserToken.User.username) {
                throw new ValidationError("Token stimmt nicht mit Username überein");
            }

            const accessToken = generateJWT(
                refreshUserToken.User.username,
                process.env.ACCESS_TOKEN_SECRET,
                parseInt(process.env.ACCESS_TOKEN_EXPIRATION)
            );
            const accessTokenExpiresAt = new Date(Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRATION) * 1000);

            await Models.UserToken.create({
                userId: refreshUserToken.User.id,
                token: accessToken,
                type: "accessToken",
                expiresAt: accessTokenExpiresAt
            });
            return res.status(200).json({ accessToken: accessToken });
        });
    } catch (error) {
        next(error);
    }
};

const generateJWT = (username, secret, expiresIn) => {
    return jwt.sign(
        {
            UserInfo: {
                username: username
                //TODO: add additional information to paylpoad (roles, etc.)
            }
        },
        secret,
        { expiresIn: expiresIn }
    );
};

const findUser = async (username, email) => {
    return await Models.User.findOne({
        where: {
            ...(username && { username: username }),
            ...(email && { email: email })
        }
    });
};

const findUserToken = async (userId, token, type, includeUser) => {
    return await Models.UserToken.findOne({
        where: {
            ...(userId && { userId: userId }),
            ...(token && { token: token }),
            type: type
        },
        ...(includeUser && { include: Models.User })
    });
};

export { login, register, accountActivation, requestPasswordReset, passwordReset, logout, refreshAccessToken };
