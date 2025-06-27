import { logger } from "@/config/logger";
import { AppError, InternalServerError } from "@/errors/errorClasses";
import { ApiResponse } from "@/utils/ApiResponse";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

export const errorHandlerMiddleware: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    const path = req.route?.path || req.path || "/unknown";

    logger.error(`Error beim aufrufen einer Route: ${path}`, { error: err.stack });

    if (!(err instanceof AppError)) {
        err = new InternalServerError();
    }

    ApiResponse.sendError(res, err.message, err instanceof AppError ? err.statusCode : 500);
};
