import { container } from "tsyringe";
import { ServerLogService } from "@/services/serverLog.service.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { PermissionService } from "@/services/permission.service.js";
import { NotificationService } from "@/services/notification.service.js";
import { AdminPageService } from "@/services/adminPage.service.js";
import { SocketService } from "@/socketIO/socket.service.js";

container.registerSingleton(ServerLogService, ServerLogService);
container.registerSingleton(RouteGroupService, RouteGroupService);
container.registerSingleton(PermissionService, PermissionService);
container.registerSingleton(NotificationService, NotificationService);
container.registerSingleton(AdminPageService, AdminPageService);

container.register<SocketService>("SocketService", {
    useValue: SocketService.getInstance()
});

export { container };
