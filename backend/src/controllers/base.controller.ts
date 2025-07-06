import { ApiResponse } from "@/utils/apiResponse.util.js";
import { NextFunction, Request, Response } from "express";

export abstract class BaseController {
    protected async handleRequest(req: Request, res: Response, next: NextFunction, serviceFunction: () => Promise<Record<string, any>>): Promise<void> {
        try {
            const jsonResult = await serviceFunction();
            let statusCode = undefined;
            let logResponse = undefined;

            if (typeof jsonResult.statusCode === "number") {
                statusCode = jsonResult.statusCode;
                delete jsonResult.statusCode;
            }

            if (typeof jsonResult.logResponse === "boolean") {
                logResponse = jsonResult.logResponse;
                delete jsonResult.logResponse;
            }

            ApiResponse.sendSuccess(res, req, jsonResult, statusCode, logResponse);
        } catch (error) {
            next(error);
        }
    }
}
