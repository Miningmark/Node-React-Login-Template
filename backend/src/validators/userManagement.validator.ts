import { number, z } from "zod/v4";
import { authorizationBaseValidation, emailBaseValidation, numberBaseValidation, passwordBaseValidation, usernameBaseValidation } from "@/validators/base.validator.js";

export const getUsersSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    params: z.object({
        limit: numberBaseValidation,
        offset: numberBaseValidation
    })
});

export const updateUserPermissionsSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        id: z.number(),
        permissionIds: z.array(z.number())
    })
});

export const updateUserSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z
        .object({
            id: z.number(),
            username: usernameBaseValidation.optional(),
            email: emailBaseValidation.optional(),
            isActive: z.boolean().optional(),
            isDisabled: z.boolean().optional(),
            permissionIds: z.array(z.number()).optional()
        })
        .refine((data) => {
            return data.username !== undefined || data.email !== undefined || data.isActive !== undefined || data.isDisabled !== undefined || data.permissionIds !== undefined;
        }, "Es muss mindestens ein Wert geändert werden")
});

export const addUserSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        username: usernameBaseValidation,
        email: emailBaseValidation,
        permissionIds: z.array(z.number())
    })
});
