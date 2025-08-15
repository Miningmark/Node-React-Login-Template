import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";
import { Op, WhereOptions } from "@sequelize/core";
import { injectable } from "tsyringe";

@injectable()
export class ServerLogService {
    constructor() {}

    generateJSONResponse(databaseServerLogs: ServerLog[]): Record<string, any> {
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

    buildServerLogQueryConditions(
        userIds?: number[],
        types?: ServerLogTypes[],
        ipv4Address?: string,
        createdAtFrom?: Date,
        createdAtTo?: Date,
        searchString?: string
    ) {
        const conditions: WhereOptions[] = [];

        if (userIds !== undefined && userIds.length > 0) {
            const orConditions: WhereOptions[] = [];

            const nonNullUserIds = userIds.filter((id) => id !== -1);
            if (nonNullUserIds.length > 0) {
                orConditions.push({ userId: { [Op.in]: nonNullUserIds } });
            }

            if (userIds.includes(-1)) {
                orConditions.push({ userId: null });
            }

            if (orConditions.length === 1) {
                conditions.push(orConditions[0]);
            } else if (orConditions.length > 1) {
                const orClause = { [Op.or]: orConditions };
                conditions.push(orClause);
            }
        }

        if (types !== undefined && types.length > 0) {
            conditions.push({ type: types.length === 1 ? types[0] : { [Op.in]: types } });
        }

        if (ipv4Address) {
            conditions.push({ ipv4Address: { [Op.like]: `%${ipv4Address}%` } });
        }

        if (createdAtFrom !== undefined) {
            conditions.push({ createdAt: { [Op.gte]: createdAtFrom } });
        }

        if (createdAtTo !== undefined) {
            conditions.push({ createdAt: { [Op.lte]: createdAtTo } });
        }

        if (searchString) {
            const like = { [Op.like]: `%${searchString}%` };
            conditions.push({
                [Op.or]: [
                    { message: like },
                    { url: like },
                    { method: like },
                    !isNaN(Number(searchString)) ? { status: Number(searchString) } : {},
                    { userAgent: like }
                ]
            });
        }

        return conditions.length > 0 ? { [Op.and]: conditions } : {};
    }
}
