import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
    constructor(message = "Ein Konflikt ist aufgetreten, Aktion nicht möglich") {
        super(message, 409);
    }
}
