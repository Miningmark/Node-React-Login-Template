import { z } from "zod/v4";

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.email(),
        password: z.string().min(8)
    })
});
