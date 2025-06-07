import express from "express";
const router = express.Router();

import * as loginController from "../../controllers/login/loginController.js";

router.get("/login", loginController.login);

export default router;
