import { injectable } from "tsyringe";

import Notification from "@/models/notification.model.js";

@injectable()
export class NotificationService {
    constructor() {}

    generateMultipleJSONResponseWithModel(
        databaseNotifications: Notification[]
    ): Record<string, any> {
        return databaseNotifications.map((databaseNotification) => {
            return this.generateSingleJSONResponseWithModel(databaseNotification);
        });
    }

    generateSingleJSONResponseWithModel(databaseNotification: Notification): Record<string, any> {
        return this.generateSingleJSONResponse(
            databaseNotification.id,
            databaseNotification.name,
            databaseNotification.description,
            databaseNotification.notifyFrom,
            databaseNotification.notifyTo
        );
    }

    generateSingleJSONResponse(
        id: number,
        name: string,
        description: string,
        notifyFrom: Date,
        notifyTo: Date
    ): Record<string, any> {
        return {
            id: id,
            name: name,
            description: description,
            notifyFrom: notifyFrom,
            notifyTo: notifyTo
        };
    }
}
