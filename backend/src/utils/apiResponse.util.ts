import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import { getIpv4Address } from "@/utils/misc.util.js";
import { Request, Response } from "express";
import { Readable } from "stream";

export class ApiResponse {
    static async sendJSONSuccess(res: Response, req: Request, jsonResponse: Record<string, any>, logResponse: boolean = true, statusCode: number = 200) {
        const loggerOptions = this.generateLoggerOptions(req, jsonResponse, logResponse, statusCode);

        await databaseLogger(ServerLogTypes.INFO, jsonResponse?.message, loggerOptions);
        return res.status(statusCode).json(jsonResponse);
    }

    static async sendStreamSuccess(res: Response, req: Request, contentType: string, stream: Readable, jsonResponse: Record<string, any> = {}) {
        const loggerOptions = this.generateLoggerOptions(req, jsonResponse);
        await databaseLogger(ServerLogTypes.INFO, jsonResponse?.message, loggerOptions);

        res.setHeader("Content-Type", contentType);
        stream.pipe(res);
    }

    static async sendError(res: Response, req: Request, jsonResponse: Record<string, any>, statusCode: number = 500, logResponse: boolean = false) {
        const loggerOptions = this.generateLoggerOptions(req, jsonResponse, logResponse, statusCode);
        const level = statusCode >= 500 ? ServerLogTypes.ERROR : statusCode >= 400 ? ServerLogTypes.WARN : ServerLogTypes.INFO;

        await databaseLogger(level, jsonResponse?.message, loggerOptions);

        return res.status(statusCode).json(jsonResponse);
    }

    private static generateLoggerOptions(req: Request, jsonResponse: Record<string, any>, logResponse: boolean = true, statusCode: number = 200): DatabaseLoggerOptions {
        return {
            userId: req.userId,
            url: req.originalUrl,
            method: req.method,
            status: statusCode,
            ipv4Address: getIpv4Address(req),
            userAgent: req.headers["user-agent"],
            requestBody: req.body,
            requestHeaders: req.headers,
            response: logResponse ? jsonResponse : { response: "*removed*" },
            source: "ApiResponse"
        };
    }
}
