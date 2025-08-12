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
import { container } from "tsyringe";

const router = Router();
const adminPageController = container.resolve(AdminPageController);

/*router.get("/getServerLogs{/:limit-:offset}", verifyAuth(), verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]), validateRequest(getServerLogSchema), adminPageController.getServerLogs);
router.get("/getFilterOptionsServerLog", verifyAuth(), verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]), validateRequest(onlyAuthorizationSchema), adminPageController.getFilterOptionsServerLog);

router.post("/getFilteredServerLogs{/:limit-:offset}", verifyAuth(), verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]), validateRequest(getFilteredServerLogSchema), adminPageController.getFilteredServerLogs);

router.get(
    "/getPermissionsWithRouteGroups",
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_PERMISSIONS_READ.groupName, ADMIN_PAGE_PERMISSIONS_WRITE.groupName]),
    validateRequest(onlyAuthorizationSchema),
    adminPageController.getPermissionsWithRouteGroups
);
router.get("/getRouteGroups", verifyAuth(), verifyPermission([ADMIN_PAGE_PERMISSIONS_READ.groupName, ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), validateRequest(onlyAuthorizationSchema), adminPageController.getRouteGroups);

router.post("/createPermission", verifyAuth(), verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), validateRequest(createPermissionSchema), adminPageController.createPermission);
router.post("/updatePermission", verifyAuth(), verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), validateRequest(updatePermissionSchema), adminPageController.updatePermission);
router.post("/deletePermission", verifyAuth(), verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]), validateRequest(deletePermissionSchema), adminPageController.deletePermission);

router.get(
    "/getNotifications{/:limit-:offset}",
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_NOTIFICATIONS_READ.groupName, ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]),
    validateRequest(getNotificationsSchema),
    adminPageController.getNotifications
);

router.post("/createNotification", verifyAuth(), verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]), validateRequest(createNotificationSchema), adminPageController.createNotification);
router.post("/updateNotification", verifyAuth(), verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]), validateRequest(updateNotificationSchema), adminPageController.updateNotification);
router.post("/deleteNotification", verifyAuth(), verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]), validateRequest(deleteNotificationSchema), adminPageController.deleteNotification);

router.post("/updateMaintenanceMode", verifyAuth(), verifyPermission([ADMIN_PAGE_MAINTENANCE_MODE_WRITE.groupName]), validateRequest(updateMaintenanceModeSchema), adminPageController.updateMaintenanceMode);*/

export default router;
