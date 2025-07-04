import { ApiResponse } from "@/utils/apiResponse.util.js";
import { NextFunction, Request, Response } from "express";

export abstract class BaseController {
    protected async handleRequest(req: Request, res: Response, next: NextFunction, serviceFunction: () => Promise<any>): Promise<void> {
        try {
            const jsonResult = await serviceFunction();
            let statusCode = undefined;

            if (typeof jsonResult.statusCode === "number") {
                statusCode = jsonResult.statusCode;
                delete jsonResult.statusCode;
            }

            ApiResponse.sendSuccess(res, req, jsonResult, statusCode);
        } catch (error) {
            next(error);
        }
    }
}
