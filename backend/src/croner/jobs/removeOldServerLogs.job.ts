import { Op } from "@sequelize/core";

import { databaseLogger } from "@/config/logger.js";
import { CronJobDefinition } from "@/croner/scheduler.js";
import ServerLog, { ServerLogTypes } from "@/models/serverLog.model.js";

const job: CronJobDefinition = {
    name: "removeOldServerLogs",
    schedule: "? ? /2 * * *",
    job: async () => {
        const databaseServerLogs = await ServerLog.findAll({
            where: {
                createdAt: { [Op.lte]: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
            }
        });
        const destroyedCount = databaseServerLogs.length;

        await Promise.all(
            databaseServerLogs.map(async (databaseServerLog) => {
                await databaseServerLog.destroy();
            })
        );

        await databaseLogger(
            ServerLogTypes.INFO,
            `Es wurden ${destroyedCount} ServerLogs gelöscht`,
            {
                source: job.name
            }
        );
    }
};

export default job;
