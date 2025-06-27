import { AppError } from "@/errors/errorClasses";

export class UnauthorizedError extends AppError {
    constructor(message: string = "Authentication failed") {
        super(message, 401);
    }
}
