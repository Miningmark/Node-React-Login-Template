export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string = "An Unknow Error occurred", statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
