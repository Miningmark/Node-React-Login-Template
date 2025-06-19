import config from "../../config/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { Models, sequelize } from "../modelController.js";
import { ConflictError, ForbiddenError, UnauthorizedError, ValidationError } from "../../errors/errorClasses.js";
import { passwordReset, sendRegistrationEmail } from "../../mail/Account/accountMails.js";
import { serverLoggerForRoutes } from "../../utils/ServerLog/serverLogger.js";
import * as accountUtils from "../../utils/Account/accountUtils.js";

export async function login(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { username, password } = req.body || {};
        let jsonResponse = { message: config.isDevServer ? "BACKEND: Erfolgreich eingelogged" : "Erfolgreich eingelogged" };

        if (username === undefined || password === undefined) throw new ValidationError("Benutzername und Passwort erforderlich");

        const foundUser = await Models.User.findOne({ where: { username: username } }, { transaction: transaction });

        if (foundUser === null) throw new ValidationError("Dieser Benutzer existiert nicht");
        req.userId = foundUser.id;

        if (foundUser.isDisabled) throw new ForbiddenError("Dieser Benutzer ist gesperrt");
        if (!foundUser.isActive) throw new ForbiddenError("Dieser Benutzer ist noch nicht aktiviert oder wurde vorübergehend deaktiviert");

        const isPasswordMatching = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordMatching) {
            await accountUtils.addLastLogin(req, foundUser.id, false);
            await accountUtils.checkLastLogins(foundUser.id);
            await accountUtils.checkChangedLocationAndRegion(foundUser.id);

            throw new UnauthorizedError("Passwort nicht korrekt");
        }

        const routeGroups = await accountUtils.findRouteGroups(foundUser.id);

        const accessUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "accessToken" } }, { transaction: transaction });
        const refreshUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "refreshToken" } }, { transaction: transaction });

        if (accessUserToken !== null) accessUserToken.destroy({ transaction: transaction });
        if (refreshUserToken !== null) refreshUserToken.destroy({ transaction: transaction });

        const accessToken = accountUtils.generateJWT(foundUser.id, foundUser.username, routeGroups, config.accessTokenSecret, config.accessTokenExpiration);
        const refreshToken = accountUtils.generateJWT(foundUser.id, foundUser.username, routeGroups, config.refreshTokenSecret, config.refreshTokenExpiration);

        const accessTokenExpiresAt = new Date(Date.now() + config.accessTokenExpiration * 1000);
        const refreshTokenExpiresAt = new Date(Date.now() + config.refreshTokenExpiration * 1000);

        await Models.UserToken.create({ userId: foundUser.id, token: accessToken, type: "accessToken", expiresAt: accessTokenExpiresAt }, { transaction: transaction });
        await Models.UserToken.create({ userId: foundUser.id, token: refreshToken, type: "refreshToken", expiresAt: refreshTokenExpiresAt }, { transaction: transaction });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "Lax",
            ...(config.isDevServer ? {} : { secure: true }),
            maxAge: config.refreshTokenExpiration * 1000
        });

        jsonResponse.accessToken = accessToken;
        jsonResponse.username = username.charAt(0).toUpperCase() + username.slice(1);
        jsonResponse.routeGroups = routeGroups;

        await accountUtils.addLastLogin(req, foundUser.id, true);
        await accountUtils.checkChangedLocationAndRegion(foundUser.id);

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, foundUser.id, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function register(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { username, password, email } = req.body || {};
        let jsonResponse = { message: config.isDevServer ? "BACKEND: Benutzer wurde erfolgreich registriert" : "Benutzer wurde erfolgreich registriert" };

        if (username === undefined || password === undefined || email === undefined) throw new ValidationError("Alle Eingaben erforderlich");

        await accountUtils.validateUsername(username);
        await accountUtils.validateEmail(email);
        await accountUtils.validatePassword(password);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Models.User.create({ username: username, email: email, password: hashedPassword }, { transaction: transaction });

        const token = await accountUtils.generateUserToken(transaction, user.id, "userRegistration", config.accountActivationTokenExpiresIn);
        await sendRegistrationEmail(user.email, token, config.accountActivationTokenExpiresIn);

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, null, 201, jsonResponse, "loginController", null);
        return res.status(201).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function accountActivation(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { token } = req.body || {};
        let jsonResponse = { message: "Benutzer erfolgreich freigeschaltet!" };

        if (token === undefined) throw new ValidationError("Token nicht vorhanden");

        const userToken = await Models.UserToken.findOne({ where: { token: token, type: "userRegistration" }, include: { model: Models.User } }, { transaction: transaction });
        if (userToken === null) throw new ValidationError("Token nicht vorhanden");
        req.userId = userToken.User.id;

        if (new Date(Date.now()) > userToken.expiresAt) {
            await userToken.User.destroy({ transaction: transaction });
            throw new ValidationError("Token abgelaufen, bitte neu registrieren");
        }

        userToken.User.isActive = true;
        await userToken.User.save({ transaction: transaction });

        await userToken.destroy({ transaction: transaction });

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, req.userId, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function requestPasswordReset(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { usernameOrEmail } = req.body || {};
        const sendResponse = req.userId === undefined ? true : false;
        let foundUser = undefined;
        let jsonResponse = { message: config.isDevServer ? "BACKEND: Email zum Passwort ändern wurde versandt" : "Email zum Passwort ändern wurde versandt" };

        if (usernameOrEmail === undefined) throw new ValidationError("Benutzername/Email erforderlich");

        if (req.userId === undefined) {
            foundUser = await Models.User.findOne({ where: { [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }] } }, { transaction: transaction });
        } else {
            foundUser = await Models.User.findOne({ where: { id: req.userId } }, { transaction: transaction });
        }

        if (foundUser === null) throw new ValidationError("Es existiert kein Benutzer mit dieser Nutzernamen oder Email");
        if (req.userId === null) req.userId = foundUser.id;

        if (foundUser.isDisabled) throw new UnauthorizedError("Benutzer ist gesperrt, kein zurücksetzten des Passworts möglich");

        const userToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "passwordReset" } }, { transaction: transaction });
        if (userToken !== null) userToken.destroy({ transaction: transaction });

        const token = await accountUtils.generateUserToken(transaction, foundUser.id, "passwordReset", config.passwordResetTokenExpiresIn);
        await passwordReset(foundUser.email, token, config.passwordResetTokenExpiresIn);

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, req.userId, 200, jsonResponse, "loginController", null);
        if (sendResponse) return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function passwordResetOrReactivation(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { token, password } = req.body || {};
        let jsonResponse = { message: config.isDevServer ? "BACKEND: Passwort erfolgreich gespeichert" : "Passwort erfolgreich gespeichert" };

        if (token === undefined || password === undefined) throw new ValidationError("Passwort und Token erforderlich!");
        await accountUtils.validatePassword(password);

        const userToken = await Models.UserToken.findOne(
            {
                where: { token: token, type: { [Op.or]: ["adminRegistration", "passwordReset", "accountReactivation"] } },
                include: Models.User
            },
            { transaction: transaction }
        );

        if (userToken === null) throw new ValidationError("Ungültiger Token");
        req.userId = userToken.User.id;

        if (userToken.expiresAt !== null && new Date(Date.now()) > userToken.expiresAt) {
            if (userToken.type === "adminRegistration") {
                throw new UnauthorizedError("Zeit zum Registrierung abschließen leider abgelaufen bitte selbst registrieren oder einen Admin darum bitten");
            }

            requestPasswordReset(req, res, next);
            throw new ValidationError("Token bereits abgelaufen, neuer Token wurde an deine Email gesendet");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        userToken.User.password = hashedPassword;
        userToken.User.isActive = true;

        await userToken.User.save({ transaction: transaction });
        await userToken.destroy({ transaction: transaction });

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, req.userId, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function logout(req, res, next) {
    try {
        const { userId } = req;
        let jsonResponse = { message: config.isDevServer ? "BACKEND: Benutzer erfolgreich abgemeldet" : "Benutzer erfolgreich abgemeldet" };

        const foundUser = await Models.User.findOne({ where: { id: userId } });
        if (foundUser === null) throw new ValidationError("Kein Nutzer mit diesem Benutzername gefunden");

        const accessUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "accessToken" } });
        const refreshUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "refreshToken" } });

        if (accessUserToken !== null) accessUserToken.destroy();
        if (refreshUserToken !== null) refreshUserToken.destroy();

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "Lax",
            ...(config.isDevServer ? {} : { secure: true })
        });

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, foundUser.id, 200, jsonResponse, "loginController", null);
        res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function refreshAccessToken(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { refreshToken } = req.cookies || {};
        let jsonResponse = { message: config.isDevServer ? "BACKEND: Token erfolgreich erneuert" : "Token erfolgreich erneuert" };

        if (refreshToken === undefined) throw new ValidationError("Keinen Cookie für Erneuerung gefunden");

        const refreshUserToken = await Models.UserToken.findOne(
            { where: { token: refreshToken, type: "refreshToken" }, include: { model: Models.User } },
            { transaction: transaction }
        );

        if (refreshUserToken === null) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                sameSite: "Lax",
                ...(config.isDevServer ? {} : { secure: true })
            });

            throw new UnauthorizedError("Token nicht vorhanden, bitte neu anmelden");
        }
        req.userId = refreshUserToken.User.id;

        const accessUserToken = await Models.UserToken.findOne({ where: { userId: refreshUserToken.User.id, type: "accessToken" } }, { transaction: transaction });
        if (accessUserToken !== null) await accessUserToken.destroy();

        const routeGroups = await accountUtils.findRouteGroups(refreshUserToken.User.id);

        jwt.verify(refreshToken, config.refreshTokenSecret, async (err, decoded) => {
            if (err || decoded.UserInfo.id !== refreshUserToken.User.id) {
                await refreshUserToken.destroy();
                throw new ValidationError("Token stimmt nicht mit Benutzer id überein");
            }

            const newAccessTokenExpiresAt = new Date(Date.now() + config.accessTokenExpiration * 1000);
            const newAccessToken = accountUtils.generateJWT(
                decoded.UserInfo.id,
                decoded.UserInfo.username,
                routeGroups,
                config.accessTokenSecret,
                config.accessTokenExpiration
            );

            await Models.UserToken.create(
                { userId: decoded.UserInfo.id, token: newAccessToken, type: "accessToken", expiresAt: newAccessTokenExpiresAt },
                { transaction: transaction }
            );
            jsonResponse.accessToken = newAccessToken;

            await transaction.commit();

            await serverLoggerForRoutes(req, "INFO", jsonResponse.message, decoded.UserInfo.id, 200, jsonResponse, "loginController", null);
            return res.status(200).json(jsonResponse);
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function changePassword(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { currentPassword, newPassword } = req.body || {};
        const { userId } = req;
        let jsonResponse = { message: "Passwort erfolgreich geändert bitte neu anmelden" };

        if (currentPassword === undefined || newPassword === undefined) throw new ValidationError("Alle Eingaben erforderlich");

        const foundUser = await Models.User.findOne({ where: { id: userId } }, { transaction: transaction });
        if (foundUser === null) throw new ValidationError("Benutzer nicht vorhanden");

        const passwordMatching = await bcrypt.compare(currentPassword, foundUser.password);
        if (!passwordMatching) throw new ValidationError("Altes Passwort stimmt nicht überein");

        await accountUtils.validatePassword(newPassword);
        const newHashedPassword = await bcrypt.hash(newPassword, 10);

        foundUser.password = newHashedPassword;
        await foundUser.save({ transaction: transaction });

        const accessUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "accessToken" } }, { transaction: transaction });
        const refreshUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "refreshToken" } }, { transaction: transaction });

        if (accessUserToken !== null) await accessUserToken.destroy({ transaction: transaction });
        if (refreshUserToken !== null) await refreshUserToken.destroy({ transaction: transaction });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "Lax",
            ...(config.isDevServer ? {} : { secure: true })
        });

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, foundUser.id, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function changeEmail(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { newEmail } = req.body || {};
        const { userId } = req;
        let jsonResponse = { message: "Email erfolgreich geändert" };

        if (newEmail === undefined) throw new ValidationError("Alle Eingaben erforderlich");

        const foundUser = await Models.User.findOne({ where: { id: userId } }, { transaction: transaction });
        if (foundUser === null) throw new ValidationError("Benutzer nicht vorhanden");

        if (foundUser.email.toLowerCase() === newEmail.toLowerCase()) throw new ConflictError("Die Email ist die selbe wie momentan verwendet");
        await accountUtils.validateEmail(newEmail);

        const foundUserWithNewEmail = await Models.User.findOne({ where: { email: newEmail } }, { transaction: transaction });
        if (foundUserWithNewEmail !== null) throw new ConflictError("Email bereits vergeben");

        foundUser.email = newEmail;
        await foundUser.save({ transaction: transaction });

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function changeUsername(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { newUsername } = req.body || {};
        const { userId } = req;
        let jsonResponse = { message: "Benutzername erfolgreich geändert, bitte neu anmelden" };

        if (newUsername === undefined) throw new ValidationError("Alle Eingaben erforderlich");

        const foundUser = await Models.User.findOne({ where: { id: userId } }, { transaction: transaction });
        if (foundUser === null) throw new ValidationError("Benutzer nicht vorhanden");

        if (foundUser.username.toLowerCase() === newUsername.toLowerCase()) throw new ConflictError("Die Benutzername ist der selbe wie momentan verwendet");
        await accountUtils.validateUsername(newUsername);

        const foundUserWithNewUsername = await Models.User.findOne({ where: { username: newUsername } }, { transaction: transaction });
        if (foundUserWithNewUsername !== null) throw new ConflictError("Benutzername bereits vergeben");

        foundUser.username = newUsername;
        await foundUser.save({ transaction: transaction });

        const accessUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "accessToken" } }, { transaction: transaction });
        const refreshUserToken = await Models.UserToken.findOne({ where: { userId: foundUser.id, type: "refreshToken" } }, { transaction: transaction });

        if (accessUserToken !== null) await accessUserToken.destroy({ transaction: transaction });
        if (refreshUserToken !== null) await refreshUserToken.destroy({ transaction: transaction });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "Lax",
            ...(config.isDevServer ? {} : { secure: true })
        });

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function getUsername(req, res, next) {
    try {
        const { userId, username } = req;
        let jsonResponse = { message: "Benutzername erfolgreich zurückgegeben" };
        jsonResponse.username = username.charAt(0).toUpperCase() + username.slice(1);

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function getLastLogins(req, res, next) {
    try {
        const { userId } = req;
        let jsonResponse = { message: "LastLogins erfolgreich zurückgegeben" };

        const foundUser = await Models.User.findOne({ where: { id: userId }, include: { model: Models.LastLogin, limit: 5, order: [["loginAt", "DESC"]] } });

        jsonResponse.lastLogins = foundUser.LastLogins.map((lastLogin) => ({
            ipv4Adress: lastLogin.ipv4Adress,
            country: lastLogin.country,
            regionName: lastLogin.regionName,
            loginAt: lastLogin.loginAt,
            successfully: lastLogin.successfully
        }));

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function getRouteGroups(req, res, next) {
    try {
        const { userId } = req;
        let jsonResponse = { message: "RouteGroups erfolgreich zurückgegeben" };

        jsonResponse.routeGroups = await accountUtils.findRouteGroups(userId);

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "loginController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}
