import { ServerController } from "@/controllers/server.controller.js";
import { ServerService } from "@/services/server.service.js";
import { Router } from "express";

const router = Router();

const serverService = new ServerService();
const serverController = new ServerController(serverService);

router.get("/getSettings", serverController.getSettings);

export default router;
