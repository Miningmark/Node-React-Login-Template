import { ENV } from "@/config/env.js";
import LastLogin from "@/models/lastLogin.model.js";
import User from "@/models/user.model.js";
import { UserTokenType } from "@/models/userToken.model.js";
import { EmailService } from "@/services/email.service.js";
import { TokenService } from "@/services/token.service.js";
import { UserService } from "@/services/user.service.js";
import { SocketService } from "@/socketIO/socket.service.js";
import { getAccountLockedEmailTemplate, getSuspiciousLoginEmailTemplate } from "@/templates/email/auth.template.email.js";
import { formatDate, getIpAddress as getIpv4Address, IPV4_REGEX } from "@/utils/misc.util.js";
import { CreationAttributes } from "@sequelize/core";
import { Request } from "express";

export class UserActivityService {
    private emailService: EmailService;
    private tokenService: TokenService;
    private userService: UserService;

    constructor() {
        this.emailService = EmailService.getInstance();
        this.tokenService = new TokenService();
        this.userService = new UserService();
    }

    async checkHasLocationChanged(databaseUser: User) {
        const userLastLogins = await databaseUser.getLastLogins({ limit: 2, order: [["loginTime", "DESC"]] });

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

    async checkUserLastLogins(databaseUser: User) {
        let unsuccefullyLogins = 0;
        const userLastLogins = await databaseUser.getLastLogins({ limit: 5, order: [["id", "DESC"]] });

        userLastLogins.forEach((userLastLogin) => {
            if (!userLastLogin.successfully) unsuccefullyLogins++;
        });

        if (unsuccefullyLogins === 5) {
            databaseUser.isActive = false;
            await databaseUser.save();

            SocketService.getInstance().emitToRoom("listen:userManagement:users:watchList", "userManagement:users:update", this.userService.generateJSONUserResponse(databaseUser.id, undefined, undefined, false));

            const token = await this.tokenService.generateHexUserToken(databaseUser.id, UserTokenType.ACCOUNT_REACTIVATION_TOKEN, null);

            await this.emailService.sendHTMLTemplateEmail(
                databaseUser.email,
                "Konto vorübergehend deaktiviert",
                getAccountLockedEmailTemplate(ENV.FRONTEND_NAME, databaseUser.username, `${ENV.FRONTEND_URL}password-reset?token=${token}`)
            );

            return true;
        }

        return false;
    }

    async addUserLastLogin(userId: number, req: Request, successfully: boolean) {
        const ipv4Address = getIpv4Address(req);
        const userAgent = req.headers["user-agent"] || "Ungültiger UserAgent";

        let userLastLogin: CreationAttributes<LastLogin> = {
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
        await LastLogin.create(userLastLogin);
    }
}
