import { ValidatedRequest } from "@/@types/validation.js";
import { BaseController } from "@/controllers/base.controller.js";
import { ServerService } from "@/services/server.service.js";
import { RegisterValidation } from "@/validators/auth.validator.js";
import { NextFunction, Response } from "express";

export class ServerController extends BaseController {
    constructor(private serverService: ServerService) {
        super();
    }

    getSettings = (req: ValidatedRequest<RegisterValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.serverService.getSettings();
        });
    };
}
