import { AdminPageController } from "@/controllers/adminPage.controller.js";
import { validateRequest } from "@/middlewares/validateRequest.middleware.js";
import { verifyAuth } from "@/middlewares/verifyAuth.middleware.js";
import { verifyPermission } from "@/middlewares/verifyPermission.middleware.js";
import {
    ADMIN_PAGE_MAINTENANCE_MODE_WRITE,
    ADMIN_PAGE_NOTIFICATIONS_READ,
    ADMIN_PAGE_NOTIFICATIONS_WRITE,
    ADMIN_PAGE_PERMISSIONS_READ,
    ADMIN_PAGE_PERMISSIONS_WRITE,
    ADMIN_PAGE_SERVER_LOG_READ
} from "@/routeGroups/adminPage.routeGroup.js";
import { AdminPageService } from "@/services/adminPage.service.js";
import {
    createNotificationSchema,
    createPermissionSchema,
    deleteNotificationSchema,
    deletePermissionSchema,
    getFilteredServerLogSchema,
    getNotificationsSchema,
    getServerLogSchema,
    updateMaintenanceModeSchema,
    updateNotificationSchema,
    updatePermissionSchema
} from "@/validators/adminPage.validator.js";
import { onlyAuthorizationSchema } from "@/validators/base.validator.js";
import { Router } from "express";

const router = Router();
const adminPageService = new AdminPageService();
const adminPageController = new AdminPageController(adminPageService);

router.get("/getServerLogs{/:limit-:offset}", verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]), verifyAuth(), validateRequest(getServerLogSchema), adminPageController.getServerLogs);
router.get("/getFilterOptionsServerLog", verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]), verifyAuth(), validateRequest(onlyAuthorizationSchema), adminPageController.getFilterOptionsServerLog);

router.post("/getFilteredServerLogs{/:limit-:offset}", verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]), verifyAuth(), validateRequest(getFilteredServerLogSchema), adminPageController.getFilteredServerLogs);

router.get(
    "/getPermissionsWithRouteGroups",
    verifyPermission([ADMIN_PAGE_PERMISSIONS_READ.groupName, ADMIN_PAGE_PERMISSIONS_WRITE.groupName]),
    verifyAuth(),
    validateRequest(onlyAuthorizationSchema),
    adminPageController.getPermissionsWithRouteGroups
);
router.get("/getRouteGroups", verifyPermission([ADMIN_PAGE_PERMISSIONS_READ.groupName, ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), verifyAuth(), validateRequest(onlyAuthorizationSchema), adminPageController.getRouteGroups);

router.post("/createPermission", verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), verifyAuth(), validateRequest(createPermissionSchema), adminPageController.createPermission);
router.post("/updatePermission", verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), verifyAuth(), validateRequest(updatePermissionSchema), adminPageController.updatePermission);
router.post("/deletePermission", verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), verifyAuth(), validateRequest(deletePermissionSchema), adminPageController.deletePermission);

router.get(
    "/getNotifications{/:limit-:offset}",
    verifyPermission([ADMIN_PAGE_NOTIFICATIONS_READ.groupName, ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]),
    verifyAuth(),
    validateRequest(getNotificationsSchema),
    adminPageController.getNotifications
);

router.post("/createNotification", verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]), verifyAuth(), validateRequest(createNotificationSchema), adminPageController.createNotification);
router.post("/updateNotification", verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]), verifyAuth(), validateRequest(updateNotificationSchema), adminPageController.updateNotification);
router.post("/deleteNotification", verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]), verifyAuth(), validateRequest(deleteNotificationSchema), adminPageController.deleteNotification);

router.post("/updateMaintenanceMode", verifyPermission([ADMIN_PAGE_MAINTENANCE_MODE_WRITE.groupName]), verifyAuth(), validateRequest(updateMaintenanceModeSchema), adminPageController.updateMaintenanceMode);

export default router;
