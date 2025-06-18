import { Models } from "../controllers/modelController.js";
import { ConflictError, ValidationError } from "../errors/errorClasses.js";
import generateUUID from "./generateUUID.js";
import { EMAIL_REGEX, USERNAME_REGEX } from "./regex.js";

export async function validateEmail(email) {
    if (!EMAIL_REGEX.test(email)) throw new ValidationError("Email entspricht nicht den Anforderungen");

    const duplicateEmail = await Models.User.findOne({ where: { email: email } });
    if (duplicateEmail) throw new ConflictError("Email bereits vergeben!");
}

export async function validateUsername(username) {
    if (!USERNAME_REGEX.test(username)) throw new ValidationError("Benutzername entsprechen nicht den Anforderungen");

    const duplicateUsername = await Models.User.findOne({ where: { username: username } });
    if (duplicateUsername) throw new ConflictError("Benutzername bereits vergeben!");
}

export async function validatePassword(password) {
    if (!USERNAME_REGEX.test(password)) throw new ValidationError("Passwort entsprecht nicht den Anforderungen");
}

export async function generateUserToken(transaction, userId, type, expiresIn) {
    const token = generateUUID();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await Models.UserToken.create(
        {
            userId: userId,
            token: token,
            type: type,
            expiresAt
        },
        { transaction: transaction }
    );
}
