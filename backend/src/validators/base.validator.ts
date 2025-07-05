import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "@/utils/misc.util.js";
import { z, ZodString } from "zod/v4";

export const usernameBaseValidation: ZodString = z
    .string()
    .min(5)
    .max(15)
    .regex(USERNAME_REGEX, "Benutzername entspricht nicht den Anforderungen")
    .refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Benutzername kann nicht SuperAdmin enthalten!");

export const emailBaseValidation: ZodString = z
    .string()
    .regex(EMAIL_REGEX, "Email entspricht nicht den Anforderungen")
    .refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Email kann nicht SuperAdmin enthalten!");

export const passwordBaseValidation: ZodString = z.string().min(8).max(24).regex(PASSWORD_REGEX, "Passwort entspricht nicht den Anforderungen");

export const authorizationValidation: ZodString = z
    .string()
    .min(1, "Kein AccessToken vorhanden")
    .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, "Kein AccessToken vorhanden");

export const onlyAuthorizationHeader = z.object({
    headers: z.object({
        authorization: authorizationValidation
    })
});
