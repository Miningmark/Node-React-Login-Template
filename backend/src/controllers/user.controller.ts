import { BaseController } from "@/controllers/base.controller.js";
import { UnauthorizedError } from "@/errors/unauthorizedError.js";
import { UserService } from "@/services/user.service.js";
import { NextFunction, Request, Response } from "express";

export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super();
    }

    updateUsername = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req;
            if (userId === undefined) throw new UnauthorizedError();

            const { newUsername } = req.body;

            return await this.userService.updateUsername(userId, newUsername, res);
        });
    };

    updateEmail = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req;
            if (userId === undefined) throw new UnauthorizedError();

            const { newEmail } = req.body;

            return await this.userService.updateEmail(userId, newEmail, res);
        });
    };

    updatePassword = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req;
            if (userId === undefined) throw new UnauthorizedError();

            const { currentPassword, newPassword } = req.body;

            return await this.userService.updatePassword(userId, currentPassword, newPassword, res);
        });
    };
}
