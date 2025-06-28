import { AppError } from "@/errors/errorClasses";

export class ForbiddenError extends AppError {
    constructor(message: string = "Zugriff verweigert") {
        super(message, 403);
    }
}
