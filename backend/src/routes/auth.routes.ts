import { AuthController } from "@/controllers/auth.controller";
import { validateRequest } from "@/middlewares/validateRequest.middleware";
import { AuthService } from "@/services/auth.service";
import { registerSchema } from "@/validators/auth.validator";
import { Router } from "express";

const router = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

router.post("/register", validateRequest(registerSchema), authController.register);

export default router;
