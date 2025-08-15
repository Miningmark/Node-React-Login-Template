import { z } from "zod/v4";

import { emailValidation, usernameValidation } from "@/validators/base.validator.js";

export type GetAvatarValidation = z.infer<typeof getAvatarSchema>;
export const getAvatarSchema = z.object({
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .refine((val) => Number.isInteger(val) && val >= 0, "Muss eine positive Ganzzahl sein")
    })
});

export type DeleteAvatarValidation = z.infer<typeof deleteAvatarSchema>;
export const deleteAvatarSchema = z.object({
    body: z.object({
        id: z.int().positive()
    })
});

export type UpdateUserValidation = z.infer<typeof updateUserSchema>;
export const updateUserSchema = z.object({
    body: z
        .object({
            id: z.int().positive(),
            username: usernameValidation.optional(),
            email: emailValidation.optional(),
            isActive: z.boolean().optional(),
            isDisabled: z.boolean().optional(),
            permissionIds: z.array(z.int().positive()).optional()
        })
        .refine((data) => {
            return (
                data.username !== undefined ||
                data.email !== undefined ||
                data.isActive !== undefined ||
                data.isDisabled !== undefined ||
                data.permissionIds !== undefined
            );
        }, "Es muss mindestens ein Wert geändert werden")
});

export type CreateUserValidation = z.infer<typeof createUserSchema>;
export const createUserSchema = z.object({
    body: z.object({
        username: usernameValidation,
        email: emailValidation,
        permissionIds: z.array(z.int().positive())
    })
});
