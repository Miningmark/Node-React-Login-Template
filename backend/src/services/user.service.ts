import { ControllerResponse } from "@/controllers/base.controller.js";
import { ConflictError, InternalServerError, ValidationError } from "@/errors/errorClasses.js";
import LastLogin from "@/models/lastLogin.model.js";
import Notification from "@/models/notification.model.js";
import Permission from "@/models/permission.model.js";
import User from "@/models/user.model.js";
import UserNotification from "@/models/userNotifications.model.js";
import UserSettings, { UserSettingsTheme } from "@/models/userSettings.model.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { S3Service } from "@/services/s3.service.js";
import { TokenService } from "@/services/token.service.js";
import { UserNotificationService } from "@/services/userNotification.service.js";
import { SocketService } from "@/socketIO/socket.service.js";
import { capitalizeFirst } from "@/utils/misc.util.js";
import { Op } from "@sequelize/core";
import bcrypt from "bcrypt";
import { Response } from "express";
import sharp from "sharp";

export class UserService {
    private tokenService: TokenService;
    private routeGroupService: RouteGroupService;
    private userNotificationService: UserNotificationService;
    private s3Service: S3Service;

    constructor() {
        this.tokenService = new TokenService();
        this.routeGroupService = new RouteGroupService();
        this.userNotificationService = new UserNotificationService();
        this.s3Service = S3Service.getInstance();
    }

    async updateUsername(userId: number, newUsername: string, res: Response): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzername erfolgreich geändert" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ValidationError("Du kannst den Benutzernamen vom SuperAdmin nicht ändern");

        if (databaseUser.username.toLowerCase() === newUsername.toLowerCase()) throw new ConflictError("Die Benutzername ist der selbe wie momentan verwendet");

        const databaseUserNewUsername = await User.findOne({ where: { username: newUsername } });
        if (databaseUserNewUsername !== null) throw new ConflictError("Benutzername bereits vergeben");

