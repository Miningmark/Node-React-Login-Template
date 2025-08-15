import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { ValidatedRequest } from "@/@types/validation.js";
import { BaseController } from "@/controllers/base.controller.js";
import { AdminPageService } from "@/services/adminPage.service.js";
import {
    CreateNotificationsValidation,
    CreatePermissionValidation,
    DeleteNotificationValidation,
    DeletePermissionValidation,
    GetFilteredServerLogValidation,
    UpdateMaintenanceModeValidation,
    UpdateNotificationValidation,
    UpdatePermissionValidation
} from "@/validators/adminPage.validator.js";
import { OnlyLimitAndOffsetValidation } from "@/validators/base.validator";

@injectable()
export class AdminPageController extends BaseController {
    constructor(@inject(AdminPageService) private readonly adminPageService: AdminPageService) {
        super();
    }

    getServerLogs = (
        req: ValidatedRequest<OnlyLimitAndOffsetValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;

            return await this.adminPageService.getServerLogs(limit, offset);
        });
    };

    getFilteredServerLogs = (
        req: ValidatedRequest<GetFilteredServerLogValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;
            const { userIds, types, ipv4Address, createdAtFrom, createdAtTo, searchString } =
                req.validated.body;

            return await this.adminPageService.getFilteredServerLogs(
                limit,
                offset,
                userIds,
                types,
                ipv4Address,
                createdAtFrom,
                createdAtTo,
                searchString
            );
        });
    };

    getFilterOptionsServerLog = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPageService.getFilterOptionsServerLog();
        });
    };

    getPermissionsWithRouteGroups = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPageService.getPermissionsWithRouteGroups();
        });
    };

    getRouteGroups = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.adminPageService.getRouteGroups();
        });
    };

    createPermission = (
        req: ValidatedRequest<CreatePermissionValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { name, routeGroupIds, description } = req.validated.body;

            return await this.adminPageService.createPermission(name, routeGroupIds, description);
        });
    };

    updatePermission = (
        req: ValidatedRequest<UpdatePermissionValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { id, name, description, routeGroupIds } = req.validated.body;

            return await this.adminPageService.updatePermission(
                id,
                name,
                description,
                routeGroupIds
            );
        });
    };

    deletePermission = (
        req: ValidatedRequest<DeletePermissionValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { id } = req.validated.body;

            return await this.adminPageService.deletePermission(id);
        });
    };

    getNotifications = (
        req: ValidatedRequest<OnlyLimitAndOffsetValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;

            return await this.adminPageService.getNotifications(limit, offset);
        });
    };

    createNotification = (
        req: ValidatedRequest<CreateNotificationsValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { name, description, notifyFrom, notifyTo } = req.validated.body;

            return await this.adminPageService.createNotification(
                name,
                description,
                notifyFrom,
                notifyTo
            );
        });
    };

    updateNotification = (
        req: ValidatedRequest<UpdateNotificationValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { id, resendNotification, name, description, notifyFrom, notifyTo } =
                req.validated.body;

            return await this.adminPageService.updateNotification(
                id,
                resendNotification,
                name,
                description,
                notifyFrom,
                notifyTo
            );
        });
    };

    deleteNotification = (
        req: ValidatedRequest<DeleteNotificationValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { id } = req.validated.body;

            return await this.adminPageService.deleteNotification(id);
        });
    };

    updateMaintenanceMode = (
        req: ValidatedRequest<UpdateMaintenanceModeValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { active } = req.validated.body;

            return await this.adminPageService.updateMaintenanceMode(active);
        });
    };
}
