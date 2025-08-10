import { InternalServerError } from "@/errors/errorClasses.js";
import { ApiResponse } from "@/utils/apiResponse.util.js";
import { NextFunction, Request, Response } from "express";
import { Readable } from "stream";

export type ControllerResponse =
    | { type: "json"; jsonResponse: Record<string, any>; statusCode?: number; logResponse?: boolean }
    | { type: "stream"; stream: Readable; contentType: string; filename: string; jsonResponse: Record<string, any> };

export abstract class BaseController {
    protected async handleRequest(req: Request, res: Response, next: NextFunction, serviceFunction: () => Promise<ControllerResponse>): Promise<void> {
        try {
            const controllerResponse = await serviceFunction();

            switch (controllerResponse.type) {
                case "json":
                    ApiResponse.sendJSONSuccess(res, req, controllerResponse.jsonResponse, controllerResponse.logResponse, controllerResponse.statusCode);
                    break;

                case "stream":
                    ApiResponse.sendStreamSuccess(res, req, controllerResponse.contentType, controllerResponse.stream, controllerResponse.filename, controllerResponse.jsonResponse);
                    break;

                default:
                    throw new InternalServerError("Unbekannter Antworttyp");
            }
        } catch (error) {
            next(error);
        }
    }
}
