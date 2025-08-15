import { Router } from "express";
import { container } from "tsyringe";

import { ServerController } from "@/controllers/server.controller.js";

const router = Router();
const serverController = container.resolve(ServerController);

router.get("/getSettings", serverController.getSettings);

export default router;
