import { databaseLogger } from "@/config/logger.js";
import { CronJobDefinition } from "@/croner/scheduler.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import User from "@/models/user.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { Op } from "@sequelize/core";

const job: CronJobDefinition = {
    name: "removeInactiveRegistrations",
    schedule: "? ? /2 * * *",
    job: async () => {
        const databaseUserTokens = await UserToken.findAll({
            where: { type: { [Op.or]: [UserTokenType.USER_REGISTRATION_TOKEN, UserTokenType.ADMIN_REGISTRATION_TOKEN] }, expiresAt: { [Op.lte]: new Date(Date.now()) } },
            include: { model: User }
        });
        const destroyedCount = databaseUserTokens.length;

        await Promise.all(
            databaseUserTokens.map(async (databaseUserToken) => {
                await databaseUserToken.user?.destroy();
            })
        );

        await databaseLogger(ServerLogTypes.INFO, `Es wurden ${destroyedCount} Benutzer wegen abgelaufener aktivierung gelöscht`, {
            source: job.name
        });
    }
};

export default job;
