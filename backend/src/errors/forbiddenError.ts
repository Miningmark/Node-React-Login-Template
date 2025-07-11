import { AppError } from "@/errors/errorClasses.js";

export class ForbiddenError extends AppError {
    constructor(message: string = "Zugriff verweigert") {
        super(message, 403);
    }
}
