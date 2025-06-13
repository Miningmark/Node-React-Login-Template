import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
    constructor(message = "Ungültige Anfrage/Eingabe", reason = null) {
        super(message, 400, reason);
    }
}
