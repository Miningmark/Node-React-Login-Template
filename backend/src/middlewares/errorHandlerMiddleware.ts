import { ENV } from "@/config/env";
import { consoleLogger, databaseLogger, DatabaseLoggerOptions } from "@/config/logger";
import { AppError, InternalServerError } from "@/errors/errorClasses";
import { ServerLogLevels } from "@/models/serverLog.model";
import { ApiResponse } from "@/utils/ApiResponse";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorHandlerMiddleware: ErrorRequestHandler = async (error: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
    const path = req.route?.path || req.path || "/unknown";

    if (!(error instanceof AppError)) {
        error = new InternalServerError();
    }

    const loggerOptions: DatabaseLoggerOptions = {
        userId: req.userId,
        url: req.originalUrl,
        method: req.method,
        status: error instanceof AppError ? error.statusCode : 500,
        ipv4Address: getIpAddress(req),
        userAgent: req.headers["user-agent"],
        requestBody: req.body,
        requestHeaders: req.headers,
        response: { message: error.message },
        source: "errorHandlerMiddleware",
        error: error
    };

    await databaseLogger(ServerLogLevels.ERROR, error.message, loggerOptions);
    ApiResponse.sendError(res, error.message, error instanceof AppError ? error.statusCode : 500);
};

const getIpAddress = (req: Request): string | undefined => {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string") return forwardedFor;

    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string") return realIp;

    const remoteAddr = req.headers["remote-addr"];
    if (typeof remoteAddr === "string") return remoteAddr;

    const ip = req.ip;
    if (typeof ip === "string") return ip;

    return undefined;
};
