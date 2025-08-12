import { UserManagementController } from "@/controllers/userManagement.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { verifyPermission } from "@/middlewares/verifyPermission.middleware.js";
import { USER_MANAGEMENT_CREATE, USER_MANAGEMENT_READ, USER_MANAGEMENT_WRITE } from "@/routeGroups/userManagement.routeGroup.js";
import { UserManagementService } from "@/services/userManagement.service.js";
import { onlyAuthorizationSchema } from "@/validators/base.validator.js";
import { createUserSchema, deleteAvatarSchema, getAvatarSchema, getUsersSchema, updateUserSchema } from "@/validators/userManagement.validator.js";
import { Router } from "express";

const router = Router();

const userManagementService = new UserManagementService();
const userManagementController = new UserManagementController(userManagementService);

router.get(
    "/getUsers{/:limit-:offset}",
    verifyAuth(),
    verifyPermission([USER_MANAGEMENT_READ.groupName, USER_MANAGEMENT_WRITE.groupName, USER_MANAGEMENT_CREATE.groupName]),
    validateRequest(getUsersSchema),
    userManagementController.getUsers
);
router.get(
    "/getAvatar{/:id}",
    verifyAuth(),
    verifyPermission([USER_MANAGEMENT_READ.groupName, USER_MANAGEMENT_WRITE.groupName, USER_MANAGEMENT_CREATE.groupName]),
    validateRequest(getAvatarSchema),
    userManagementController.getAvatar
);

router.get(
    "/getPermissions",
    verifyAuth(),
    verifyPermission([USER_MANAGEMENT_READ.groupName, USER_MANAGEMENT_WRITE.groupName, USER_MANAGEMENT_CREATE.groupName]),
    validateRequest(onlyAuthorizationSchema),
    userManagementController.getPermissions
);

router.post("/updateUser", verifyAuth(), verifyPermission([USER_MANAGEMENT_WRITE.groupName, USER_MANAGEMENT_CREATE.groupName]), validateRequest(updateUserSchema), userManagementController.updateUser);
router.post("/createUser", verifyAuth(), verifyPermission([USER_MANAGEMENT_CREATE.groupName]), validateRequest(createUserSchema), userManagementController.createUser);

router.post("/deleteAvatar", verifyAuth(), verifyPermission([USER_MANAGEMENT_WRITE.groupName, USER_MANAGEMENT_CREATE.groupName]), validateRequest(deleteAvatarSchema), userManagementController.deleteAvatar);

export default router;
