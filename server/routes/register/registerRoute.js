import express from "express";
const router = express.Router();

import * as registerController from "../../controllers/register/registerController.js";

router.post("/register", registerController.register);

export default router;
