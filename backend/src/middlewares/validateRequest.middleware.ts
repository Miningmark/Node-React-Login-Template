import { NextFunction, Response } from "express";
import { z, ZodObject } from "zod/v4";

import { ValidatedRequest } from "@/@types/validation.js";

export const validateRequest = <T extends ZodObject>(schema: T) => {
    return (req: ValidatedRequest<z.infer<T>>, res: Response, next: NextFunction): void => {
        try {
            const validatedData = schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers,
                cookies: req.cookies,
                file: req.file,
                files: req.files
            });

            req.validated = validatedData;

            next();
        } catch (error) {
            next(error);
        }
    };
};
