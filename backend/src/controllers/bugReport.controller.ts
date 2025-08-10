import { ValidatedRequest } from "@/@types/validation";
import { BaseController } from "@/controllers/base.controller.js";
import { BugReportService } from "@/services/bugReport.service.js";
import { CreateBugReportValidation, GetBugReportFileValidation, GetBugReportsValidation, GetOwnBugReportsValidation } from "@/validators/bugReport.validator.js";
import { NextFunction, Response } from "express";

export class BugReportController extends BaseController {
    constructor(private bugReportService: BugReportService) {
        super();
    }

    getBugReports = (req: ValidatedRequest<GetBugReportsValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;

            return await this.bugReportService.getBugReports(limit, offset);
        });
    };

    getOwnBugReports = (req: ValidatedRequest<GetOwnBugReportsValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { limit, offset } = req.validated.params;

            return await this.bugReportService.getOwnBugReports(userId, limit, offset);
        });
    };

    getBugReportFile = (req: ValidatedRequest<GetBugReportFileValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { id, fileIndex } = req.validated.body;

            return await this.bugReportService.getBugReportFile(id, fileIndex);
        });
    };

    createBugReport = (req: ValidatedRequest<CreateBugReportValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId } = req as { userId: number };
            const { name, description } = req.validated.body;
            const files = req.validated.files;

            return await this.bugReportService.createBugReport(userId, name, description, files);
        });
    };
}
