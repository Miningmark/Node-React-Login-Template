import { BaseController } from "@/controllers/base.controller.js";
import { UserService } from "@/services/user.service.js";
import { NextFunction, Request, Response } from "express";

export class UserController extends BaseController {
    constructor(private userService: UserService) {
        super();
    }

    updatePassword = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { currentPassword, newPassword } = req.body;
            return await this.userService.updatePassword(currentPassword, newPassword);
        });
    };
}
