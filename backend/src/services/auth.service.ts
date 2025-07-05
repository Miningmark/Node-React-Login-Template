import { ENV } from "@/config/env.js";
import { ForbiddenError } from "@/errors/forbiddenError.js";
import { UnauthorizedError } from "@/errors/unauthorizedError.js";
import { ValidationError } from "@/errors/validationError.js";
import User from "@/models/user.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { EmailService } from "@/services/email.service.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";
import { TokenService } from "@/services/token.service.js";
import { UserActivityService } from "@/services/userActivity.service.js";
import { getCompleteRegistrationEmailTemplate, getPasswordResetEmailTemplate } from "@/templates/email/auth.template.email.js";
import { capitalizeFirst, formatDate, parseTimeOffsetToDate } from "@/utils/misc.util.js";
import { Op } from "@sequelize/core";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import ms from "ms";

export class AuthService {
    private emailService: EmailService;
    private tokenService: TokenService;
    private userActivityService: UserActivityService;
    private routeGroupService: RouteGroupService;

    constructor() {
        this.emailService = EmailService.getInstance();
        this.tokenService = new TokenService();
        this.userActivityService = new UserActivityService();
        this.routeGroupService = new RouteGroupService();
    }

    async register(username: string, email: string, password: string) {
        let jsonResponse: Record<string, any> = { message: "Benutzer wurde erfolgreich registriert", statusCode: 201 };

        let databaseUser = await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } });
        if (databaseUser !== null) throw new ValidationError("Benutzername oder Email bereits vergeben");

        const hashedPassword = await bcrypt.hash(password, 10);
        databaseUser = await User.create({ username: username, email: email, password: hashedPassword });

        const token = await this.tokenService.generateHexUserToken(databaseUser.id, UserTokenType.USER_REGISTRATION_TOKEN, ENV.ACCOUNT_ACTIVATION_USER_EXPIRY);
        await this.emailService.sendHTMLTemplateEmail(
            databaseUser.email,
            "Abschluss deiner Registrierung",
            getCompleteRegistrationEmailTemplate(
                ENV.FRONTEND_NAME,
                databaseUser.username,
                `${ENV.FRONTEND_URL}account-activation?token=${token}`,
                formatDate(parseTimeOffsetToDate(ENV.ACCOUNT_ACTIVATION_USER_EXPIRY))
            )
        );

        return jsonResponse;
    }

    async login(username: string, password: string, req: Request, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich angemeldet" };

        const databaseUser = await User.findOne({ where: { username: username } });
        if (databaseUser === null) throw new ValidationError("Benutzername nicht vorhanden");
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

        const routeGroupsArray = await this.routeGroupService.generateRouteGroupArray(databaseUser);
        const resultJWTs = await this.tokenService.generateJWTs(databaseUser, routeGroupsArray);

        this.tokenService.setRefreshTokenCookie(res, resultJWTs.refreshToken);

        jsonResponse.accessToken = resultJWTs.accessToken;
        jsonResponse.username = capitalizeFirst(databaseUser.username);
        jsonResponse.routeGroups = routeGroupsArray;

        await this.userActivityService.addUserLastLogin(databaseUser.id, req, true);
        await this.userActivityService.checkHasLocationChanged(databaseUser);

        return jsonResponse;
    }

    async logout(userId: number, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich abgemeldet" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        await this.tokenService.removeJWTs(databaseUser);
        this.tokenService.clearRefreshTokenCookie(res);

        return jsonResponse;
    }

    async accountActivation(token: string) {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich freigeschaltet" };

        const databaseUserToken = await UserToken.findOne({ where: { type: UserTokenType.USER_REGISTRATION_TOKEN, token: token }, include: { model: User } });
        if (databaseUserToken === null) throw new ValidationError("Token nicht vorhanden oder ungültig");

        if (databaseUserToken.expiresAt !== null && new Date(Date.now()) > databaseUserToken.expiresAt) {
            await databaseUserToken.user.destroy();
            throw new ValidationError("Token abgelaufen, bitte neu registrieren");
        }

        databaseUserToken.user.isActive = true;
        await databaseUserToken.user.save();

        await databaseUserToken.destroy();

        return jsonResponse;
    }

    async refreshAccessToken(token: string, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Token erfolgreich erneuert" };

        const refreshUserToken = await UserToken.findOne({ where: { type: UserTokenType.REFRESH_TOKEN, token: token }, include: { model: User } });

        if (refreshUserToken === null) {
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

        const routeGroupsArray = await this.routeGroupService.generateRouteGroupArray(refreshUserToken.user);
        const accessToken = await this.tokenService.generateJWT(
            refreshUserToken.user,
            UserTokenType.ACCESS_TOKEN,
            routeGroupsArray,
            ENV.ACCESS_TOKEN_SECRET,
            ENV.ACCESS_TOKEN_EXPIRY as ms.StringValue
        );

        jsonResponse.accessToken = accessToken;

        return jsonResponse;
    }

    async requestPasswordReset(usernameOrEmail: string) {
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
            getPasswordResetEmailTemplate(
                ENV.FRONTEND_NAME,
                databaseUser.username,
                `${ENV.FRONTEND_URL}password-reset?token=${token}`,
                formatDate(parseTimeOffsetToDate(ENV.PASSWORD_RESET_EXPIRY))
            )
        );

        return jsonResponse;
    }

    async handlePasswordRecovery(token: string, password: string) {
        let jsonResponse: Record<string, any> = { message: "Passwort erfolgreich gespeichert" };

        const databaseUserToken = await UserToken.findOne({
            where: { token: token, type: { [Op.or]: [UserTokenType.ADMIN_REGISTRATION_TOKEN, UserTokenType.PASSWORD_RESET_TOKEN, UserTokenType.ACCOUNT_REACTIVATION_TOKEN] } },
            include: { model: User }
        });
        if (databaseUserToken === null) throw new ValidationError("Token nicht vorhanden oder abgelaufen");

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

        databaseUserToken.user.password = hashedPassword;
        await databaseUserToken.user.save();
        await databaseUserToken.destroy();

        return jsonResponse;
    }
}
