import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
    constructor(message = "Zugriff verweigert", reason = null) {
        super(message, 403, reason);
    }
}
