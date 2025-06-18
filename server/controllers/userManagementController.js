import { Models } from "./modelController.js";

const getUsers = async (req, res, next) => {
    try {
        const { offset, limit } = req.params;

        const users = await Models.User.findAll({
            include: {
                model: Models.Permission
            },
            ...(limit || offset ? { limit: Number(limit), offset: Number(offset) } : {})
        });

        const jsonResult = users.map((user) => {
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                isActive: user.isActive,
                isDisabled: user.isDisabled,
                permissions: user.Permissions?.map((permission) => ({
                    id: permission.id,
                    name: permission.name
                }))
            };
        });

        return res.status(200).json(jsonResult);
    } catch (error) {
        next(error);
    }
};

export { getUsers };
