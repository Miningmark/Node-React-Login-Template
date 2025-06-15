import express from "express";
const router = express.Router();

import * as accountController from "../controllers/accountController.js";
import config from "../config/config.js";

import verifyAccessToken from "../middleware/verifyAccessToken.js";

//public routes
if (config.isRegisterEnable) {
    router.post("/register", accountController.register);
    router.post("/account-activation", accountController.accountActivation);
}
router.post("/login", accountController.login);
router.post("/request-password-reset", accountController.requestPasswordReset);
router.post("/password-reset", accountController.passwordReset);

router.get("/refresh-access-token", accountController.refreshAccessToken);

//protected routes
if (config.isRegisterEnable) {
    router.post("/change-username", verifyAccessToken, accountController.changeUsername);
}

router.post("/logout", verifyAccessToken, accountController.logout);
router.post("/change-password", verifyAccessToken, accountController.changePassword);
router.post("/change-email", verifyAccessToken, accountController.changeEmail);

router.get("/user-roles", verifyAccessToken, accountController.getUserRoles);
router.get("/username", verifyAccessToken, accountController.getUsername);
router.get("/config", verifyAccessToken, accountController.getConfig);

export default router;
