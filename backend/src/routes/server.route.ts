import { ServerController } from "@/controllers/server.controller.js";
import { publicRateLimiter } from "@/middlewares/rateLimiter.middleware.js";
import { ServerService } from "@/services/server.service.js";
import { Router } from "express";
import { container } from "tsyringe";

const router = Router();
const serverController = container.resolve(ServerController);

router.get("/getSettings", publicRateLimiter, serverController.getSettings);

export default router;
