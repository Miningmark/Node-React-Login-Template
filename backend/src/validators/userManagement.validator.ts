import { z } from "zod/v4";

import {
    authorizationHeader,
    emailValidation,
    limitAndOffsetParams,
    usernameValidation
} from "@/validators/base.validator.js";

export type GetUsersValidation = z.infer<typeof getUsersSchema>;
export const getUsersSchema = z.object({
    headers: authorizationHeader,
    params: limitAndOffsetParams
});

export type GetAvatarValidation = z.infer<typeof getAvatarSchema>;
export const getAvatarSchema = z.object({
    headers: authorizationHeader,
    params: z.object({
        id: z
            .string()
            .transform((val) => parseInt(val, 10))
            .refine((val) => Number.isInteger(val) && val >= 0, "Muss eine positive Ganzzahl sein")
    })
});

export type DeleteAvatarValidation = z.infer<typeof deleteAvatarSchema>;
export const deleteAvatarSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        id: z.int().positive()
    })
});

export type UpdateUserValidation = z.infer<typeof updateUserSchema>;
export const updateUserSchema = z.object({
    headers: authorizationHeader,
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
    headers: authorizationHeader,
    body: z.object({
        username: usernameValidation,
        email: emailValidation,
        permissionIds: z.array(z.int().positive())
    })
});
