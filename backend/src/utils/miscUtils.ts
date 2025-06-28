import { Request } from "express";

export const getIpAddress = (req: Request): string | undefined => {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string") return forwardedFor;

    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string") return realIp;

    const remoteAddr = req.headers["remote-addr"];
    if (typeof remoteAddr === "string") return remoteAddr;

    const ip = req.ip;
    if (typeof ip === "string") return ip;

    return undefined;
};
