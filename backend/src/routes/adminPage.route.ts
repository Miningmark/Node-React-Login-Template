import { Router } from "express";
import { container } from "tsyringe";

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
    updateMaintenanceModeSchema,
    updateNotificationSchema,
    updatePermissionSchema
} from "@/validators/adminPage.validator.js";
import { onlyAuthorizationSchema, onlyLimitAndOffsetSchema } from "@/validators/base.validator.js";

const router = Router();
const adminPageController = container.resolve(AdminPageController);

router.get(
    "/getServerLogs{/:limit-:offset}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]),
    validateRequest(onlyLimitAndOffsetSchema),
    adminPageController.getServerLogs
);

router.get(
    "/getFilterOptionsServerLog",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]),
    adminPageController.getFilterOptionsServerLog
);

router.post(
    "/getFilteredServerLogs{/:limit-:offset}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_SERVER_LOG_READ.groupName]),
    validateRequest(getFilteredServerLogSchema),
    adminPageController.getFilteredServerLogs
);

router.get(
    "/getPermissionsWithRouteGroups",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([
        ADMIN_PAGE_PERMISSIONS_READ.groupName,
        ADMIN_PAGE_PERMISSIONS_WRITE.groupName
    ]),
    adminPageController.getPermissionsWithRouteGroups
);
router.get(
    "/getRouteGroups",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([
        ADMIN_PAGE_PERMISSIONS_READ.groupName,
        ADMIN_PAGE_PERMISSIONS_WRITE.groupName
    ]),
    adminPageController.getRouteGroups
);

router.post(
    "/createPermission",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]),
    validateRequest(createPermissionSchema),
    adminPageController.createPermission
);
router.post(
    "/updatePermission",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]),
    validateRequest(updatePermissionSchema),
    adminPageController.updatePermission
);
router.post(
    "/deletePermission",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_PERMISSIONS_WRITE.groupName]),
    validateRequest(deletePermissionSchema),
    adminPageController.deletePermission
);

router.get(
    "/getNotifications{/:limit-:offset}",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([
        ADMIN_PAGE_NOTIFICATIONS_READ.groupName,
        ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName
    ]),
    validateRequest(onlyLimitAndOffsetSchema),
    adminPageController.getNotifications
);

router.post(
    "/createNotification",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]),
    validateRequest(createNotificationSchema),
    adminPageController.createNotification
);
router.post(
    "/updateNotification",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]),
    validateRequest(updateNotificationSchema),
    adminPageController.updateNotification
);
router.post(
    "/deleteNotification",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_NOTIFICATIONS_WRITE.groupName]),
    validateRequest(deleteNotificationSchema),
    adminPageController.deleteNotification
);

router.post(
    "/updateMaintenanceMode",
    validateRequest(onlyAuthorizationSchema),
    verifyAuth(),
    verifyPermission([ADMIN_PAGE_MAINTENANCE_MODE_WRITE.groupName]),
    validateRequest(updateMaintenanceModeSchema),
    adminPageController.updateMaintenanceMode
);

export default router;
