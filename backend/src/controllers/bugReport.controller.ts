import { ValidatedRequest } from "@/@types/validation";
import { BaseController } from "@/controllers/base.controller.js";
import { BugReportService } from "@/services/bugReport.service.js";
import { CreateBugReportValidation, GetActiveBugReportsValidation, GetBugReportFileValidation, GetBugReportsValidation, GetOwnBugReportsValidation, UpdateBugReportStatusValidation } from "@/validators/bugReport.validator.js";
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

    getActiveBugReports = (req: ValidatedRequest<GetActiveBugReportsValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { limit, offset } = req.validated.params;

            return await this.bugReportService.getActiveBugReports(limit, offset);
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
            const { userId, routeGroups } = req as { userId: number; routeGroups: string[] };
            const { id, fileIndex } = req.validated.body;

            return await this.bugReportService.getBugReportFile(userId, routeGroups, id, fileIndex);
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

    updateBugReportStatus = (req: ValidatedRequest<UpdateBugReportStatusValidation>, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { userId, routeGroups } = req as { userId: number; routeGroups: string[] };
            const { id, status } = req.validated.body;

            return await this.bugReportService.updateBugReportStatus(userId, routeGroups, id, status);
        });
    };
}
