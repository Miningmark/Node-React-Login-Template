import config from "../config/config.js";
import { AppError } from "../errors/AppError.js";
import { serverLogger } from "../utils/ServerLog/serverLogger.js";

export async function errorHandler(error, req, res, next) {
    let errorType = "";
    let jsonResponse = {};

    let loggerOptions = {
        userId: req.userId,
        url: req.originalUrl,
        method: req.method,
        ipv4Adress: req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.headers["remote-addr"] || req.ip,
        userAgent: req.headers["user-agent"],
        requestBody: req.body,
        requestHeaders: req.headers,
        response: {},
        source: "errorHandler",
        errorStack: error
    };

    if (error instanceof AppError) {
        errorType = "ERROR";
        jsonResponse = { message: config.isDevServer ? "BACKEND: " + error.message : error.message, ...(error.reason && { reason: error.reason }) };
        loggerOptions.status = error.status;
        loggerOptions.response = jsonResponse;
    } else {
        errorType = "CRITICAL";
        jsonResponse = { message: "Interner Serverfehler bitte Admin kontaktieren" };
        loggerOptions.status = 500;
        loggerOptions.response = jsonResponse;
    }

    await serverLogger(errorType, error.message, loggerOptions);
    return res.status(loggerOptions.status).json(jsonResponse);
}
