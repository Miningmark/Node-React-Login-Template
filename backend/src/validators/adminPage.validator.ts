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