        databaseUser.username = newUsername;
        await databaseUser.save();

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", this.generateJSONResponse(databaseUser.id, databaseUser.username));
        return { type: "json", jsonResponse: jsonResponse };
    }

    async updateEmail(userId: number, newEmail: string, res: Response): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Email erfolgreich geändert" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ValidationError("Du kannst die Email vom SuperAdmin nicht ändern");

        if (databaseUser.email.toLowerCase() === newEmail.toLowerCase()) throw new ConflictError("Die Email ist die selbe wie momentan verwendet");

        const databaseUserNewEmail = await User.findOne({ where: { email: newEmail } });
        if (databaseUserNewEmail !== null) throw new ConflictError("Email bereits vergeben");

        databaseUser.email = newEmail;
        await databaseUser.save();

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", this.generateJSONResponse(databaseUser.id, undefined, databaseUser.email));
        return { type: "json", jsonResponse: jsonResponse };
    }

    async updatePassword(userId: number, currentPassword: string, newPassword: string, res: Response): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Passwort erfolgreich geändert, bitte neu anmelden" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ValidationError("Passwortänderungen für den SuperAdmin sind nicht möglich. Bitte direkt am Server vornehmen!");

        const passwordMatching = await bcrypt.compare(currentPassword, databaseUser.password);
        if (passwordMatching === false) throw new ValidationError("Passwörter stimmt nicht überein");
        if (currentPassword === newPassword) throw new ConflictError("Dein Passwort kann nicht mit deinem alten Passwort gleich sein");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        databaseUser.password = hashedPassword;
        await databaseUser.save();

        this.tokenService.removeJWTs(databaseUser);
        this.tokenService.clearRefreshTokenCookie(res);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async updateSettings(userId: number, theme?: UserSettingsTheme, isSideMenuFixed?: boolean): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Einstellungen erfolgreich geändert" };

        const databaseUser = await User.findOne({ where: { id: userId }, include: { model: UserSettings } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");
        if (databaseUser.userSettings === undefined) throw new InternalServerError("Einstellungen nicht geladen");

        if (databaseUser.userSettings === null) {
            await databaseUser.createUserSettings({ userId: userId, theme: theme, isSideMenuFixed: isSideMenuFixed });
        } else {
            if (theme !== undefined) {
                databaseUser.userSettings.theme = theme;
            }

            if (isSideMenuFixed !== undefined) {
                databaseUser.userSettings.isSideMenuFixed = isSideMenuFixed;
            }

            await databaseUser.userSettings.save();
        }

        return { type: "json", jsonResponse: jsonResponse };
    }

    async confirmPendingNotification(userId: number, notificationId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benachrichtigung erfolgreich bestätigt" };

        const databaseUserNotification = await UserNotification.findOne({ where: { userId: userId, notificationId: notificationId } });
        if (databaseUserNotification === null) throw new ValidationError("Keine Benachrichtigung gefunden");

        databaseUserNotification.confirmed = true;
        await databaseUserNotification.save();

        return { type: "json", jsonResponse: jsonResponse };
    }

    async updateAvatar(userId: number, file: Express.Multer.File): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Profilbild erfolgreich geändert" };

        const webpImageBuffer = await sharp(file.buffer).resize({ width: 512 }).webp({ quality: 80 }).toBuffer();
        await this.s3Service.uploadFile("users", `${userId}/avatar.webp`, webpImageBuffer, "image/webp");

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", { id: userId, avatar: "changed" });
        return { type: "json", jsonResponse: jsonResponse };
    }

    async getUsername(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzername erfolgreich zurückgegeben" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        jsonResponse.username = capitalizeFirst(databaseUser.username);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getRouteGroups(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "LastLogins erfolgreich zurückgegeben" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        jsonResponse.routeGroups = await this.routeGroupService.generateUserRouteGroupArray(databaseUser);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getLastLogins(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "RouteGroups erfolgreich zurückgegeben" };

        const databaseUser = await User.findOne({ where: { id: userId }, include: { model: LastLogin, limit: 5, order: [["loginTime", "DESC"]] } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        jsonResponse.lastLogins = databaseUser.lastLogins
            ? databaseUser.lastLogins.map((lastLogin) => ({
                  ipv4Address: lastLogin.ipv4Address,
                  country: lastLogin.country,
                  regionName: lastLogin.regionName,
                  loginTime: lastLogin.loginTime,
                  successfully: lastLogin.successfully
              }))
            : [];

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getSettings(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Einstellungen erfolgreich zurückgegeben" };

        const databaseUser = await User.findOne({ where: { id: userId }, include: { model: UserSettings } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");
        if (databaseUser.userSettings === undefined) throw new InternalServerError("Einstellungen nicht geladen");

        if (databaseUser.userSettings === null) {
            databaseUser.userSettings = await databaseUser.createUserSettings();
        }

        jsonResponse.settings = {
            theme: databaseUser.userSettings.theme,
            isSideMenuFixed: databaseUser.userSettings.isSideMenuFixed
        };

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getPendingNotifications(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Events erfolgreich zurückgegeben" };

        const databasePendingNotifications = await UserNotification.findAll({
            where: {
                userId: userId,
                confirmed: false
            },
            include: {
                model: Notification,
                where: {
                    notifyFrom: { [Op.lte]: Date.now() },
                    notifyTo: { [Op.gte]: Date.now() }
                }
            }
        });

        jsonResponse.pendingNotifications = this.userNotificationService.generateMultipleJSONResponseWithModel(databasePendingNotifications, false);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getActiveNotifications(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Events erfolgreich zurückgegeben" };

        const databasePendingNotifications = await UserNotification.findAll({
            where: {
                userId: userId
            },
            include: {
                model: Notification,
                where: {
                    notifyFrom: { [Op.lte]: Date.now() },
                    notifyTo: { [Op.gte]: Date.now() }
                }
            }
        });

        jsonResponse.activeNotifications = this.userNotificationService.generateMultipleJSONResponseWithModel(databasePendingNotifications, true);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getAvatar(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Profilbild erfolgreich zurückgegeben" };
        let stream, contentType;

        try {
            ({ stream, contentType } = await this.s3Service.getFile("users", `${userId}/avatar.webp`));
        } catch (error) {
            return { type: "json", jsonResponse: jsonResponse, statusCode: 204 };
        }

        return { type: "stream", stream: stream, contentType: contentType, jsonResponse: jsonResponse };
    }

    async deleteAvatar(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Profilbild erfolgreich entfernt" };

        await this.s3Service.deleteFile("users", `${userId}/avatar.webp`);

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", { id: userId, avatar: null });
        return { type: "json", jsonResponse: jsonResponse };
    }

    generateJSONResponseWithModel(databaseUser: User): Record<string, any> {
        return this.generateJSONResponse(databaseUser.id, databaseUser.username, databaseUser.email, databaseUser.isActive, databaseUser.isDisabled, databaseUser.permissions);
    }

    generateJSONResponse(id: number, username?: string, email?: string, isActive?: boolean, isDisabled?: boolean, permissions?: Permission[]): Record<string, any> {
        return {
            id: id,
            username: username,
            email: email,
            isActive: isActive,
            isDisabled: isDisabled,
            permissions: permissions
                ? permissions.map((permission) => ({
                      id: permission.id,
                      name: permission.name
                  }))
                : []
        };
    }
}
