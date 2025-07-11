import { ENV } from "@/config/env.js";
import { AuthController } from "@/controllers/auth.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { AuthService } from "@/services/auth.service.js";
import {
    accountActivationSchema,
    handlePasswordRecoverySchema,
    loginSchema,
    logoutSchema,
    refreshTokenSchema,
    registerSchema,
    requestPasswordResetSchema
} from "@/validators/auth.validator.js";
import { Router } from "express";

const router = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

if (ENV.ENABLE_REGISTER === true) {
    router.post("/register", validateRequest(registerSchema), authController.register);
    router.post("/accountActivation", validateRequest(accountActivationSchema), authController.accountActivation);
}

router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", verifyAuth(), validateRequest(logoutSchema), authController.logout);

router.post("/requestPasswordReset", validateRequest(requestPasswordResetSchema), authController.requestPasswordReset);
router.post("/handlePasswordRecovery", validateRequest(handlePasswordRecoverySchema), authController.handlePasswordRecovery);

router.get("/refreshAccessToken", validateRequest(refreshTokenSchema), authController.refreshAccessToken);

export default router;
