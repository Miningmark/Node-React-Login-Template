import { ENV } from "@/config/env.js";
import { UserController } from "@/controllers/user.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { UserService } from "@/services/user.service.js";
import { onlyAuthorizationHeader } from "@/validators/base.validator.js";
import { updateEmailSchema, updatePasswordSchema, updateSettingsSchema, updateUsernameSchema } from "@/validators/user.validator.js";
import { Router } from "express";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

if (ENV.ENABLE_USERNAME_CHANGE === true) {
    router.post("/updateUsername", validateRequest(updateUsernameSchema), verifyAuth(), userController.updateUsername);
}
router.post("/updateEmail", validateRequest(updateEmailSchema), verifyAuth(), userController.updateEmail);
router.post("/updatePassword", validateRequest(updatePasswordSchema), verifyAuth(), userController.updatePassword);
router.post("/updateSettings", validateRequest(updateSettingsSchema), verifyAuth(), userController.updateSettings);

router.get("/getUsername", validateRequest(onlyAuthorizationHeader), verifyAuth(), userController.getUsername);
router.get("/getRouteGroups", validateRequest(onlyAuthorizationHeader), verifyAuth(), userController.getRouteGroups);
router.get("/getLastLogins", validateRequest(onlyAuthorizationHeader), verifyAuth(), userController.getLastLogins);
router.get("/getSettings", validateRequest(onlyAuthorizationHeader), verifyAuth(), userController.getSettings);

export default router;
