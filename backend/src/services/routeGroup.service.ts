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
                      routeGroupsArray.push(routeGroup.name);
                  })
                : [];
        });

        return routeGroupsArray;
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
