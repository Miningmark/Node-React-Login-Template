import { UserController } from "@/controllers/user.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { UserService } from "@/services/user.service.js";
import { updateEmailSchema, updatePasswordSchema, updateUsernameSchema } from "@/validators/user.validator.js";
import { Router } from "express";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

router.post("/updateUsername", validateRequest(updateUsernameSchema), verifyAuth(), userController.updateUsername);
router.post("/updateEmail", validateRequest(updateEmailSchema), verifyAuth(), userController.updateEmail);
router.post("/updatePassword", validateRequest(updatePasswordSchema), verifyAuth(), userController.updatePassword);

export default router;
