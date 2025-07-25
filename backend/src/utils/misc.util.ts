import { ValidationError } from "@/errors/validationError.js";
import { Request } from "express";

export const USERNAME_REGEX = /^[a-zA-Z0-9-]{5,15}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;
export const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export const getIpv4Address = (req: Request): string | undefined => {
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string") return realIp;

    const remoteAddr = req.headers["remote-addr"];
    if (typeof remoteAddr === "string") return remoteAddr;

    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string") return forwardedFor;

    const ip = req.ip;
    if (typeof ip === "string") return ip;

    return undefined;
};

export function parseTimeOffsetToDate(timeOffset: string): Date {
    const match = timeOffset.match(/^(\d+)([smhd])$/);
    if (match === null) throw new ValidationError("Ungültiges Format");

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case "s":
            return new Date(Date.now() + value * 1000);
        case "m":
            return new Date(Date.now() + value * 60 * 1000);
        case "h":
            return new Date(Date.now() + value * 60 * 60 * 1000);
        case "d":
            return new Date(Date.now() + value * 24 * 60 * 60 * 1000);
        case "y":
            return new Date(Date.now() + value * 365 * 24 * 60 * 60 * 1000);
        default:
            throw new Error("Ungültige Einheit");
    }
}

export function formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: "Europe/Berlin",
        dateStyle: "short",
        timeStyle: "short"
    };

    return new Intl.DateTimeFormat("de-DE", options).format(date);
}

export function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
