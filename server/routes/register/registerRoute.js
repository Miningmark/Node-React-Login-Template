import express from "express";
const router = express.Router();

import * as registerController from "../../controllers/register/registerController.js";

router.post("/register", registerController.register);
router.post("/account-activation", registerController.accountActivation);

export default router;
