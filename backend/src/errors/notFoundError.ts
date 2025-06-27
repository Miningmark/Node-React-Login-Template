import { AppError } from "@/errors/errorClasses";

export class NotFoundError extends AppError {
    constructor(message: string = "Die angeforderte Adresse existiert nicht") {
        super(message, 404);
    }
}
