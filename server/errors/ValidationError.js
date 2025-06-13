import { AppError } from "./AppError.js";

export class ValidationError extends AppError {
    constructor(message = "Die eingegebenen Daten sind ungültig", reason = null) {
        super(message, 400, reason);
    }
}
