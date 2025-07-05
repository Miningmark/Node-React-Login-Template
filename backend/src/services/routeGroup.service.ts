import RouteGroup from "@/models/routeGroup.model.js";
import User from "@/models/user.model.js";

export class RouteGroupService {
    async generateRouteGroupArray(databaseUser: User): Promise<string[]> {
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
}
