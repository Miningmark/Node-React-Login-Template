import { ControllerResponse } from "@/controllers/base.controller.js";
import { ForbiddenError, ValidationError } from "@/errors/errorClasses.js";
import BugReport, { BugReportStatusType } from "@/models/bugReport.model.js";
import { BugReportRouteGroups } from "@/routeGroups/bugReport.routeGroup.js";
import { S3Service } from "@/services/s3.service.js";
import path from "path";
import sharp from "sharp";

export class BugReportService {
    private s3Service: S3Service;
    constructor() {
        this.s3Service = S3Service.getInstance();
    }

    async getBugReports(limit?: number, offset?: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "BugReports erfolgreich zurückgegeben" };
        const databaseBugReports = await BugReport.findAll({ ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.bugReportCount = await BugReport.count();
        jsonResponse.bugReports = this.generateJSONResponse(databaseBugReports);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getOwnBugReports(userId: number, limit?: number, offset?: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "BugReports erfolgreich zurückgegeben" };
        const databaseBugReports = await BugReport.findAll({ where: { userId: userId }, ...(limit !== undefined && offset !== undefined ? { limit: limit, offset: offset } : {}), order: [["id", "DESC"]] });

        jsonResponse.bugReportCount = await BugReport.count({ where: { userId: userId } });
        jsonResponse.bugReports = this.generateJSONResponse(databaseBugReports);

        return { type: "json", jsonResponse: jsonResponse };
    }

    async getBugReportFile(userId: number, routeGroups: string[], id: number, fileIndex: number): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Datei für BugReport erfolgreich zurückgegeben" };
        let stream, contentType;

        const databaseBugReport = await BugReport.findOne({ where: { id: id } });

        if (databaseBugReport === null) throw new ValidationError("Keinen BugReport mit dieser ID gefunden");
        if (databaseBugReport.userId !== userId && routeGroups.includes(BugReportRouteGroups.BUG_REPORT_READ.groupName) === false) throw new ForbiddenError("Du kannst nur Dateien von deinen eigenen BugReports ansehen");
        if (databaseBugReport.fileNames.length === 0 || databaseBugReport.fileNames.length < fileIndex) throw new ValidationError("Es ist keine Datei mit diesen Index vorhanden");

        try {
            ({ stream, contentType } = await this.s3Service.getFile("bug-reports", `${databaseBugReport.id}/${databaseBugReport.fileNames[fileIndex - 1]}`));
        } catch (error) {
            return { type: "json", jsonResponse: { message: "Es ist keine Datei mit diesen Index vorhanden" }, statusCode: 204 };
        }

        return { type: "stream", stream: stream, contentType: contentType, filename: databaseBugReport.fileNames[fileIndex - 1], jsonResponse: jsonResponse };
    }

    async createBugReport(userId: number, name: string, description: string, files: Express.Multer.File[]): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "BugReport erfolgreich erstellt" };

        const databaseBugReport = await BugReport.create({ userId: userId, name: name, description: description, status: BugReportStatusType.NEW });
        const fileNames: string[] = [];

        await Promise.all(
            files.map(async (file) => {
                if (file.mimetype.startsWith("image/")) {
                    const webpImageBuffer = await sharp(file.buffer).resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
                    await this.s3Service.uploadFile("bug-reports", `${databaseBugReport.id}/${path.parse(file.originalname).name}.webp`, webpImageBuffer, "image/webp");
                    fileNames.push(`${path.parse(file.originalname).name}.webp`);
                } else {
                    await this.s3Service.uploadFile("bug-reports", `${databaseBugReport.id}/${file.originalname}`, file.buffer, file.mimetype);
                    fileNames.push(file.originalname);
                }
            })
        );

        databaseBugReport.fileNames = fileNames;
        await databaseBugReport.save();

        return { type: "json", jsonResponse: jsonResponse };
    }

    async updateBugReportStatus(userId: number, routeGroups: string[], id: number, status: BugReportStatusType): Promise<ControllerResponse> {
        let jsonResponse: Record<string, any> = { message: "Den Status vom BugReport erfolgreich geändert" };

        const databaseBugReport = await BugReport.findOne({ where: { id: id } });

        if (databaseBugReport === null) throw new ValidationError("Keinen BugReport mit dieser ID gefunden");
        if (databaseBugReport.userId !== userId && routeGroups.includes(BugReportRouteGroups.BUG_REPORT_WRITE.groupName) === false)
            throw new ForbiddenError("Du kannst nur den Status von deinen eigenen BugReports bearbeiten");
        if (routeGroups.includes(BugReportRouteGroups.BUG_REPORT_WRITE.groupName) === false && (databaseBugReport.status !== BugReportStatusType.NEW || status !== BugReportStatusType.CLOSED))
            throw new ForbiddenError('Du kannst deine eigenen BugReports nur auf "GESCHLOSSEN" setzen wenn der Status noch auf "NEU" ist');

        databaseBugReport.status = status;
        await databaseBugReport.save();

        return { type: "json", jsonResponse: jsonResponse };
    }

    generateJSONResponse(databaseBugReports: BugReport[]): Record<string, any> {
        return databaseBugReports.map((databaseBugReport) => {
            return {
                id: databaseBugReport.id,
                userId: databaseBugReport.userId,
                status: databaseBugReport.status,
                name: databaseBugReport.name,
                description: databaseBugReport.description,
                createdAt: databaseBugReport.createdAt,
                hasFiles: databaseBugReport.fileNames.length === 0 ? false : true,
                fileCount: databaseBugReport.fileNames.length
            };
        });
    }
}
