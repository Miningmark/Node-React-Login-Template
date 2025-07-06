import Permission from "@/models/permission.model";
import User from "@/models/user.model.js";

export class UserManagementService {
    constructor() {}

    //TODO: socketIO
    async getUsers(limit: number | undefined, offset: number | undefined) {
        let jsonResponse: Record<string, any> = { message: "Alle angeforderten Benutzer zurück gegeben" };

        const databaseUsers = await User.findAll({ include: { model: Permission }, ...(limit && offset ? { limit: limit, offset: offset } : {}) });

        jsonResponse.users = databaseUsers.map((databaseUser) => {
            return {
                id: databaseUser.id,
                username: databaseUser.username,
                email: databaseUser.email,
                isActive: databaseUser.isActive,
                isDisabled: databaseUser.isDisabled,
                permissions: databaseUser.permissions.map((databasePermission) => ({
                    id: databasePermission.id,
                    name: databasePermission.name
                }))
            };
        });

        return jsonResponse;
    }

    //TODO: SocketIO
    async getAllPermissions() {
        let jsonResponse: Record<string, any> = { message: "Alle Permissions zurück gegeben" };

        const databasePermissions = await Permission.findAll();

        jsonResponse.permissions = databasePermissions.map((databasePermission) => {
            return {
                id: databasePermission.id,
                name: databasePermission.name,
                description: databasePermission.description
            };
        });

        return jsonResponse;
    }

    //TODO: SocketIO
    async updateUserPermissions() {
        let jsonResponse: Record<string, any> = { message: "Rechte erfolgreich bearbeitet" };

        return jsonResponse;
    }

    //TODO: SocketIO
    async updateUser() {
        let jsonResponse: Record<string, any> = { message: "Benutzer erfolgreich bearbeitet" };

        return jsonResponse;
    }

    //TODO: SocketIO
    async addUser() {
        let jsonResponse: Record<string, any> = { message: "Benutzer wurde erfolgreich registriert" };

        return jsonResponse;
    }
}
