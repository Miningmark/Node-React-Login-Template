import { ValidatedRequest } from "@/@types/validation";
import { BaseController } from "@/controllers/base.controller.js";
import { AdminPageService } from "@/services/adminPage.service.js";
import {
    CreateNotificationsValidation,
    CreatePermissionValidation,
    DeleteNotificationValidation,
    DeletePermissionValidation,
    GetFilteredServerLogValidation,
    GetNotificationsValidation,
    GetServerLogValidation,
    UpdateNotificationValidation,
    UpdatePermissionValidation
} from "@/validators/adminPage.validator.js";
import { OnlyAuthorizationValidation } from "@/validators/base.validator.js";
import { NextFunction, Response } from "express";

export class AdminPageController extends BaseController {
    constructor(private adminPanelService: AdminPageService) {
        super();
    }

    getServerLogs = (req: ValidatedRequest<GetServerLogValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;

            return await this.adminPanelService.getServerLogs(limit, offset);
        });
    };

    getFilteredServerLogs = (req: ValidatedRequest<GetFilteredServerLogValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;
            const { userIds, types, ipv4Address, createdAtFrom, createdAtTo, searchString } = req.validated.body;

            return await this.adminPanelService.getFilteredServerLogs(limit, offset, userIds, types, ipv4Address, createdAtFrom, createdAtTo, searchString);
        });
    };

    getFilterOptionsServerLog = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPanelService.getFilterOptionsServerLog();
        });
    };

    getPermissionsWithRouteGroups = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPanelService.getPermissionsWithRouteGroups();
        });
    };

    getRouteGroups = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPanelService.getRouteGroups();
        });
    };

    createPermission = (req: ValidatedRequest<CreatePermissionValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { name, routeGroupIds, description } = req.validated.body;

            return await this.adminPanelService.createPermission(name, routeGroupIds, description);
        });
    };

    updatePermission = (req: ValidatedRequest<UpdatePermissionValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id, name, description, routeGroupIds } = req.validated.body;

            return await this.adminPanelService.updatePermission(id, name, description, routeGroupIds);
        });
    };

    deletePermission = (req: ValidatedRequest<DeletePermissionValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id } = req.validated.body;

            return await this.adminPanelService.deletePermission(id);
        });
    };

    getNotifications = (req: ValidatedRequest<GetNotificationsValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;

            return await this.adminPanelService.getNotifications(limit, offset);
        });
    };

    createNotification = (req: ValidatedRequest<CreateNotificationsValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { name, description, notifyFrom, notifyTo } = req.validated.body;

            return await this.adminPanelService.createNotification(name, description, notifyFrom, notifyTo);
        });
    };

    updateNotification = (req: ValidatedRequest<UpdateNotificationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id, resendNotification, name, description, notifyFrom, notifyTo } = req.validated.body;

            return await this.adminPanelService.updateNotification(id, resendNotification, name, description, notifyFrom, notifyTo);
        });
    };

    deleteNotification = (req: ValidatedRequest<DeleteNotificationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id } = req.validated.body;

            return await this.adminPanelService.deleteNotification(id);
        });
    };
}
