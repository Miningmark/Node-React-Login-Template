import config from "../../config/config.js";
import { formatDate } from "../../utils/utils.js";
import { sendMail } from "../mailer.js";

export async function sendRegistrationEmail(email, token, expiresIn) {
    await sendMail(
        email,
        "Abschluss deiner Registrierung",
        "Unter dem nachstehenden Link hast du bis zum " +
            formatDate(new Date(Date.now() + expiresIn * 1000)) +
            " die Möglichkeit, deine Registrierung abzuschließen: " +
            config.frontendURL +
            config.frontendURLAccountActivationToken +
            token
    );
}

export async function sendAccountLocking(email, token) {
    await sendMail(
        email,
        "Account Sperrung",
        "Aus Sicherheitsgründen wurde dein Account nach mehreren fehlgeschlagenen Login-Versuchen vorübergehend deaktiviert. \nDu kannst ihn über den folgenden Link wieder aktivieren: " +
            config.frontendURL +
            config.frontendURLPasswordResetToken +
            token
    );
}

export async function sendSuspiciousLogin(email, recentLogin) {
    await sendMail(
        email,
        "Verdächtiger Login-Versuch auf deinem Account",
        "Wir haben einen Login-Versuch auf deinem Account festgestellt, der von einem ungewöhnlichen Standort aus erfolgt ist.\n" +
            "Details des Logins:\n" +
            "• Datum & Uhrzeit: " +
            formatDate(recentLogin.loginAt) +
            "\n" +
            "• IP-Adresse: " +
            recentLogin.ipv4Adress +
            "\n" +
            "• Land: " +
            recentLogin.country +
            "\n" +
            "• Region: " +
            recentLogin.regionName +
            "\n" +
            "Wenn du diesen Login nicht selbst durchgeführt hast, empfehlen wir dir dringend, dein Passwort sofort zu ändern und verdächtige Aktivitäten zu überprüfen.\n" +
            "Du kannst dein Passwort über folgenden Link ändern: " +
            config.frontendURL +
            config.frontendURLPasswordForgotten
    );
}

export async function passwordReset(email, token, expiresIn) {
    await sendMail(
        email,
        "Passwort vergessen?",
        "Unter dem nachstehenden Link hast du bis zum " +
            formatDate(new Date(Date.now() + expiresIn * 1000)) +
            " die Möglichkeit, dein Passwort zurückzusetzen: " +
            config.frontendURL +
            config.frontendURLPasswordResetToken +
            token
    );
}
