import { AppError } from "../errors/AppError.js";

export const errorHandler = (error, req, res, next) => {
    //TODO: logging inside database

    if (error instanceof AppError) {
        return res.status(error.status).json({ message: error.message, reason: error.reason });
    }

    return res.status(500).json({ message: "Interner Serverfehler bitte Admin kontaktieren" });
};
