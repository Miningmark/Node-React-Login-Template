import express from "express";
const router = express.Router();

import * as accountController from "../controllers/accountController.js";

router.post("/logout", accountController.logout);

export default router;
