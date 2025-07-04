import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger.js";
import { AppError, InternalServerError } from "@/errors/errorClasses.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import { ApiResponse } from "@/utils/apiResponse.util.js";
import { getIpAddress } from "@/utils/misc.util.js";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorHandlerMiddleware: ErrorRequestHandler = async (error: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!(error instanceof AppError)) {
        console.log(error);
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

    await databaseLogger(ServerLogTypes.ERROR, error.message, loggerOptions);
    ApiResponse.sendError(res, error.message, error instanceof AppError ? error.statusCode : 500);
};
