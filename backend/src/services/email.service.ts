import { ENV } from "@/config/env.js";
import { databaseLogger } from "@/config/logger.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import nodemailer from "nodemailer";
import { singleton } from "tsyringe";

@singleton()
export class EmailService {
    private transporter!: nodemailer.Transporter;
    private readonly fromAddress: string;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: ENV.SMTP_HOST,
            port: ENV.SMTP_PORT,
            secure: ENV.SMTP_PORT === 465 ? true : false,
            auth: {
                user: ENV.SMTP_USER,
                pass: ENV.SMTP_PASSWORD
            }
        });

        this.fromAddress = ENV.SMTP_USER;

        this.verifyConnection();
    }

    private async verifyConnection() {
        try {
            await this.transporter.verify();
            await databaseLogger(ServerLogTypes.INFO, "EmailService verbunden", { source: "EmailService" });
        } catch (error) {
            await databaseLogger(ServerLogTypes.ERROR, "EmailService konnte sich nicht mit dem Email Server verbinden", {
                error: error instanceof Error ? error : undefined
            });
        }
    }

    async sendHTMLTemplateEmail(to: string, subject: string, htmlTemplate: string) {
        try {
            if (ENV.NODE_ENV === "production") {
                const info = await this.transporter.sendMail({
                    from: this.fromAddress,
                    to: to,
                    subject: subject,
                    html: htmlTemplate
                });
                await databaseLogger(ServerLogTypes.INFO, `Email erfolgreich versendet ID: ${info.messageId}`, { source: "EmailService" });
            }
        } catch (error) {
            await databaseLogger(ServerLogTypes.ERROR, "Error", { error: error instanceof Error ? error : undefined });
        }
    }
}
