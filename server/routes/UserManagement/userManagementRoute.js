import { SmartRouter } from "../../lib/SmartRouter.js";

import * as userManagementController from "../../controllers/UserManagement/userManagementController.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const userManagementReadDescription = "Hat das Recht alle Userdaten zu sehen";
    const userManagementWriteDescription = "Hat das Recht alle Userdaten zu sehen und zu bearbeiten";
    const userManagementCreateDescription = "Hat das Recht alle Userdaten zu sehen, zu bearbeiten und zu erstellen";

    smartRouter.get("/getUsers{/:limit-:offset}", "userManagementRead", userManagementReadDescription, verifyAccessToken, userManagementController.getUsers);

    smartRouter.get("/getAllPermissions", "userManagementWrite", userManagementWriteDescription, verifyAccessToken, userManagementController.getAllPermissions);
    smartRouter.post("/updateUser", "userManagementWrite", userManagementWriteDescription, verifyAccessToken, userManagementController.updateUser);
    smartRouter.post("/updatePermissions", "userManagementWrite", userManagementWriteDescription, verifyAccessToken, userManagementController.updatePermissions);

    smartRouter.post("/addUser", "userManagementCreate", userManagementCreateDescription, verifyAccessToken, userManagementController.addUser);

    return smartRouter.getExpressRouter();
};
