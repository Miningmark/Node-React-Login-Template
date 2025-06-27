import { AppError } from "@/errors/errorClasses";

export class ConflictError extends AppError {
    constructor(message: string = "A conflict has occurred, action not possible") {
        super(message, 409);
    }
}
