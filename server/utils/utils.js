import { v4 as uuidv4 } from "uuid";
import { Models, sequelize } from "../controllers/modelController.js";

export const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{5,15}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;
export const IPV4_REGEX = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export function generateUUID() {
    return uuidv4().replaceAll("-", "");
}

export function formatDate(dateInput) {
    const date = new Date(dateInput);

    const options = {
        timeZone: "Europe/Berlin",
        dateStyle: "short",
        timeStyle: "short"
    };

    return new Intl.DateTimeFormat("de-DE", options).format(date);
}

export async function removeRouteGroups() {
    const transaction = await sequelize.transaction();
    try {
        let dateNow = new Date(Date.now());
        const routeGroups = await Models.RouteGroup.findAll({ transaction: transaction });
        if (routeGroups !== null) {
            await Promise.all(
                routeGroups.map(async (routeGroup) => {
                    if (Math.abs(dateNow - new Date(routeGroup.updatedAt)) > 5 * 1000) {
                        await routeGroup.destroy({ transaction: transaction });
                    }
                })
            );
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        await serverLogger("CRITICAL", "Löschen der nicht mehr benutzen RouteGroups fehlgeschlagen", {
            source: "routeGroupRemoval",
            error: error
        });
    }
}
