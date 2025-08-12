import { defineGroup, GroupEntry } from "@/routeGroups/index.js";

export const USER_MANAGEMENT_READ = defineGroup("userManagementRead", "Hat das Recht, alle Userdaten zu sehen");
export const USER_MANAGEMENT_WRITE = defineGroup("userManagementWrite", "Hat das Recht, alle Userdaten zu sehen und zu bearbeiten");
export const USER_MANAGEMENT_CREATE = defineGroup("userManagementCreate", "Hat das Recht, alle Userdaten zu sehen, zu bearbeiten und zu erstellen");
