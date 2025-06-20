import { SmartRouter } from "../../lib/SmartRouter.js";

import * as adminPageController from "../../controllers/AdminPage/adminPageController.js";
import verifyAccessToken from "../../middleware/verifyAccessToken.js";

export default async () => {
    const smartRouter = new SmartRouter();

    smartRouter.get("/getServerLog{/:limit-:offset}", "adminPageServerLogRead", "Hat das Recht den Serverlog zu sehen", verifyAccessToken, adminPageController.getServerLog);
    smartRouter.get("/getFilteredServerLog{/:limit-:offset}", "adminPageServerLogRead", "Hat das Recht den Serverlog zu sehen", verifyAccessToken, adminPageController.getFilteredServerLog);
    smartRouter.get("/getFilterOptionsServerLog", "adminPageServerLogRead", "Hat das Recht den Serverlog zu sehen", verifyAccessToken, adminPageController.getFilterOptionsServerLog);

    smartRouter.get("/getAllPermissionsWithRouteGroups", "adminPagePermissionsRead", "Hat das Recht die Permissions mit den RouteGroups zu sehen", verifyAccessToken, adminPageController.getAllPermissionsWithRouteGroups);
    smartRouter.get("/getAllRouteGroups", "adminPagePermissionsWrite", "Hat das Recht die Permissions mit den RouteGroups zu sehen und zu bearbeiten", verifyAccessToken, adminPageController.getAllRouteGroups);

    smartRouter.post("/createPermission", "adminPagePermissionsWrite", "Hat das Recht die Permissions mit den RouteGroups zu sehen und zu bearbeiten", verifyAccessToken, adminPageController.createPermission);
    smartRouter.post("/updatePermission", "adminPagePermissionsWrite", "Hat das Recht die Permissions mit den RouteGroups zu sehen und zu bearbeiten", verifyAccessToken, adminPageController.updatePermission);
    smartRouter.post("/deletePermission", "adminPagePermissionsWrite", "Hat das Recht die Permissions mit den RouteGroups zu sehen und zu bearbeiten", verifyAccessToken, adminPageController.deletePermission);

    return smartRouter.getExpressRouter();
};
