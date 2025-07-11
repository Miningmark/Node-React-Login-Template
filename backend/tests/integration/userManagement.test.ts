import app from "@/app";
import { ENV } from "@/config/env";
import Permission from "@/models/permission.model";
import RouteGroup from "@/models/routeGroup.model";
import User from "@/models/user.model";
import UserToken, { UserTokenType } from "@/models/userToken.model";
import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe(`GET /api/${ENV.API_VERSION}/userManagement/getUsers - returns all users with or without limit and pagination`, () => {
    let accessToken = "";
    beforeEach(async () => {
        const databaseUser = await User.create({
            username: "testGetUsers",
            password: await bcrypt.hash("testGetUsers123!", 10),
            email: "testGetUsers@testGetUsers.com",
            isActive: true
        });

        const databasePermission = await Permission.create({ name: "testGetUsersPermission" });
        const databaseRouteGroups = await RouteGroup.findAll();

        await databasePermission.setRouteGroups(databaseRouteGroups);
        await databaseUser.setPermissions([databasePermission]);

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testGetUsers",
            password: "testGetUsers123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully return all Users without limit and pagination", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/userManagement/getUsers`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Alle");
        expect(res.body.message).toContain("Benutzer");
    });

    it("should successfully return all Users with limit and pagination", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/userManagement/getUsers/1-1`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Alle");
        expect(res.body.message).toContain("Benutzer");
    });

    it("should fail because limit must be a number", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/userManagement/getUsers/a-1`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("params");
        expect(res.body.message).toContain("limit");
    });

    it("should fail because offset must be a number", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/userManagement/getUsers/1-a`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("params");
        expect(res.body.message).toContain("offset");
    });

    it("should fail because route is not valid", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/userManagement/getUsers/1-`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(404);
    });
});

describe(`GET /api/${ENV.API_VERSION}/userManagement/getAllPermissions - returns all permissions for userManagement`, () => {
    let accessToken = "";
    beforeEach(async () => {
        const databaseUser = await User.create({
            username: "getAllPermissions",
            password: await bcrypt.hash("getAllPermissions123!", 10),
            email: "getAllPermissions@getAllPermissions.com",
            isActive: true
        });

        const databasePermission = await Permission.create({ name: "getAllPermissionsPermission" });
        const databaseRouteGroups = await RouteGroup.findAll();

        await databasePermission.setRouteGroups(databaseRouteGroups);
        await databaseUser.setPermissions([databasePermission]);

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "getAllPermissions",
            password: "getAllPermissions123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully return all Permissions", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/userManagement/getAllPermissions`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Alle");
        expect(res.body.message).toContain("Permissions");
    });
});

describe(`POST /api/${ENV.API_VERSION}/userManagement/updateUserPermissions - updates permissions for an user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        const databaseUser = await User.create({
            username: "updateUserPermissions",
            password: await bcrypt.hash("updateUserPermissions123!", 10),
            email: "updateUserPermissions@updateUserPermissions.com",
            isActive: true
        });

        const databasePermission = await Permission.create({ name: "updateUserPermissionsPermission" });
        const databaseRouteGroups = await RouteGroup.findAll();

        await databasePermission.setRouteGroups(databaseRouteGroups);
        await databaseUser.setPermissions([databasePermission]);

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "updateUserPermissions",
            password: "updateUserPermissions123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully update an users permissions", async () => {
        const res = await request(app)
            .post(`/api/${ENV.API_VERSION}/userManagement/updateUserPermissions`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({
                id: 1,
                permissionIds: [1]
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Rechte");
        expect(res.body.message).toContain("bearbeitet");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUserPermissions`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing id", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUserPermissions`).set("authorization", `Bearer ${accessToken}`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("id");
    });

    it("should fail because body is missing permissionIds", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUserPermissions`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("permissionIds");
    });
    it("should fail because id is not a number", async () => {
        const res = await request(app)
            .post(`/api/${ENV.API_VERSION}/userManagement/updateUserPermissions`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({
                id: "1",
                permissionIds: [1]
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("id");
    });

    it("should fail because permissionIds is not a array", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUserPermissions`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1,
            permissionIds: "[1]"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("permissionIds");
    });

    it("should fail because name is SuperAdmin", async () => {
        const databaseUser = await User.create({
            username: "SuperAdmin",
            password: await bcrypt.hash("", 10),
            email: ""
        });

        const res = await request(app)
            .post(`/api/${ENV.API_VERSION}/userManagement/updateUserPermissions`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({
                id: databaseUser.id,
                permissionIds: [1]
            });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("bearbeitet");
    });
});

