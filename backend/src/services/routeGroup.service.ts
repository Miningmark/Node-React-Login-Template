import RouteGroup from "@/models/routeGroup.model.js";
import User from "@/models/user.model.js";
import { isGroupEntry } from "@/routeGroups/index.js";
import fs from "fs/promises";
import path from "path";
import { injectable } from "tsyringe";
import { fileURLToPath, pathToFileURL } from "url";

@injectable()
export class RouteGroupService {
    constructor() {}

    async generateUserRouteGroupArray(databaseUser: User): Promise<string[]> {
        const routeGroupsArray: string[] = [];

        const userPermissions = await databaseUser.getPermissions({
            include: { model: RouteGroup }
        });
        if (userPermissions === null) return routeGroupsArray;

        userPermissions.map((userPermission) => {
            userPermission.routeGroups
                ? userPermission.routeGroups.map((routeGroup) => {
                      if (!routeGroupsArray.includes(routeGroup.name)) {
                          routeGroupsArray.push(routeGroup.name);
                      }
                  })
                : [];
        });

        return routeGroupsArray;
    }

    generateMultipleJSONResponseWithModel(databaseRouteGroups?: RouteGroup[]): Record<string, any> {
        return databaseRouteGroups
            ? databaseRouteGroups.map((databaseRouteGroup) => {
                  return this.generateSingleJSONResponseWithModel(databaseRouteGroup);
              })
            : [];
    }

    generateSingleJSONResponseWithModel(databaseRouteGroup: RouteGroup): Record<string, any> {
        return this.generateSingleJSONResponse(
            databaseRouteGroup.id,
            databaseRouteGroup.name,
            databaseRouteGroup.description === null ? undefined : databaseRouteGroup.description
        );
    }

    generateSingleJSONResponse(
        id: number,
        name: string,
        description?: string
    ): Record<string, any> {
        return {
            id: id,
            name: name,
            description: description
        };
    }

    static async createRouteGroups() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const routeGroupsDir = path.join(__dirname, "..", "routeGroups");

        const files = await fs.readdir(routeGroupsDir);

        for (const file of files) {
            if (!(file.endsWith(".routeGroup.ts") || file.endsWith(".routeGroup.js"))) continue;

            const fullPath = path.join(routeGroupsDir, file);
            const moduleUrl = pathToFileURL(fullPath).toString();

            for (const [exportName, routeGroup] of Object.entries(await import(moduleUrl))) {
                if (isGroupEntry(routeGroup)) {
                    const [databaseRouteGroup, isDatabaseRouteGroupCreated] =
                        await RouteGroup.findOrCreate({
                            where: { name: routeGroup.groupName },
                            defaults: {
                                name: routeGroup.groupName,
                                description: routeGroup.groupDescription
                            }
                        });

                    if (isDatabaseRouteGroupCreated === false) {
                        if (databaseRouteGroup.description !== routeGroup.groupDescription) {
                            databaseRouteGroup.description = routeGroup.groupDescription;
                        }

                        databaseRouteGroup.updatedAt = new Date(Date.now());
                        await databaseRouteGroup.save();
                    }
                }
            }
        }
    }

    static async removeUnusedRouteGroups() {
        let lastUpdatedAt = new Date(0);

        const databaseRouteGroups = await RouteGroup.findAll();

        databaseRouteGroups.map(async (databaseRouteGroup) => {
            if (databaseRouteGroup.updatedAt.getTime() > lastUpdatedAt.getTime()) {
                lastUpdatedAt = databaseRouteGroup.updatedAt;
            }
        });

        await Promise.all(
            databaseRouteGroups.map(async (databaseRouteGroup) => {
                if (
                    Math.abs(databaseRouteGroup.updatedAt.getTime() - lastUpdatedAt.getTime()) >
                    1000
                ) {
                    await databaseRouteGroup.destroy();
                }
            })
        );
    }
}
