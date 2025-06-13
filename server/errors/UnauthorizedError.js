import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
    constructor(message = "Authentifizierung fehlgeschlagen", reason = null) {
        super(message, 401, reason);
    }
}
