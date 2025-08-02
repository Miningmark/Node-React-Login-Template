import { AdminPageController } from "@/controllers/adminPage.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { AdminPageRouteGroups } from "@/routeGroups/adminPage.routeGroup.js";
import { AdminPageService } from "@/services/adminPage.service.js";
import {
    createNotificationSchema,
    createPermissionSchema,
    deleteNotificationSchema,
    deletePermissionSchema,
    getFilteredServerLogSchema,
    getNotificationsSchema,
    getServerLogSchema,
    updateNotificationSchema,
    updatePermissionSchema
} from "@/validators/adminPage.validator.js";
import { onlyAuthorizationSchema } from "@/validators/base.validator.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const adminPageService = new AdminPageService();
    const adminPageController = new AdminPageController(adminPageService);

    smartRouter.get("/getServerLogs{/:limit-:offset}", AdminPageRouteGroups.ADMIN_PANEL_SERVER_LOG_READ, verifyAuth(), validateRequest(getServerLogSchema), adminPageController.getServerLogs);
    smartRouter.get("/getFilterOptionsServerLog", AdminPageRouteGroups.ADMIN_PANEL_SERVER_LOG_READ, verifyAuth(), validateRequest(onlyAuthorizationSchema), adminPageController.getFilterOptionsServerLog);

    smartRouter.post("/getFilteredServerLogs{/:limit-:offset}", AdminPageRouteGroups.ADMIN_PANEL_SERVER_LOG_READ, verifyAuth(), validateRequest(getFilteredServerLogSchema), adminPageController.getFilteredServerLogs);

    smartRouter.get("/getPermissionsWithRouteGroups", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_READ, verifyAuth(), validateRequest(onlyAuthorizationSchema), adminPageController.getPermissionsWithRouteGroups);
    smartRouter.get("/getRouteGroups", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_READ, verifyAuth(), validateRequest(onlyAuthorizationSchema), adminPageController.getRouteGroups);

    smartRouter.post("/createPermission", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_WRITE, verifyAuth(), validateRequest(createPermissionSchema), adminPageController.createPermission);
    smartRouter.post("/updatePermission", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_WRITE, verifyAuth(), validateRequest(updatePermissionSchema), adminPageController.updatePermission);
    smartRouter.post("/deletePermission", AdminPageRouteGroups.ADMIN_PANEL_PERMISSIONS_WRITE, verifyAuth(), validateRequest(deletePermissionSchema), adminPageController.deletePermission);

    smartRouter.get("/getNotifications{/:limit-:offset}", AdminPageRouteGroups.ADMIN_PANEL_NOTIFICATIONS_READ, verifyAuth(), validateRequest(getNotificationsSchema), adminPageController.getNotifications);

    smartRouter.post("/createNotification", AdminPageRouteGroups.ADMIN_PANEL_NOTIFICATIONS_WRITE, verifyAuth(), validateRequest(createNotificationSchema), adminPageController.createNotification);
    smartRouter.post("/updateNotification", AdminPageRouteGroups.ADMIN_PANEL_NOTIFICATIONS_WRITE, verifyAuth(), validateRequest(updateNotificationSchema), adminPageController.updateNotification);
    smartRouter.post("/deleteNotification", AdminPageRouteGroups.ADMIN_PANEL_NOTIFICATIONS_WRITE, verifyAuth(), validateRequest(deleteNotificationSchema), adminPageController.deleteNotification);

    return smartRouter.getExpressRouter();
};
