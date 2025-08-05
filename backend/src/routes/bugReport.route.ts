import { BugReportController } from "@/controllers/bugReport.controller.js";
import { SmartRouter } from "@/lib/smartRouter.lib.js";
import { BugReportService } from "@/services/bugReport.service.js";

export default async () => {
    const smartRouter = new SmartRouter();

    const bugReportService = new BugReportService();
    const bugReportController = new BugReportController(bugReportService);

    return smartRouter.getExpressRouter();
};
