import { GroupEntry } from "@/routeGroups/index.js";

export class AdminPageRouteGroups {
    static readonly ADMIN_PANEL_SERVER_LOG_READ: GroupEntry = {
        groupName: "adminPageServerLogRead",
        groupDescription: "Hat das Recht den Serverlog zu sehen"
    };

    static readonly ADMIN_PANEL_PERMISSIONS_READ: GroupEntry = {
        groupName: "adminPagePermissionsRead",
        groupDescription: "Hat das Recht die Permissions mit den RouteGroups zu sehen"
    };

    static readonly ADMIN_PANEL_PERMISSIONS_WRITE: GroupEntry = {
        groupName: "adminPagePermissionsWrite",
        groupDescription: "Hat das Recht die Permissions mit den RouteGroups zu sehen und zu bearbeiten"
    };
}
