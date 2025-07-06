import { UserManagementController } from "@/controllers/userManagement.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { UserManagementRouteGroups } from "@/routeGroups/userManagement.routeGroup.js";
import { UserManagementService } from "@/services/userManagement.service.js";
import { onlyAuthorizationHeader } from "@/validators/base.validator.js";
import { addUserSchema, getUsersSchema, updateUserPermissionsSchema, updateUserSchema } from "@/validators/userManagement.validator.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const userManagementService = new UserManagementService();
    const userManagementController = new UserManagementController(userManagementService);

    smartRouter.get("/getUsers{/:limit-:offset}", UserManagementRouteGroups.READ, validateRequest(getUsersSchema), verifyAuth(), userManagementController.getUsers);

    smartRouter.get("/getAllPermissions", UserManagementRouteGroups.WRITE, validateRequest(onlyAuthorizationHeader), verifyAuth(), userManagementController.getAllPermissions);
    smartRouter.post("/updateUserPermissions", UserManagementRouteGroups.WRITE, validateRequest(updateUserPermissionsSchema), verifyAuth(), userManagementController.updateUserPermissions);
    smartRouter.post("/updateUser", UserManagementRouteGroups.WRITE, validateRequest(updateUserSchema), verifyAuth(), userManagementController.updateUser);

    smartRouter.get("/addUser", UserManagementRouteGroups.CREATE, validateRequest(addUserSchema), verifyAuth(), userManagementController.addUser);

    return smartRouter.getExpressRouter();
};
