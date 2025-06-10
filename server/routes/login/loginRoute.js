import express from "express";
const router = express.Router();

import * as loginController from "../../controllers/login/loginController.js";

router.post("/login", loginController.login);
router.post("/password-forgotten", loginController.passwordForgotten);

export default router;
