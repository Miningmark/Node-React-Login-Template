import { ENV } from "@/config/env.js";
import { ControllerResponse } from "@/controllers/base.controller.js";
import { ForbiddenError, ValidationError } from "@/errors/errorClasses.js";
import Permission from "@/models/permission.model.js";
import User from "@/models/user.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { EmailService } from "@/services/email.service.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { S3Service } from "@/services/s3.service.js";
import { TokenService } from "@/services/token.service.js";
import { UserService } from "@/services/user.service.js";
import { SocketService } from "@/socketIO/socket.service.js";
import { getCompleteAdminRegistrationEmailTemplate } from "@/templates/email/userManagement.template.email.js";
import { formatDate, parseTimeOffsetToDate } from "@/utils/misc.util.js";
import { Op } from "@sequelize/core";

export class UserManagementService {
    private emailService: EmailService;
    private routeGroupService: RouteGroupService;
    private tokenService: TokenService;
    private userService: UserService;

    constructor() {
        this.emailService = EmailService.getInstance();
        this.routeGroupService = new RouteGroupService();
        this.tokenService = new TokenService();
        this.userService = new UserService();
    }

    async getUsers(limit?: number, offset?: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Benutzer zurück gegeben" };

        const databaseUsers = await User.findAll({ include: { model: Permission }, ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.users = databaseUsers.map((databaseUser) => {
            return this.userService.generateJSONResponseWithModel(databaseUser);
        });

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getAvatar(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Profilbild erfolreich zurückgegeben" };
        let stream, contentType;

        try {
            ({ stream, contentType } = await S3Service.getInstance().getFile("users", `avatars/${userId}-avatar`));
        } catch (error) {
            return { type: "json", jsonResponse: jsonResponse, statusCode: 204 };
        }

        return { type: "stream", stream: stream, contentType: contentType, jsonResponse: jsonResponse };
    }

    async deleteAvatar(userId: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Profilbild erfolreich entfernt" };

        await S3Service.getInstance().deleteFile("users", `avatars/${userId}-avatar`);

        SocketService.getInstance().emitToRoom(`listen:user:${userId}`, "user:update", { avatar: null });

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getPermissions(): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Alle Permissions zurück gegeben" };

        const databasePermissions = await Permission.findAll();

        jsonResponse.permissions = databasePermissions.map((databasePermission) => {
            return {
                id: databasePermission.id,
                name: databasePermission.name,
                description: databasePermission.description
            };
        });

        return { type: "json", jsonResponse: jsonResponse };
    }

    async updateUser(userId: number, username?: string, email?: string, isActive?: boolean, isDisabled?: boolean, permissionIds?: number[]): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich bearbeitet" };

        const databaseUser = await User.findOne({ where: { id: userId }, include: { model: Permission } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        const databaseUserTokens = await UserToken.findAll({
            where: { type: { [Op.or]: [UserTokenType.USER_REGISTRATION_TOKEN, UserTokenType.ADMIN_REGISTRATION_TOKEN] }, expiresAt: { [Op.gte]: new Date(Date.now()) } }
        });

        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ForbiddenError("SuperAdmin kann nicht bearbeitet werden");

        if (username !== undefined) {
            const databaseUser = await User.findOne({ where: { username: username } });
            if (databaseUser !== null) throw new ValidationError("Benutzername oder bereits vergeben");
        }

        if (email !== undefined) {
            const databaseUser = await User.findOne({ where: { email: email } });
            if (databaseUser !== null) throw new ValidationError("Email oder bereits vergeben");
        }

        if (permissionIds !== undefined) {
            const databaseSuperAdminPermission = await Permission.findOne({ where: { name: "SuperAdmin Berechtigung" } });
            if (databaseSuperAdminPermission === null) throw new ValidationError("SuperAdmin Berechtigung nicht gefunden!");

            if (permissionIds.includes(databaseSuperAdminPermission.id)) throw new ForbiddenError("SuperAdmin Berechtigung kann keinem anderen Benutzern zugewiesen werden");
        }

        const onlyPermissionIds = username === undefined && email === undefined && isActive === undefined;
        if (!onlyPermissionIds && databaseUser.isActive === false && databaseUserTokens.length !== 0)
            throw new ForbiddenError("Es können nur Rechte editiert und der Benutzer gesperrt werden solange der Registrierungsprozess nicht abgeschlossen ist");

        if (username !== undefined) {
            databaseUser.username = username;
            SocketService.getInstance().emitToRoom(`listen:user:${databaseUser.id}`, "user:update", { username: databaseUser.username });
        }

        if (email !== undefined) {
            databaseUser.email = email;
            SocketService.getInstance().emitToRoom(`listen:user:${databaseUser.id}`, "user:update", { email: databaseUser.email });
        }

        if (isActive !== undefined) {
            this.tokenService.removeJWTs(databaseUser);
            databaseUser.isActive = isActive;
            SocketService.getInstance().emitToRoom(`listen:user:${databaseUser.id}`, "user:update", { isActive: databaseUser.isActive });
        }

        if (isDisabled !== undefined) {
            this.tokenService.removeJWTs(databaseUser);
            databaseUser.isDisabled = isDisabled;
            SocketService.getInstance().emitToRoom(`listen:user:${databaseUser.id}`, "user:update", { isDisabled: databaseUser.isDisabled });
        }

        if (permissionIds !== undefined) {
            this.tokenService.removeJWT(databaseUser, UserTokenType.ACCESS_TOKEN);
            const databasePermissions = await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
            await databaseUser.setPermissions(databasePermissions);

            databaseUser.permissions = await databaseUser.getPermissions();

            SocketService.getInstance().emitToRoom(`listen:user:${databaseUser.id}`, "user:update", { routeGroups: await this.routeGroupService.generateUserRouteGroupArray(databaseUser) });
        }

        await databaseUser.save();
        SocketService.getInstance().emitToRoom(
            "listen:userManagement:users:watchList",
            "userManagement:users:update",
            this.userService.generateJSONResponse(databaseUser.id, username, email, isActive, isDisabled, databaseUser.permissions)
        );

        return { type: "json", jsonResponse: jsonResponse };
    }

    async createUser(username: string, email: string, permissionIds: number[]): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzer wurde erfolgreich registriert" };

        const databaseSuperAdminPermission = await Permission.findOne({ where: { name: "SuperAdmin Berechtigung" } });
        if (databaseSuperAdminPermission === null) throw new ValidationError("SuperAdmin Berechtigung nicht gefunden!");

        if (permissionIds.includes(databaseSuperAdminPermission.id)) throw new ForbiddenError("SuperAdmin Berechtigung kann keinen anderen Benutzern zugewiesen werden");

        let databaseUser = await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } });
        if (databaseUser !== null) throw new ValidationError("Benutzername oder Email bereits vergeben");

        const databasePermissions = await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });

        databaseUser = await User.create({ username: username, email: email, password: "" });
        await databaseUser.setPermissions(databasePermissions);
        databaseUser.permissions = await databaseUser.getPermissions();

        const token = await this.tokenService.generateHexUserToken(databaseUser.id, UserTokenType.ADMIN_REGISTRATION_TOKEN, ENV.ACCOUNT_ACTIVATION_ADMIN_EXPIRY);
        await this.emailService.sendHTMLTemplateEmail(
            databaseUser.email,
            "Abschluss deiner Registrierung",
            getCompleteAdminRegistrationEmailTemplate(ENV.FRONTEND_NAME, databaseUser.username, `${ENV.FRONTEND_URL}password-reset?token=${token}`, formatDate(parseTimeOffsetToDate(ENV.ACCOUNT_ACTIVATION_ADMIN_EXPIRY)))
        );

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:create", this.userService.generateJSONResponseWithModel(databaseUser));
        return { type: "json", jsonResponse: jsonResponse };
    }
}
