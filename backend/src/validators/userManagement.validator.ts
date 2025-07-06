import { number, z } from "zod/v4";
import { authorizationBaseValidation, emailBaseValidation, numberBaseValidation, passwordBaseValidation, usernameBaseValidation } from "./base.validator";

export const getUsersSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    params: z.object({
        limit: numberBaseValidation,
        offset: numberBaseValidation
    })
});

export const updateUserSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        id: z.number(),
        username: usernameBaseValidation.optional(),
        email: emailBaseValidation.optional(),
        isActive: z.boolean().optional(),
        isDisabled: z.boolean().optional(),
        permissionIds: z.array(z.number()).optional()
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
