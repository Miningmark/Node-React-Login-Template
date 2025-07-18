import { ConflictError, InternalServerError, ValidationError } from "@/errors/errorClasses.js";
import LastLogin from "@/models/lastLogin.model.js";
import Permission from "@/models/permission.model.js";
import User from "@/models/user.model.js";
import UserSettings, { UserSettingsTheme } from "@/models/userSettings.model.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { TokenService } from "@/services/token.service.js";
import { SocketService } from "@/socketIO/socket.service.js";
import { capitalizeFirst } from "@/utils/misc.util.js";
import bcrypt from "bcrypt";
import { Response } from "express";

export class UserService {
    private tokenService: TokenService;
    private routeGroupService: RouteGroupService;

    constructor() {
        this.tokenService = new TokenService();
        this.routeGroupService = new RouteGroupService();
    }

    async updateUsername(userId: number, newUsername: string, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Benutzername erfolgreich geändert" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        console.log(databaseUser.username);
        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ValidationError("Du kannst den Benutzernamen vom SuperAdmin nicht ändern");

        if (databaseUser.username.toLowerCase() === newUsername.toLowerCase()) throw new ConflictError("Die Benutzername ist der selbe wie momentan verwendet");

        const databaseUserNewUsername = await User.findOne({ where: { username: newUsername } });
        if (databaseUserNewUsername !== null) throw new ConflictError("Benutzername bereits vergeben");

        databaseUser.username = newUsername;
        await databaseUser.save();

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", this.generateJSONResponse(databaseUser.id, databaseUser.username));
        return jsonResponse;
    }

    async updateEmail(userId: number, newEmail: string, res: Response) {
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
        return jsonResponse;
    }

    async updatePassword(userId: number, currentPassword: string, newPassword: string, res: Response) {
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

        return jsonResponse;
    }

    async updateSettings(userId: number, theme: UserSettingsTheme) {
        let jsonResponse: Record<string, any> = { message: "Einstellungen erfolgreich geändert" };

        const databaseUser = await User.findOne({ where: { id: userId }, include: { model: UserSettings } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");
        if (databaseUser.userSettings === undefined) throw new InternalServerError("Einstellungen nicht geladen");

        if (databaseUser.userSettings === null) {
            await databaseUser.createUserSettings({ userId: userId, theme: theme });
        } else {
            databaseUser.userSettings.theme = theme;
            await databaseUser.userSettings.save();
        }

        return jsonResponse;
    }

    async getUsername(userId: number) {
        let jsonResponse: Record<string, any> = { message: "Benutzername erfolgreich zurückgegeben" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        jsonResponse.username = capitalizeFirst(databaseUser.username);

        return jsonResponse;
    }

    async getRouteGroups(userId: number) {
        let jsonResponse: Record<string, any> = { message: "LastLogins erfolgreich zurückgegeben" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        jsonResponse.routeGroups = await this.routeGroupService.generateUserRouteGroupArray(databaseUser);

        return jsonResponse;
    }

    async getLastLogins(userId: number) {
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

        return jsonResponse;
    }

    async getSettings(userId: number) {
        let jsonResponse: Record<string, any> = { message: "Einstellungen erfolreich zurückgegeben" };

        const databaseUser = await User.findOne({ where: { id: userId }, include: { model: UserSettings } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");
        if (databaseUser.userSettings === undefined) throw new InternalServerError("Einstellungen nicht geladen");

        if (databaseUser.userSettings === null) {
            databaseUser.userSettings = await databaseUser.createUserSettings();
        }

        jsonResponse.settings = {
            theme: databaseUser.userSettings.theme
        };

        return jsonResponse;
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
