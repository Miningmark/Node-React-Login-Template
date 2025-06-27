import { z } from "zod";

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8)
    })
});
