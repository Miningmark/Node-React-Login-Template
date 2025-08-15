import { Request, Response } from "express";

import { NotFoundError } from "@/errors/errorClasses.js";

export const notFoundMiddleware = (req: Request, res: Response) => {
    throw new NotFoundError();
};
