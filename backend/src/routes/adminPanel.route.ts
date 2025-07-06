import { AdminPanelController } from "@/controllers/adminPanel.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { AdminPanelRouteGroups } from "@/routeGroups/adminPanel.routeGroup.js";
import { AdminPanelService } from "@/services/adminPanel.service.js";
import { getServerLogSchema } from "@/validators/adminPanel.validator.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const adminPanelService = new AdminPanelService();
    const adminPanelController = new AdminPanelController(adminPanelService);

    smartRouter.get("/getServerLog{/:limit-:offset}", AdminPanelRouteGroups.ADMIN_PANEL_SERVER_LOG_READ, verifyAuth(), validateRequest(getServerLogSchema), adminPanelController.getServerLogs);

    /*smartRouter.get("/getFilterOptionsServerLog", "adminPageServerLogRead", adminPageServerLogReadDescription, verifyAccessToken, adminPageController.getFilterOptionsServerLog);
    smartRouter.get("/getAllPermissionsWithRouteGroups", "adminPagePermissionsRead", adminPagePermissionsReadDescription, verifyAccessToken, adminPageController.getAllPermissionsWithRouteGroups);
    smartRouter.get("/getAllRouteGroups", "adminPagePermissionsRead", adminPagePermissionsReadDescription, verifyAccessToken, adminPageController.getAllRouteGroups);

    smartRouter.post("/getFilteredServerLog{/:limit-:offset}", "adminPageServerLogRead", adminPageServerLogReadDescription, verifyAccessToken, adminPageController.getFilteredServerLog);
    smartRouter.post("/createPermission", "adminPagePermissionsWrite", adminPagePermissionsWriteDescription, verifyAccessToken, adminPageController.createPermission);
    smartRouter.post("/updatePermission", "adminPagePermissionsWrite", adminPagePermissionsWriteDescription, verifyAccessToken, adminPageController.updatePermission);
    smartRouter.post("/deletePermission", "adminPagePermissionsWrite", adminPagePermissionsWriteDescription, verifyAccessToken, adminPageController.deletePermission);*/

    return smartRouter.getExpressRouter();
};
