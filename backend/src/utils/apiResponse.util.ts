import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import { getIpv4Address } from "@/utils/misc.util.js";
import { Request, Response } from "express";

export class ApiResponse {
    static async sendSuccess(res: Response, req: Request, jsonData: Record<string, any>, statusCode: number = 200, logResponse: boolean = true) {
        const loggerOptions: DatabaseLoggerOptions = {
            userId: req.userId,
            url: req.originalUrl,
            method: req.method,
            status: statusCode,
            ipv4Address: getIpv4Address(req),
            userAgent: req.headers["user-agent"],
            requestBody: req.body,
            requestHeaders: req.headers,
            response: logResponse ? jsonData : { response: "*removed*" },
            source: "ApiResponse"
        };

        await databaseLogger(ServerLogTypes.INFO, jsonData?.message, loggerOptions);
        res.status(statusCode).json(jsonData);
    }

    static sendError(res: Response, errorMessage: string, statusCode: number = 400) {
        res.status(statusCode).json({ message: errorMessage });
    }
}
