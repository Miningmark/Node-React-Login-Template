import { AppError } from "@/errors/errorClasses";

export class BadRequestError extends AppError {
    constructor(message: string = "Ungültige Anfrage/Eingabe") {
        super(message, 400);
    }
}
