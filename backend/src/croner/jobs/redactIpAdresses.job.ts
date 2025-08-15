import { Op } from "@sequelize/core";

import { databaseLogger } from "@/config/logger.js";
import { CronJobDefinition } from "@/croner/scheduler.js";
import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";

const job: CronJobDefinition = {
    name: "redactIpAdresses",
    schedule: "? ? /2 * * *",
    job: async () => {
        const databaseServerLogs = await ServerLog.findAll({
            where: {
                createdAt: { [Op.lte]: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
                ipv4Address: { [Op.and]: [{ [Op.not]: null }, { [Op.notEndsWith]: ".xxx" }] }
            }
        });
        const destroyedCount = databaseServerLogs.length;

        await Promise.all(
            databaseServerLogs.map(async (databaseServerLog) => {
                databaseServerLog.ipv4Address =
                    typeof databaseServerLog.ipv4Address === "string"
                        ? databaseServerLog.ipv4Address.trim().replace(/\d{1,3}$/, "xxx")
                        : databaseServerLog.ipv4Address;
                await databaseServerLog.save();
            })
        );

        await databaseLogger(
            ServerLogTypes.INFO,
            `Es wurden ${destroyedCount} IP Adressen anonymisiert`,
            {
                source: job.name
            }
        );
    }
};

export default job;
