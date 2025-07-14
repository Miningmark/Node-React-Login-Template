import { ENV } from "@/config/env.js";
import { ForbiddenError, ValidationError } from "@/errors/errorClasses.js";
import Permission from "@/models/permission.model.js";
import User from "@/models/user.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { EmailService } from "@/services/email.service.js";
import { TokenService } from "@/services/token.service.js";
import { SocketService } from "@/socketIO/socket.service.js";
import { getCompleteAdminRegistrationEmailTemplate } from "@/templates/email/userManagement.template.email.js";
import { formatDate, parseTimeOffsetToDate } from "@/utils/misc.util.js";
import { Op } from "@sequelize/core";
import { UserService } from "@/services/user.service.js";

export class UserManagementService {
    private emailService: EmailService;
    private tokenService: TokenService;
    private userService: UserService;

    constructor() {
        this.emailService = EmailService.getInstance();
        this.tokenService = new TokenService();
        this.userService = new UserService();
    }

    async getUsers(limit?: number, offset?: number) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Benutzer zurück gegeben" };

        const databaseUsers = await User.findAll({ include: { model: Permission }, ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.users = databaseUsers.map((databaseUser) => {
            return this.userService.generateJSONUserResponse(databaseUser);
        });

        return jsonResponse;
    }

    async getPermissions() {
        let jsonResponse: Record<string, any> = { message: "Alle Permissions zurück gegeben" };

        const databasePermissions = await Permission.findAll();

        jsonResponse.permissions = databasePermissions.map((databasePermission) => {
            return {
                id: databasePermission.id,
                name: databasePermission.name,
                description: databasePermission.description
            };
        });

        return jsonResponse;
    }

    async updateUser(userId: number, username?: string, email?: string, isActive?: boolean, isDisabled?: boolean, permissionIds?: number[]) {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich bearbeitet" };

        const databaseUser = await User.findOne({ where: { id: userId }, include: { model: Permission } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        const databaseUserTokens = await UserToken.findAll({
            where: { type: { [Op.or]: [UserTokenType.USER_REGISTRATION_TOKEN, UserTokenType.ADMIN_REGISTRATION_TOKEN] }, expiresAt: { [Op.gte]: new Date(Date.now()) } }
        });

        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ForbiddenError("SuperAdmin kann nicht bearbeitet werden");

        if (permissionIds !== undefined) {
            const databaseSuperAdminPermission = await Permission.findOne({ where: { name: "SuperAdmin Berechtigung" } });
            if (databaseSuperAdminPermission === null) throw new ValidationError("SuperAdmin Berechtigung nicht gefunden!");

            if (permissionIds.includes(databaseSuperAdminPermission.id)) throw new ForbiddenError("SuperAdmin Berechtigung kann keinem anderen Benutzern zugewiesen werden");
        }

        const onlyPermissionIds = username === undefined && email === undefined && isActive === undefined;
        if (!onlyPermissionIds && databaseUser.isActive === false && databaseUserTokens.length !== 0)
            throw new ForbiddenError("Es können nur Rechte editiert und der Benutzer gesperrt werden solange der Registrierungsprozess nicht abgeschlossen ist");

        if (username !== undefined) {
            //TODO: SocketIO inform single user over his new username
            databaseUser.username = username;
        }

        if (email !== undefined) {
            //TODO: SocketIO inform single user over his new email ? is it anywhere visible ?
            databaseUser.email = email;
        }

        if (isActive !== undefined) {
            //TODO: SocketIO should loggout edited user, it happens automatic if user request anything new from backend
            this.tokenService.removeJWTs(databaseUser);
            databaseUser.isActive = isActive;
        }

        if (isDisabled !== undefined) {
            //TODO: SocketIO should loggout edited user, it happens automatic if user request anything new from backend
            this.tokenService.removeJWTs(databaseUser);
            databaseUser.isDisabled = isDisabled;
        }

        if (permissionIds !== undefined) {
            //TODO: SocketIO inform single user over his new routeGroups which comes with permissions, also deleting accessToken so frontend is requesting a new one which has new routeGroups after then

            this.tokenService.removeJWT(databaseUser, UserTokenType.ACCESS_TOKEN);
            const databasePermissions = await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
            await databaseUser.setPermissions(databasePermissions);
        }

        await databaseUser.save();

        //TODO: SocketIO inform edited user over changes
        SocketService.getInstance().emitToRoom("listen:users:watchList", "users:update", this.userService.generateJSONUserResponse(databaseUser));
        return jsonResponse;
    }

    async createUser(username: string, email: string, permissionIds: number[]) {
        let jsonResponse: Record<string, any> = { message: "Benutzer wurde erfolgreich registriert" };

        const databaseSuperAdminPermission = await Permission.findOne({ where: { name: "SuperAdmin Berechtigung" } });
        if (databaseSuperAdminPermission === null) throw new ValidationError("SuperAdmin Berechtigung nicht gefunden!");

        if (permissionIds.includes(databaseSuperAdminPermission.id)) throw new ForbiddenError("SuperAdmin Berechtigung kann keinen anderen Benutzern zugewiesen werden");

        const databasePermissions = await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });

        const databaseUser = await User.create({ username: username, email: email, password: "" });
        await databaseUser.setPermissions(databasePermissions);
        databaseUser.permissions = await databaseUser.getPermissions();

        const token = await this.tokenService.generateHexUserToken(databaseUser.id, UserTokenType.ADMIN_REGISTRATION_TOKEN, ENV.ACCOUNT_ACTIVATION_ADMIN_EXPIRY);
        await this.emailService.sendHTMLTemplateEmail(
            databaseUser.email,
            "Abschluss deiner Registrierung",
            getCompleteAdminRegistrationEmailTemplate(ENV.FRONTEND_NAME, databaseUser.username, `${ENV.FRONTEND_URL}password-reset?token=${token}`, formatDate(parseTimeOffsetToDate(ENV.ACCOUNT_ACTIVATION_ADMIN_EXPIRY)))
        );

        SocketService.getInstance().emitToRoom("listen:users:watchList", "users:create", this.userService.generateJSONUserResponse(databaseUser));
        return jsonResponse;
    }
}
