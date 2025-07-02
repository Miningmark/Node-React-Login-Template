import bcrypt from "bcrypt";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import ms from "ms";
import { ValidationError } from "@/errors/validationError";
import User from "@/models/user.model";
import { Op } from "sequelize";
import UserToken, { UserTokenType } from "@/models/userToken.model";
import { formatDate, getIpAddress as getIpv4Address, IPV4_REGEX, parseTimeOffsetToDate } from "@/utils/misc.util";
import { ENV } from "@/config/env";
import { EmailService } from "./email.service";
import { getAccountLockedEmailTemplate, getCompleteRegistrationEmailTemplate, getSuspiciousLoginEmailTemplate } from "@/template/email/auth.template.email";
import { ForbiddenError } from "@/errors/forbiddenError";
import { Request, Response } from "express";
import UserLastLogin, { UserLastLoginAttributes } from "@/models/userLastLogin.model";
import { UnauthorizedError } from "@/errors/unauthorizedError";
import RouteGroup from "@/models/routeGroup.model";

export class AuthService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    async register(username: string, email: string, password: string) {
        const jsonResponse: Record<string, any> = { message: "Benutzer wurde erfolgreich registriert", statusCode: 201 };

        let databaseUser = await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } });
        if (databaseUser !== null) throw new ValidationError("Benutzername oder Email bereits vergeben");

        const hashedPassword = await bcrypt.hash(password, 10);
        databaseUser = await User.create({ username: username, email: email, password: hashedPassword });

        const token = await this.generateHexUserToken(databaseUser.id, UserTokenType.USER_REGISTRATION_TOKEN, ENV.ACCOUNT_ACTIVATION_USER_EXPIRY);
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
            await this.addUserLastLogin(databaseUser.id, req, false);

            const isAccountLocked = await this.checkUserLastLogins(databaseUser);
            if (isAccountLocked) throw new ForbiddenError("Benutzer wurde wegen zuvieler fehlerhafter Login Versuchen vorübergehen deaktiviert");

            await this.checkHasLocationChanged(databaseUser);
            throw new UnauthorizedError("Passwort nicht korrekt");
        }

        await this.removeJWTs(databaseUser);

        const routeGroupsArray = await this.generateRouteGroupArray(databaseUser);
        const resultJWTs = await this.generateJWTs(databaseUser, routeGroupsArray);

        await this.setRefreshTokenCookie(res, resultJWTs.refreshToken);

        jsonResponse.accessToken = resultJWTs.accessToken;
        jsonResponse.username = databaseUser.username;
        jsonResponse.username = routeGroupsArray;

        await this.addUserLastLogin(databaseUser.id, req, true);
        await this.checkHasLocationChanged(databaseUser);

        return jsonResponse;
    }

    private async setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            ...(ENV.NODE_ENV === "production" ? { secure: true } : {}),
            maxAge: ms(ENV.REFRESH_TOKEN_EXPIRY as ms.StringValue)
        });
    }

    private async generateJWTs(databaseUser: User, routeGroupsArray: string[]) {
        const accessToken = await this.generateJWT(
            databaseUser,
            UserTokenType.ACCESS_TOKEN,
            routeGroupsArray,
            ENV.ACCESS_TOKEN_SECRET,
            ENV.ACCESS_TOKEN_EXPIRY as ms.StringValue
        );
        const refreshToken = await this.generateJWT(
            databaseUser,
            UserTokenType.REFRESH_TOKEN,
            routeGroupsArray,
            ENV.REFRESH_TOKEN_SECRET,
            ENV.REFRESH_TOKEN_EXPIRY as ms.StringValue
        );

        return { accessToken: accessToken, refreshToken: refreshToken };
    }

    private async generateJWT(databaseUser: User, tokenType: UserTokenType, routeGroupsArray: string[], secret: string, expiresIn: ms.StringValue) {
        const token = jsonwebtoken.sign(
            {
                userId: databaseUser.id,
                username: databaseUser.username,
                routeGroups: routeGroupsArray
            },
            secret,
            { expiresIn: expiresIn }
        );

        await UserToken.create({ userId: databaseUser.id, token: token, type: tokenType, expiresAt: new Date(Date.now() + ms(expiresIn)) });

        return token;
    }

    private async generateRouteGroupArray(databaseUser: User): Promise<string[]> {
        let routeGroupsArray: string[] = [];

        const userPermissions = await databaseUser.$get("permissions", { include: [{ model: RouteGroup }] });
        if (userPermissions === null) return routeGroupsArray;

        userPermissions.map((userPermission) => {
            userPermission.routeGroups.map((routeGroup) => {
                routeGroupsArray.push(routeGroup.name);
            });
        });

        return routeGroupsArray;
    }

    private async removeJWTs(databaseUser: User) {
        const userTokens = await databaseUser.$get("userTokens", {
            where: { [Op.or]: [{ type: UserTokenType.ACCESS_TOKEN }, { type: UserTokenType.REFRESH_TOKEN }] }
        });

        await Promise.all(
            userTokens.map(async (userToken) => {
                await userToken.destroy();
            })
        );
    }

    private async checkHasLocationChanged(databaseUser: User) {
        const userLastLogins = await databaseUser.$get("userLastLogins", {
            limit: 2,
            order: [["loginTime", "DESC"]]
        });

        if (userLastLogins.length < 2) return;

        const recentLogin = userLastLogins[0];
        const lastLogin = userLastLogins[1];

        if (recentLogin.country !== lastLogin.country || recentLogin.regionName !== lastLogin.regionName) {
            await this.emailService.sendHTMLTemplateEmail(
                databaseUser.email,
                "Verdächtiger Login-Versuch",
                getSuspiciousLoginEmailTemplate(
                    ENV.FRONTEND_NAME,
                    databaseUser.username,
                    formatDate(recentLogin.loginTime),
                    recentLogin.ipv4Address,
                    recentLogin.country,
                    recentLogin.regionName,
                    `${ENV.FRONTEND_URL}login?key=forgotten`
                )
            );
        }
    }

    private async checkUserLastLogins(databaseUser: User) {
        let unsuccefullyLogins = 0;
        const userLastLogins = await databaseUser.$get("userLastLogins", {
            limit: 5,
            order: [["loginTime", "DESC"]]
        });

        userLastLogins.forEach((userLastLogin) => {
            if (!userLastLogin.successfully) unsuccefullyLogins++;
        });

        if (unsuccefullyLogins === 5) {
            databaseUser.isActive = false;
            await databaseUser.save();

            const userToken = await this.generateHexUserToken(databaseUser.id, UserTokenType.ACCOUNT_REACTIVATION_TOKEN, null);

            await this.emailService.sendHTMLTemplateEmail(
                databaseUser.email,
                "Konto vorübergehend deaktiviert",
                getAccountLockedEmailTemplate(ENV.FRONTEND_NAME, databaseUser.username, `${ENV.FRONTEND_URL}password-reset?token=${userToken}`)
            );

            return true;
        }

        return false;
    }

    private async addUserLastLogin(userId: number, req: Request, successfully: boolean) {
        const ipv4Address = getIpv4Address(req);
        const userAgent = req.headers["user-agent"] || "Ungültiger UserAgent";

        let userLastLogin: UserLastLoginAttributes = {
            userId: userId,
            userAgent: userAgent,
            loginTime: new Date(Date.now()),
            successfully: successfully,
            ipv4Address: "",
            country: "",
            regionName: ""
        };

        if (!ipv4Address || !IPV4_REGEX.test(ipv4Address)) {
            userLastLogin.ipv4Address = `Ungültig: ${ipv4Address}`;
            userLastLogin.country = "Ungültige IP Adresse";
            userLastLogin.regionName = "Ungültige IP Adresse";
        } else {
            userLastLogin.ipv4Address = ipv4Address;
            const ipLookupResponse = await fetch(`http://ip-api.com/json/${ipv4Address}`);
            const ipLookupData = await ipLookupResponse.json();

            if (ipLookupData?.status === "success") {
                userLastLogin.country = ipLookupData.country;
                userLastLogin.regionName = ipLookupData.regionName;
            } else {
                userLastLogin.country = "IP Lookup nicht erfolgreich";
                userLastLogin.regionName = "IP Lookup nicht erfolgreich";
            }
        }
        await UserLastLogin.create(userLastLogin);
    }

    private async generateHexUserToken(userId: number, type: UserTokenType, expiresIn: string | null) {
        const token = crypto.randomBytes(32).toString("hex");
        let expiresAt = null;

        if (expiresIn !== null) expiresAt = parseTimeOffsetToDate(expiresIn);

        await UserToken.create({ userId: userId, token: token, type: type, expiresAt: expiresAt });

        return token;
    }
}
