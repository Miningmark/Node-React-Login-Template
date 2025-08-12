import { ENV } from "@/config/env.js";
import { AuthController } from "@/controllers/auth.controller.js";
import { checkMaintenanceMode } from "@/middlewares/checkMaintenanceMode.middleware.js";
import { publicRateLimiter } from "@/middlewares/rateLimiter.middleware.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { accountActivationSchema, handlePasswordRecoverySchema, loginSchema, refreshTokenSchema, registerSchema, requestPasswordResetSchema } from "@/validators/auth.validator.js";
import { onlyAuthorizationSchema } from "@/validators/base.validator.js";
import { Router } from "express";
import { container } from "tsyringe";

const router = Router();
const authController = container.resolve(AuthController);

if (ENV.ENABLE_REGISTER === true) {
    router.post("/register", checkMaintenanceMode(), publicRateLimiter, validateRequest(registerSchema), authController.register);
    router.post("/accountActivation", checkMaintenanceMode(), publicRateLimiter, validateRequest(accountActivationSchema), authController.accountActivation);
}

router.post("/login", publicRateLimiter, validateRequest(loginSchema), authController.login);
router.post("/logout", validateRequest(onlyAuthorizationSchema), verifyAuth(), authController.logout);

router.post("/requestPasswordReset", checkMaintenanceMode(), publicRateLimiter, validateRequest(requestPasswordResetSchema), authController.requestPasswordReset);
router.post("/handlePasswordRecovery", checkMaintenanceMode(), publicRateLimiter, validateRequest(handlePasswordRecoverySchema), authController.handlePasswordRecovery);

router.get("/refreshAccessToken", publicRateLimiter, validateRequest(refreshTokenSchema), authController.refreshAccessToken);

export default router;
