import { z } from "zod/v4";

import {
    emailValidation,
    passwordValidation,
    usernameValidation
} from "@/validators/base.validator.js";

export type RegisterValidation = z.infer<typeof registerSchema>;
export const registerSchema = z.object({
    body: z.object({
        username: usernameValidation,
        email: emailValidation,
        password: passwordValidation
    })
});

export type LoginValidation = z.infer<typeof loginSchema>;
export const loginSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string()
    })
});

export type AccountActivationValidation = z.infer<typeof accountActivationSchema>;
export const accountActivationSchema = z.object({
    body: z.object({
        token: z.string().length(64)
    })
});

export type RefreshTokenValidation = z.infer<typeof refreshTokenSchema>;
export const refreshTokenSchema = z.object({
    cookies: z.object({
        refreshToken: z.string().min(1, "Kein RefreshToken vorhanden")
    })
});

export type RequestPasswordResetValidation = z.infer<typeof requestPasswordResetSchema>;
export const requestPasswordResetSchema = z.object({
    body: z.object({
        usernameOrEmail: z
            .string()
            .refine(
                (val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()),
                "Passwortänderungen für den SuperAdmin sind nicht möglich. Bitte direkt am Server vornehmen!"
            )
    })
});

export type HandlePasswordRecoveryValidation = z.infer<typeof handlePasswordRecoverySchema>;
export const handlePasswordRecoverySchema = z.object({
    body: z.object({
        token: z.string().length(64),
        password: passwordValidation
    })
});
