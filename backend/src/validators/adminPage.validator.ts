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

/*export const getFilteredServerLogSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    params: z.object({
        limit: numberBaseValidation.optional(),
        offset: numberBaseValidation.optional()
    }),
    body: z.object({
        userIds: z.array(z.number()).optional(),
        levels: z.array(z.number()).optional(),
        ipv4Address: z.string().optional(),
        timestampFrom: z.iso.datetime().optional(),
        timestampTo: z.iso.datetime().optional(),
        searchString: z.string().optional
    })
});*/
