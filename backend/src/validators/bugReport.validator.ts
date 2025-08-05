import { authorizationHeader, isoDateTimeValidation, limitAndOffsetParams, multipleFilesValidation } from "@/validators/base.validator.js";
import { z } from "zod/v4";

export type CreateBugReportValidation = z.infer<typeof createBugReportSchema>;
export const createBugReportSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        name: z.string().min(5).max(25),
        description: z.string().min(5).max(16000)
    }),
    files: multipleFilesValidation(5, 3)
});
