import app from "@/app";
import { ENV } from "@/config/env";
import User from "@/models/user.model";
import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe(`POST /api/${ENV.API_VERSION}/user/updateUsername - updates username for an user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testUpdateU",
            password: await bcrypt.hash("testUpdateU123!", 10),
            email: "testUpdateU@testUpdateU.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testUpdateU",
            password: "testUpdateU123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully update an username", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "testUpdateU1"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Benutzername");
        expect(res.body.message).toContain("geändert");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing newUsername", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "12"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "12453456453544534"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "124534564`"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t be SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "SuperAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "superadmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t be superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "superAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "SuperAdmin12345"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "superadmin12345"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "superAdmin12345"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "12345SuperAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "12345superadmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because newUsername can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "12345superAdmin"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newUsername");
    });

    it("should fail because can`t be the same as before", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "testUpdateU"
        });
        expect(res.statusCode).toBe(409);
        expect(res.body.message).toContain("Benutzername");
        expect(res.body.message).toContain("selbe");
    });

    it("should fail because username already in use", async () => {
        await User.create({
            username: "testUpdateU2",
            password: await bcrypt.hash("testUpdateU123!", 10),
            email: "testUpdateU2@testUpdateU2.com",
            isActive: true
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateUsername`).set("authorization", `Bearer ${accessToken}`).send({
            newUsername: "testUpdateU2"
        });

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toContain("Benutzer");
        expect(res.body.message).toContain("vergeben");
    });
});

describe(`POST /api/${ENV.API_VERSION}/user/updateEmail - updates email for an user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testUpdateEmail",
            password: await bcrypt.hash("testUpdateEmail123!", 10),
            email: "testUpdateEmail@testUpdateEmail.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testUpdateEmail",
            password: "testUpdateEmail123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully update an email", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "testUpdateEmail123@testUpdateEmail.com"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Email");
        expect(res.body.message).toContain("geändert");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing newEmail", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because newEmail is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "testUpdateEmail123@testUpdateEmail"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t be SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "SuperAdmin@SuperAdmin.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "superadmin@superadmin.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t be superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "superAdmin@superAdmin.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "SuperAdmin12345@SuperAdmin12345.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "superadmin12345@superadmin12345.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "superAdmin12345@superAdmin12345.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t contain SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "12345SuperAdmin@12345SuperAdmin.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t contain superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "12345superadmin@12345superadmin.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because email can`t contain superAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "12345superAdmin@12345superAdmin.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newEmail");
    });

    it("should fail because can`t be the same as before", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "testUpdateEmail@testUpdateEmail.com"
        });
        expect(res.statusCode).toBe(409);
        expect(res.body.message).toContain("Email");
        expect(res.body.message).toContain("selbe");
    });

    it("should fail because email already in use", async () => {
        await User.create({
            username: "testUpdateEmail2",
            password: await bcrypt.hash("testUpdateEmail123!", 10),
            email: "testUpdateEmail2@testUpdateEmail2.com",
            isActive: true
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updateEmail`).set("authorization", `Bearer ${accessToken}`).send({
            newEmail: "testUpdateEmail2@testUpdateEmail2.com"
        });

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toContain("Email");
        expect(res.body.message).toContain("vergeben");
    });
});

describe(`POST /api/${ENV.API_VERSION}/user/updatePassword - updates password for an user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testUpdatePassword",
            password: await bcrypt.hash("testUpdatePassword123!", 10),
            email: "testUpdatePassword@testUpdatePassword.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testUpdatePassword",
            password: "testUpdatePassword123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully update an password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testUpdatePassword123!",
            newPassword: "testUpdatePassword1234!"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("geändert");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing currentPassword", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("currentPassword");
    });

    it("should fail because body is missing newPassword", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testUpdatePassword123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because newPassword is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testUpdatePassword123!",
            newPassword: "t"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because newPassword is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testUpdatePassword123!",
            newPassword: "testUpdatePassword1234!5165816566165616846846"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because newPassword contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testUpdatePassword123!",
            newPassword: "testUpdatePassword1234!`"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because currentPassword is not matching", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testUpdatePassword1235!",
            newPassword: "testUpdatePassword1234!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Passwörter");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("überein");
    });

    it("should fail because currentPassword and newPassword can`t be the same", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/user/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testUpdatePassword123!",
            newPassword: "testUpdatePassword123!"
        });
        expect(res.statusCode).toBe(409);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("alten");
    });
});

describe(`GET /api/${ENV.API_VERSION}/user/getUsername - return username for an user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testGetUsername",
            password: await bcrypt.hash("testGetUsername123!", 10),
            email: "testGetUsername@testGetUsername.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testGetUsername",
            password: "testGetUsername123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully return username", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/user/getUsername`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.username).toContain("TestGetUsername");
    });
});

describe(`GET /api/${ENV.API_VERSION}/user/getRouteGroups - returns all RouteGroups for an user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testGetRouteGroups",
            password: await bcrypt.hash("testGetRouteGroups123!", 10),
            email: "testGetRouteGroups@testGetRouteGroups.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testGetRouteGroups",
            password: "testGetRouteGroups123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully return all route groups a user have", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/user/getRouteGroups`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.routeGroups).toBeDefined();
    });
});

describe(`GET /api/${ENV.API_VERSION}/user/getLastLogins - returns the last 5 logins`, () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testGetLastLogins",
            password: await bcrypt.hash("testGetLastLogins123!", 10),
            email: "testGetLastLogins@testGetLastLogins.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testGetLastLogins",
            password: "testGetLastLogins123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully return last 5 logins", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/user/getLastLogins`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.lastLogins).toBeDefined();
    });
});
