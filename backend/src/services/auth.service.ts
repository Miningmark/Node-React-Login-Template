import { ENV } from "@/config/env.js";
import { ControllerResponse } from "@/controllers/base.controller";
import { ForbiddenError, InternalServerError, UnauthorizedError, ValidationError } from "@/errors/errorClasses.js";
import ServerSettings, { ServerSettingKey } from "@/models/serverSettings.model.js";
import User from "@/models/user.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { ADMIN_PAGE_MAINTENANCE_MODE_WRITE } from "@/routeGroups/adminPage.routeGroup.js";
import { EmailService } from "@/services/email.service.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { TokenService } from "@/services/token.service.js";
import { UserService } from "@/services/user.service.js";
import { UserActivityService } from "@/services/userActivity.service.js";
import { SocketService } from "@/socketIO/socket.service.js";
import { getCompleteUserRegistrationEmailTemplate, getPasswordResetEmailTemplate } from "@/templates/email/auth.template.email.js";
import { capitalizeFirst, formatDate, parseTimeOffsetToDate } from "@/utils/misc.util.js";
import { Op } from "@sequelize/core";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import ms from "ms";

export class AuthService {
    private emailService: EmailService;
    private tokenService: TokenService;
    private userService: UserService;
    private userActivityService: UserActivityService;
    private routeGroupService: RouteGroupService;

    constructor() {
        this.emailService = EmailService.getInstance();
        this.tokenService = new TokenService();
        this.userService = new UserService();
        this.userActivityService = new UserActivityService();
        this.routeGroupService = new RouteGroupService();
    }

    async register(username: string, email: string, password: string): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzer wurde erfolgreich registriert" };

