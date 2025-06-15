import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Models } from "./modelController.js";
import { sendMail } from "../mail/mailer.js";
import generateUUID from "../utils/generateUUID.js";
import formatDate from "../utils/formatDate.js";
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "../errors/errorClasses.js";
import config from "../config/config.js";

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{5,15}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;
const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) throw new ValidationError("Benutzername und Passwort erforderlich");

        const foundUser = await findUser(username);

        if (!foundUser) throw new ValidationError("Dieser Benutzer existiert nicht");
        if (foundUser.isDisabled) throw new ForbiddenError("Dieser Benutzer ist gesperrt");
        if (!foundUser.isActive) throw new ForbiddenError("Dieser Benutzer ist noch nicht aktiviert oder wurde vorübergehend deaktiviert");

        const isPasswordMatching = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordMatching) {
            await addLastLogin(req, foundUser.id, false);
            await checkLastLogins();
            throw new UnauthorizedError("Passwort nicht korrekt");
        }
        const accessUserToken = await findUserToken(foundUser.id, null, "accessToken", null);
        const refreshUserToken = await findUserToken(foundUser.id, null, "refreshToken", null);

        if (accessUserToken) accessUserToken.destroy();
        if (refreshUserToken) refreshUserToken.destroy();

        const accessToken = generateJWT(foundUser.username, config.accessTokenSecret, config.accessTokenExpiration);
        const refreshToken = generateJWT(foundUser.username, config.refreshTokenSecret, config.refreshTokenExpiration);

        const accessTokenExpiresAt = new Date(Date.now() + config.accessTokenExpiration * 1000);
        const refreshTokenExpiresAt = new Date(Date.now() + config.refreshTokenExpiration * 1000);

        await Models.UserToken.create({ userId: foundUser.id, token: accessToken, type: "accessToken", expiresAt: accessTokenExpiresAt });
        await Models.UserToken.create({ userId: foundUser.id, token: refreshToken, type: "refreshToken", expiresAt: refreshTokenExpiresAt });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "Lax",
            ...(config.isDevServer ? {} : { secure: true }),
            maxAge: config.refreshTokenExpiration * 1000
        });

        const jsonResult = {};
        jsonResult.accessToken = accessToken;
        jsonResult.username = username.charAt(0).toUpperCase() + username.slice(1);
        jsonResult.roles = await getJSONRoles(username);
        jsonResult.config = getJSONConfig();

        await addLastLogin(req, foundUser.id, true);
        await checkChangedLocationAndRegion(foundUser.username);

        return res.status(200).json(jsonResult);
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
        const expiresAt = new Date(Date.now() + config.accountActivationTokenExpiresIn * 1000);

        await createdUser.addRole(role);
        await Models.UserToken.create({ userId: createdUser.id, token, type: "registration", expiresAt });

        //TODO: make it fancier
        sendMail(
            email,
            "Abschluss deiner Registrierung",
            "Unter dem nachstehenden Link hast du bis zum " +
                formatDate(expiresAt) +
                " die Möglichkeit, deine Registrierung abzuschließen: " +
                config.frontendURL +
                config.frontendURLAccountActivationToken +
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
        const expiresAt = new Date(Date.now() + config.passwordResetTokenExpiresIn * 1000);

        await Models.UserToken.create({ userId: foundUser.id, token, type: "passwordReset", expiresAt });

        //TODO: make it prettier
        sendMail(
            foundUser.email,
            "Passwort vergessen?",
            "Unter dem nachstehenden Link hast du bis zum " +
                formatDate(expiresAt) +
                "die Möglichkeit, dein Passwort zurückzusetzen: " +
                config.frontendURL +
                config.frontendURLPasswordResetToken +
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
            sameSite: "Lax",
            ...(config.isDevServer ? {} : { secure: true })
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
                sameSite: "Lax",
                ...(config.isDevServer ? {} : { secure: true })
            });

            throw new UnauthorizedError("Token nicht vorhanden, bitte neu anmelden");
        }

        const accessUserToken = await findUserToken(refreshUserToken.User.id, null, "accessToken", null);
        if (accessUserToken) accessUserToken.destroy();

        jwt.verify(refreshToken, config.refreshTokenSecret, async (err, decoded) => {
            if (err || decoded.UserInfo.username !== refreshUserToken.User.username) {
                throw new ValidationError("Token stimmt nicht mit Username überein");
            }

            const accessToken = generateJWT(refreshUserToken.User.username, config.accessTokenSecret, config.accessTokenExpiration);
            const accessTokenExpiresAt = new Date(Date.now() + config.accessTokenExpiration * 1000);

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

const changePassword = async (req, res, next) => {
    try {
        const { username } = req;
        const { currentPassword, newPassword } = req.body;

        if (!username || !currentPassword || !newPassword) throw new ValidationError("Alle Eingaben erforderlich");

        const foundUser = await findUser(username);
        if (!foundUser) throw new ValidationError("Benutzername nicht vorhanden");

        const currentPasswordMatching = await bcrypt.compare(currentPassword, foundUser.password);
        if (!currentPasswordMatching) throw new ValidationError("Altes Passwort stimmt nicht überein");

        if (!PASSWORD_REGEX.test(newPassword)) throw new ValidationError("Neues Passwort entspricht nicht den Anforderungen");
        const newPasswordHashed = await bcrypt.hash(newPassword, 10);

        foundUser.password = newPasswordHashed;
        foundUser.save();

        const accessUserToken = await findUserToken(foundUser.id, null, "refreshToken", null);
        const refreshUserToken = await findUserToken(foundUser.id, null, "accessToken", null);

        if (accessUserToken) accessUserToken.destroy();
        if (refreshUserToken) refreshUserToken.destroy();

        res.status(200).json({ message: "Passwort erfolgreich geändert bitte neu anmelden" });
    } catch (error) {
        next(error);
    }
};

const changeEmail = async (req, res, next) => {
    try {
        const { username } = req;
        const { newEmail } = req.body;

        if (!username || !newEmail) throw new ValidationError("Alle Eingaben erforderlich");

        const foundUser = await findUser(username, null);
        if (!foundUser) throw new ValidationError("Benutzername nicht vorhanden");

        if (foundUser.email.toLowerCase() === newEmail.toLowerCase()) throw new ConflictError("Die Email ist die selbe wie momentan verwendet");
        if (!EMAIL_REGEX.test(newEmail)) throw new ValidationError("Neue Email entspricht keiner gültigen Email");

        const foundUserNewEmail = await findUser(null, newEmail);
        if (foundUserNewEmail && foundUserNewEmail.username !== foundUser.username) throw new ConflictError("Email bereits vergeben");

        foundUser.email = newEmail;
        foundUser.save();

        res.status(200).json({ message: "Email erfolgreich geändert" });
    } catch (error) {
        next(error);
    }
};

const changeUsername = async (req, res, next) => {
    try {
        const { username } = req;
        const { newUsername } = req.body;

        if (!username || !newUsername) throw new ValidationError("Alle Eingaben erforderlich");

        const foundUser = await findUser(username, null);
        if (!foundUser) throw new ValidationError("Benutzername nicht vorhanden");

        if (foundUser.username.toLowerCase() === newUsername.toLowerCase())
            throw new ConflictError("Die Benutzername ist der selbe wie momentan verwendet");

        if (!USERNAME_REGEX.test(newUsername)) throw new ValidationError("Neuer Nutzername ist nicht gültig");

        const foundUserNewUsername = await findUser(newUsername, null);
        if (foundUserNewUsername && foundUserNewUsername.email !== foundUser.email) throw new ConflictError("Nutzername bereits vergeben");

        foundUser.username = newUsername;
        foundUser.save();

        res.status(200).json({ message: "Nutzername erfolgreich geändert" });
    } catch (error) {
        next(error);
    }
};

const getUserRoles = async (req, res, next) => {
    try {
        const { username } = req;
        if (!username) throw new ValidationError("Nutzername erforderlich");

        const jsonResult = {};
        jsonResult.roles = await getJSONRoles(username);

        return res.status(200).json(jsonResult);
    } catch (error) {
        next(error);
    }
};

const getUsername = async (req, res, next) => {
    try {
        const { username } = req;
        if (!username) throw new ValidationError("Nutzername erforderlich");

        const jsonResult = {};
        jsonResult.username = username.charAt(0).toUpperCase() + username.slice(1);

        return res.status(200).json(jsonResult);
    } catch (error) {
        next(error);
    }
};

const getConfig = async (req, res, next) => {
    try {
        const { username } = req;
        if (!username) throw new ValidationError("Nutzername erforderlich");

        const jsonResult = {};
        jsonResult.config = getJSONConfig();

        return res.status(200).json(jsonResult);
    } catch (error) {
        next(error);
    }
};

const getLastLogins = async (req, res, next) => {
    try {
        const { username } = req;

        if (!username) throw new ValidationError("Nutzername erforderlich");

        const foundUser = await Models.User.findOne({
            where: { username: username },
            include: [{ model: Models.LastLogin, limit: 5, order: [["loginAt", "DESC"]] }]
        });

        const resultJson = foundUser.LastLogins.map((lastLogin) => ({
            ipv4Adress: lastLogin.ipv4Adress,
            country: lastLogin.country,
            regionName: lastLogin.regionName,
            loginAt: lastLogin.loginAt,
            successfully: lastLogin.successfully
        }));

        return res.status(200).json(resultJson);
    } catch (error) {
        next(error);
    }
};

const checkChangedLocationAndRegion = async (username) => {
    const foundUser = await Models.User.findOne({
        where: { username: username },
        include: [{ model: Models.LastLogin, limit: 2, order: [["loginAt", "DESC"]] }]
    });

    if (foundUser.LastLogins.length !== 2) return;

    const recentLogin = foundUser.LastLogins[0];
    const lastLogin = foundUser.LastLogins[1];

    if (recentLogin.country !== lastLogin.country || recentLogin.region !== lastLogin.region) {
        sendMail(
            foundUser.email,
            "Verdächtiger Login-Versuch auf deinem Account",
            "Wir haben einen Login-Versuch auf deinem Account festgestellt, der von einem ungewöhnlichen Standort aus erfolgt ist.\n" +
                "Details des Logins:\n" +
                "• Datum & Uhrzeit: " +
                formatDate(recentLogin.loginAt) +
                "\n" +
                "• IP-Adresse: " +
                recentLogin.ipv4Adress +
                "\n" +
                "• Land: " +
                recentLogin.country +
                "\n" +
                "• Region: " +
                recentLogin.regionName +
                "\n" +
                "Wenn du diesen Login nicht selbst durchgeführt hast, empfehlen wir dir dringend, dein Passwort sofort zu ändern und verdächtige Aktivitäten zu überprüfen.\n" +
                "Du kannst dein Passwort über folgenden Link ändern: " +
                config.frontendURL +
                config.frontendURLPasswordForgotten
        );
    }
};

const checkLastLogins = async (username) => {
    let countUnsuccessfullyLogins;

    const foundUser = await Models.User.findOne({
        where: { username: username },
        include: [{ model: Models.LastLogin, limit: 5, order: [["loginAt", "DESC"]] }]
    });

    foundUser.LastLogins.foreach((lastLogin) => {
        if (!lastLogin.successfully) countUnsuccessfullyLogins++;
    });

    if (countUnsuccessfullyLogins === 5) {
        const token = generateUUID();
        //TODO: make it fancier
        sendMail(
            foundUser.email,
            "Account Sperrung",
            "Aus Sicherheitsgründen wurde dein Account nach mehreren fehlgeschlagenen Login-Versuchen vorübergehend deaktiviert. \nDu kannst ihn über den folgenden Link wieder aktivieren: " +
                config.frontendURL +
                config.frontendURLAccountReactivation +
                token
        );

        foundUser.isActive = false;
        await foundUser.save();

        await Models.UserToken.create({ userId: foundUser.id, toke: token, type: "accountReactivation", expiresAt: null });
    }
};

const addLastLogin = async (req, userId, successfully) => {
    const ipv4Adress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.headers["remote-addr"] || req.ip;
    const userAgent = req.headers["user-agent"];

    const jsonResult = {};
    let isValid = true;

    if (!ipv4Adress || !IPV4_REGEX.test(ipv4Adress)) isValid = false;
    const ipLookupResponse = await fetch(`http://ip-api.com/json/${ipv4Adress}`);
    const ipLookupData = await ipLookupResponse.json();

    if (!userId) throw new ValidationError("UserId nicht verhanden");

    jsonResult.userId = userId;
    jsonResult.ipv4Adress = isValid ? ipv4Adress : "Ungültig: " + ipv4Adress;
    jsonResult.userAgent = userAgent ? userAgent : "Nicht vorhanden";
    jsonResult.country = ipLookupData.status === "success" ? ipLookupData.country : "IP Lookup nicht erfolgreich";
    jsonResult.regionName = ipLookupData.status === "success" ? ipLookupData.regionName : "IP Lookup nicht erfolgreich";
    jsonResult.loginAt = new Date(Date.now());
    jsonResult.successfully = successfully;

    await Models.LastLogin.create(jsonResult);
};

const getJSONRoles = async (username) => {
    const foundUser = await Models.User.findOne({
        where: { username: username },
        include: { model: Models.Role, include: { model: Models.Permission } }
    });

    if (!foundUser) throw new ValidationError("Kein Nutzer in der Datenbank gefunden");

    return foundUser.Roles.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.Permissions.map((perm) => ({
            id: perm.id,
            name: perm.name
        }))
    }));
};

const getJSONConfig = () => {
    return {
        isRegisterEnable: config.isRegisterEnable,
        isUsernameChangeEnable: config.isUsernameChangeEnable,
        serverVersion: config.serverVersion
    };
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

export {
    login,
    register,
    accountActivation,
    requestPasswordReset,
    passwordReset,
    logout,
    refreshAccessToken,
    changePassword,
    changeEmail,
    changeUsername,
    getUserRoles,
    getUsername,
    getConfig,
    getLastLogins
};
