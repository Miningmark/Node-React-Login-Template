import { ControllerResponse } from "@/controllers/base.controller.js";
import { ForbiddenError, ValidationError } from "@/errors/errorClasses.js";
import Notification from "@/models/notifications.model.js";
import Permission from "@/models/permission.model.js";
import RouteGroup from "@/models/routeGroup.model.js";
import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";
import User from "@/models/user.model.js";
import UserNotification from "@/models/userNotifications.model.js";
import { PermissionService } from "@/services/permission.service.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { ServerLogService } from "@/services/serverLog.service.js";
import { SocketService } from "@/socketIO/socket.service.js";
import { Op } from "@sequelize/core";
import { NotificationService } from "@/services/notification.service.js";

export class AdminPageService {
    private serverLogService: ServerLogService;
    private routeGroupService: RouteGroupService;
    private permissionService: PermissionService;
    private notificationService: NotificationService;

    constructor() {
        this.serverLogService = new ServerLogService();
        this.routeGroupService = new RouteGroupService();
        this.permissionService = new PermissionService();
        this.notificationService = new NotificationService();
    }

    async getServerLogs(limit?: number, offset?: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten ServerLogs zurück gegeben" };

        const databaseServerLogs = await ServerLog.findAll({ ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.serverLogCount = await ServerLog.count();
        jsonResponse.serverLogs = this.serverLogService.generateJSONResponse(databaseServerLogs);

        return { type: "json", jsonResponse: jsonResponse, logResponse: false };
    }

    async getFilteredServerLogs(limit?: number, offset?: number, userIds?: number[], types?: string[], ipv4Adress?: string, createdAtFrom?: Date, createdAtTo?: Date, searchString?: string): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Serverlogs zurück gegeben" };

        const buildServerLogQueryConditions = this.serverLogService.buildServerLogQueryConditions(userIds, types, ipv4Adress, createdAtFrom, createdAtTo, searchString);

        const databaseServerLogs = await ServerLog.findAll({
            where: buildServerLogQueryConditions,
            ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}),
            order: [["id", "DESC"]]
        });

        jsonResponse.serverLogCount = await ServerLog.count({ where: buildServerLogQueryConditions });
        jsonResponse.serverLogs = this.serverLogService.generateJSONResponse(databaseServerLogs);

