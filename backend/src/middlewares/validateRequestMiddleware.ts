import { ValidationError } from "@/errors/errorClasses";
import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validateRequest = (schema: AnyZodObject) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
                headers: req.headers
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                next(new ValidationError(`${(error.errors[0]?.path).toString().replace(",", ":{")}} ${error.errors[0]?.message}` || "Request Validation failed"));
                return;
            }
            next(new ValidationError("Request Validation failed"));
        }
    };
};
