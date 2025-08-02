import { authorizationHeader, isoDateTimeValidation, limitAndOffsetParams } from "@/validators/base.validator.js";
import { z } from "zod/v4";

export type GetServerLogValidation = z.infer<typeof getServerLogSchema>;
export const getServerLogSchema = z.object({
    headers: authorizationHeader,
    params: limitAndOffsetParams
});

export type GetFilteredServerLogValidation = z.infer<typeof getFilteredServerLogSchema>;
export const getFilteredServerLogSchema = z.object({
    headers: authorizationHeader,
    params: limitAndOffsetParams,
    body: z.object({
        userIds: z.array(z.int()).optional(),
        types: z.array(z.string()).optional(),
        ipv4Address: z.string().optional(),
        createdAtFrom: isoDateTimeValidation.optional(),
        createdAtTo: isoDateTimeValidation.optional(),
        searchString: z.string().optional()
    })
});

export type CreatePermissionValidation = z.infer<typeof createPermissionSchema>;
export const createPermissionSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        name: z.string().min(5).max(50),
        description: z.string().min(5).max(100).optional(),
        routeGroupIds: z.array(z.int().positive())
    })
});

export type UpdatePermissionValidation = z.infer<typeof updatePermissionSchema>;
export const updatePermissionSchema = z.object({
    headers: authorizationHeader,
    body: z
        .object({
            id: z.int().positive(),
            name: z.string().min(5).max(50).optional(),
            description: z.string().min(5).max(100).optional(),
            routeGroupIds: z.array(z.int().positive()).optional()
        })
        .refine((data) => {
            return data.name !== undefined || data.description !== undefined || data.routeGroupIds !== undefined;
        }, "Es muss mindestens ein Wert geändert werden")
});

export type DeletePermissionValidation = z.infer<typeof deletePermissionSchema>;
export const deletePermissionSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        id: z.int().positive()
    })
});

export type GetNotificationsValidation = z.infer<typeof getNotificationsSchema>;
export const getNotificationsSchema = z.object({
    headers: authorizationHeader,
    params: limitAndOffsetParams
});

export type CreateNotificationsValidation = z.infer<typeof createNotificationSchema>;
export const createNotificationSchema = z.object({
    headers: authorizationHeader,
    body: z
        .object({
            name: z.string().min(5).max(25),
            description: z.string().min(5).max(16000),
            notifyFrom: isoDateTimeValidation,
            notifyTo: isoDateTimeValidation
        })
        .refine((data) => {
            return data.notifyFrom !== undefined || data.notifyTo !== undefined || data.notifyFrom < data.notifyTo;
        }, "Startdatum muss vor dem Enddatum liegen")
});

export type UpdateNotificationValidation = z.infer<typeof updateNotificationSchema>;
export const updateNotificationSchema = z.object({
    headers: authorizationHeader,
    body: z
        .object({
            id: z.int().positive(),
            resendNotification: z.boolean(),
            name: z.string().min(5).max(25).optional(),
            description: z.string().min(5).max(16000).optional(),
            notifyFrom: isoDateTimeValidation.optional(),
            notifyTo: isoDateTimeValidation.optional()
        })
        .refine((data) => {
            return data.name !== undefined || data.description !== undefined || data.notifyFrom !== undefined || data.notifyTo !== undefined;
        }, "Es muss mindestens ein Wert geändert werden")
});

export type DeleteNotificationValidation = z.infer<typeof deleteNotificationSchema>;
export const deleteNotificationSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        id: z.int().positive()
    })
});
