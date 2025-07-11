import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";
import { ServerLogService } from "./serverLog.service.js";
import User from "@/models/user.model.js";
import RouteGroup from "@/models/routeGroup.model.js";
import Permission from "@/models/permission.model.js";

export class AdminPageService {
    private serverLogService: ServerLogService;
    constructor() {
        this.serverLogService = new ServerLogService();
    }

    async getServerLogs(limit: number | undefined, offset: number | undefined) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten ServerLogs zurück gegeben", logResponse: false };

        const databaseServerLogs = await ServerLog.findAll({ ...(limit && offset ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

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

        jsonResponse.filterOptions.levels = Object.values(ServerLogTypes);

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
                routeGroups: databasePermission.routeGroups.map((databaseRouteGroup) => ({
                    id: databaseRouteGroup.id,
                    name: databaseRouteGroup.name,
                    description: databaseRouteGroup.description
                }))
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
}
