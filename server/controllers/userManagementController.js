import { ConflictError, ValidationError } from "../errors/errorClasses.js";
import { Models, sequelize } from "./modelController.js";

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{5,15}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const getUsers = async (req, res, next) => {
    try {
        const { offset, limit } = req.params;

        const users = await Models.User.findAll({
            include: {
                model: Models.Permission
            },
            ...(limit || offset ? { limit: Number(limit), offset: Number(offset) } : {})
        });

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
};

const getAllPermissions = async (req, res, next) => {
    try {
        const permissions = await Models.Permission.findAll();

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
};

const updateUsers = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id, username, email, isActive, isDisabled } = req.body || {};

        if (id === undefined) throw new ValidationError("Die ID des zu bearbeitenden Benutzers muss mitgegeben werden");

        const user = await Models.User.findOne({ where: { id: id } }, { transaction: transaction });
        if (user === undefined) throw new ValidationError("Es existiert kein Benutzer mit dieser ID");

        if (username === undefined && email === undefined && isActive === undefined && isDisabled === undefined) throw new ValidationError("Es muss mindestens ein Wert geändert werden");

        if (username) {
            if (!USERNAME_REGEX.test(username)) throw new ValidationError("Benutzername entsprechen nicht den Anforderungen");
            const duplicateUsername = await Models.User.findOne({ where: { username: username } }, { transaction: transaction });

            if (duplicateUsername) throw new ConflictError("Benutzername bereits vergeben!");
            user.username = username;
        }

        if (email) {
            if (!EMAIL_REGEX.test(email)) throw new ValidationError("Email entspricht nicht den Anforderungen");
            const duplicateEmail = await Models.User.findOne({ where: { email: email } }, { transaction: transaction });

            if (duplicateEmail) throw new ConflictError("Email bereits vergeben!");
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
};

export { getUsers, getAllPermissions, updateUsers };
