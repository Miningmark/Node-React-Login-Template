import { BaseController } from "@/controllers/base.controller.js";
import { UserManagementService } from "@/services/userManagement.service.js";
import { NextFunction, Request, Response } from "express";

export class UserManagementController extends BaseController {
    constructor(private userManagementService: UserManagementService) {
        super();
    }

    getUsers = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const limit = req.params.limit !== undefined ? parseInt(req.params.limit) : undefined;
            const offset = req.params.offset !== undefined ? parseInt(req.params.offset) : undefined;

            return await this.userManagementService.getUsers(limit, offset);
        });
    };

    getAllPermissions = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.userManagementService.getAllPermissions();
        });
    };

    updateUserPermissions = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.userManagementService.updateUserPermissions();
        });
    };

    updateUser = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.userManagementService.updateUser();
        });
    };

    addUser = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.userManagementService.addUser();
        });
    };
}
