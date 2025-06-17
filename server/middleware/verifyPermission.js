import { Op } from "sequelize";
import { Models } from "../controllers/modelController.js";
import { UnauthorizedError } from "../errors/errorClasses.js";

export default (method, path) => {
    return async (req, res, next) => {
        try {
            const { username } = req;
            if (!username) throw new UnauthorizedError("Keine Berechtigung diese Route aufzurufen");

            const route = await Models.Route.findOne({
                where: { path: path, method: method, permissionId: { [Op.ne]: null } },
                include: {
                    model: Models.Permission,
                    include: {
                        model: Models.User,
                        where: { username: username }
                    }
                }
            });

            if (!route) throw new UnauthorizedError("Keine Berechtigung diese Route aufzurufen");

            next();
        } catch (error) {
            next(error);
        }
    };
};
