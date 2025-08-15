import { ForbiddenError, InternalServerError } from "@/errors/errorClasses.js";
import ServerSettings, { ServerSettingKey } from "@/models/serverSettings.model.js";
import { NextFunction, Request, Response } from "express";

export const checkMaintenanceMode = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const databaseServerSetting = await ServerSettings.findOne({
                where: { key: ServerSettingKey.MAINTENANCE_MODE }
            });
            if (databaseServerSetting === null)
                throw new InternalServerError("Server Setting nicht vorhanden");

            if (databaseServerSetting.value === false) return next();

            next(
                new ForbiddenError(
                    "Server befindet sich momentan im Wartungsmodus bitte später nochmal versuchen."
                )
            );
        } catch (error) {
            next(error);
        }
    };
};
