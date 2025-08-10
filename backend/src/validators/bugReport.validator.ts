import { authorizationHeader, multipleFilesValidation } from "@/validators/base.validator.js";
import { z } from "zod/v4";

export type CreateBugReportValidation = z.infer<typeof createBugReportSchema>;
export const createBugReportSchema = z.object({
    headers: authorizationHeader,
    body: z.object({
        name: z.string().min(5).max(25),
        description: z.string().min(5).max(16000)
    }),
    files: multipleFilesValidation(5, 3, [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.oasis.opendocument.text",
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/vnd.oasis.opendocument.presentation",
        "text/plain"
    ])
});
