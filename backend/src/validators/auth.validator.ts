import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "@/utils/misc.util.js";
import { z, ZodString } from "zod/v4";

const usernameString: ZodString = z.string().min(5).max(15).regex(USERNAME_REGEX, "Benutzername entspricht nicht den Anforderungen");
const emailString: ZodString = z.string().regex(EMAIL_REGEX, "Email entspricht nicht den Anforderungen");
const passwordString: ZodString = z.string().min(8).max(24).regex(PASSWORD_REGEX, "Passwort entspricht nicht den Anforderungen");

export const registerSchema = z.object({
    body: z.object({
        username: usernameString.refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Benutzername kann nicht SuperAdmin enthalten!"),
        email: emailString,
        password: passwordString
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
        authorization: z
            .string()
            .min(1, "Kein AccessToken vorhanden")
            .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, "Kein AccessToken vorhanden")
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
            .refine(
                (val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()),
                "Passwortänderungen für den SuperAdmin sind nicht möglich. Bitte direkt am Server vornehmen!"
            )
    })
});
