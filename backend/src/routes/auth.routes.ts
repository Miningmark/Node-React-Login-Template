import { AuthController } from "@/controllers/auth.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { AuthService } from "@/services/auth.service.js";
import { loginSchema, registerSchema } from "@/validators/auth.validator.js";
import { Router } from "express";

const router = Router();

const authService = new AuthService();
const authController = new AuthController(authService);

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);

export default router;
