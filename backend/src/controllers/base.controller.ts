import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/utils/apiResponse.util";

export abstract class BaseController {
    protected async handleRequest(req: Request, res: Response, next: NextFunction, serviceFunction: () => Promise<any>): Promise<void> {
        try {
            const jsonResult = await serviceFunction();
            ApiResponse.sendSuccess(res, req, jsonResult);
        } catch (error) {
            next(error);
        }
    }
}
