import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger.js";
import { AppError, InternalServerError, ValidationError } from "@/errors/errorClasses.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import { ApiResponse } from "@/utils/apiResponse.util.js";
import { getIpv4Address } from "@/utils/misc.util.js";
import { formatZodError } from "@/utils/zod.util.js";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod/v4";

export const errorHandlerMiddleware: ErrorRequestHandler = async (error: unknown, req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (error instanceof ZodError) {
        error = new ValidationError(formatZodError(error));
    } else if (error instanceof MulterError) {
        if (error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_FIELD_COUNT") {
            error = new ValidationError("Mehr Dateien erhalten als zulässig");
        } else {
            error = new InternalServerError("Fehler mit Dateiannahme");
        }
    } else if (!(error instanceof AppError)) {
        console.log(error);
        error = new InternalServerError();
    }

    const loggerOptions: DatabaseLoggerOptions = {
        userId: req.userId,
        url: req.originalUrl,
        method: req.method,
        status: error instanceof AppError ? error.statusCode : 500,
        ipv4Address: getIpv4Address(req),
        userAgent: req.headers["user-agent"],
        requestBody: req.body,
        requestHeaders: req.headers,
        response: { message: (error as AppError).message },
        source: "errorHandlerMiddleware",
        error: error as Error
    };

    let jsonResponse: Record<string, any> = {};
    jsonResponse.message = error instanceof ZodError ? formatZodError(error) : (error as AppError).message;

    await databaseLogger(ServerLogTypes.ERROR, jsonResponse.message, loggerOptions);
    ApiResponse.sendError(res, jsonResponse, error instanceof AppError ? error.statusCode : 500);
};
