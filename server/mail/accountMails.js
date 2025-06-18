import { sendMail } from "./mailer.js";

export async function sendRegistrationEmail() {
    sendMail(
        email,
        "Abschluss deiner Registrierung",
        "Unter dem nachstehenden Link hast du bis zum " +
            formatDate(expiresAt) +
            " die Möglichkeit, deine Registrierung abzuschließen: " +
            config.frontendURL +
            config.frontendURLAccountActivationToken +
            token
    );
}
