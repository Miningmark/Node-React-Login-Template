import { ENV } from "@/config/env.js";
import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";
import { ServerLogService } from "@/services/serverLog.service.js";
import { SocketService } from "@/services/socket.service.js";
import { container } from "tsyringe";
import winston from "winston";

const REDACT_KEYS = [/authorization/i, /cookie/i, /password/i, /newPassword/i, /currentPassword/i, /email/i, /newEmail/i, /usernameOrEmail/i, /token/i, /secret/i];
const MAX_LENGTH = 2000;

const serverLogService = new ServerLogService();

export interface DatabaseLoggerOptions {
    userId?: number;
    url?: string;
    method?: string;
    status?: number;
    ipv4Address?: string;
    userAgent?: string;
    requestBody?: Record<string, any>;
    requestHeaders?: Record<string, any>;
    response?: Record<string, any>;
    source?: string;
    error?: Error;
}

export const consoleLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
        winston.format.colorize(),
        winston.format.timestamp({ format: "DD:MM:YYYY HH:mm:ss" }),
        winston.format.errors(),
        winston.format.printf(({ timestamp, level, message, error }) => {
            return `[${timestamp}] [${level}]: ${message} ${error ? `\n ${error}` : ""}`;
        })
    ),
    transports: [new winston.transports.Console()]
});

export async function databaseLogger(type: ServerLogTypes, message: string, options: DatabaseLoggerOptions) {
    try {
        const { userId, url, method, status, ipv4Address, userAgent, requestBody, requestHeaders, response, source, error } = options;

        if (ENV.CONSOLE_LOG_ERRORS) {
            if (type === ServerLogTypes.INFO) {
                consoleLogger.info(message);
            } else if (type === ServerLogTypes.WARN) {
                consoleLogger.warn(message);
            } else if (type === ServerLogTypes.ERROR) {
                consoleLogger.error(message, { error: error?.stack });
            }
        }

        const databaseServerLog = await ServerLog.create({
            type: type,
            message: message,
            userId: userId,
            url: url,
            method: method,
            status: status,
            ipv4Address: ipv4Address,
            userAgent: userAgent,
            requestBody: JSON.stringify(redactObject(requestBody)),
            requestHeaders: JSON.stringify(redactObject(requestHeaders)),
            response: JSON.stringify(redactObject(response)),
            source: source,
            errorStack: error?.stack?.split("\n").slice(1).join("\n")
        });

        try {
            container.resolve(SocketService).emitToRoom("listen:adminPage:serverLogs:watchList", "adminPage:serverLogs:create", serverLogService.generateJSONResponse([databaseServerLog])[0]);
        } catch (error) {}
    } catch (error) {
        consoleLogger.error("Error bei erstellen eines ServerLog in der Datenbank", {
            error: error instanceof Error ? error.stack : ""
        });
    }
}

function redactValue(key: string, val: unknown) {
    if (REDACT_KEYS.some((rx) => rx.test(key))) return "[REDACTED]";
    if (typeof val === "string" && val.length > MAX_LENGTH) {
        return val.slice(0, MAX_LENGTH) + "...[truncated]";
    }
    return val;
}

function redactObject(obj?: Record<string, any>) {
    if (obj === undefined || typeof obj !== "object") return obj;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
            out[k] = redactObject(v as Record<string, any>);
        } else {
            out[k] = redactValue(k, v);
        }
    }
    return out;
}
