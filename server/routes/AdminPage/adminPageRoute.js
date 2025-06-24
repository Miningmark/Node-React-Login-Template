import { SmartRouter } from "../../lib/SmartRouter.js";

import * as adminPageController from "../../controllers/AdminPage/adminPageController.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const adminPageServerLogReadDescription = "Hat das Recht den Serverlog zu sehen";
    const adminPagePermissionsReadDescription = "Hat das Recht die Permissions mit den RouteGroups zu sehen";
    const adminPagePermissionsWriteDescription = "Hat das Recht die Permissions mit den RouteGroups zu sehen und zu bearbeiten";

    smartRouter.get("/getServerLog{/:limit-:offset}", "adminPageServerLogRead", adminPageServerLogReadDescription, verifyAccessToken, adminPageController.getServerLog);
    smartRouter.get(
        "/getFilterOptionsServerLog",
        "adminPageServerLogRead",
        adminPageServerLogReadDescription,
        verifyAccessToken,
        adminPageController.getFilterOptionsServerLog
    );
    smartRouter.get(
        "/getAllPermissionsWithRouteGroups",
        "adminPagePermissionsRead",
        adminPagePermissionsReadDescription,
        verifyAccessToken,
        adminPageController.getAllPermissionsWithRouteGroups
    );
    smartRouter.get("/getAllRouteGroups", "adminPagePermissionsWrite", adminPagePermissionsWriteDescription, verifyAccessToken, adminPageController.getAllRouteGroups);

    smartRouter.post(
        "/getFilteredServerLog{/:limit-:offset}",
        "adminPageServerLogRead",
        adminPageServerLogReadDescription,
        verifyAccessToken,
        adminPageController.getFilteredServerLog
    );
    smartRouter.post("/createPermission", "adminPagePermissionsWrite", adminPagePermissionsWriteDescription, verifyAccessToken, adminPageController.createPermission);
    smartRouter.post("/updatePermission", "adminPagePermissionsWrite", adminPagePermissionsWriteDescription, verifyAccessToken, adminPageController.updatePermission);
    smartRouter.post("/deletePermission", "adminPagePermissionsWrite", adminPagePermissionsWriteDescription, verifyAccessToken, adminPageController.deletePermission);

    return smartRouter.getExpressRouter();
};
