import { AppError } from "@/errors/errorClasses";

export class ValidationError extends AppError {
    constructor(message: string = "Die eingegebenen Daten sind ungültig") {
        super(message, 400);
    }
}
