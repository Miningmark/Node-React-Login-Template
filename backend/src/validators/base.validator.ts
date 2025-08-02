import { EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from "@/utils/misc.util.js";
import { z } from "zod/v4";

export const usernameValidation = z
    .string()
    .min(5)
    .max(15)
    .regex(USERNAME_REGEX, "Benutzername entspricht nicht den Anforderungen")
    .refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Benutzername kann nicht SuperAdmin enthalten!");

export const emailValidation = z
    .string()
    .regex(EMAIL_REGEX, "Email entspricht nicht den Anforderungen")
    .refine((val) => !val.toLowerCase().includes("SuperAdmin".toLowerCase()), "Email kann nicht SuperAdmin enthalten!");

export const passwordValidation = z.string().min(8).max(24).regex(PASSWORD_REGEX, "Passwort entspricht nicht den Anforderungen");

export const isoDateTimeValidation = z.iso.datetime().transform((val) => new Date(val));

export const authorizationHeader = z.object({
    authorization: z
        .string()
        .min(1, "Kein AccessToken vorhanden")
        .regex(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/, "Kein AccessToken vorhanden")
});

export const limitAndOffsetParams = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || (Number.isInteger(val) && val > 0), "Muss eine positive Ganzzahl sein"),
    offset: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined))
        .refine((val) => val === undefined || (Number.isInteger(val) && val > 0), "Muss eine positive Ganzzahl sein")
});

export type OnlyAuthorizationValidation = z.infer<typeof onlyAuthorizationSchema>;
export const onlyAuthorizationSchema = z.object({
    headers: authorizationHeader
});

export const imageFileValidation = (maxFileSizeInMB: number): z.ZodCustom<Express.Multer.File, Express.Multer.File> => {
    return z
        .custom<Express.Multer.File>((file): file is Express.Multer.File => !!file && typeof file === "object", {
            message: "Datei fehlt oder ungültig"
        })
        .refine((file) => file.mimetype?.startsWith("image/jpeg") || file.mimetype?.startsWith("image/png") || file.mimetype?.startsWith("image/webp"), {
            message: "Nur Bilddateien sind erlaubt (.png, .jpeg, .jpg, .jpe, .webp)"
        })
        .refine((file) => file.size <= maxFileSizeInMB * 1024 * 1024, {
            message: `Bild zu groß (max. ${maxFileSizeInMB}MB)`
        });
};
