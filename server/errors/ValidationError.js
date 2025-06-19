import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
    constructor(message = "Die eingegebenen Daten sind ungültig") {
        super(message, 400);
    }
}
