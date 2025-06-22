import jsonwebtoken from "jsonwebtoken";
import { Models } from "../../controllers/modelController.js";
import { ConflictError, ValidationError } from "../../errors/errorClasses.js";
import { generateUUID, EMAIL_REGEX, USERNAME_REGEX, PASSWORD_REGEX, IPV4_REGEX } from "../utils.js";
import { sendAccountLocking, sendSuspiciousLogin } from "../../mail/Account/accountMails.js";
import { serverLogger } from "../ServerLog/serverLogger.js";

export async function validateEmail(email) {
    if (!EMAIL_REGEX.test(email)) throw new ValidationError("Email entspricht nicht den Anforderungen");

    const duplicateEmail = await Models.User.findOne({ where: { email: email } });
    if (duplicateEmail) throw new ConflictError("Email bereits vergeben!");
}

export async function validateUsername(username) {
    if (!USERNAME_REGEX.test(username)) throw new ValidationError("Benutzername entspricht nicht den Anforderungen");

    if (username.toLowerCase() === "SuperAdmin".toLowerCase()) throw new ConflictError("Benutzername kann nicht SuperAdmin sein!");

    const duplicateUsername = await Models.User.findOne({ where: { username: username } });
    if (duplicateUsername) throw new ConflictError("Benutzername bereits vergeben!");
}

export async function validatePassword(password) {
    if (!PASSWORD_REGEX.test(password)) throw new ValidationError("Passwort entspricht nicht den Anforderungen");
}

export async function generateUserToken(transaction, userId, type, expiresIn) {
    const token = generateUUID();

    let expiresAt = null;
    if (expiresIn !== null) expiresAt = new Date(Date.now() + expiresIn * 1000);

    await Models.UserToken.create(
        {
            userId: userId,
            token: token,
            type: type,
            expiresAt
        },
        { transaction: transaction }
    );
    return token;
}

export function generateJWT(userId, username, userRouteGroups, secret, expiresIn) {
    return jsonwebtoken.sign(
        {
            UserInfo: {
                id: userId,
                username: username,
                routeGroups: userRouteGroups
            }
        },
        secret,
        { expiresIn: expiresIn }
    );
}

export async function findRouteGroups(userId) {
    const routeGroupsArray = [];

    const userWithPermissions = await Models.User.findOne({
        where: { id: userId },
        include: {
            model: Models.Permission,
            include: {
                model: Models.RouteGroup
            }
        }
    });

    userWithPermissions.Permissions.flatMap((permission) => {
        permission.RouteGroups.map((group) => {
            routeGroupsArray.push(group.name);
        });
    });

    return routeGroupsArray;
}

export async function addLastLogin(req, userId, successfully) {
    const ipv4Address = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.headers["remote-addr"] || req.ip;
    const userAgent = req.headers["user-agent"];

    let jsonLastLogin = {};

    jsonLastLogin.userId = userId;
    jsonLastLogin.userAgent = userAgent ? userAgent : "Nicht vorhanden";
    jsonLastLogin.loginAt = new Date(Date.now());
    jsonLastLogin.successfully = successfully;

    if (!ipv4Address || !IPV4_REGEX.test(ipv4Address)) {
        jsonLastLogin.ipv4Address = "Ungültig: " + ipv4Address;
        jsonLastLogin.country = "Ungültige IP Adresse";
        jsonLastLogin.regionName = "Ungültige IP Adresse";
    } else {
        jsonLastLogin.ipv4Address = ipv4Address;
        const ipLookupResponse = await fetch(`http://ip-api.com/json/${ipv4Address}`);
        const ipLookupData = await ipLookupResponse.json();

        if (ipLookupData?.status === "success") {
            jsonLastLogin.country = ipLookupData.country;
            jsonLastLogin.regionName = ipLookupData.regionName;
        } else {
            jsonLastLogin.country = "IP Lookup nicht erfolgreich";
            jsonLastLogin.regionName = "IP Lookup nicht erfolgreich";
        }
    }
    await serverLogger("INFO", "Neuer Eintrag in LastLogins erstellt", {
        userId: userId,
        source: "accountUtils"
    });
    await Models.LastLogin.create(jsonLastLogin);
}

export async function checkLastLogins(userId) {
    let countUnsuccessfullyLogins = 0;

    const foundUser = await Models.User.findOne({
        where: { id: userId },
        include: { model: Models.LastLogin, limit: 5, order: [["loginAt", "DESC"]] }
    });

    foundUser.LastLogins.forEach((lastLogin) => {
        if (!lastLogin.successfully) countUnsuccessfullyLogins++;
    });

    if (countUnsuccessfullyLogins === 5) {
        foundUser.isActive = false;
        await foundUser.save();

        const userToken = generateUserToken(null, userId, "accountReactivation", null);

        await serverLogger("INFO", "Benutzer wegen zuvieler falscher Login versuche deaktiviert", {
            userId: foundUser.id,
            source: "accountUtils"
        });
        sendAccountLocking(foundUser.email, userToken);
    }
}

export async function checkChangedLocationAndRegion(userId) {
    const foundUser = await Models.User.findOne({
        where: { id: userId },
        include: { model: Models.LastLogin, limit: 2, order: [["loginAt", "DESC"]] }
    });

    if (foundUser.LastLogins.length !== 2) return;

    const recentLogin = foundUser.LastLogins[0];
    const lastLogin = foundUser.LastLogins[1];

    if (recentLogin.country !== lastLogin.country || recentLogin.region !== lastLogin.region) {
        await serverLogger("INFO", "User benachrichtigt wegen verdächtigen Login verhalten", {
            userId: foundUser.id,
            source: "accountUtils"
        });
        sendSuspiciousLogin(email, recentLogin);
    }
}
