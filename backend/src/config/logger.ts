import { ENV } from "@/config/env.js";
import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";
import { SocketService } from "@/socketIO/socket.service";
import winston from "winston";

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
            if (type === ServerLogTypes.INFO) {
                consoleLogger.info(message);
            } else if (type === ServerLogTypes.WARN) {
                consoleLogger.warn(message);
            } else if (type === ServerLogTypes.ERROR) {
                consoleLogger.error(message, { error: error?.stack });
            }
        }

        const serverLog = {
            type: type,
            message: message,
            userId: userId,
            url: url,
            method: method,
            status: status,
            ipv4Address: ipv4Address,
            userAgent: userAgent,
            requestBody: JSON.stringify(requestBody),
            requestHeaders: JSON.stringify(requestHeaders),
            response: JSON.stringify(response),
            source: source,
            errorStack: error?.stack?.split("\n").slice(1).join("\n")
        };

        await ServerLog.create(serverLog);
        try {
            SocketService.getInstance().emitToRoom("listen:serverLogs:watchList", "serverLogs:create", serverLog);
        } catch (error) {}
    } catch (error) {
        consoleLogger.error("Error bei erstellen eines ServerLog in der Datenbank", { error: error instanceof Error ? error.stack : "" });
    }
}
