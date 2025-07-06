import { GroupEntry } from "@/routeGroups/index.js";

export class UserManagementRouteGroups {
    static readonly READ: GroupEntry = {
        groupName: "userManagementRead",
        groupDescription: "Hat das Recht, alle Userdaten zu sehen"
    };

    static readonly WRITE: GroupEntry = {
        groupName: "userManagementWrite",
        groupDescription: "Hat das Recht, alle Userdaten zu sehen und zu bearbeiten"
    };

    static readonly CREATE: GroupEntry = {
        groupName: "userManagementCreate",
        groupDescription: "Hat das Recht, alle Userdaten zu sehen, zu bearbeiten und zu erstellen"
    };
}
