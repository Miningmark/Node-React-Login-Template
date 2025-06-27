import { AppError } from "@/errors/errorClasses";

export class UnauthorizedError extends AppError {
    constructor(message: string = "Authentifizierung fehlgeschlagen") {
        super(message, 401);
    }
}
