import { AppError } from "@/errors/errorClasses";

export class ForbiddenError extends AppError {
    constructor(message: string = "Access denied") {
        super(message, 403);
    }
}
