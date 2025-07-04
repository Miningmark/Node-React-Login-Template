import { AppError } from "@/errors/errorClasses.js";

export class InternalServerError extends AppError {
    constructor(message: string = "Ein interner Serverfehler ist aufgetreten") {
        super(message, 500);
    }
}
