import { consoleLogger } from "@/config/logger";

export class ErrorMonitoringService {
    private static instance: ErrorMonitoringService;

    private constructor() {
        process.on("uncaughtException", this.handleUncaughtException);
        process.on("unhandledRejection", this.handleUnhandledRejection);
    }

    public static getInstance(): ErrorMonitoringService {
        if (!ErrorMonitoringService.instance) {
            ErrorMonitoringService.instance = new ErrorMonitoringService();
        }
        return ErrorMonitoringService.instance;
    }

    private handleUncaughtException = (error: Error) => {
        consoleLogger.error("Unhandeld Exception, shutting Server down", { error: error.stack });
        process.exit(1);
    };
    private handleUnhandledRejection = (reason: any) => {
        consoleLogger.error("Unhandeld Rejection, shutting Server down", { error: reason instanceof Error ? reason.stack : new Error(String(reason)) });
        process.exit(1);
    };
}
