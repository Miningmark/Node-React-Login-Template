import { AdminPageController } from "@/controllers/adminPage.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { AdminPageRouteGroups } from "@/routeGroups/adminPage.routeGroup.js";
import { AdminPageService } from "@/services/adminPage.service.js";
import { getServerLogSchema } from "@/validators/adminPage.validator.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const adminPageService = new AdminPageService();
    const adminPageController = new AdminPageController(adminPageService);

    smartRouter.get("/getServerLogs{/:limit-:offset}", AdminPageRouteGroups.ADMIN_PANEL_SERVER_LOG_READ, verifyAuth(), validateRequest(getServerLogSchema), adminPageController.getServerLogs);
    //smartRouter.get("/getFilterOptionsServerLog", AdminPageRouteGroups.ADMIN_PANEL_SERVER_LOG_READ, verifyAuth(), validateRequest(), adminPageController.getFilterOptionsServerLog);
    //smartRouter.post("/getFilteredServerLog{/:limit-:offset}", AdminPageRouteGroups.ADMIN_PANEL_SERVER_LOG_READ, verifyAuth(), validateRequest(getFilteredServerLogSchema), adminPageController.getFilteredServerLogs);

    //smartRouter.get("/getAllPermissionsWithRouteGroups", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_READ, verifyAuth(), validateRequest(), adminPageController.getAllPermissionsWithRouteGroups);
    //smartRouter.get("/getAllRouteGroups", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_READ, verifyAuth(), validateRequest(), adminPageController.getAllRouteGroups);

    //smartRouter.post("/createPermission", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_WRITE, verifyAuth(), validateRequest(), adminPageController.createPermission);
    //smartRouter.post("/updatePermission", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_WRITE, verifyAuth(), validateRequest(), adminPageController.updatePermission);
    //smartRouter.post("/deletePermission", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_WRITE, verifyAuth(), validateRequest(), adminPageController.deletePermission);

    return smartRouter.getExpressRouter();
};
