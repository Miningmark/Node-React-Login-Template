import { ValidatedRequest } from "@/@types/validation.js";
import { BaseController } from "@/controllers/base.controller.js";
import { UserManagementService } from "@/services/userManagement.service.js";
import { OnlyAuthorizationValidation } from "@/validators/base.validator";
import { CreateUserValidation, DeleteAvatarValidation, GetAvatarValidation, GetUsersValidation, UpdateUserValidation } from "@/validators/userManagement.validator.js";
import { NextFunction, Request, Response } from "express";

export class UserManagementController extends BaseController {
    constructor(private userManagementService: UserManagementService) {
        super();
    }

    getUsers = (req: ValidatedRequest<GetUsersValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;

            return await this.userManagementService.getUsers(limit, offset);
        });
    };

    getAvatar = (req: ValidatedRequest<GetAvatarValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id } = req.validated.params;

            return await this.userManagementService.getAvatar(id);
        });
    };

    deleteAvatar = (req: ValidatedRequest<DeleteAvatarValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id } = req.validated.body;

            return await this.userManagementService.deleteAvatar(id);
        });
    };

    getPermissions = (req: ValidatedRequest<OnlyAuthorizationValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            return await this.userManagementService.getPermissions();
        });
    };

    updateUser = (req: ValidatedRequest<UpdateUserValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id, username, email, isActive, isDisabled, permissionIds } = req.validated.body;

            return await this.userManagementService.updateUser(id, username, email, isActive, isDisabled, permissionIds);
        });
    };

    createUser = (req: ValidatedRequest<CreateUserValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { username, email, permissionIds } = req.validated.body;

            return await this.userManagementService.createUser(username, email, permissionIds);
        });
    };
}
