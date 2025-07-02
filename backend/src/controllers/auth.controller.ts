import { AuthService } from "@/services/auth.service";
import { BaseController } from "./base.controller";
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
}
