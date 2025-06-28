import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger";
import { AppError, InternalServerError } from "@/errors/errorClasses";
import { ServerLogLevels } from "@/models/serverLog.model";
import { ApiResponse } from "@/utils/ApiResponse";
import { getIpAddress } from "@/utils/miscUtils";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorHandlerMiddleware: ErrorRequestHandler = async (error: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
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
