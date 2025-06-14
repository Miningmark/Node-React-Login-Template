import express from "express";
const router = express.Router();

import * as accountController from "../controllers/accountController.js";
import config from "../config/config.js";

import verifyAccessToken from "../middleware/verifyAccessToken.js";
import authorizePermission from "../middleware/authorizePermission.js";

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
    router.post("/changeUsername", verifyAccessToken, accountController.changeUsername);
}

router.post("/logout", verifyAccessToken, accountController.logout);
router.post("/changePassword", verifyAccessToken, accountController.changePassword);
router.post("/changeEmail", verifyAccessToken, accountController.changeEmail);

export default router;
