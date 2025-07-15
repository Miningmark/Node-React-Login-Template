import { BaseController } from "@/controllers/base.controller.js";
import { UserService } from "@/services/user.service.js";
import { NextFunction, Request, Response } from "express";

export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super();
    }

    updateUsername = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { newUsername } = req.body;

            return await this.userService.updateUsername(userId, newUsername, res);
        });
    };

    updateEmail = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { newEmail } = req.body;

            return await this.userService.updateEmail(userId, newEmail, res);
        });
    };

    updatePassword = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { currentPassword, newPassword } = req.body;

            return await this.userService.updatePassword(userId, currentPassword, newPassword, res);
        });
    };

    getUsername = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getUsername(userId);
        });
    };

    getRouteGroups = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getRouteGroups(userId);
        });
    };

    getLastLogins = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.userService.getLastLogins(userId);
        });
    };
}
