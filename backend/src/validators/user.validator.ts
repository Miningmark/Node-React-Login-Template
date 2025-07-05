import { z } from "zod/v4";
import { authorizationValidation, passwordBaseValidation } from "@/validators/base.validator.js";

export const updatePasswordSchema = z.object({
    headers: z.object({
        authorization: authorizationValidation
    }),
    body: z.object({
        currentPassword: z.string(),
        newPassword: passwordBaseValidation
    })
});
