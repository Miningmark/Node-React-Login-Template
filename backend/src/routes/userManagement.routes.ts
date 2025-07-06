import { UserManagementController } from "@/controllers/userManagement.controller";
import { SmartRouter } from "@/lib/smartRouter.lib";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { UserManagementService } from "@/services/userManagement.service.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const userManagementService = new UserManagementService();
    const userManagementController = new UserManagementController(userManagementService);

    const userManagementReadDescription = "Hat das Recht alle Userdaten zu sehen";
    const userManagementWriteDescription = "Hat das Recht alle Userdaten zu sehen und zu bearbeiten";
    const userManagementCreateDescription = "Hat das Recht alle Userdaten zu sehen, zu bearbeiten und zu erstellen";

    /*smartRouter.get("/getUsers{/:limit-:offset}", "userManagementRead", userManagementReadDescription, verifyAuth(), userManagementController.addUser);

    smartRouter.get("/getAllPermissions", "userManagementWrite", userManagementWriteDescription, verifyAuth(), userManagementController.addUser);
    smartRouter.post("/updateUser", "userManagementWrite", userManagementWriteDescription, verifyAuth(), userManagementController.addUser);
    smartRouter.post("/updatePermissions", "userManagementWrite", userManagementWriteDescription, verifyAuth(), userManagementController.addUser);*/

    smartRouter.get("/addUser", "userManagementCreate", userManagementCreateDescription, verifyAuth(), userManagementController.addUser);

    return smartRouter.getExpressRouter();
};
