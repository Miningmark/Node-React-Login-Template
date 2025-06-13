import nodemailer from "nodemailer";

const DEBUG = true;

export async function sendMail(to, subject, text) {
    if (!DEBUG) {
        const transporter = nodemailer.createTransport({
            host: "mail.your-server.de",
            port: 587, // oder 465 für SSL
            secure: false, // true für 465, false für andere Ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
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
