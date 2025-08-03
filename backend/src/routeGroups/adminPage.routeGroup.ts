import { GroupEntry } from "@/routeGroups/index.js";

export class AdminPageRouteGroups {
    static readonly ADMIN_PAGE_SERVER_LOG_READ: GroupEntry = {
        groupName: "adminPageServerLogRead",
        groupDescription: "Hat das Recht den Serverlog zu sehen"
    };

    static readonly ADMIN_PAGE_PERMISSIONS_READ: GroupEntry = {
        groupName: "adminPagePermissionsRead",
        groupDescription: "Hat das Recht die Berechtigungen mit den RouteGroups zu sehen"
    };

    static readonly ADMIN_PAGE_PERMISSIONS_WRITE: GroupEntry = {
        groupName: "adminPagePermissionsWrite",
        groupDescription: "Hat das Recht die Berechtigungen mit den RouteGroups zu sehen und zu bearbeiten"
    };

    static readonly ADMIN_PAGE_NOTIFICATIONS_READ: GroupEntry = {
        groupName: "adminPageNotificationsRead",
        groupDescription: "Hat das Recht die Benachrichtigungen sehen"
    };

    static readonly ADMIN_PAGE_NOTIFICATIONS_WRITE: GroupEntry = {
        groupName: "adminPageNotificationsWrite",
        groupDescription: "Hat das Recht die Benachrichtigungen sehen und zu bearbeiten"
    };

    static readonly ADMIN_PAGE_MAINTENANCE_MODE_WRITE: GroupEntry = {
        groupName: "adminPageMaintenanceModeWrite",
        groupDescription: "Hat Zugang wärend sich der Server im Wartungsmodus befindet, bitte mit Vorsicht vergeben"
    };
}
