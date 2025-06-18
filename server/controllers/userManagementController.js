import { Op } from "sequelize";
import { ValidationError } from "../errors/errorClasses.js";
import { validateEmail, validateUsername } from "../utils/accountUtils.js";
import { Models, sequelize } from "./modelController.js";
import config from "../config/config.js";

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
            users: users.map((user) => {
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
            return res.status(200).json({ permissions: {} });
        }

        const jsonResult = {
            permissions: permissions.map((permission) => {
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

export async function updateUser(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { id, username, email, isActive, isDisabled, permissionIds } = req.body || {};

        if (id === undefined) throw new ValidationError("Die ID des zu bearbeitenden Benutzers muss mitgegeben werden");

        const user = await Models.User.findOne({ where: { id: id } }, { transaction: transaction });
        if (user === null) throw new ValidationError("Es existiert kein Benutzer mit dieser ID");

        if (username === undefined && email === undefined && isActive === undefined && isDisabled === undefined && permissionIds === undefined)
            throw new ValidationError("Es muss mindestens ein Wert geändert werden");

        if (username !== undefined) {
            await validateUsername(username);

            const refreshUserToken = await Models.UserToken.findOne({ where: { userId: user.id, type: "refreshToken" } }, { transaction: transaction });
            const accessUserToken = await Models.UserToken.findOne({ where: { userId: user.id, type: "accessToken" } }, { transaction: transaction });

            if (refreshUserToken !== null) await refreshUserToken.destroy();
            if (accessUserToken !== null) await accessUserToken.destroy();

            user.username = username;
        }

        if (email !== undefined) {
            await validateEmail(email);
            user.email = email;
        }

        if (isActive !== undefined) {
            if (typeof isActive !== "boolean") throw new ValidationError("Falscher Typ für isActive");
            user.isActive = isActive;
        }

        if (isDisabled !== undefined) {
            if (typeof isDisabled !== "boolean") throw new ValidationError("Falscher Typ für isDisabled");
            user.isDisabled = isDisabled;
        }

        if (permissionIds !== undefined) {
            if (!Array.isArray(permissionIds)) throw new ValidationError("Falscher Typ für Rechte");
            const newPermissions = await Models.Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
            await user.setPermissions(newPermissions);
        }

        await user.save({ transaction: transaction });
        await transaction.commit();

        return res.status(200).json({ message: "Benutzer erfolgreich bearbeitet" });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function addUser(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { username, email } = req.body || {};

        if (username === undefined || email === undefined) throw new ValidationError("Benutzername und Email erforderlich");

        await validateUsername(username);
        await validateEmail(email);

        const hashedPassword = await bcrypt.hash(config.passwordAccountCreatedByAdmin, 10);
        const user = await Models.User.create({ username: username, email: email, password: hashedPassword });

        const token = await generateUserToken(transaction, user.id, "registrationByAdmin", config.accountCreatedByAdminExpiresIn);
        await sendRegistrationEmail(user.email, token);

        await transaction.commit();
        return res.status(201).json({ message: "Benutzer wurde erfolgreich registriert" });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}

export async function updatePermissions(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
        const { id, permissionIds } = req.body || {};

        if (id === undefined) throw new ValidationError("Die ID des zu bearbeitenden Benutzers muss mitgegeben werden");
        if (permissionIds === undefined) throw new ValidationError("Die Rechte des zu bearbeitenden Benutzers muss mitgegeben werden");

        if (!Array.isArray(permissionIds)) throw new ValidationError("Falscher Typ für Rechte");

        const user = await Models.User.findOne({ where: { id: id } }, { transaction: transaction });

        const newPermissions = await Models.Permission.findAll({ where: { id: { [Op.in]: permissionIds } } });
        await user.setPermissions(newPermissions);

        return res.status(200).json({ message: "Rechten erfolgreich bearbeitet" });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}
