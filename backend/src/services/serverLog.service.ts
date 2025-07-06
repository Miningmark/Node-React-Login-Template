import ServerLog from "@/models/serverLog.model.js";

export class ServerLogService {
    async generateJSONResponse(databaseServerLogs: ServerLog[]): Promise<Record<string, any>> {
        return databaseServerLogs.map((databaseServerLog) => {
            return {
                id: databaseServerLog.id,
                type: databaseServerLog.type,
                message: databaseServerLog.message,
                userId: databaseServerLog.userId,
                url: databaseServerLog.url,
                method: databaseServerLog.method,
                status: databaseServerLog.status,
                ipv4Address: databaseServerLog.ipv4Address,
                userAgent: databaseServerLog.userAgent,
                requestBody: databaseServerLog.requestBody,
                requestHeaders: databaseServerLog.requestHeaders,
                response: databaseServerLog.response,
                source: databaseServerLog.source,
                errorStack: databaseServerLog.errorStack,
                createdAt: databaseServerLog.createdAt
            };
        });
    }
}
