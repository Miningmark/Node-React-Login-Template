import { ValidatedRequest } from "@/@types/validation.js";
import { BaseController } from "@/controllers/base.controller.js";
import { UserService } from "@/services/user.service.js";
import { OnlyAuthorizationValidation } from "@/validators/base.validator";
import { ConfirmPendingNotificationValidation, UpdateAvatarValidation, UpdateEmailValidation, UpdatePasswordValidation, UpdateSettingsValidation, UpdateUsernameValidation } from "@/validators/user.validator.js";
import { NextFunction, Request, Response } from "express";

export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super();
    }

    updateUsername = (req: ValidatedRequest<UpdateUsernameValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { newUsername } = req.validated.body;

            return await this.userService.updateUsername(userId, newUsername, res);
        });
    };

    updateEmail = (req: ValidatedRequest<UpdateEmailValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { newEmail } = req.validated.body;

            return await this.userService.updateEmail(userId, newEmail, res);
        });
    };

    updatePassword = (req: ValidatedRequest<UpdatePasswordValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { currentPassword, newPassword } = req.validated.body;

            return await this.userService.updatePassword(userId, currentPassword, newPassword, res);
        });
    };

    updateSettings = (req: ValidatedRequest<UpdateSettingsValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { theme, isSideMenuFixed } = req.validated.body;

            return await this.userService.updateSettings(userId, theme, isSideMenuFixed);
        });
    };

    confirmPendingNotification = (req: ValidatedRequest<ConfirmPendingNotificationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { id } = req.validated.body;

            return await this.userService.confirmPendingNotification(userId, id);
        });
    };

    updateAvatar = (req: ValidatedRequest<UpdateAvatarValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { file } = req.validated;

            return await this.userService.updateAvatar(userId, file);
        });
    };

    getUsername = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getUsername(userId);
        });
    };

    getRouteGroups = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getRouteGroups(userId);
        });
    };

    getLastLogins = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getLastLogins(userId);
        });
    };

    getSettings = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getSettings(userId);
        });
    };

    getPendingNotifications = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getPendingNotifications(userId);
        });
    };

    getActiveNotifications = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getActiveNotifications(userId);
        });
    };

    getAvatar = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getAvatar(userId);
        });
    };

    deleteAvatar = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.deleteAvatar(userId);
        });
    };
}
