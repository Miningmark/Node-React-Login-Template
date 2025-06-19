import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
    constructor(message = "Authentifizierung fehlgeschlagen") {
        super(message, 401);
    }
}
