import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { Models } from "../modelController.js";
import { sendMail } from "../../mail/mailer.js";
import generateUUID from "../../uuid/generateUUID.js";

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9-]{5,15}$/;
const EMAIL_REGEX = /^(?=^.{0,36}$)[\w-.]+@([\w-]+.)+[\w-]{2,4}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,24}$/;

const register = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: "Alle Eingaben erforderlich" });
        }

        if (!USERNAME_REGEX.test(username) || !EMAIL_REGEX.test(email) || !PASSWORD_REGEX.test(password)) {
            return res.status(401).json({ message: "Eingaben entsprechen nicht den Anforderungen!" });
        }

        const duplicateUsername = await Models.User.findOne({ where: { username } });
        const duplicateEmail = await Models.User.findOne({ where: { email } });

        if (duplicateUsername) {
            return res.status(409).json({ message: "Nutzername bereits vergeben!", reason: "username" });
        }

        if (duplicateEmail) {
            return res.status(409).json({ message: "Email bereits registriert!", reason: "email" });
        }

        //TODO: should do it with an transaction if Role could not beeing added
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Models.User.create({ username, email, password: hashedPassword });
        const role = await Models.Role.findOne({ where: { name: "User" } });

        await user.addRole(role);

        const token = generateUUID();
        const expiresAt = new Date(Date.now() + parseInt(process.env.REGISTER_TOKEN_EXPIRE_AT) * 1000);

        await Models.UserToken.create({ userId: user.id, token, type: "registration", expiresAt });
        sendMail(
            email,
            "Abschluss deiner Registrierung",
            "Unter dem nachfolgenden Link kannst du deine Registrierung auf " +
                process.env.FRONTEND_WEBADRESS +
                " abschließen: " +
                process.env.FRONTEND_WEBADRESS_REGISTER_TOKEN +
                token
        );

        return res.status(201).json({ message: "Nutzer wurde erfolgreich registriert" });
    } catch (err) {
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

const accountActivation = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token nicht vorhanden" });
        }

        const userToken = await Models.UserToken.findOne({
            where: {
                token,
                type: "registration"
            },
            include: Models.User
        });

        if (!userToken) {
            return res.status(400).json({ message: "Token nicht vorhanden" });
        }

        if (new Date(Date.now()) > userToken.expiresAt) {
            await userToken.User.destroy();
            return res.status(400).json({ message: "Token abgelaufen, bitte neu registrieren", redirect: "/register" });
        }

        userToken.User.isActive = true;
        await userToken.User.save();

        await userToken.destroy();

        return res.status(201).json({ message: "Nutzer erfolgreich freigeschaltet!" });
    } catch (err) {
        return res.status(500).json({ message: "Interner Serverfehler, bitte Admin kontaktieren" });
    }
};

export { register, accountActivation };
