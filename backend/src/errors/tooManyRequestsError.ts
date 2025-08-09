import { AppError } from "@/errors/errorClasses.js";

export class TooManyRequestsError extends AppError {
    constructor(message: string = "Zu viele Anfragen. Bitte warte kurz und versuche es erneut.") {
        super(message, 429);
    }
}
