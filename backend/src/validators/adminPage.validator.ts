import { authorizationBaseValidation, numberBaseValidation } from "@/validators/base.validator.js";
import { z } from "zod/v4";

export const getServerLogSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    params: z.object({
        limit: numberBaseValidation.optional(),
        offset: numberBaseValidation.optional()
    })
});

export const getFilteredServerLogSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    params: z.object({
        limit: numberBaseValidation.optional(),
        offset: numberBaseValidation.optional()
    }),
    body: z.object({
        userIds: z.array(z.number()).optional(),
        types: z.array(z.string()).optional(),
        ipv4Address: z.string().optional(),
        createdAtFrom: z.iso.datetime().optional(),
        createdAtTo: z.iso.datetime().optional(),
        searchString: z.string().optional()
    })
});

export const createPermissionSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        name: z.string(),
        description: z.string().optional(),
        routeGroupIds: z.array(z.number())
    })
});

export const updatePermissionSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z
        .object({
            id: z.number(),
            name: z.string().optional(),
            description: z.string().optional(),
            routeGroupIds: z.array(z.number()).optional()
        })
        .refine((data) => {
            return data.name !== undefined || data.description !== undefined || data.routeGroupIds !== undefined;
        }, "Es muss mindestens ein Wert geändert werden")
});

export const deletePermissionSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        id: z.number()
    })
});

export const getNotificationsSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    params: z.object({
        limit: numberBaseValidation.optional(),
        offset: numberBaseValidation.optional()
    })
});

export const createNotificationSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z
        .object({
            name: z.string(),
            description: z.string(),
            notifyFrom: z.iso.datetime(),
            notifyTo: z.iso.datetime()
        })
        .refine((data) => {
            return data.notifyFrom !== undefined || data.notifyTo !== undefined || data.notifyFrom < data.notifyTo;
        }, "notifyFrom muss zeitlich vor notifyTo liegen")
});

export const updateNotificationSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z
        .object({
            id: z.number(),
            resendNotification: z.boolean(),
            name: z.string().optional(),
            description: z.string().optional(),
            notifyFrom: z.iso.datetime().optional(),
            notifyTo: z.iso.datetime().optional()
        })
        .refine((data) => {
            return data.name !== undefined || data.description !== undefined || data.notifyFrom !== undefined || data.notifyTo !== undefined;
        }, "Es muss mindestens ein Wert geändert werden")
});

export const deleteNotificationSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    body: z.object({
        id: z.number()
    })
});
