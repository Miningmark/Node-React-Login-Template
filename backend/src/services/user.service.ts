import { ConflictError } from "@/errors/conflictError.js";
import { ValidationError } from "@/errors/validationError.js";
import User from "@/models/user.model.js";
import { TokenService } from "@/services/token.service.js";
import bcrypt from "bcrypt";
import { Response } from "express";

export class UserService {
    private tokenService: TokenService;

    constructor() {
        this.tokenService = new TokenService();
    }

    async updateUsername(userId: number, newUsername: string, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Benutzername erfolgreich geändert, bitte neu anmelden" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        if (databaseUser.username.toLowerCase() === newUsername.toLowerCase()) throw new ConflictError("Die Benutzername ist der selbe wie momentan verwendet");

        const databaseUserNewUsername = await User.findOne({ where: { username: newUsername } });
        if (databaseUserNewUsername !== null) throw new ConflictError("Benutzername bereits vergeben");

        databaseUser.username = newUsername;
        await databaseUser.save();

        this.tokenService.removeJWTs(databaseUser);
        this.tokenService.clearRefreshTokenCookie(res);

        return jsonResponse;
    }

    async updateEmail(userId: number, newEmail: string, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Email erfolgreich geändert" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit dieser Benutzernamen gefunden");

        if (databaseUser.email.toLowerCase() === newEmail.toLowerCase()) throw new ConflictError("Die Email ist die selbe wie momentan verwendet");

        const databaseUserNewEmail = await User.findOne({ where: { email: newEmail } });
        if (databaseUserNewEmail !== null) throw new ConflictError("Email bereits vergeben");

        databaseUser.email = newEmail;
        await databaseUser.save();

        return jsonResponse;
    }

    async updatePassword(userId: number, currentPassword: string, newPassword: string, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Passwort erfolgreich geändert, bitte neu anmelden" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        const passwordMatching = await bcrypt.compare(currentPassword, databaseUser.password);
        if (passwordMatching === false) throw new ValidationError("Passwörter stimmt nicht überein");
        if (currentPassword === newPassword) throw new ConflictError("Dein Passwort kann nicht mit deinem alten Passwort gleich sein");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        databaseUser.password = hashedPassword;
        await databaseUser.save();

        this.tokenService.removeJWTs(databaseUser);
        this.tokenService.clearRefreshTokenCookie(res);

        return jsonResponse;
    }
}
