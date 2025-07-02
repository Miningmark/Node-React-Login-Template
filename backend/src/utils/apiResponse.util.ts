import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger";
import { ServerLogLevels } from "@/models/serverLog.model";
import { getIpAddress } from "@/utils/misc.util";
import { Request, Response } from "express";

export class ApiResponse {
    static async sendSuccess(res: Response, req: Request, jsonData: any, statusCode: number = 200) {
        const loggerOptions: DatabaseLoggerOptions = {
            userId: req.userId,
            url: req.originalUrl,
            method: req.method,
            status: statusCode,
            ipv4Address: getIpAddress(req),
            userAgent: req.headers["user-agent"],
            requestBody: req.body,
            requestHeaders: req.headers,
            response: jsonData,
            source: "ApiResponse"
        };

        await databaseLogger(ServerLogLevels.INFO, jsonData?.message, loggerOptions);
        res.status(statusCode).json(jsonData);
    }

    static sendError(res: Response, errorMessage: string, statusCode: number = 400) {
        res.status(statusCode).json({ message: errorMessage });
    }
}
