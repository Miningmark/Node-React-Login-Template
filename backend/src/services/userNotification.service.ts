import { InternalServerError } from "@/errors/errorClasses.js";
import UserNotification from "@/models/userNotifications.model.js";
import { NotificationService } from "@/services/notification.service.js";

export class UserNotificationService {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    generateMultipleJSONResponseWithModel(databaseUserNotifications: UserNotification[], sendConfirmed: boolean = false): Record<string, any> {
        return databaseUserNotifications.map((databaseUserNotification) => {
            return this.generateSingleJSONResponseWithModel(databaseUserNotification, sendConfirmed);
        });
    }

    generateSingleJSONResponseWithModel(databaseUserNotification: UserNotification, sendConfirmed: boolean = false): Record<string, any> {
        if (databaseUserNotification.notification === undefined) throw new InternalServerError("Notification nicht mitgeladen");

        const jsonResponse = this.notificationService.generateSingleJSONResponse(
            databaseUserNotification.notification.id,
            databaseUserNotification.notification.name,
            databaseUserNotification.notification.description,
            databaseUserNotification.notification.notifyFrom,
            databaseUserNotification.notification.notifyTo
        );
        if (sendConfirmed) {
            jsonResponse.confirmed = databaseUserNotification.confirmed;
        }

        return jsonResponse;
    }
}
