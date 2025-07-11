import { BaseController } from "@/controllers/base.controller.js";
import { UnauthorizedError } from "@/errors/unauthorizedError.js";
import { AuthService } from "@/services/auth.service.js";
import { NextFunction, Request, Response } from "express";

export class AuthController extends BaseController {
    constructor(private authService: AuthService) {
        super();
    }

    register = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { username, email, password } = req.body;

            return await this.authService.register(username, email, password);
        });
    };

    login = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { username, password } = req.body;

            return await this.authService.login(username, password, req, res);
        });
    };

    logout = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };

            return await this.authService.logout(userId, res);
        });
    };

    accountActivation = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { token } = req.body;

            return await this.authService.accountActivation(token);
        });
    };

    refreshAccessToken = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { refreshToken } = req.cookies;

            return await this.authService.refreshAccessToken(refreshToken, res);
        });
    };

    requestPasswordReset = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { usernameOrEmail } = req.body;

            return await this.authService.requestPasswordReset(usernameOrEmail);
        });
    };

    handlePasswordRecovery = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { token, password } = req.body;

            return await this.authService.handlePasswordRecovery(token, password);
        });
    };
}
