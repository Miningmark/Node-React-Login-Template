import { AppError } from "@/errors/errorClasses.js";

export class UnauthorizedError extends AppError {
    constructor(message: string = "Authentifizierung fehlgeschlagen") {
        super(message, 401);
    }
}
