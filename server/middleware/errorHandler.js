import { AppError } from "../errors/AppError.js";
import config from "../config/config.js";

export const errorHandler = (error, req, res, next) => {
    //TODO: logging inside database

    if (config.logErrorsInsideConsole) console.error(error);

    if (error instanceof AppError) {
        return res
            .status(error.status)
            .json({ message: config.isDevServer ? "BACKEND: " + error.message : error.message, ...(error.reason && { reason: error.reason }) });
    }

    return res.status(500).json({ message: "Interner Serverfehler bitte Admin kontaktieren" });
};
