import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
    constructor(message = "Ungültige Anfrage/Eingabe") {
        super(message, 400);
    }
}
