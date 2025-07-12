import { ForbiddenError, ValidationError } from "@/errors/errorClasses.js";
import Permission from "@/models/permission.model.js";
import RouteGroup from "@/models/routeGroup.model.js";
import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";
import User from "@/models/user.model.js";
import { Op } from "@sequelize/core";
import { ServerLogService } from "./serverLog.service.js";

export class AdminPageService {
    private serverLogService: ServerLogService;
    constructor() {
        this.serverLogService = new ServerLogService();
    }

    async getServerLogs(limit?: number, offset?: number) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten ServerLogs zurück gegeben", logResponse: false };

        const databaseServerLogs = await ServerLog.findAll({ ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.serverLogCount = await ServerLog.count();
        jsonResponse.serverLogs = await this.serverLogService.generateJSONResponse(databaseServerLogs);

        return jsonResponse;
    }

    async getFilteredServerLogs(limit?: number, offset?: number, userIds?: number[], types?: string[], ipv4Adress?: string, createdAtFrom?: Date, createdAtTo?: Date, searchString?: string) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Serverlogs zurück gegeben", logResponse: false };

        const buildServerLogQueryConditions = this.serverLogService.buildServerLogQueryConditions(userIds, types, ipv4Adress, createdAtFrom, createdAtTo, searchString);

        const databaseServerLogs = await ServerLog.findAll({
            where: buildServerLogQueryConditions,
            ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}),
            order: [["id", "DESC"]]
        });

        jsonResponse.serverLogCount = await ServerLog.count({ where: buildServerLogQueryConditions });
        jsonResponse.serverLogs = await this.serverLogService.generateJSONResponse(databaseServerLogs);

        return jsonResponse;
    }

    async getFilterOptionsServerLog() {
        let jsonResponse: Record<string, any> = { message: "Alle Filter Optionen zurück gegeben" };

        const databaseUsers = await User.findAll({});

        jsonResponse.filterOptions = {};
        jsonResponse.filterOptions.users = databaseUsers.map((databaseUser) => {
            return {
                id: databaseUser.id,
                username: databaseUser.username
            };
        });

        jsonResponse.filterOptions.types = Object.values(ServerLogTypes);

        return jsonResponse;
    }

    async getPermissionsWithRouteGroups() {
        let jsonResponse: Record<string, any> = { message: "Alle Rechte mit RouteGroups zurück gegeben" };

        const databasePermissions = await Permission.findAll({ include: { model: RouteGroup } });

        jsonResponse.permissions = databasePermissions.map((databasePermission) => {
            return {
                id: databasePermission.id,
                name: databasePermission.name,
                description: databasePermission.description,
                routeGroups: databasePermission.routeGroups
                    ? databasePermission.routeGroups.map((databaseRouteGroup) => ({
                          id: databaseRouteGroup.id,
                          name: databaseRouteGroup.name,
                          description: databaseRouteGroup.description
                      }))
                    : []
            };
        });

        return jsonResponse;
    }

    async getRouteGroups() {
        let jsonResponse: Record<string, any> = { message: "Alle RouteGroups zurück gegeben" };

        const databaseRouteGroups = await RouteGroup.findAll();

        jsonResponse.routeGroups = databaseRouteGroups.map((databaseRouteGroup) => {
            return {
                id: databaseRouteGroup.id,
                name: databaseRouteGroup.name,
                description: databaseRouteGroup.description
            };
        });

        return jsonResponse;
    }

    async createPermission(name: string, routeGroupIds: number[], description?: string) {
        let jsonResponse: Record<string, any> = { message: "Recht erfolgreich erstellt" };

        const databasePermissionNew = await Permission.findOne({ where: { name: name } });
        if (databasePermissionNew !== null) throw new ValidationError("Der Name für die Permission ist schon belegt");

        const databasePermission = await Permission.create({ name: name, description: description });
        const databaseRouteGroups = await RouteGroup.findAll({ where: { id: { [Op.in]: routeGroupIds } } });

        await databasePermission.setRouteGroups(databaseRouteGroups);

        jsonResponse.permissionId = databasePermission.id;

        return jsonResponse;
    }

    async updatePermission(id: number, name?: string, description?: string, routeGroupIds?: number[]) {
        let jsonResponse: Record<string, any> = { message: "Recht erfolgreich bearbeitet" };

        const databasePermission = await Permission.findOne({ where: { id: id } });
        if (databasePermission === null) throw new ValidationError("Es gibt keine Permission mit dieser Id");
        if (databasePermission.name.toLowerCase() === "SuperAdmin Berechtigung".toLowerCase()) throw new ForbiddenError("Die SuperAdmin Berechtigung kann nicht bearbeitet werden");

        if (name !== undefined) {
            const databasePermissionNew = await Permission.findOne({ where: { name: name } });
            if (databasePermissionNew !== null) throw new ValidationError("Der Name für die Permission ist schon belegt");

            databasePermission.name = name;
        }

        if (description !== undefined) {
            databasePermission.description = description;
        }

        if (routeGroupIds !== undefined) {
            const databaseRouteGroups = await RouteGroup.findAll({ where: { id: { [Op.in]: routeGroupIds } } });
            await databasePermission.setRouteGroups(databaseRouteGroups);
        }

        await databasePermission.save();

        return jsonResponse;
    }

    async deletePermission(id: number) {
        let jsonResponse: Record<string, any> = { message: "Recht erfolgreich gelöscht" };

        const databasePermission = await Permission.findOne({ where: { id: id } });
        if (databasePermission === null) throw new ValidationError("Es gibt keine Permission mit dieser ID");
        if (databasePermission.name.toLowerCase() === "SuperAdmin Berechtigung".toLowerCase()) throw new ForbiddenError("Die SuperAdmin Berechtigung kann nicht gelöscht werden");

        await databasePermission.destroy();

        return jsonResponse;
    }
}
