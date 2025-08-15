import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { ValidatedRequest } from "@/@types/validation.js";
import { BaseController } from "@/controllers/base.controller.js";
import { AuthService } from "@/services/auth.service.js";
import {
    AccountActivationValidation,
    HandlePasswordRecoveryValidation,
    LoginValidation,
    RefreshTokenValidation,
    RegisterValidation,
    RequestPasswordResetValidation
} from "@/validators/auth.validator.js";
import { OnlyAuthorizationValidation } from "@/validators/base.validator";

@injectable()
export class AuthController extends BaseController {
    constructor(@inject(AuthService) private readonly authService: AuthService) {
        super();
    }

    register = (
        req: ValidatedRequest<RegisterValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { username, email, password } = req.validated.body;

            return await this.authService.register(username, email, password);
        });
    };

    login = (req: ValidatedRequest<LoginValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { username, password } = req.validated.body;

            return await this.authService.login(username, password, req, res);
        });
    };

    logout = (
        req: ValidatedRequest<OnlyAuthorizationValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.authService.logout(userId, res);
        });
    };

    accountActivation = (
        req: ValidatedRequest<AccountActivationValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { token } = req.validated.body;

            return await this.authService.accountActivation(token);
        });
    };

    refreshAccessToken = (
        req: ValidatedRequest<RefreshTokenValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { refreshToken } = req.validated.cookies;

            return await this.authService.refreshAccessToken(refreshToken, res);
        });
    };

    requestPasswordReset = (
        req: ValidatedRequest<RequestPasswordResetValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { usernameOrEmail } = req.validated.body;

            return await this.authService.requestPasswordReset(usernameOrEmail);
        });
    };

    handlePasswordRecovery = (
        req: ValidatedRequest<HandlePasswordRecoveryValidation>,
        res: Response,
        next: NextFunction
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const { token, password } = req.validated.body;

            return await this.authService.handlePasswordRecovery(token, password);
        });
    };
}
