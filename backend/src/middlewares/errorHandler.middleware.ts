import { ErrorRequestHandler, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod/v4";

import { databaseLogger, DatabaseLoggerOptions } from "@/config/logger.js";
import { AppError, InternalServerError, ValidationError } from "@/errors/errorClasses.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import { ApiResponse } from "@/utils/apiResponse.util.js";
import { getIpv4Address } from "@/utils/misc.util.js";
import { formatZodError } from "@/utils/zod.util.js";

export const errorHandlerMiddleware: ErrorRequestHandler = async (
    error: unknown,
    req: Request,
    res: Response
): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(error);

    let normalized: AppError;

    if (error instanceof ZodError) {
        normalized = new ValidationError(formatZodError(error));
    } else if (error instanceof MulterError) {
        if (
            error.code === "LIMIT_UNEXPECTED_FILE" ||
            error.code === "LIMIT_FILE_COUNT" ||
            error.code === "LIMIT_FIELD_COUNT"
        ) {
            normalized = new ValidationError("Mehr Dateien erhalten als zulässig");
        } else {
            normalized = new InternalServerError("Fehler mit Dateiannahme");
        }
    } else if (error instanceof AppError) {
        normalized = error;
    } else {
        normalized = new InternalServerError();
    }

    const jsonResponse: Record<string, any> = { message: normalized.message };

    const loggerOptions: DatabaseLoggerOptions = {
        userId: req.userId,
        url: req.originalUrl,
        method: req.method,
        status: normalized.statusCode,
        ipv4Address: getIpv4Address(req),
        userAgent: req.headers["user-agent"],
        requestBody: req.body,
        requestHeaders: req.headers,
        response: jsonResponse,
        source: "errorHandlerMiddleware",
        error: normalized
    };

    await databaseLogger(ServerLogTypes.ERROR, jsonResponse.message, loggerOptions);
    ApiResponse.sendError(res, jsonResponse, normalized.statusCode);
};
