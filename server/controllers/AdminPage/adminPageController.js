import { Models } from "../modelController.js";
import { serverLoggerForRoutes } from "../../utils/ServerLog/serverLogger.js";
import { Op, where } from "sequelize";
import { buildJSONResponse, buildServerLogWhereClause } from "../../utils/ServerLog/ServerLogUtils.js";

export async function getServerLog(req, res, next) {
    try {
        const { userId } = req;
        const { limit, offset } = req.params || {};
        let jsonResponse = { message: "Alle angeforderten Serverlogs zurück gegeben", serverLogs: {} };

        //TODO: check limit and offset

        const logResults = await Models.ServerLog.findAll({ ...(limit || offset ? { limit: Number(limit), offset: Number(offset) } : {}), order: [["id", "DESC"]] });

        if (logResults === null) {
            await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
            return res.status(200).json(jsonResponse);
        }

        jsonResponse.serverLogCount = await Models.ServerLog.count();
        jsonResponse.serverLogs = buildJSONResponse(logResults);

        let jsonResponseServerLogger = {};
        jsonResponseServerLogger.message = jsonResponse.message;
        jsonResponseServerLogger.serverLogs = "*removed*";

        await serverLoggerForRoutes(req, "INFO", jsonResponseServerLogger.message, userId, 200, jsonResponseServerLogger, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function getFilteredServerLog(req, res, next) {
    try {
        const { userId } = req;
        const { userIds, levels, ipv4Address, timestampFrom, timestampTo, searchString } = req.body || {};
        const { limit, offset } = req.params || {};
        let jsonResponse = { message: "Alle angeforderten Serverlogs zurück gegeben", serverLogs: {} };

        //TODO: check limit and offset

        const whereClause = buildServerLogWhereClause(userIds, levels, ipv4Address, timestampFrom, timestampTo, searchString);
        const logResults = await Models.ServerLog.findAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            order: [["id", "DESC"]]
        });

        if (logResults === null) {
            await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse.message, "adminPageController", null);
            return res.status(200).json(jsonResponse);
        }

        jsonResponse.serverLogCount = await Models.ServerLog.count({ where: whereClause });
        jsonResponse.serverLogs = buildJSONResponse(logResults);

        let jsonResponseServerLogger = {};
        jsonResponseServerLogger.message = jsonResponse.message;
        jsonResponseServerLogger.serverLogs = "*removed*";

        await serverLoggerForRoutes(req, "INFO", jsonResponseServerLogger.message, userId, 200, jsonResponseServerLogger, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function getFilterOptionsServerLog(req, res, next) {
    try {
        const { userId } = req;
        let jsonResponse = { message: "Alle Filter Optionen zurück gegeben", filterOptions: { users: [] } };

        const foundUsers = await Models.User.findAll({});

        if (foundUsers !== null) {
            jsonResponse.filterOptions.users = foundUsers.map((user) => {
                return {
                    id: user.id,
                    username: user.username
                };
            });
        }

        jsonResponse.filterOptions.levels = Models.ServerLog.rawAttributes.level.values;

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function getAllPermissionsWithRouteGroups(req, res, next) {
    try {
        const { userId } = req;
        let jsonResponse = { message: "Alle Filter Optionen zurück gegeben", filterOptions: { users: [] } };

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function getAllRouteGroups(req, res, next) {
    try {
        const { userId } = req;
        let jsonResponse = { message: "Alle Filter Optionen zurück gegeben", filterOptions: { users: [] } };

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}
