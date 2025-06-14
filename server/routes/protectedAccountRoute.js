import express from "express";
const router = express.Router();

import * as accountController from "../controllers/accountController.js";

router.post("/logout", accountController.logout);
router.post("/changePassword", accountController.changePassword);
router.post("/changeEmail", accountController.changeEmail);
router.post("/changeUsername", accountController.changeUsername);

export default router;
