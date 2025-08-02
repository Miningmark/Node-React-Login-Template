import { UserManagementController } from "@/controllers/userManagement.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup.js";
import { UserManagementService } from "@/services/userManagement.service.js";
import { onlyAuthorizationSchema } from "@/validators/base.validator.js";
import { createUserSchema, deleteAvatarSchema, getAvatarSchema, getUsersSchema, updateUserSchema } from "@/validators/userManagement.validator.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const userManagementService = new UserManagementService();
    const userManagementController = new UserManagementController(userManagementService);

    smartRouter.get("/getUsers{/:limit-:offset}", UserManagementRouteGroups.USER_MANAGEMENT_READ, verifyAuth(), validateRequest(getUsersSchema), userManagementController.getUsers);
    smartRouter.get("/getAvatar{/:id}", UserManagementRouteGroups.USER_MANAGEMENT_READ, verifyAuth(), validateRequest(getAvatarSchema), userManagementController.getAvatar);

    smartRouter.get("/getPermissions", UserManagementRouteGroups.USER_MANAGEMENT_READ, verifyAuth(), validateRequest(onlyAuthorizationSchema), userManagementController.getPermissions);

    smartRouter.post("/updateUser", UserManagementRouteGroups.USER_MANAGEMENT_WRITE, verifyAuth(), validateRequest(updateUserSchema), userManagementController.updateUser);
    smartRouter.post("/createUser", UserManagementRouteGroups.USER_MANAGEMENT_CREATE, verifyAuth(), validateRequest(createUserSchema), userManagementController.createUser);

    smartRouter.post("/deleteAvatar", UserManagementRouteGroups.USER_MANAGEMENT_WRITE, verifyAuth(), validateRequest(deleteAvatarSchema), userManagementController.deleteAvatar);

    return smartRouter.getExpressRouter();
};