describe(`POST /api/${ENV.API_VERSION}/userManagement/updateUser - updates an user`, () => {
    let accessToken = "";
    beforeEach(async () => {
        const databaseUser = await User.create({
            username: "updateUser",
            password: await bcrypt.hash("updateUser123!", 10),
            email: "updateUser@updateUser.com",
            isActive: true
        });

        const databasePermission = await Permission.create({ name: "updateUserPermission" });
        const databaseRouteGroups = await RouteGroup.findAll();

        await databasePermission.setRouteGroups(databaseRouteGroups);
        await databaseUser.setPermissions([databasePermission]);

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "updateUser",
            password: "updateUser123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully update an user", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1,
            username: "test12345"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Benutzer");
        expect(res.body.message).toContain("bearbeitet");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing id", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("id");
    });

    it("should fail because body has no optional parameter", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("mindestens");
        expect(res.body.message).toContain("Wert");
        expect(res.body.message).toContain("geändert");
    });

    it("should fail because body id is not number", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: "1"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("id");
    });

    it("should fail because body username is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1,
            username: 456456
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because body email is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1,
            username: "test123",
            email: "test123@test123"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because body isActive is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1,
            username: "test123",
            email: "test123@test123.com",
            isActive: "true"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("isActive");
    });

    it("should fail because body isDisabled is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: 1,
            username: "test123",
            email: "test123@test123.com",
            isActive: true,
            isDisabled: "true"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("isDisabled");
    });

    it("should fail because name is SuperAdmin", async () => {
        const databaseUser = await User.create({
            username: "SuperAdmin",
            password: await bcrypt.hash("", 10),
            email: ""
        });

        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/updateUser`).set("authorization", `Bearer ${accessToken}`).send({
            id: databaseUser.id,
            username: "test123"
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("bearbeitet");
    });

    it("should fail because user is in registration process and only permission can be changed", async () => {
        const databaseUser = await User.findOne({ where: { username: "updateUser" } });

        if (databaseUser === null) throw new Error("User not found");

        databaseUser.isActive = false;
        await databaseUser.save();

        await UserToken.create({ userId: databaseUser.id, token: "123456", type: UserTokenType.USER_REGISTRATION_TOKEN, expiresAt: new Date(Date.now() + 20000) });

        const res = await request(app)
            .post(`/api/${ENV.API_VERSION}/userManagement/updateUser`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({
                id: 1,
                username: "test123",
                email: "test123@test123.com",
                isActive: true,
                isDisabled: true,
                permissionIds: [1]
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("Rechte");
        expect(res.body.message).toContain("Registrierung");
        expect(res.body.message).toContain("nicht");
    });

    it("should pass because user is in registration process but permissions can be changed", async () => {
        const databaseUser = await User.findOne({ where: { username: "updateUser" } });

        if (databaseUser === null) throw new Error("User not found");

        databaseUser.isActive = false;
        await databaseUser.save();

        await UserToken.create({ userId: databaseUser.id, token: "123456", type: UserTokenType.USER_REGISTRATION_TOKEN, expiresAt: new Date(Date.now() + 20000) });

        const res = await request(app)
            .post(`/api/${ENV.API_VERSION}/userManagement/updateUser`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({
                id: 1,
                permissionIds: [1]
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("erfolgreich");
        expect(res.body.message).toContain("bearbeitet");
    });
});

describe(`POST /api/${ENV.API_VERSION}/userManagement/addUser - adds an user over userManagement Panel`, () => {
    let accessToken = "";
    beforeEach(async () => {
        const databaseUser = await User.create({
            username: "addUser",
            password: await bcrypt.hash("addUser123!", 10),
            email: "addUser@addUser.com",
            isActive: true
        });

        const databasePermission = await Permission.create({ name: "addUserPermission" });
        const databaseRouteGroups = await RouteGroup.findAll();

        await databasePermission.setRouteGroups(databaseRouteGroups);
        await databaseUser.setPermissions([databasePermission]);

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "addUser",
            password: "addUser123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully add an user", async () => {
        const res = await request(app)
            .post(`/api/${ENV.API_VERSION}/userManagement/addUser`)
            .set("authorization", `Bearer ${accessToken}`)
            .send({
                username: "addUser1",
                email: "addUser1@addUser1.com",
                permissionIds: [1]
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Benutzer");
        expect(res.body.message).toContain("registriert");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/addUser`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing username", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/addUser`).set("authorization", `Bearer ${accessToken}`).send({});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because body is missing email", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/addUser`).set("authorization", `Bearer ${accessToken}`).send({
            username: "test123"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because body is missing permissionIds", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/userManagement/addUser`).set("authorization", `Bearer ${accessToken}`).send({
            username: "test123",
            email: "test123@test123.com"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("permissionIds");
    });
});
