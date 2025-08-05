import { ValidatedRequest } from "@/@types/validation";
import { BaseController } from "@/controllers/base.controller.js";
import { BugReportService } from "@/services/bugReport.service.js";
import { CreateBugReportValidation } from "@/validators/bugReport.validator.js";
import { NextFunction, Response } from "express";

export class BugReportController extends BaseController {
    constructor(private bugReportService: BugReportService) {
        super();
    }

    createBugReport = (req: ValidatedRequest<CreateBugReportValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { name, description } = req.validated.body;
            const files = req.validated.files;

            return await this.bugReportService.createBugReport(userId, name, description, files);
        });
    };
}
