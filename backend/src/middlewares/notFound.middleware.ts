import { NotFoundError } from "@/errors/errorClasses";
import { Request, Response } from "express";

export const notFoundMiddleware = (req: Request, res: Response) => {
    throw new NotFoundError();
};
