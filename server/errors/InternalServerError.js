import { AppError } from "./AppError.js";

export class InternalServerError extends AppError {
    constructor(message = "Ein interner Serverfehler ist aufgetreten", reason = null) {
        super(message, 500, reason);
    }
}
