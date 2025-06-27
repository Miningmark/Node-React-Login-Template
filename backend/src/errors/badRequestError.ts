import { AppError } from "@/errors/errorClasses";

export class BadRequestError extends AppError {
    constructor(message: string = "Invalid Request/Input") {
        super(message, 400);
    }
}
