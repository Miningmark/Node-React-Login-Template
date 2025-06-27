import { Response } from "express";

export class ApiResponse {
    static sendSuccess(res: Response, successMessage: string = "Success", statusCode: number = 200, jsonData: any = null) {
        res.status(statusCode).json({
            message: successMessage,
            data: jsonData
        });
    }

    static sendError(res: Response, errorMessage: string, statusCode: number = 400) {
        res.status(statusCode).json({
            message: errorMessage
        });
    }
}
