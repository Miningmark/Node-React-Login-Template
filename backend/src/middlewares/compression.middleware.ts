import compression from "compression";
import { Request, Response } from "express";

export const compressionMiddleware = () => {
    return compression({
        filter: shouldCompress,
        level: 6,
        threshold: 1024
    });
};

function shouldCompress(req: Request, res: Response) {
    if (req.headers["x-no-compression"]) {
        return false;
    }

    return compression.filter(req, res);
}
