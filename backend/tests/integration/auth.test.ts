import app from "@/app";
import { ENV } from "@/config/env";
import User from "@/models/user.model";
import UserToken from "@/models/userToken.model";
import bcrypt from "bcrypt";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

describe(`POST /api/${ENV.API_VERSION}/users/register - register a new User`, () => {
    it("should successfully register", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing username", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because body is missing email", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "testRegister"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because body is missing password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because username is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "superadmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "superAdmin",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username and email is already used", async () => {
        await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "testRegister",
            email: "testRegister@testRegister.com",
            password: "testRegister123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("vergeben");
    });
});

describe(`POST /api/${ENV.API_VERSION}/users/login - user login`, () => {
    beforeEach(async () => {
        await User.create({ username: "testLogin", password: await bcrypt.hash("testLogin123!", 10), email: "testLogin@testLogin.com", isActive: true });
    });

    it("should successfully login", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLogin123!"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing username", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because body is missing password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail user does not exist", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
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

        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
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

        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
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

        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("korrekt");
    });

    it("should fail because of too many faild logins and user should be deactivated", async () => {
        await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLogin123!1"
        });
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
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

describe(`POST /api/${ENV.API_VERSION}/users/accountActivation - Activate User`, () => {
    it("should successfully activate a user", async () => {
        const resRegister = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "testActivation",
            email: "testActivation@testActivation.com",
            password: "testActivation123!"
        });
        expect(resRegister.statusCode).toBe(201);

        const databaseUser = await User.findOne({ where: { username: "testActivation" } });
        if (databaseUser === null) throw new Error("Benutzer nicht gefunden");

        const databaseToken = await UserToken.findOne({ where: { userId: databaseUser.id } });
        if (databaseToken === null) throw new Error("Token nicht gefunden");

        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/accountActivation`).send({
            token: databaseToken.token
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("erfolgreich");
        expect(res.body.message).toContain("freigeschaltet");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/accountActivation`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because token is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/accountActivation`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/accountActivation`).send({
            token: "4"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/accountActivation`).send({
            token: "461854168546851658418658565615614856914698514698514685148561465865885665651465"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("token");
    });

    it("should fail because token is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/accountActivation`).send({
            token: "4618541685468516584186585656156148566848866448686156489484894869"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("ungültig");
    });

    it("should fail because token is expired", async () => {
        const resRegister = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
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

        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/accountActivation`).send({
            token: databaseToken.token
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Token");
        expect(res.body.message).toContain("abgelaufen");
    });
});

describe(`POST /api/${ENV.API_VERSION}/users/logout - Logout User`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({ username: "testLogout", password: await bcrypt.hash("testLogout123!", 10), email: "testLogout@testLogout.com", isActive: true });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogout",
            password: "testLogout123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully logout a user", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/logout`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("erfolgreich");
        expect(res.body.message).toContain("abgemeldet");
    });
});
