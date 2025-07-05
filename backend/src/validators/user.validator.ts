import { z } from "zod/v4";
import { authorizationValidation, emailBaseValidation, passwordBaseValidation, usernameBaseValidation } from "@/validators/base.validator.js";

export const updateUsernameSchema = z.object({
    headers: z.object({
        authorization: authorizationValidation
    }),
    body: z.object({
        newUsername: usernameBaseValidation
    })
});

export const updateEmailSchema = z.object({
    headers: z.object({
        authorization: authorizationValidation
    }),
    body: z.object({
        newEmail: emailBaseValidation
    })
});

export const updatePasswordSchema = z.object({
    headers: z.object({
        authorization: authorizationValidation
    }),
    body: z.object({
        currentPassword: z.string(),
        newPassword: passwordBaseValidation
    })
});
