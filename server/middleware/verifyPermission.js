import { Op } from "sequelize";
import { Models } from "../controllers/modelController.js";
import { UnauthorizedError } from "../errors/errorClasses.js";

export default (groupName) => {
    return async (req, res, next) => {
        try {
            const { username } = req;
            if (!username) throw new UnauthorizedError("Keine Berechtigung diese Route aufzurufen");

            const route = await Models.RouteGroup.findOne({
                where: { name: groupName, permissionId: { [Op.ne]: null } },
                include: {
                    model: Models.Permission,
                    required: true,
                    include: {
                        model: Models.User,
                        required: true,
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
