import { AppError } from "@/errors/errorClasses";

export class NotFoundError extends AppError {
    constructor(message: string = "Requested Route not found") {
        super(message, 404);
    }
}
