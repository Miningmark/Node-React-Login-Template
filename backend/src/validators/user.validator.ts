import { UserSettingsTheme } from "@/models/userSettings.model.js";
import { authorizationHeader, emailValidation, passwordValidation, singleFileValidation, usernameValidation } from "@/validators/base.validator.js";
import { z } from "zod/v4";

export type UpdateUsernameValidation = z.infer<typeof updateUsernameSchema>;
export const updateUsernameSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        newUsername: usernameValidation
    })
});

export type UpdateEmailValidation = z.infer<typeof updateEmailSchema>;
export const updateEmailSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        newEmail: emailValidation
    })
});

export type UpdatePasswordValidation = z.infer<typeof updatePasswordSchema>;
export const updatePasswordSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        currentPassword: z.string(),
        newPassword: passwordValidation
    })
});

export type UpdateSettingsValidation = z.infer<typeof updateSettingsSchema>;
export const updateSettingsSchema = z.object({
    headers: authorizationHeader,
    body: z
        .object({
            theme: z.enum(Object.values(UserSettingsTheme)).optional(),
            isSideMenuFixed: z.boolean().optional(),
            menuBookmarks: z
                .array(z.object({ linkName: z.string(), link: z.string() }))
                .min(0)
                .max(5)
                .optional()
        })
        .refine((data) => {
            return data.theme !== undefined || data.isSideMenuFixed !== undefined || data.menuBookmarks !== undefined;
        }, "Es muss mindestens ein Wert geändert werden")
});

export type ConfirmPendingNotificationValidation = z.infer<typeof confirmPendingNotificationSchema>;
export const confirmPendingNotificationSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        id: z.int().positive()
    })
});

export type UpdateAvatarValidation = z.infer<typeof updateAvatarSchema>;
export const updateAvatarSchema = z.object({
    headers: authorizationHeader,
    file: singleFileValidation(5, ["image/jpeg", "image/png", "image/webp"])
});
