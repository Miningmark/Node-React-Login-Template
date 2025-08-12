import { defineGroup } from "@/routeGroups/index.js";

export const ADMIN_PAGE_SERVER_LOG_READ = defineGroup("adminPageServerLogRead", "Hat das Recht den Serverlog zu sehen");
export const ADMIN_PAGE_PERMISSIONS_READ = defineGroup("adminPagePermissionsRead", "Hat das Recht die Berechtigungen mit den RouteGroups zu sehen");
export const ADMIN_PAGE_PERMISSIONS_WRITE = defineGroup("adminPagePermissionsWrite", "Hat das Recht die Berechtigungen mit den RouteGroups zu sehen und zu bearbeiten");
export const ADMIN_PAGE_NOTIFICATIONS_READ = defineGroup("adminPageNotificationsRead", "Hat das Recht die Benachrichtigungen sehen");
export const ADMIN_PAGE_NOTIFICATIONS_WRITE = defineGroup("adminPageNotificationsWrite", "Hat das Recht die Benachrichtigungen sehen und zu bearbeiten");
export const ADMIN_PAGE_MAINTENANCE_MODE_WRITE = defineGroup("adminPageMaintenanceModeWrite", "Hat Zugang wärend sich der Server im Wartungsmodus befindet, bitte mit Vorsicht vergeben");
