import { Models } from "../modelController.js";
import { serverLoggerForRoutes } from "../../utils/ServerLog/serverLogger.js";

export async function getServerLog(req, res, next) {
    try {
        const { userId } = req;
        const { limit, offset } = req.params || {};
        let jsonResponse = { message: "Alle angeforderten Serverlogs zurück gegeben", serverLogs: {} };

        const logs = await Models.ServerLog.findAll({ ...(limit || offset ? { limit: Number(limit), offset: Number(offset) } : {}), order: [["id", "ASC"]] });

        if (logs === null) {
            await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse.message, "adminPageController", null);
            return res.status(200).json(jsonResponse);
        }

        jsonResponse.serverLogs = logs.map((log) => {
            return {
                id: log.id,
                level: log.level,
                message: log.message,
                userId: log.UserId,
                url: log.url,
                method: log.method,
                status: log.status,
                ipv4Adress: log.ipv4Adress,
                userAgent: log.userAgent,
                requestBody: log.requestBody,
                requestHeaders: log.requestHeaders,
                response: log.response,
                source: log.source,
                errorStack: log.errorStack,
                timestamp: log.timestamp
            };
        });

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse.message, "userManagementController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

/*
        const { userId } = req;
        const { search } = req.params || {};
        //let jsonResponse = { message: "Alle angeforderten ServerLogs zurück gegeben", users: {} };

        const fromDate = new Date("2025-01-01");
        const toDate = new Date("2025-12-31");
        const limitTwo = 50;
        const offsetTwo = 0;

        const results = await Models.ServerLog.findAll({
            where: {
                [Op.or]: [{ message: { [Op.like]: `%${search}%` } }, { url: { [Op.like]: `%${search}%` } }, { method: { [Op.like]: `%${search}%` } }]
            },
            limit: 5000
        });

        /*const results = await Models.ServerLog.findAll({
            /*attributes: {
                include: [
                    [
                        Sequelize.literal(`
          MATCH (
            message,
            url,
            method,
            ipv4Adress,
            userAgent,
            source,
            errorStack,
            requestBody,
            requestHeaders,
            response
          )
          AGAINST (${sequelize.escape(searchTerm)} IN NATURAL LANGUAGE MODE)
        `),
                        "relevance"
                    ]
                ]
            },
            where: Sequelize.literal(
                `MATCH (message,url,method,ipv4Adress,userAgent,source,errorStack,requestBody,requestHeaders,response) AGAINST (${sequelize.escape(
                    searchTerm
                )} IN NATURAL LANGUAGE MODE)`
            ),
            //order: [[Sequelize.literal("relevance"), "DESC"]],
            limit: limitTwo,
            offset: offsetTwo
        });

        res.status(200).json(results);
        const users = await Models.User.findAll({
            include: {
                model: Models.Permission
            },
            ...(limit || offset ? { limit: Number(limit), offset: Number(offset) } : {})
        });

        if (users === null) {
            await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "userManagementController", null);
            return res.status(200).json(jsonResponse);
        }

        jsonResponse.users = users.map((user) => {
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                isDisabled: user.isDisabled,
                permissions: user.Permissions?.map((permission) => ({
                    id: permission.id,
                    name: permission.name
                }))
            };
        });




        /*const { username, password } = req.body || {};
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
        return res.status(200).json(jsonResponse);*/
