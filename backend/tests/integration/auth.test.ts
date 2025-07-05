import app from "@/app";
import { ENV } from "@/config/env";
import User from "@/models/user.model";
import UserToken, { UserTokenType } from "@/models/userToken.model";
import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import crypto from "crypto";

describe(`POST /api/${ENV.API_VERSION}/auth/register - register a new user`, () => {
    it("should successfully register", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing username", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because body is missing email", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because body is missing password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because username is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "12",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister156615616165165161561665165165",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister$",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because email is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because password is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "t"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because password is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!5165816566165616846846"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because password contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!`"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because username can`t be SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "SuperAdmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "superadmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t be superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "superAdmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "SuperAdmin12345",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "superadmin12345",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "superAdmin12345",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "12345SuperAdmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "12345superadmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "12345superAdmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because email can`t be SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "SuperAdmin@SuperAdmin.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "superadmin@superadmin.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t be superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "superAdmin@superAdmin.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "SuperAdmin12345@SuperAdmin12345.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "superadmin12345@superadmin12345.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "superAdmin12345@superAdmin12345.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "12345SuperAdmin@12345SuperAdmin.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "12345superadmin@12345superadmin.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because email can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "12345superAdmin@12345superAdmin.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because username and email is already used", async () => {
        await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("vergeben");
    });
});

describe(`POST /api/${ENV.API_VERSION}/auth/login - login a user`, () => {
    beforeEach(async () => {
        await User.create({ username: "testLogin", password: await bcrypt.hash("testLogin123!", 10), email: "testLogin@testLogin.com", isActive: true });
    });

    it("should successfully login", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing username", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because body is missing password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail user does not exist", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin1",
            password: "testLogin123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("vorhanden");
    });

    it("should fail user is deactivated", async () => {
        const user = await User.findOne({ where: { username: "testLogin" } });
        if (user === null) throw new Error();
        user.isDisabled = true;
        user.save();

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!"
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("gesperrt");
    });

    it("should fail user is deactivated", async () => {
        const user = await User.findOne({ where: { username: "testLogin" } });
        if (user === null) throw new Error();
        user.isDisabled = false;
        user.isActive = false;
        user.save();

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!"
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("aktiviert");
    });

    it("should fail because passwords not matching", async () => {
        const user = await User.findOne({ where: { username: "testLogin" } });
        if (user === null) throw new Error();
        user.isActive = true;
        user.save();

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("korrekt");
    });

    it("should fail because of too many faild logins and user should be deactivated", async () => {
        await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("zuvieler");
        expect(res.body.message).toContain("deaktiviert");

        const user = await User.findOne({ where: { username: "testLogin" } });
        if (user === null) throw new Error("Benutzer nicht gefunden");

        expect(user.isActive).toBe(false);
    });
});

