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

    getFilteredServerLogs = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const limit = req.params.limit !== undefined ? parseInt(req.params.limit) : undefined;
            const offset = req.params.offset !== undefined ? parseInt(req.params.offset) : undefined;

            const { userIds, types, ipv4Address, createdAtFrom, createdAtTo, searchString } = req.body;

            return await this.adminPanelService.getFilteredServerLogs(limit, offset, userIds, types, ipv4Address, createdAtFrom, createdAtTo, searchString);
        });
    };

    getFilterOptionsServerLog = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPanelService.getFilterOptionsServerLog();
        });
    };

    getPermissionsWithRouteGroups = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPanelService.getPermissionsWithRouteGroups();
        });
    };

    getRouteGroups = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPanelService.getRouteGroups();
        });
    };
}
