import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Models } from "./modelController.js";
import { sendMail } from "../mail/mailer.js";
import generateUUID from "../utils/generateUUID.js";
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "../errors/errorClasses.js";

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{5,15}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) throw new ValidationError("Benutzername und Passwort erforderlich");

        const foundUser = await Models.User.findOne({ where: { username } });

        if (!foundUser) throw new ValidationError("Dieser Benutzer existiert nicht");
        if (foundUser.isDisabled) throw new ForbiddenError("Dieser Benutzer ist gesperrt");
        if (!foundUser.isActive) throw new ForbiddenError("Dieser Benutzer ist noch nicht aktiviert");

        const isPasswordMatching = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordMatching) throw new UnauthorizedError("Passwort nicht korrekt");

        const accessToken = generateJWT(foundUser.username, process.env.ACCESS_TOKEN_SECRET, parseInt(process.env.ACCESS_TOKEN_EXPIRATION));
        const refreshToken = generateJWT(foundUser.username, process.env.REFRESH_TOKEN_SECRET, parseInt(process.env.REFRESH_TOKEN_EXPIRATION));
        const expiresAt = new Date(Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION) * 1000);

        const accessUserToken = await findUserToken(foundUser.id, null, "accessToken");
        const refreshUserToken = await findUserToken(foundUser.id, null, "refreshToken");

        if (accessUserToken) accessUserToken.destroy();
        if (refreshUserToken) refreshUserToken.destroy();

        await Models.UserToken.create({ userId: foundUser.id, token: accessToken, type: "accessToken", expiresAt });
        await Models.UserToken.create({ userId: foundUser.id, token: refreshToken, type: "refreshToken", expiresAt });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            /*secure: true,*/ //TODO:
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

        const userToken = await findUserToken(null, token, "registration");
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

const requestPasswordReset = async (req, res, next) => {
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

        //TODO:
        const { doNotSendRespone } = req.body;
        if (!doNotSendRespone) return res.status(200).json({ message: "Email zum Passwort ändern wurde versandt" });
    } catch (error) {
        next(error);
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

const logout = async (req, res, next) => {
    try {
        const { username } = req;

        if (!username) {
            return res.status(400).json({ message: "Nutzername erforderlich" });
        }

        const foundUser = await Models.User.findOne({ where: { username: username } });
        if (!foundUser) {
            return res.status(400).json({ message: "Kein Nutzer mit diesem Benutzername gefunden" });
        }

        const userToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "refreshToken" } });
        if (userToken) {
            userToken.destroy();
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "None"
            /*secure: true,*/ //TODO:
        });

        res.status(200).json({ message: "Nutzer erfolgreich abgemeldet" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ message: "Keinen Cookie für Erneuerung gefunden" });
        }

        const userToken = await Models.UserToken.findOne({ where: { token: refreshToken, type: "refreshToken" }, include: Models.User });
        if (!userToken) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                sameSite: "None"
                /*secure: true,*/ //TODO:
            });
            return res.status(401).json({ message: "Token nicht vorhanden, bitte neu anmelden" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || decoded.UserInfo.username !== userToken.User.username) {
                return res.status(401).json({ message: "Token stimmt nicht mit Username überein" });
            }

            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: userToken.User.username
                        //TODO: add additional information to paylpoad (roles, etc.)
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRATION) }
            );
            return res.status(200).json({ accessToken: accessToken });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
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

const findUserToken = async (userId, token, type) => {
    return await Models.UserToken.findOne({
        where: {
            ...(userId && { userId: userId }),
            ...(token && { token: token }),
            type: type
        }
    });
};

export { login, register, accountActivation, requestPasswordReset, passwordReset, logout, refreshAccessToken };