describe(`POST /api/${ENV.API_VERSION}/auth/accountActivation - activate a user`, () => {
    it("should successfully activate a user", async () => {
        const resRegister = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testActivation",
            email: "testActivation@testActivation.com",
            password: "testActivation123!"
        });
        expect(resRegister.statusCode).toBe(201);

        const databaseUser = await User.findOne({ where: { username: "testActivation" } });
        if (databaseUser === null) throw new Error("Benutzer nicht gefunden");

        const databaseToken = await UserToken.findOne({ where: { userId: databaseUser.id } });
        if (databaseToken === null) throw new Error("Token nicht gefunden");

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/accountActivation`).send({
            token: databaseToken.token
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("erfolgreich");
        expect(res.body.message).toContain("freigeschaltet");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/accountActivation`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because token is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/accountActivation`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/accountActivation`).send({
            token: "4"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/accountActivation`).send({
            token: "461854168546851658418658565615614856914698514698514685148561465865885665651465"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/accountActivation`).send({
            token: "4618541685468516584186585656156148566848866448686156489484894869"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("ungültig");
    });

    it("should fail because token is expired", async () => {
        const resRegister = await request(app).post(`/api/${ENV.API_VERSION}/auth/register`).send({
            username: "testActivation",
            email: "testActivation@testActivation.com",
            password: "testActivation123!"
        });
        expect(resRegister.statusCode).toBe(201);

        const databaseUser = await User.findOne({ where: { username: "testActivation" } });
        if (databaseUser === null) throw new Error("Benutzer nicht gefunden");

        const databaseToken = await UserToken.findOne({ where: { userId: databaseUser.id } });
        if (databaseToken === null) throw new Error("Token nicht gefunden");
        databaseToken.expiresAt = new Date(Date.now() - 2000);
        await databaseToken.save();

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/accountActivation`).send({
            token: databaseToken.token
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("abgelaufen");
    });
});

describe(`POST /api/${ENV.API_VERSION}/auth/logout -logout a user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({ username: "testLogout", password: await bcrypt.hash("testLogout123!", 10), email: "testLogout@testLogout.com", isActive: true });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testLogout",
            password: "testLogout123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully logout a user", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/logout`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("erfolgreich");
        expect(res.body.message).toContain("abgemeldet");
    });
});

describe(`GET /api/${ENV.API_VERSION}/auth/refreshAccessToken - Refresh Access Token`, () => {
    let refreshToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testRefreshAccessToken",
            password: await bcrypt.hash("testRefreshAccessToken123!", 10),
            email: "testRefreshAccessToken@testRefreshAccessToken.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testRefreshAccessToken",
            password: "testRefreshAccessToken123!"
        });
        expect(resLogin.statusCode).toBe(200);
        expect(resLogin.headers["set-cookie"][0]).toContain("refreshToken=");
        refreshToken = resLogin.headers["set-cookie"][0];
    });

    it("should successfully refresh an accessToken", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/auth/refreshAccessToken`).set("Cookie", refreshToken).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("erneuert");
    });

    it("should fail because no Cookie set", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/auth/refreshAccessToken`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige");
        expect(res.body.message).toContain("headers");
        expect(res.body.message).toContain("cookie");
    });

    it("should fail because Cookie is invalid", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/auth/refreshAccessToken`).set("Cookie", "").send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Kein");
        expect(res.body.message).toContain("vorhanden");
        expect(res.body.message).toContain("headers");
        expect(res.body.message).toContain("cookie");
    });

    it("should fail because Cookie is not in database", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/auth/refreshAccessToken`).set("Cookie", "refreshToken=123").send();

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("vorhanden");
        expect(res.body.message).toContain("neuanmelden");
    });

    it("should fail because token can not be decoded", async () => {
        const databaseUser = await User.findOne({ where: { username: "testRefreshAccessToken" } });
        if (databaseUser === null) throw new Error("User nicht vorhanden");

        const databaseRefreshToken = await UserToken.findOne({ where: { userId: databaseUser.id, type: UserTokenType.REFRESH_TOKEN } });
        if (databaseRefreshToken === null) throw new Error("Token nicht vorhanden");

        databaseRefreshToken.token = "123";
        await databaseRefreshToken.save();

        const res = await request(app).get(`/api/${ENV.API_VERSION}/auth/refreshAccessToken`).set("Cookie", "refreshToken=123").send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("verifiziert");
    });
});

describe(`GET /api/${ENV.API_VERSION}/auth/requestPasswordReset - request an email for password reseting`, () => {
    beforeEach(async () => {
        await User.create({
            username: "testRequestPasswordReset",
            password: await bcrypt.hash("testRequestPasswordReset123!", 10),
            email: "testRequestPasswordReset@testRequestPasswordReset.com",
            isActive: true
        });
    });

    it("should successfully request an email for passwordReset with username", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "testRequestPasswordReset"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Email");
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should successfully request an email for passwordReset with email", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "testRequestPasswordReset@testRequestPasswordReset.com"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Email");
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing username or email", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t be SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "SuperAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "superadmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t be superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "superAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "SuperAdmin12345"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "superadmin12345"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "superAdmin12345"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "12345SuperAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "12345superadmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because username can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "12345superAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("usernameOrEmail");
    });

    it("should fail because user does not exist", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "testRequestPasswordReset1"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("existiert");
        expect(res.body.message).toContain("kein");
        expect(res.body.message).toContain("Benutzer");
    });

    it("should fail because user is deactivated", async () => {
        const databaseUser = await User.findOne({ where: { username: "testRequestPasswordReset" } });

        if (databaseUser === null) throw new Error("Benutzer existiert nicht");
        databaseUser.isDisabled = true;
        await databaseUser.save();

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/requestPasswordReset`).send({
            usernameOrEmail: "testRequestPasswordReset"
        });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("Benutzer");
        expect(res.body.message).toContain("gesperrt");
    });
});
describe(`GET /api/${ENV.API_VERSION}/auth/handlePasswordRecovery - handle passwordReset, accountActivation & Reactivation`, () => {
    let userId = 0;
    let userPassword = crypto.randomBytes(10).toString("hex") + "A0!";
    beforeEach(async () => {
        const databaseUser = await User.create({
            username: "testHandlePasswordRecovery",
            password: await bcrypt.hash(userPassword, 10),
            email: "testHandlePasswordRecovery@testHandlePasswordRecovery.com"
        });
        if (databaseUser === null) throw new Error("Benutzer nicht gefunden");
        userId = databaseUser.id;
    });

    it("should successfully complete an registration from an admin", async () => {
        const databaseUserToken = await UserToken.create({
            type: UserTokenType.ADMIN_REGISTRATION_TOKEN,
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            userId: userId,
            expiresAt: new Date(Date.now() + 2000)
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: databaseUserToken.token,
            password: "testHandlePR123!"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should successfully complete an reactivation after too many failed logins", async () => {
        const databaseUserToken = await UserToken.create({
            type: UserTokenType.ACCOUNT_REACTIVATION_TOKEN,
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            userId: userId,
            expiresAt: null
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: databaseUserToken.token,
            password: "testHandlePR123!"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should successfully complete an password reset action", async () => {
        const databaseUserToken = await UserToken.create({
            type: UserTokenType.PASSWORD_RESET_TOKEN,
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            userId: userId,
            expiresAt: new Date(Date.now() + 2000)
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: databaseUserToken.token,
            password: "testHandlePR123!"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should fail because token does not exists", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            password: "testHandlePR123!"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("vorhanden");
        expect(res.body.message).toContain("abgelaufen");
    });

    it("should fail because token to complete admin registration is expired", async () => {
        const databaseUserToken = await UserToken.create({
            type: UserTokenType.ADMIN_REGISTRATION_TOKEN,
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            userId: userId,
            expiresAt: new Date(Date.now() - 2000)
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: databaseUserToken.token,
            password: "testHandlePR123!"
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Zeit");
        expect(res.body.message).toContain("abgelaufen");
        expect(res.body.message).toContain("Admin");
    });

    it("should fail because token for password reset is expired", async () => {
        const databaseUserToken = await UserToken.create({
            type: UserTokenType.PASSWORD_RESET_TOKEN,
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            userId: userId,
            expiresAt: new Date(Date.now() - 2000)
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: databaseUserToken.token,
            password: "testHandlePR123!"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zeit");
        expect(res.body.message).toContain("abgelaufen");
        expect(res.body.message).toContain("Email");
    });

    it("should fail because password is the same as before", async () => {
        const databaseUserToken = await UserToken.create({
            type: UserTokenType.PASSWORD_RESET_TOKEN,
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            userId: userId,
            expiresAt: new Date(Date.now() + 2000)
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: databaseUserToken.token,
            password: userPassword
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("gleich");
        expect(res.body.message).toContain("alten");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing token", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: "4"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: "461854168546851658418658565615614856914698514698514685148561465865885665651465"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because body is missing password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: "4618541685468516584186585656156148566848866448686156489484894869"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because password is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            password: "t"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because password is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            password: "testRegister123!5165816566165616846846"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because password contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/handlePasswordRecovery`).send({
            token: "4618541685468516584186585656156148566848866448686156489484894869",
            password: "testRegister123!`"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });
});
