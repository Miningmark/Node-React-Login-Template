import { AppError } from "@/errors/errorClasses.js";

export class ValidationError extends AppError {
    constructor(message: string = "Die eingegebenen Daten sind ungültig") {
        super(message, 400);
    }
}
