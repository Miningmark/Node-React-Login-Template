import { ValidationError } from "@/errors/errorClasses.js";
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod/v4";

export const validateRequest = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers,
                file: req.file
            });

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
