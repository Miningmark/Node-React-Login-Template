import { Request } from "express";
import { z, ZodObject } from "zod/v4";

export interface ValidatedRequest<T = any> extends Request {
    validated: T;
}

export type InferValidation<T> = T extends ZodObject<infer U> ? z.infer<T> : never;
