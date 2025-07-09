import ServerLog from "@/models/serverLog.model.js";
import { ServerLogService } from "./serverLog.service.js";

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

        console.log(limit, offset);
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
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Serverlogs zurück gegeben", logResponse: false };

        //TODO:

        return jsonResponse;
    }
}
