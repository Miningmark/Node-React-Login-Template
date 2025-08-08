import { ZodError } from "zod/v4";

export function formatZodError(err: ZodError): string {
    return err.issues
        .map((i) => {
            const path = i.path.join(".");
            return `${path || "<root>"}: ${i.message}`;
        })
        .join("; ");
}
