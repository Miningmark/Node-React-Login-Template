import { GroupEntry } from "@/routeGroups/index.js";

export class UserManagementRouteGroups {
    static readonly USER_MANAGEMENT_READ: GroupEntry = {
        groupName: "userManagementRead",
        groupDescription: "Hat das Recht, alle Userdaten zu sehen"
    };

    static readonly USER_MANAGEMENT_WRITE: GroupEntry = {
        groupName: "userManagementWrite",
        groupDescription: "Hat das Recht, alle Userdaten zu sehen und zu bearbeiten"
    };

    static readonly USER_MANAGEMENT_CREATE: GroupEntry = {
        groupName: "userManagementCreate",
        groupDescription: "Hat das Recht, alle Userdaten zu sehen, zu bearbeiten und zu erstellen"
    };
}
