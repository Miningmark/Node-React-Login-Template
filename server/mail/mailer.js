import nodemailer from "nodemailer";
import config from "../config/config.js";

export async function sendMail(to, subject, text) {
    if (config.sendEmails) {
        const transporter = nodemailer.createTransport({
            host: "mail.your-server.de",
            port: 587, // oder 465 für SSL
            secure: false, // true für 465, false für andere Ports
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        try {
            await transporter.sendMail({
                from: config.emailUser,
                to: to,
                subject: subject,
                text: text
            });
        } catch (error) {
            console.error(error);
            return { message: "failed to send mail", status: 500 };
        }
    }
}
