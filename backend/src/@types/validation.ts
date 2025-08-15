import { Request } from "express";
import { z, ZodObject } from "zod/v4";

export interface ValidatedRequest<T = ZodObject> extends Request {
    validated: T;
}

export type InferValidation<T> = T extends ZodObject ? z.infer<T> : never;
