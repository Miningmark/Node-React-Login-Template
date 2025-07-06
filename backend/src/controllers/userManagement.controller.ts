import { BaseController } from "@/controllers/base.controller.js";
import { UserManagementService } from "@/services/userManagement.service.js";
import { NextFunction, Request, Response } from "express";

export class UserManagementController extends BaseController {
    constructor(private userManagementService: UserManagementService) {
        super();
    }

    addUser = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.userManagementService.addUser();
        });
    };
}
