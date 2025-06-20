import config from "../../config/config.js";
import { Models } from "../../controllers/modelController.js";

export async function serverLogger(level, message, options = {}) {
    try {
        const { userId, url, method, status, ipv4Address, userAgent, requestBody, requestHeaders, response, source, error } = options;

        if (requestBody !== undefined) {
            let { password, newPassword, currentPassword, email, newEmail, usernameOrEmail } = requestBody;
            if (password !== undefined) requestBody.password = "userPassword";
            if (newPassword !== undefined) requestBody.newPassword = "newUserPassword";
            if (currentPassword !== undefined) requestBody.currentPassword = "currentUserPassword";
            if (email !== undefined) requestBody.email = "userEmail";
            if (newEmail !== undefined) requestBody.newEmail = "newUserEmail";
            if (usernameOrEmail !== undefined) requestBody.usernameOrEmail = "usernameOrEmail";
        }

        if (config.logErrorsInsideConsole) console.error("[Logger]:", level, message, options);

        await Models.ServerLog.create({
            level: level,
            message: message,
            userId: userId,
            url: url,
            method: method,
            status: status,
            ipv4Address: ipv4Address,
            userAgent: userAgent,
            requestBody: requestBody,
            requestHeaders: requestHeaders,
            response: response,
            source: source,
            errorStack: error?.stack.split("\n").slice(1).join("\n"),
            timestamp: new Date(Date.now())
        });
    } catch (err) {
        console.error("[Logger/Database Error] :", err, level, message, options);
    }
}

export async function serverLoggerForRoutes(req, level, message, userId, status, response, source, error) {
    const options = {
        userId: userId,
        url: req.originalUrl,
        method: req.method,
        status: status,
        ipv4Address: req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.headers["remote-addr"] || req.ip,
        userAgent: req.headers["user-agent"],
        requestBody: req.body,
        requestHeaders: req.headers,
        response: response,
        source: source,
        errorStack: error
    };

    await serverLogger(level, message, options);
}
