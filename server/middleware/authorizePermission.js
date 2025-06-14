import { Models } from "../controllers/modelController.js";

export default function authorizePermission(requiredUserPermission) {
    return async function (req, res, next) {
        try {
            const { username } = req;
            if (!username) return res.status(401).json({ message: "AccessToken hat keinen Username enthalten" });

            const foundUser = await Models.User.findOne({ where: { username: username } });
            const userRoles = await foundUser.getRoles({ include: [Models.Permission] });

            const allUserPermissions = userRoles.flatMap((role) => role.Permissions.map((p) => p.name));

            if (!allUserPermissions.includes(requiredUserPermission)) {
                return res.status(403).json({ message: "Nicht genug Rechte" });
            }

            next();
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
        }
    };
}
