import { AppError } from "@/errors/errorClasses";

export class ValidationError extends AppError {
    constructor(message: string = "The data entered are invalid") {
        super(message, 400);
    }
}
