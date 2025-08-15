import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { Cron } from "croner";

import { ServerLogTypes } from "@/models/serverLog.model.js";
import { databaseLogger } from "@/config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jobsDir = path.join(__dirname, "jobs");

export interface CronJobDefinition {
    name: string;
    schedule: string;
    job: () => Promise<void> | void;
}

export async function scheduleAllCronJobs() {
    try {
        const files = await fs.readdir(jobsDir);

        for (const file of files) {
            if (!(file.endsWith(".job.ts") || file.endsWith(".job.js"))) continue;

            const fullPath = path.join(jobsDir, file);
            const moduleUrl = pathToFileURL(fullPath).toString();

            const job: CronJobDefinition = (await import(moduleUrl)).default;

            new Cron(job.schedule, { timezone: "Europe/Berlin" }, async () => {
                await job.job();
            });

            await databaseLogger(
                ServerLogTypes.INFO,
                `Job "${job.name}" erfolgreich erstellt mit dem Zeitplan "${job.schedule}"`,
                {
                    source: "scheduler"
                }
            );
        }

        await databaseLogger(ServerLogTypes.INFO, "Sämtliche CronJobs erfolgreich erstellt", {
            source: "scheduler"
        });
    } catch {
        await databaseLogger(ServerLogTypes.ERROR, "Fehler beim erstellen der CronJobs", {
            source: "scheduler"
        });
    }
}
