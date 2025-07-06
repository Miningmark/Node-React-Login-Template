import { authorizationBaseValidation, numberBaseValidation } from "@/validators/base.validator.js";
import { z } from "zod/v4";

export const getServerLogSchema = z.object({
    headers: z.object({
        authorization: authorizationBaseValidation
    }),
    params: z.object({
        limit: numberBaseValidation,
        offset: numberBaseValidation
    })
});
