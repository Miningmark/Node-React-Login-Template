import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
    constructor(message = "Zugriff verweigert") {
        super(message, 403);
    }
}
