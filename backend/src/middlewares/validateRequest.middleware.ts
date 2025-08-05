import { ValidatedRequest } from "@/@types/validation.js";
import { ValidationError } from "@/errors/errorClasses.js";
import { NextFunction, Response } from "express";
import { z, ZodError, ZodObject } from "zod/v4";

export const validateRequest = <T extends ZodObject<any>>(schema: T) => {
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
            if (error instanceof ZodError) {
                next(new ValidationError(`{${(error.issues[0]?.path).toString().replace(",", "}:{")}} ${error.issues[0]?.message}` || "Validierung der Anfrage fehlgeschlagen"));
                return;
            }
            next(new ValidationError("Validierung der Anfrage fehlgeschlagen"));
        }
    };
};