        let databaseUser = await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } });
        if (databaseUser !== null) throw new ValidationError("Benutzername oder Email bereits vergeben");

        const hashedPassword = await bcrypt.hash(password, 10);
        databaseUser = await User.create({ username: username, email: email, password: hashedPassword });

        const token = await this.tokenService.generateHexUserToken(databaseUser.id, UserTokenType.USER_REGISTRATION_TOKEN, ENV.ACCOUNT_ACTIVATION_USER_EXPIRY);
        await this.emailService.sendHTMLTemplateEmail(
            databaseUser.email,
            "Abschluss deiner Registrierung",
            getCompleteUserRegistrationEmailTemplate(ENV.FRONTEND_NAME, databaseUser.username, `${ENV.FRONTEND_URL}account-activation?token=${token}`, formatDate(parseTimeOffsetToDate(ENV.ACCOUNT_ACTIVATION_USER_EXPIRY)))
        );

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", this.userService.generateJSONResponseWithModel(databaseUser));
        return { type: "json", jsonResponse: jsonResponse, statusCode: 201 };
    }

    async login(username: string, password: string, req: Request, res: Response): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich angemeldet" };

        const databaseUser = await User.findOne({ where: { username: username } });
        if (databaseUser === null) throw new ValidationError("Benutzername nicht vorhanden");

        const routeGroupsArray = await this.routeGroupService.generateUserRouteGroupArray(databaseUser);
        const databaseServerSetting = await ServerSettings.findOne({ where: { key: ServerSettingKey.MAINTENANCE_MODE } });
        if (databaseServerSetting === null) throw new InternalServerError("Server Setting nicht vorhanden");

        if (databaseServerSetting.value === true) {
            console.log(routeGroupsArray);
            if (!routeGroupsArray.includes(ADMIN_PAGE_MAINTENANCE_MODE_WRITE.groupName)) {
                throw new ForbiddenError("Server befindet sich momentan im Wartungsmodus bitte später nochmal versuchen.");
            }
        }
        if (databaseUser.isDisabled === true) throw new ForbiddenError("Benutzer ist gesperrt");
        if (databaseUser.isActive === false) throw new ForbiddenError("Benutzer ist noch nicht aktiviert oder vorübergehen deaktiviert");

        const isPasswordMatching = await bcrypt.compare(password, databaseUser.password);
        if (isPasswordMatching === false) {
            await this.userActivityService.addUserLastLogin(databaseUser.id, req, false);

            const isAccountLocked = await this.userActivityService.checkUserLastLogins(databaseUser);
            if (isAccountLocked) throw new ForbiddenError("Benutzer wurde wegen zuvieler fehlerhafter Login Versuchen vorübergehen deaktiviert");

            await this.userActivityService.checkHasLocationChanged(databaseUser);
            throw new UnauthorizedError("Passwort nicht korrekt");
        }

        await this.tokenService.removeJWTs(databaseUser);

        const resultJWTs = await this.tokenService.generateJWTs(databaseUser, routeGroupsArray);

        this.tokenService.setRefreshTokenCookie(res, resultJWTs.refreshToken);

        jsonResponse.accessToken = resultJWTs.accessToken;
        jsonResponse.userId = databaseUser.id;
        jsonResponse.username = capitalizeFirst(databaseUser.username);
        jsonResponse.routeGroups = routeGroupsArray;

        await this.userActivityService.addUserLastLogin(databaseUser.id, req, true);
        await this.userActivityService.checkHasLocationChanged(databaseUser);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async logout(userId: number, res: Response): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich abgemeldet" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        await this.tokenService.removeJWTs(databaseUser);
        this.tokenService.clearRefreshTokenCookie(res);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async accountActivation(token: string): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich freigeschaltet" };

        const databaseUserToken = await UserToken.findOne({ where: { type: UserTokenType.USER_REGISTRATION_TOKEN, token: token }, include: { model: User } });
        if (databaseUserToken === null || databaseUserToken.user === undefined) throw new ValidationError("Token nicht vorhanden oder ungültig");

        if (databaseUserToken.expiresAt !== null && new Date(Date.now()) > databaseUserToken.expiresAt) {
            await databaseUserToken.user.destroy();
            throw new ValidationError("Token abgelaufen, bitte neu registrieren");
        }

        databaseUserToken.user.isActive = true;

        await databaseUserToken.user.save();
        await databaseUserToken.destroy();

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", this.userService.generateJSONResponse(databaseUserToken.user.id, undefined, undefined, true));
        return { type: "json", jsonResponse: jsonResponse };
    }

    async refreshAccessToken(token: string, res: Response): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Token erfolgreich erneuert" };

        const refreshUserToken = await UserToken.findOne({ where: { type: UserTokenType.REFRESH_TOKEN, token: token }, include: { model: User } });

        if (refreshUserToken === null || refreshUserToken.user === undefined) {
            this.tokenService.clearRefreshTokenCookie(res);
            throw new UnauthorizedError("Token nicht vorhanden, bitte neuanmelden");
        }

        const accessUserToken = await UserToken.findOne({ where: { type: UserTokenType.ACCESS_TOKEN, userId: refreshUserToken.user.id } });
        if (accessUserToken !== null) await accessUserToken.destroy();

        try {
            const decoded = jsonwebtoken.verify(refreshUserToken.token, ENV.REFRESH_TOKEN_SECRET);
            if (decoded === undefined || typeof decoded === "string" || decoded.userId !== refreshUserToken.user.id) {
                await refreshUserToken.destroy();
                throw new Error();
            }
        } catch (error) {
            await refreshUserToken.destroy();
            throw new ValidationError("Token konnte nicht verifiziert werden, bitte neuanmelden");
        }

        const routeGroupsArray = await this.routeGroupService.generateUserRouteGroupArray(refreshUserToken.user);
        const accessToken = await this.tokenService.generateJWT(refreshUserToken.user, UserTokenType.ACCESS_TOKEN, routeGroupsArray, ENV.ACCESS_TOKEN_SECRET, ENV.ACCESS_TOKEN_EXPIRY as ms.StringValue);

        jsonResponse.accessToken = accessToken;

        SocketService.getInstance()
            .getIO()
            .sockets.sockets.forEach((socket) => {
                if (socket.userId === refreshUserToken.user!.id) {
                    socket.routeGroups = routeGroupsArray;
                }
            });

        return { type: "json", jsonResponse: jsonResponse };
    }

    async requestPasswordReset(usernameOrEmail: string): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Email zum Passwort ändern erfolgreich versandt" };

        const databaseUser = await User.findOne({ where: { [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }] } });

        if (databaseUser === null) throw new ValidationError("Es existiert kein Benutzer mit diesem Benutzername oder Email");
        if (databaseUser.isDisabled) throw new ForbiddenError("Benutzer gesperrt, zurücksetzten des Passworts nicht möglich");

        const databaseUserToken = await UserToken.findOne({ where: { userId: databaseUser.id, type: UserTokenType.PASSWORD_RESET_TOKEN } });
        if (databaseUserToken !== null) await databaseUserToken.destroy();

        const token = await this.tokenService.generateHexUserToken(databaseUser.id, UserTokenType.PASSWORD_RESET_TOKEN, ENV.PASSWORD_RESET_EXPIRY);
        await this.emailService.sendHTMLTemplateEmail(
            databaseUser.email,
            "Passwort vergessen?",
            getPasswordResetEmailTemplate(ENV.FRONTEND_NAME, databaseUser.username, `${ENV.FRONTEND_URL}password-reset?token=${token}`, formatDate(parseTimeOffsetToDate(ENV.PASSWORD_RESET_EXPIRY)))
        );

        return { type: "json", jsonResponse: jsonResponse };
    }

    async handlePasswordRecovery(token: string, password: string): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Passwort erfolgreich gespeichert" };

        const databaseUserToken = await UserToken.findOne({
            where: { token: token, type: { [Op.or]: [UserTokenType.ADMIN_REGISTRATION_TOKEN, UserTokenType.PASSWORD_RESET_TOKEN, UserTokenType.ACCOUNT_REACTIVATION_TOKEN] } },
            include: { model: User }
        });
        if (databaseUserToken === null || databaseUserToken.user === undefined) throw new ValidationError("Token nicht vorhanden oder abgelaufen");

        if (databaseUserToken.expiresAt !== null && new Date(Date.now()) > databaseUserToken.expiresAt) {
            if (databaseUserToken.type === UserTokenType.ADMIN_REGISTRATION_TOKEN) {
                await databaseUserToken.destroy();
                throw new UnauthorizedError("Zeit zum abschließen der Registrierung leider abgelaufen bitte selbst registrieren oder einen Admin darum bitten");
            }

            await databaseUserToken.destroy();
            await this.requestPasswordReset(databaseUserToken.user.username);
            throw new ValidationError("Zeit zum zurücksetzten leider schon abgelaufen, es wurde Ihnen eine neue Email gesendet");
        }

        const isPasswordMatching = await bcrypt.compare(password, databaseUserToken.user.password);
        if (isPasswordMatching === true) throw new ValidationError("Ihr neues Passwort kann nicht mit ihrem alten Passwort gleich sein");

        const hashedPassword = await bcrypt.hash(password, 10);

        databaseUserToken.user.isActive = true;
        databaseUserToken.user.password = hashedPassword;

        await databaseUserToken.user.save();
        await databaseUserToken.destroy();

        SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", this.userService.generateJSONResponse(databaseUserToken.user.id, undefined, undefined, true));
        return { type: "json", jsonResponse: jsonResponse };
    }
}
