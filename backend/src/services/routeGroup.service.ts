import RouteGroup from "@/models/routeGroup.model.js";
import User from "@/models/user.model.js";

export class RouteGroupService {
    async generateUserRouteGroupArray(databaseUser: User): Promise<string[]> {
        let routeGroupsArray: string[] = [];

        const userPermissions = await databaseUser.getPermissions({ include: { model: RouteGroup } });
        if (userPermissions === null) return routeGroupsArray;

        userPermissions.map((userPermission) => {
            userPermission.routeGroups.map((routeGroup) => {
                routeGroupsArray.push(routeGroup.name);
            });
        });

        return routeGroupsArray;
    }

    static async removeUnusedRouteGroups() {
        let dateNow = new Date(Date.now()).getMilliseconds();
        const databaseRouteGroups = await RouteGroup.findAll();

        await Promise.all(
            databaseRouteGroups.map(async (databaseRouteGroup) => {
                if (Math.abs(dateNow - databaseRouteGroup.updatedAt.getMilliseconds()) > 1000) {
                    await databaseRouteGroup.destroy();
                }
            })
        );
    }
}
