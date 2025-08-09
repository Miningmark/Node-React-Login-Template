import { ControllerResponse } from "@/controllers/base.controller.js";
import BugReport, { BugReportStatusType } from "@/models/bugReport.model.js";
import { S3Service } from "@/services/s3.service.js";

export class BugReportService {
    private s3Service: S3Service;
    constructor() {
        this.s3Service = S3Service.getInstance();
    }

    async createBugReport(userId: number, name: string, description: string, files: Express.Multer.File[]): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "BugReport erfolgreich erstellt" };

        const databaseBugReport = await BugReport.create({ userId: userId, name: name, description: description, status: BugReportStatusType.NEW });

        files.forEach(async (file, fileIndex) => {
            await this.s3Service.uploadFile("users", `${userId}/bugReports/${databaseBugReport.id}/${fileIndex}`, file.buffer, file.mimetype);
        });

        return { type: "json", jsonResponse: jsonResponse, logResponse: false };
    }
}
