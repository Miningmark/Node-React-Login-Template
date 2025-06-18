import { ValidationError } from "../errors/errorClasses.js";
import { validateEmail, validateUsername } from "../utils/accountUtils.js";
import { Models, sequelize } from "./modelController.js";

export async function getUsers(req, res, next) {
    try {
        const { offset, limit } = req.params || {};

        const users = await Models.User.findAll({
            include: {
                model: Models.Permission
            },
            ...(limit || offset ? { limit: Number(limit), offset: Number(offset) } : {})
        });

        if (users === null) {
            return res.status(200).json({ Users: {} });
        }

        const jsonResult = {
            Users: users.map((user) => {
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
            })
        };

        return res.status(200).json(jsonResult);
    } catch (error) {
        next(error);
    }
}

export async function getAllPermissions(req, res, next) {
    try {
        const permissions = await Models.Permission.findAll();

        if (permissions === null) {
            return res.status(200).json({ Permissions: {} });
        }

        const jsonResult = {
            Permissions: permissions.map((permission) => {
                return {
                    id: permission.id,
                    name: permission.name,
                    description: permission.description
                };
            })
        };

        return res.status(200).json(jsonResult);
    } catch (error) {
        next(error);
    }
}

export async function updateUsers(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { id, username, email, isActive, isDisabled } = req.body || {};

        if (id === undefined) throw new ValidationError("Die ID des zu bearbeitenden Benutzers muss mitgegeben werden");

        const user = await Models.User.findOne({ where: { id: id } }, { transaction: transaction });
        if (user === null) throw new ValidationError("Es existiert kein Benutzer mit dieser ID");

        if (username === undefined && email === undefined && isActive === undefined && isDisabled === undefined) throw new ValidationError("Es muss mindestens ein Wert geändert werden");

        if (username) {
            validateUsername(username);

            const refreshUserToken = await Models.UserToken.findOne({ where: { userId: user.id, type: "refreshToken" } }, { transaction: transaction });
            const accessUserToken = await Models.UserToken.findOne({ where: { userId: user.id, type: "accessToken" } }, { transaction: transaction });

            if (refreshUserToken !== null) await refreshUserToken.destroy();
            if (accessUserToken !== null) await accessUserToken.destroy();

            user.username = username;
        }

        if (email) {
            validateEmail(email);
            user.email = email;
        }

        if (isActive) {
            if (typeof isActive !== "boolean") throw new ValidationError("isActive darf nur vom type boolean sein");
            user.isActive = isActive;
        }

        if (isDisabled) {
            if (typeof isDisabled !== "boolean") throw new ValidationError("isDisabled darf nur vom type boolean sein");
            user.isDisabled = isDisabled;
        }

        await user.save({ transaction: transaction });
        await transaction.commit();

        return res.status(200).json({ message: "Nutzer erfolgreich bearbeitet" });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}
