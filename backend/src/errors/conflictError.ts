import { AppError } from "@/errors/errorClasses.js";

export class ConflictError extends AppError {
    constructor(message: string = "Ein Konflikt ist aufgetreten, Aktion nicht möglich") {
        super(message, 409);
    }
}
