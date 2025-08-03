import RouteGroup from "@/models/routeGroup.model.js";
import User from "@/models/user.model.js";

export class RouteGroupService {
    async generateUserRouteGroupArray(databaseUser: User): Promise<string[]> {
        let routeGroupsArray: string[] = [];

        const userPermissions = await databaseUser.getPermissions({ include: { model: RouteGroup } });
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
        return this.generateSingleJSONResponse(databaseRouteGroup.id, databaseRouteGroup.name, databaseRouteGroup.description === null ? undefined : databaseRouteGroup.description);
    }

    generateSingleJSONResponse(id: number, name: string, description?: string): Record<string, any> {
        return {
            id: id,
            name: name,
            description: description
        };
    }

    static async generateMaintenanceModeRouteGroup() {
        let databaseRouteGroup = await RouteGroup.findOne({ where: { name: "maintenanceModeAccess" } });

        if (databaseRouteGroup === null) {
            databaseRouteGroup = await RouteGroup.create({ name: "maintenanceModeAccess", description: "Hat Zugang wärend sich der Server im Wartungsmodus befindet, bitte mit Vorsicht vergeben" });
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
                if (Math.abs(databaseRouteGroup.updatedAt.getTime() - lastUpdatedAt.getTime()) > 1000) {
                    await databaseRouteGroup.destroy();
                }
            })
        );
    }
}
