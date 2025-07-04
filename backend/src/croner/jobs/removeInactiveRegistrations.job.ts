import { databaseLogger } from "@/config/logger.js";
import { CronJobDefinition } from "@/croner/scheduler.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import User from "@/models/user.model";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { Op } from "@sequelize/core";

const job: CronJobDefinition = {
    name: "removeInactiveRegistrations",
    schedule: "* * */2 * * *",
    job: async () => {
        const databaseUserTokens = await UserToken.findAll({
            where: { type: UserTokenType.USER_REGISTRATION_TOKEN, expiresAt: { [Op.lte]: new Date(Date.now()) } },
            include: { model: User }
        });
        const destroyedCount = databaseUserTokens.length;

        if (destroyedCount === 0) return;

        await Promise.all(
            databaseUserTokens.map(async (databaseUser) => {
                await databaseUser.user?.destroy();
            })
        );

        await databaseLogger(ServerLogTypes.INFO, `Es wurden ${destroyedCount} Benutzer wegen versämter aktivierung gelöscht`, {
            source: job.name
        });
    }
};

export default job;
