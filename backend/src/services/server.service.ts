import { ControllerResponse } from "@/controllers/base.controller.js";
import ServerSettings from "@/models/serverSettings.model.js";
import { injectable } from "tsyringe";

@injectable()
export class ServerService {
    constructor() {}

    async getSettings(): Promise<ControllerResponse> {
        const jsonResponse: Record<string, any> = {
            message: "Einstellungen erfolgreich zurückgegeben"
        };

        const databaseServerSettings = await ServerSettings.findAll();

        databaseServerSettings.forEach((databaseServerSetting) => {
            jsonResponse[databaseServerSetting.key] = databaseServerSetting.value;
        });

        return { type: "json", jsonResponse: jsonResponse, statusCode: 200 };
    }
}
