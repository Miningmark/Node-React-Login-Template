import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger";
import { ServerLogLevels } from "@/models/serverLog.model";
import { getIpAddress } from "@/utils/miscUtils";
import { Request, Response } from "express";

export class ApiResponse {
    static sendSuccess(res: Response, req: Request, successMessage: string = "Success", statusCode: number = 200, jsonData: any = undefined) {
        const loggerOptions: DatabaseLoggerOptions = {
            userId: req.userId,
            url: req.originalUrl,
            method: req.method,
            status: statusCode,
            ipv4Address: getIpAddress(req),
            userAgent: req.headers["user-agent"],
            requestBody: req.body,
            requestHeaders: req.headers,
            response: { message: successMessage },
            source: "ApiResponse"
        };

        databaseLogger(ServerLogLevels.INFO, successMessage, loggerOptions);
        res.status(statusCode).json({ message: successMessage, data: jsonData });
    }

    static sendError(res: Response, errorMessage: string, statusCode: number = 400) {
        res.status(statusCode).json({ message: errorMessage });
    }
}
