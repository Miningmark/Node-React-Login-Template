import { Router } from "express";
import multer from "multer";
import { container } from "tsyringe";

import { ENV } from "@/config/env.js";
import { UserController } from "@/controllers/user.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { onlyAuthorizationSchema } from "@/validators/base.validator.js";
import {
    confirmPendingNotificationSchema,
    updateAvatarSchema,
    updateEmailSchema,
    updatePasswordSchema,
    updateSettingsSchema,
    updateUsernameSchema
} from "@/validators/user.validator.js";

const router = Router();
const userController = container.resolve(UserController);
const multerInstance = multer();

if (ENV.ENABLE_USERNAME_CHANGE === true) {
    router.post(
        "/updateUsername",
        validateRequest(updateUsernameSchema),
        verifyAuth(),
        userController.updateUsername
    );
}
router.post(
    "/updateEmail",
    validateRequest(updateEmailSchema),
    verifyAuth(),
    userController.updateEmail
);
router.post(
    "/updatePassword",
    validateRequest(updatePasswordSchema),
    verifyAuth(),
    userController.updatePassword
);
router.post(
    "/updateSettings",
    validateRequest(updateSettingsSchema),
    verifyAuth(),
    userController.updateSettings
);

router.post(
    "/confirmPendingNotification",
    validateRequest(confirmPendingNotificationSchema),
    verifyAuth(),
    userController.confirmPendingNotification
);

router.post(
    "/updateAvatar",
    multerInstance.single("file"),
    validateRequest(updateAvatarSchema),
    verifyAuth(),
    userController.updateAvatar
);
router.post(
    "/deleteAvatar",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.deleteAvatar
);

router.get(
    "/getUsername",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getUsername
);
router.get(
    "/getRouteGroups",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getRouteGroups
);
router.get(
    "/getLastLogins",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getLastLogins
);
router.get(
    "/getSettings",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getSettings
);
router.get(
    "/getUserId",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getUserId
);

router.get(
    "/getPendingNotifications",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getPendingNotifications
);
router.get(
    "/getActiveNotifications",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getActiveNotifications
);

router.get(
    "/getAvatar",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    userController.getAvatar
);

export default router;
