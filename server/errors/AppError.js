export class AppError extends Error {
    constructor(message = "Ein unbekannter Fehler ist aufgetreten", status = 500, reason = null) {
        super(message);
        this.status = status;
        this.reason = reason;
        Error.captureStackTrace(this, this.constructor);
    }
}
