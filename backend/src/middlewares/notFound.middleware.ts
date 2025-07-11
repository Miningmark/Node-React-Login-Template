import { NotFoundError } from "@/errors/errorClasses.js";
import { Request, Response } from "express";

export const notFoundMiddleware = (req: Request, res: Response) => {
    throw new NotFoundError();
};
