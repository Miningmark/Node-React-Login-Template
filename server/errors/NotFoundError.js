import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
    constructor(message = "Die angeforderte Adresse existiert nicht") {
        super(message, 404);
    }
}
