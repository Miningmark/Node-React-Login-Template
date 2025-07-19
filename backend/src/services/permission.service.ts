import Permission from "@/models/permission.model.js";
import RouteGroup from "@/models/routeGroup.model.js";
import { RouteGroupService } from "@/services/routeGroup.service.js";

export class PermissionService {
    private routeGroupService: RouteGroupService;

    constructor() {
        this.routeGroupService = new RouteGroupService();
    }

    generateMultipleJSONResponseWithModel(databasePermissions: Permission[]): Record<string, any> {
        return databasePermissions.map((databasePermission) => {
            return this.generateSingleJSONResponseWithModel(databasePermission);
        });
    }

    generateSingleJSONResponseWithModel(databasePermission: Permission): Record<string, any> {
        return this.generateSingleJSONResponse(databasePermission.id, databasePermission.name, databasePermission.description === null ? undefined : databasePermission.description, databasePermission.routeGroups);
    }

    generateSingleJSONResponse(id: number, name: string, description?: string, routeGroups?: RouteGroup[]): Record<string, any> {
        return {
            id: id,
            name: name,
            description: description,
            routeGroups: this.routeGroupService.generateMultipleJSONResponseWithModel(routeGroups)
        };
    }
}
