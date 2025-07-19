import { z } from "zod/v4";
import { authorizationBaseValidation, emailBaseValidation, passwordBaseValidation, usernameBaseValidation } from "@/validators/base.validator.js";
import { UserSettingsTheme } from "@/models/userSettings.model.js";

export const updateUsernameSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        newUsername: usernameBaseValidation
    })
});

export const updateEmailSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        newEmail: emailBaseValidation
    })
});

export const updatePasswordSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        currentPassword: z.string(),
        newPassword: passwordBaseValidation
    })
});

export const updateSettingsSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        theme: z.enum(Object.values(UserSettingsTheme))
    })
});
