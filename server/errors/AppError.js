export class AppError extends Error {
    constructor(message = "Ein unbekannter Fehler ist aufgetreten", status = 500) {
        super(message);
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}
