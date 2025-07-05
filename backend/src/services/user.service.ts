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

    async updatePassword(userId: number, currentPassword: string, newPassword: string, res: Response) {
        let jsonResponse: Record<string, any> = { message: "Passwort erfolgreich geändert bitte neu anmelden" };

        const databaseUser = await User.findOne({ where: { id: userId } });
        if (databaseUser === null) throw new ValidationError("Kein Benutzer mit diesem Benutzernamen gefunden");

        const passwordMatching = await bcrypt.compare(currentPassword, databaseUser.password);
        if (passwordMatching === false) throw new ValidationError("Passwörter stimmt nicht überein");
        if (currentPassword === newPassword) throw new ValidationError("Dein Passwort kann nicht mit deinem alten Passwort gleich sein");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        databaseUser.password = hashedPassword;
        await databaseUser.save();

        this.tokenService.removeJWTs(databaseUser);
        this.tokenService.clearRefreshTokenCookie(res);

        return jsonResponse;
    }
}
