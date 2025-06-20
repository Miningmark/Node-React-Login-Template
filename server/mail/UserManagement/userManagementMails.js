import { sendMail } from "../mailer.js";

export async function sendUserCreatedEmail(email, token, expiresIn) {
    await sendMail(
        email,
        "Dein neuer Account - Passwort festlegen",
        "Für dich wurde ein Benutzerkonto eingerichtet.\n" +
            "Um deinen Zugang zu aktivieren, setze bitte bis zum " +
            formatDate(new Date(Date.now() + expiresIn * 1000)) +
            " dein persönliches Passwort über folgenden Link:" +
            config.frontendURL +
            config.frontendURLPasswordResetToken +
            token
    );
}
