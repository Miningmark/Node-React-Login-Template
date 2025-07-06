import { BaseController } from "@/controllers/base.controller.js";
import { AdminPageService } from "@/services/adminPage.service.js";
import { NextFunction, Request, Response } from "express";

export class AdminPageController extends BaseController {
    constructor(private adminPanelService: AdminPageService) {
        super();
    }

    getServerLogs = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const limit = req.params.limit !== undefined ? parseInt(req.params.limit) : undefined;
            const offset = req.params.offset !== undefined ? parseInt(req.params.offset) : undefined;

            return await this.adminPanelService.getServerLogs(limit, offset);
        });
    };
}
