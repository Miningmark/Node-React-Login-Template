import winston from "winston";

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format((info) => ({ ...info, level: info.level.toUpperCase() }))(),
        winston.format.colorize(),
        winston.format.timestamp({ format: "DD:MM:YYYY HH:mm:ss:ms" }),
        winston.format.errors(),
        winston.format.printf(({ timestamp, level, message, error }) => {
            return `[${timestamp}] [${level}]: ${message} ${error ? `\n ${error}` : ""}`;
        })
    ),
    transports: [new winston.transports.Console()]
});
