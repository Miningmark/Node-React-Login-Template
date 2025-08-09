import { TooManyRequestsError } from "@/errors/errorClasses.js";
import { getIpv4Address } from "@/utils/misc.util.js";
import { NextFunction, Request, Response } from "express";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

function setHeaders(res: Response, rateLimiterResponse?: RateLimiterRes) {
    if (rateLimiterResponse === undefined) return;
    if (typeof rateLimiterResponse.msBeforeNext === "number") {
        res.setHeader("Retry-After", Math.ceil(rateLimiterResponse.msBeforeNext / 1000).toString());
    }
}

function makePublicRateLimiter(opts: { points: number; durationSec: number }) {
    const limiter = new RateLimiterMemory({
        points: opts.points,
        duration: opts.durationSec,
        blockDuration: 0
    });

    return async function consumeOnFail(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = getIpv4Address(req);
            const rateLimiterResponse = await limiter.consume(ip ? ip : "unknown");
            setHeaders(res, rateLimiterResponse);
            next();
        } catch (error: any) {
            setHeaders(res, error);
            next(new TooManyRequestsError());
        }
    };
}

function makeProtectedRateLimiter(opts: { points: number; durationSec: number }) {
    const limiter = new RateLimiterMemory({
        points: opts.points,
        duration: opts.durationSec,
        blockDuration: 0
    });

    return {
        async consumeOnFail(req: Request, res: Response, next: NextFunction, error: any) {
            try {
                const ip = getIpv4Address(req);
                const rateLimiterResponse = await limiter.consume(ip ? ip : "unknown");
                setHeaders(res, rateLimiterResponse);
                next(error);
            } catch (error: any) {
                setHeaders(res, error);
                next(new TooManyRequestsError());
            }
        }
    };
}

export const publicRateLimiter = makePublicRateLimiter({ points: 15, durationSec: 60 });
export const protectedRateLimiter = makeProtectedRateLimiter({ points: 10, durationSec: 60 });
