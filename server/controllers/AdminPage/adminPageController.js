import { Models, sequelize } from "../modelController.js";
import { ValidationError } from "../../errors/errorClasses.js";
import { serverLoggerForRoutes } from "../../utils/ServerLog/serverLogger.js";
import { buildJSONResponse, buildServerLogWhereClause } from "../../utils/ServerLog/ServerLogUtils.js";
import { Op } from "sequelize";

export async function getServerLog(req, res, next) {
    try {
        const { userId } = req;
        const { limit, offset } = req.params || {};
        let jsonResponse = { message: "Alle angeforderten Serverlogs zurück gegeben", serverLogs: {} };

        if (limit !== undefined && offset !== undefined) {
            if (isNaN(Number(limit))) throw new ValidationError("Parameter muss eine Nummer sein");
            if (isNaN(Number(offset))) throw new ValidationError("Parameter muss eine Nummer sein");
        }
        const logResults = await Models.ServerLog.findAll({ ...(limit || offset ? { limit: Number(limit), offset: Number(offset) } : {}), order: [["id", "DESC"]] });

        if (logResults !== null) {
            jsonResponse.serverLogCount = await Models.ServerLog.count();
            jsonResponse.serverLogs = buildJSONResponse(logResults);
        }

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

        if (limit !== undefined && offset !== undefined) {
            if (isNaN(Number(limit))) throw new ValidationError("Parameter muss eine Nummer sein");
            if (isNaN(Number(offset))) throw new ValidationError("Parameter muss eine Nummer sein");
        }

        const whereClause = buildServerLogWhereClause(userIds, levels, ipv4Address, timestampFrom, timestampTo, searchString);
        const logResults = await Models.ServerLog.findAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            order: [["id", "DESC"]]
        });

        if (logResults !== null) {
            jsonResponse.serverLogCount = await Models.ServerLog.count({ where: whereClause });
            jsonResponse.serverLogs = buildJSONResponse(logResults);
        }

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
        let jsonResponse = { message: "Alle Rechte mit RouteGroups zurück gegeben", permissions: [] };

        const permissions = await Models.Permission.findAll({ include: { model: Models.RouteGroup } });

        if (permissions !== null) {
            jsonResponse.permissions = permissions.map((permission) => {
                return {
                    id: permission.id,
                    name: permission.name,
                    description: permission.description,
                    routeGroups: permission.RouteGroups?.map((routeGroup) => ({
                        id: routeGroup.id,
                        name: routeGroup.name,
                        description: routeGroup.description
                    }))
                };
            });
        }

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function getAllRouteGroups(req, res, next) {
    try {
        const { userId } = req;
        let jsonResponse = { message: "Alle RouteGroups zurück gegeben", routeGroups: [] };

        const routeGroups = await Models.RouteGroup.findAll();

        if (routeGroups !== null) {
            jsonResponse.routeGroups = routeGroups.map((routeGroup) => {
                return {
                    id: routeGroup.id,
                    name: routeGroup.name,
                    hasPermission: routeGroup.permissionId === null ? false : true,
                    description: routeGroup.description
                };
            });
        }

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        next(error);
    }
}

export async function createPermission(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { userId } = req;
        const { name, description, routeGroupIds } = req.body || {};
        let jsonResponse = { message: "Recht erfolgreich erstellt" };

        if (name === undefined || description === undefined || routeGroupIds === undefined || !Array.isArray(routeGroupIds))
            throw new ValidationError("Es müssen alle Parameter angegeben werden");

        const foundPermission = await Models.Permission.findOne({ where: { name: name } });
        if (foundPermission !== null) throw new ValidationError("Es gibt bereits eine Permission mit diesen Namen");

        const createdPermission = await Models.Permission.create({ name: name, description: description }, { transaction: transaction });
        const foundRouteGroups = await Models.RouteGroup.findAll({ where: { id: { [Op.in]: routeGroupIds } } }, { transaction: transaction });

        if (foundRouteGroups !== null) {
            await Promise.all(
                foundRouteGroups.map(async (routeGroup) => {
                    if (routeGroup.permissionId !== null) throw new ValidationError("Diese RouteGroup ist bereits einem anderen Recht zugewiesen");
                    await createdPermission.addRouteGroup(routeGroup, { transaction: transaction });
                })
            );
        }

        jsonResponse.permissionId = createdPermission.id;

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function updatePermission(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { userId } = req;
        const { id, name, description, routeGroupIds } = req.body || {};
        let jsonResponse = { message: "Recht erfolgreich bearbeitet" };

        if (id === undefined || name === undefined || description === undefined || routeGroupIds === undefined || !Array.isArray(routeGroupIds))
            throw new ValidationError("Es müssen alle Parameter angegeben werden");

        const foundPermissionWithNewName = await Models.Permission.findOne({ where: { name: name }, include: { model: Models.RouteGroup } });
        if (foundPermissionWithNewName === null) throw new ValidationError("Es gibt keine Permission mit diesem Namen");

        const foundPermission = await Models.Permission.findOne({ where: { id: id }, include: { model: Models.RouteGroup } });
        if (foundPermission === null) throw new ValidationError("Es gibt keine Permission mit dieser id");

        if (foundPermission.RouteGroups !== undefined) {
            await Promise.all(
                foundPermission.RouteGroups.map(async (routeGroup) => {
                    routeGroup.permissionId = null;
                    routeGroup.save({ transaction: transaction });
                })
            );
        }

        foundPermission.name = name;
        foundPermission.description = description;

        const foundRouteGroups = await Models.RouteGroup.findAll({ where: { id: { [Op.in]: routeGroupIds } } }, { transaction: transaction });

        if (foundRouteGroups !== null) {
            await Promise.all(
                foundRouteGroups.map(async (routeGroup) => {
                    if (routeGroup.permissionId !== null && routeGroup.permissionId !== id)
                        throw new ValidationError("Diese RouteGroup ist bereits einem anderen Recht zugewiesen");
                    await foundPermission.addRouteGroup(routeGroup, { transaction: transaction });
                })
            );
        }

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function deletePermission(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { userId } = req;
        const { permissionId } = req.body || {};
        let jsonResponse = { message: "Recht erfolgreich gelöscht" };

        if (permissionId === undefined) throw new ValidationError("Es muss die id angegeben werden");

        const foundPermission = await Models.Permission.findOne({ where: { id: permissionId }, include: { model: Models.RouteGroup } });
        if (foundPermission === null) throw new ValidationError("Es gibt keine Permission mit dieser id");

        if (foundPermission.RouteGroups !== undefined) {
            await Promise.all(
                foundPermission.RouteGroups.map(async (routeGroup) => {
                    routeGroup.permissionId = null;
                    routeGroup.save({ transaction: transaction });
                })
            );
        }

        await foundPermission.destroy({ transaction: transaction });

        await transaction.commit();

        await serverLoggerForRoutes(req, "INFO", jsonResponse.message, userId, 200, jsonResponse, "adminPageController", null);
        return res.status(200).json(jsonResponse);
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}
