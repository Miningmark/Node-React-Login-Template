import ServerLog from "@/models/serverLog.model.js";
import { ServerLogService } from "./serverLog.service.js";

export class AdminPageService {
    private serverLogService: ServerLogService;
    constructor() {
        this.serverLogService = new ServerLogService();
    }

    //TODO: add tests
    async getServerLogs(limit: number | undefined, offset: number | undefined) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten ServerLogs zurück gegeben", logResponse: false };

        const databaseServerLogs = await ServerLog.findAll({ ...(limit && offset ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.serverLogCount = await ServerLog.count();
        jsonResponse.serverLogs = await this.serverLogService.generateJSONResponse(databaseServerLogs);

        return jsonResponse;
    }
}
