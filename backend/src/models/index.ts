import LastLogin from "@/models/lastLogin.model.js";
import Notification from "@/models/notifications.model.js";
import Permission from "@/models/permission.model.js";
import RouteGroup from "@/models/routeGroup.model.js";
import ServerLog from "@/models/serverLog.model.js";
import ServerSettings from "@/models/serverSettings.model.js";
import User from "@/models/user.model.js";
import UserNotification from "@/models/userNotifications.model.js";
import UserSettings from "@/models/userSettings.model.js";
import UserToken from "@/models/userToken.model.js";

export const models = [User, UserToken, ServerLog, Permission, RouteGroup, LastLogin, UserSettings, UserNotification, Notification, ServerSettings];
