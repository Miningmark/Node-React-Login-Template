import { AppError } from "./AppError.js";

export class InternalServerError extends AppError {
    constructor(message = "Ein interner Serverfehler ist aufgetreten") {
        super(message, 500);
    }
}
