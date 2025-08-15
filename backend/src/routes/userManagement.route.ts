import { Router } from "express";
import { container } from "tsyringe";

import { UserManagementController } from "@/controllers/userManagement.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { verifyPermission } from "@/middlewares/verifyPermission.middleware.js";
import {
    USER_MANAGEMENT_CREATE,
    USER_MANAGEMENT_READ,
    USER_MANAGEMENT_WRITE
} from "@/routeGroups/userManagement.routeGroup.js";
import { onlyAuthorizationSchema, onlyLimitAndOffsetSchema } from "@/validators/base.validator.js";
import {
    createUserSchema,
    deleteAvatarSchema,
    getAvatarSchema,
    updateUserSchema
} from "@/validators/userManagement.validator.js";

const router = Router();
const userManagementController = container.resolve(UserManagementController);

router.get(
    "/getUsers{/:limit-:offset}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([
        USER_MANAGEMENT_READ.groupName,
        USER_MANAGEMENT_WRITE.groupName,
        USER_MANAGEMENT_CREATE.groupName
    ]),
    validateRequest(onlyLimitAndOffsetSchema),
    userManagementController.getUsers
);
router.get(
    "/getAvatar{/:id}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([
        USER_MANAGEMENT_READ.groupName,
        USER_MANAGEMENT_WRITE.groupName,
        USER_MANAGEMENT_CREATE.groupName
    ]),
    validateRequest(getAvatarSchema),
    userManagementController.getAvatar
);

router.get(
    "/getPermissions",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([
        USER_MANAGEMENT_READ.groupName,
        USER_MANAGEMENT_WRITE.groupName,
        USER_MANAGEMENT_CREATE.groupName
    ]),
    userManagementController.getPermissions
);

router.post(
    "/updateUser",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([USER_MANAGEMENT_WRITE.groupName, USER_MANAGEMENT_CREATE.groupName]),
    validateRequest(updateUserSchema),
    userManagementController.updateUser
);
router.post(
    "/createUser",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([USER_MANAGEMENT_CREATE.groupName]),
    validateRequest(createUserSchema),
    userManagementController.createUser
);

router.post(
    "/deleteAvatar",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([USER_MANAGEMENT_WRITE.groupName, USER_MANAGEMENT_CREATE.groupName]),
    validateRequest(deleteAvatarSchema),
    userManagementController.deleteAvatar
);

export default router;
