import express from "express";
const router = express.Router();

import * as accountController from "../controllers/accountController.js";
import config from "../config/config.js";

import verifyAccessToken from "../middleware/verifyAccessToken.js";

//public routes
if (config.isRegisterEnable) {
    router.post("/register", accountController.register);
    router.post("/accountActivation", accountController.accountActivation);
}
router.post("/login", accountController.login);
router.post("/requestPasswordReset", accountController.requestPasswordReset);
router.post("/passwordReset", accountController.passwordResetAndReactivation);

router.get("/refreshAccessToken", accountController.refreshAccessToken);

//protected routes
if (config.isRegisterEnable) {
    router.post("/changeUsername", verifyAccessToken, accountController.changeUsername);
}

router.post("/logout", verifyAccessToken, accountController.logout);
router.post("/changePassword", verifyAccessToken, accountController.changePassword);
router.post("/changeEmail", verifyAccessToken, accountController.changeEmail);

router.get("/getRouteGroups", verifyAccessToken, accountController.getRouteGroup);
router.get("/getUsername", verifyAccessToken, accountController.getUsername);
router.get("/getLastLogins", verifyAccessToken, accountController.getLastLogins);

export default router;
