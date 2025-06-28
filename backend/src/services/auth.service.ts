import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ValidationError } from "@/errors/validationError";
import User from "@/models/user.model";
import { Op } from "sequelize";
import UserToken, { UserTokenType } from "@/models/userToken.model";
import { formatDate, parseTimeOffsetToDate } from "@/utils/misc.util";
import { ENV } from "@/config/env";
import { EmailService } from "./email.service";
import { getCompleteRegistrationEmailTemplate } from "@/template/email/auth.template.email";

export class AuthService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    async register(username: string, email: string, password: string) {
        let jsonResponse = { message: "Benutzer wurde erfolgreich registriert" };

        let databaseUser = await User.findOne({ where: { [Op.or]: [{ username: username }, { email: email }] } });
        if (databaseUser !== null) throw new ValidationError("Benutzername oder Email bereits vergeben");

        const hashedPassword = await bcrypt.hash(password, 10);
        databaseUser = await User.create({ username: username, email: email, password: hashedPassword });

        const token = await this.generateUUIDUserToken(databaseUser.id, UserTokenType.USER_REGISTRATION_TOKEN, ENV.ACCOUNT_ACTIVATION_USER_EXPIRY);
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

    private async generateUUIDUserToken(userId: number, type: UserTokenType, expiresIn: string) {
        const token = uuidv4().replace(/-/g, "");

        const expiresAt = parseTimeOffsetToDate(expiresIn);
        await UserToken.create({ userId: userId, token: token, type: type, expiresAt: expiresAt });

        return token;
    }
}
