import { databaseLogger } from "@/config/logger.js";
import { CronJobDefinition } from "@/croner/scheduler.js";
import { ServerLogTypes } from "@/models/serverLog.model.js";
import User from "@/models/user.model.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import { Op } from "@sequelize/core";

const job: CronJobDefinition = {
    name: "removeInvalidJWTs",
    schedule: "? ? /2 * * *",
    job: async () => {
        const databaseUserTokens = await UserToken.findAll({
            where: { [Op.or]: [{ type: UserTokenType.ACCESS_TOKEN }, { type: UserTokenType.REFRESH_TOKEN }], expiresAt: { [Op.lte]: new Date(Date.now()) } }
        });
        const destroyedCount = databaseUserTokens.length;

        await Promise.all(
            databaseUserTokens.map(async (databaseUserToken) => {
                await databaseUserToken.destroy();
            })
        );

        await databaseLogger(ServerLogTypes.INFO, `Es wurden ${destroyedCount} Zugangstoken gelöscht`, {
            source: job.name
        });
    }
};

export default job;
