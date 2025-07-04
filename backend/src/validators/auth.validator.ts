import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "@/utils/misc.util.js";
import { z, ZodString } from "zod/v4";

const usernameString: ZodString = z.string().min(5).max(15).regex(USERNAME_REGEX, "Benutzername entspricht nicht den Anforderungen");
const emailString: ZodString = z.string().regex(EMAIL_REGEX, "Email entspricht nicht den Anforderungen");
const passwordString: ZodString = z.string().min(8).max(24).regex(PASSWORD_REGEX, "Passwort entspricht nicht den Anforderungen");

export const registerSchema = z.object({
    body: z.object({
        username: usernameString.refine((val) => val.toLowerCase() !== "SuperAdmin".toLowerCase(), "Benutzername kann nicht SuperAdmin sein!"),
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
