import { z } from "zod/v4";
import { authorizationBaseValidation, emailBaseValidation, passwordBaseValidation, usernameBaseValidation } from "@/validators/base.validator.js";

export const registerSchema = z.object({
    body: z.object({
        username: usernameBaseValidation,
        email: emailBaseValidation,
        password: passwordBaseValidation
    })
});

export const loginSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string()
    })
});

export const logoutSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    })
});

export const accountActivationSchema = z.object({
    body: z.object({
        token: z.string().length(64)
    })
});

export const refreshTokenSchema = z.object({
    headers: z.object({
        cookie: z
            .string()
            .min(1, "Kein RefreshToken vorhanden")
            .refine((val) => val.includes("refreshToken="), { message: "Kein RefreshToken vorhanden" })
    })
});

export const requestPasswordResetSchema = z.object({
    body: z.object({
        usernameOrEmail: z
            .string()
            .refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Passwortänderungen für den SuperAdmin sind nicht möglich. Bitte direkt am Server vornehmen!")
    })
});

export const handlePasswordRecoverySchema = z.object({
    body: z.object({
        token: z.string().length(64),
        password: passwordBaseValidation
    })
});
