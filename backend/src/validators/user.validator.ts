import { z } from "zod/v4";
import { passwordBaseValidation } from "@/validators/base.validator.js";

export const updatePasswordSchema = z.object({
    body: z.object({
        currentPassword: passwordBaseValidation,
        oldPassword: passwordBaseValidation
    })
});