        return { type: "json", jsonResponse: jsonResponse, logResponse: false };
    }

    async getFilterOptionsServerLog(): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle Filter Optionen zurück gegeben" };

        const databaseUsers = await User.findAll({});

        jsonResponse.filterOptions = {};
        jsonResponse.filterOptions.users = databaseUsers.map((databaseUser) => {
            return {
                id: databaseUser.id,
                username: databaseUser.username
            };
        });

        jsonResponse.filterOptions.types = Object.values(ServerLogTypes);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getPermissionsWithRouteGroups(): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle Berechtigungen mit RouteGroups zurück gegeben" };

        const databasePermissions = await Permission.findAll({ include: { model: RouteGroup } });

        jsonResponse.permissions = this.permissionService.generateMultipleJSONResponseWithModel(databasePermissions);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getRouteGroups(): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle RouteGroups zurück gegeben" };

        const databaseRouteGroups = await RouteGroup.findAll();

        jsonResponse.routeGroups = this.routeGroupService.generateMultipleJSONResponseWithModel(databaseRouteGroups);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async createPermission(name: string, routeGroupIds: number[], description?: string): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Berechtigung erfolgreich erstellt" };

        const databasePermissionNew = await Permission.findOne({ where: { name: name } });
        if (databasePermissionNew !== null) throw new ValidationError("Der Name für die Permission ist schon belegt");

        const databasePermission = await Permission.create({ name: name, description: description });
        const databaseRouteGroups = await RouteGroup.findAll({ where: { id: { [Op.in]: routeGroupIds } } });

        await databasePermission.setRouteGroups(databaseRouteGroups);
        databasePermission.routeGroups = await databasePermission.getRouteGroups();

        SocketService.getInstance().emitToRoom("listen:userManagement:permissions:watchList", "userManagement:permissions:create", { id: databasePermission.id, name: name, description: description });
        SocketService.getInstance().emitToRoom("listen:adminPage:permissions:watchList", "adminPage:permissions:create", this.permissionService.generateSingleJSONResponseWithModel(databasePermission));

        return { type: "json", jsonResponse: jsonResponse };
    }

    async updatePermission(id: number, name?: string, description?: string, routeGroupIds?: number[]): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Berechtigung erfolgreich bearbeitet" };

        const databasePermission = await Permission.findOne({ where: { id: id } });
        if (databasePermission === null) throw new ValidationError("Es gibt keine Permission mit dieser Id");
        if (databasePermission.name.toLowerCase() === "SuperAdmin Berechtigung".toLowerCase()) throw new ForbiddenError("Die SuperAdmin Berechtigung kann nicht bearbeitet werden");

        if (name !== undefined) {
            const databasePermissionNew = await Permission.findOne({ where: { name: name } });
            if (databasePermissionNew !== null) throw new ValidationError("Der Name für die Permission ist schon belegt");

            databasePermission.name = name;
        }

        if (description !== undefined) {
            databasePermission.description = description;
        }

        if (routeGroupIds !== undefined) {
            const databaseRouteGroups = await RouteGroup.findAll({ where: { id: { [Op.in]: routeGroupIds } } });
            await databasePermission.setRouteGroups(databaseRouteGroups);
        }

        await databasePermission.save();

        SocketService.getInstance().emitToRoom("listen:userManagement:permissions:watchList", "userManagement:permissions:update", { id: id, name: name, description: description });
        SocketService.getInstance().emitToRoom("listen:adminPage:permissions:watchList", "adminPage:permissions:update", this.permissionService.generateSingleJSONResponseWithModel(databasePermission));

        return { type: "json", jsonResponse: jsonResponse };
    }

    async deletePermission(id: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Berechtigung erfolgreich gelöscht" };

        const databasePermission = await Permission.findOne({ where: { id: id }, include: { model: User } });
        if (databasePermission === null) throw new ValidationError("Es gibt keine Permission mit dieser ID");
        if (databasePermission.name.toLowerCase() === "SuperAdmin Berechtigung".toLowerCase()) throw new ForbiddenError("Die SuperAdmin Berechtigung kann nicht gelöscht werden");

        if (databasePermission.users === undefined || databasePermission.users.length !== 0) throw new ForbiddenError("Die Berechtigung kann nicht gelöscht werden da diese noch Benutzern zugewiesen ist");

        await databasePermission.destroy();

        SocketService.getInstance().emitToRoom("listen:userManagement:permissions:watchList", "userManagement:permissions:delete", { id: id });
        SocketService.getInstance().emitToRoom("listen:adminPage:permissions:watchList", "adminPage:permissions:delete", { id: id });

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getNotifications(limit?: number, offset?: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle Benachrichtigungen erfolgreich zurückgegeben" };

        const databaseNotifications = await Notification.findAll({ ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.notificationCount = await Notification.count();
        jsonResponse.notifications = this.notificationService.generateMultipleJSONResponseWithModel(databaseNotifications);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async createNotification(name: string, description: string, notifyFrom: Date, notifyTo: Date): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benachrichtigung erfolgreich erstellt" };

        const databaseNotification = await Notification.create({ name: name, description: description, notifyFrom: notifyFrom, notifyTo: notifyTo });

        SocketService.getInstance().emitToRoom("listen:global:notifications:watchList", "global:notifications:create", this.notificationService.generateSingleJSONResponseWithModel(databaseNotification));
        SocketService.getInstance().emitToRoom("listen:adminPage:notifications:watchList", "adminPage:notifications:create", this.notificationService.generateSingleJSONResponseWithModel(databaseNotification));

        return { type: "json", jsonResponse: jsonResponse };
    }

    async updateNotification(id: number, resendNotification: boolean, name?: string, description?: string, notifyFrom?: Date, notifyTo?: Date): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benachrichtigung erfolgreich geändert" };
        let activeNotifyFrom, activeNotifyTo;

        const databaseNotification = await Notification.findOne({ where: { id: id } });
        if (databaseNotification === null) throw new ValidationError("Es gibt keine Benachrichtigung mit dieser ID");

        activeNotifyFrom = databaseNotification.notifyFrom;
        activeNotifyTo = databaseNotification.notifyTo;

        if (notifyFrom !== undefined) activeNotifyFrom = notifyFrom;
        if (notifyTo !== undefined) activeNotifyTo = notifyTo;
        if (activeNotifyFrom.getTime() > activeNotifyTo.getTime()) throw new ValidationError("notifyFrom muss zeitlich vor notifyTo liegen");

        if (name !== undefined) {
            databaseNotification.name = name;
        }

        if (description !== undefined) {
            databaseNotification.description = description;
        }

        if (notifyFrom !== undefined) {
            if (databaseNotification.notifyFrom.getTime() > Date.now() && notifyFrom.getTime() < Date.now() && activeNotifyTo.getTime() > Date.now()) {
                resendNotification = true;
            }

            databaseNotification.notifyFrom = notifyFrom;
        }

        if (notifyTo !== undefined) {
            databaseNotification.notifyTo = notifyTo;
        }

        if (resendNotification) {
            await UserNotification.update({ confirmed: false }, { where: { notificationId: id } });
            SocketService.getInstance().emitToRoom("listen:global:notifications:watchList", "global:notifications:update", this.notificationService.generateSingleJSONResponseWithModel(databaseNotification));
        }

        await databaseNotification.save();

        SocketService.getInstance().emitToRoom("listen:adminPage:notifications:watchList", "adminPage:notifications:update", this.notificationService.generateSingleJSONResponseWithModel(databaseNotification));

        return { type: "json", jsonResponse: jsonResponse };
    }

    async deleteNotification(id: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benachrichtigung erfolgreich gelöscht" };

        const databaseNotification = await Notification.findOne({ where: { id: id } });
        if (databaseNotification === null) throw new ValidationError("Es gibt keine Benachrichtigung mit dieser ID");

        await databaseNotification.destroy();

        SocketService.getInstance().emitToRoom("listen:adminPage:notifications:watchList", "adminPage:notifications:delete", { id: id });

        return { type: "json", jsonResponse: jsonResponse };
    }
}
