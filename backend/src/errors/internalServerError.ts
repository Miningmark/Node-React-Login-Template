import { AppError } from "@/errors/errorClasses";

export class InternalServerError extends AppError {
    constructor(message: string = "Internal Server Error") {
        super(message, 500);
    }
}
