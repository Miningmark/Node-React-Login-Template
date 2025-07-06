import { ENV } from "@/config/env.js";
import { ForbiddenError, ValidationError } from "@/errors/errorClasses.js";
import Permission from "@/models/permission.model.js";
import User from "@/models/user.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { EmailService } from "@/services/email.service.js";
import { TokenService } from "@/services/token.service.js";
import { getCompleteAdminRegistrationEmailTemplate } from "@/templates/email/userManagement.template.email.js";
import { formatDate, parseTimeOffsetToDate } from "@/utils/misc.util.js";
import { Op } from "@sequelize/core";

export class UserManagementService {
    private emailService: EmailService;
    private tokenService: TokenService;

    constructor() {
        this.emailService = EmailService.getInstance();
        this.tokenService = new TokenService();
    }

    async getUsers(limit: number | undefined, offset: number | undefined) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Benutzer zurück gegeben" };

        const databaseUsers = await User.findAll({ include: { model: Permission }, ...(limit && offset ? { limit: limit, offset: offset } : {}) });

        jsonResponse.users = databaseUsers.map((databaseUser) => {
            return {
                id: databaseUser.id,
                username: databaseUser.username,
                email: databaseUser.email,
                isActive: databaseUser.isActive,
                isDisabled: databaseUser.isDisabled,
                permissions: databaseUser.permissions.map((databasePermission) => ({
                    id: databasePermission.id,
                    name: databasePermission.name
                }))
            };
        });

        return jsonResponse;
    }

    async getAllPermissions() {
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

    async updateUserPermissions(userId: number, permissionIds: number[]) {
        //TODO: SocketIO inform all who seeing users over change
        let jsonResponse: Record<string, any> = { message: "Rechte erfolgreich bearbeitet" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ForbiddenError("SuperAdmin kann nicht bearbeitet werden");

        const databasePermissions = await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
        await databaseUser.setPermissions(databasePermissions);

        return jsonResponse;
    }

    async updateUser(
        userId: number,
        username: string | undefined,
        email: string | undefined,
        isActive: boolean | undefined,
        isDisabled: boolean | undefined,
        permissionIds: number[] | undefined
    ) {
        //TODO: SocketIO inform all who seeing users over change
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich bearbeitet" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        const databaseUserTokens = await UserToken.findAll({
            where: { type: { [Op.or]: [UserTokenType.USER_REGISTRATION_TOKEN, UserTokenType.ADMIN_REGISTRATION_TOKEN] }, expiresAt: { [Op.gte]: new Date(Date.now()) } }
        });

        if (databaseUser.username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ForbiddenError("SuperAdmin kann nicht bearbeitet werden");

        const onlyPermissionIds = username === undefined && email === undefined && isActive === undefined && isDisabled === undefined;
        if (!onlyPermissionIds && databaseUser.isActive === false && databaseUserTokens.length !== 0)
            throw new ForbiddenError("Es können nur Rechte editiert solange der Registrierungsprozess nicht abgeschlossen ist");

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

        return jsonResponse;
    }

    async addUser(username: string, email: string, permissionIds: number[]) {
        //TODO: SocketIO inform all who seeing users over change
        let jsonResponse: Record<string, any> = { message: "Benutzer wurde erfolgreich registriert" };

        const databasePermissions = await Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });

        const databaseUser = await User.create({ username: username, email: email, password: "" });
        await databaseUser.setPermissions(databasePermissions);

        const token = await this.tokenService.generateHexUserToken(databaseUser.id, UserTokenType.ADMIN_REGISTRATION_TOKEN, ENV.ACCOUNT_ACTIVATION_ADMIN_EXPIRY);
        await this.emailService.sendHTMLTemplateEmail(
            databaseUser.email,
            "Abschluss deiner Registrierung",
            getCompleteAdminRegistrationEmailTemplate(
                ENV.FRONTEND_NAME,
                databaseUser.username,
                `${ENV.FRONTEND_URL}password-reset?token=${token}`,
                formatDate(parseTimeOffsetToDate(ENV.ACCOUNT_ACTIVATION_ADMIN_EXPIRY))
            )
        );

        return jsonResponse;
    }
}
