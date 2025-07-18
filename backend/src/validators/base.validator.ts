import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "@/utils/misc.util.js";
import { z } from "zod/v4";

export const usernameBaseValidation = z
    .string()
    .min(5)
    .max(15)
    .regex(USERNAME_REGEX, "Benutzername entspricht nicht den Anforderungen")
    .refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Benutzername kann nicht SuperAdmin enthalten!");

export const emailBaseValidation = z
    .string()
    .regex(EMAIL_REGEX, "Email entspricht nicht den Anforderungen")
    .refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Email kann nicht SuperAdmin enthalten!");

export const passwordBaseValidation = z.string().min(8).max(24).regex(PASSWORD_REGEX, "Passwort entspricht nicht den Anforderungen");

export const authorizationBaseValidation = z
    .string()
    .min(1, "Kein AccessToken vorhanden")
    .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, "Kein AccessToken vorhanden");

export const numberBaseValidation = z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Muss eine Nummer sein" })
    .transform((val) => Number(val));

export const onlyAuthorizationHeader = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    })
});
