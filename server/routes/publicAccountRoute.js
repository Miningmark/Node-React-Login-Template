import express from "express";
const router = express.Router();

import * as accountController from "../controllers/accountController.js";

router.post("/login", accountController.login);
router.post("/register", accountController.register);
router.post("/account-activation", accountController.accountActivation);
router.post("/request-password-reset", accountController.requestPasswordReset);
router.post("/password-reset", accountController.passwordReset);

router.get("/refresh-access-token", accountController.refreshAccessToken);

export default router;
