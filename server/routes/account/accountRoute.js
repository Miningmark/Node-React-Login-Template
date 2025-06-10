import express from "express";
const router = express.Router();

import * as accountController from "../../controllers/account/accountController.js";

router.post("/login", accountController.login);
router.post("/register", accountController.register);
router.post("/account-activation", accountController.accountActivation);
router.post("/password-forgotten", accountController.passwordReset);

export default router;
