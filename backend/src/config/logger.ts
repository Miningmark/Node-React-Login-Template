import ServerLog, { ServerLogLevels } from "@/models/serverLog.model";
import winston from "winston";
import { ENV } from "./env";

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

export async function databaseLogger(level: ServerLogLevels, message: string, options: DatabaseLoggerOptions) {
    try {
        const { userId, url, method, status, ipv4Address, userAgent, requestBody, requestHeaders, response, source, error } = options;

        if (requestBody !== undefined) {
            let { password, newPassword, currentPassword, email, newEmail, usernameOrEmail } = requestBody;
            if (password !== undefined) requestBody.password = "*hidden*";
            if (newPassword !== undefined) requestBody.newPassword = "*hidden*";
            if (currentPassword !== undefined) requestBody.currentPassword = "*hidden*";
            if (email !== undefined) requestBody.email = "*hidden*";
            if (newEmail !== undefined) requestBody.newEmail = "*hidden*";
            if (usernameOrEmail !== undefined) requestBody.usernameOrEmail = "*hidden*";
        }

        if (ENV.CONSOLE_LOG_ERRORS) {
            if (level === ServerLogLevels.INFO) {
                consoleLogger.info(message);
            } else if (level === ServerLogLevels.WARN) {
                consoleLogger.warn(message);
            } else if (level === ServerLogLevels.ERROR) {
                consoleLogger.error(message, { error: error?.stack });
            }
        }

        await ServerLog.create({
            level: level,
            message: message,
            userId: userId,
            url: url,
            method: method,
            status: status,
            ipv4Address: ipv4Address,
            userAgent: userAgent,
            requestBody: requestBody,
            requestHeaders: requestHeaders,
            response: response,
            source: source,
            errorStack: error?.stack?.split("\n").slice(1).join("\n"),
            timestamp: new Date(Date.now())
        });
    } catch (error) {
        consoleLogger.error("Error creating serverLog Entry for Database", { error: error instanceof Error ? error.stack : "" });
    }
}
