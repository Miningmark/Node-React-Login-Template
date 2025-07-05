import { EmailService } from "@/services/email.service.js";

export class UserService {
    private emailService: EmailService;

    constructor() {
        this.emailService = new EmailService();
    }

    async updatePassword(currentPassword: string, newPassword: string) {
        let jsonResponse: Record<string, any> = { message: "Passwort erfolgreich geändert bitte neu anmelden" };

        return jsonResponse;
    }
}
