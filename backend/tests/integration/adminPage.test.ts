import app from "@/app";
import { ENV } from "@/config/env";
import Permission from "@/models/permission.model";
import RouteGroup from "@/models/routeGroup.model";
import User from "@/models/user.model";
import UserToken, { UserTokenType } from "@/models/userToken.model";
import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe(`GET /api/${ENV.API_VERSION}/adminPage/getServerLogs - returns all ServerLogs with or without limit and pagination`, () => {
    let accessToken = "";
    beforeEach(async () => {
        const databaseUser = await User.create({
            username: "testGetServerLogs",
            password: await bcrypt.hash("testGetServerLogs123!", 10),
            email: "testGetServerLogs@testGetServerLogs.com",
            isActive: true
        });

        const databasePermission = await Permission.create({ name: "testGetServerLogsPermission" });
        const databaseRouteGroups = await RouteGroup.findAll();

        await databasePermission.setRouteGroups(databaseRouteGroups);
        await databaseUser.setPermissions([databasePermission]);

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testGetServerLogs",
            password: "testGetServerLogs123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully return all ServerLogs without limit and pagination", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/adminPage/getServerLogs`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Alle");
        expect(res.body.message).toContain("ServerLogs");
    });

    it("should successfully return all ServerLogs with limit and pagination", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/adminPage/getServerLogs/1-1`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Alle");
        expect(res.body.message).toContain("ServerLogs");
    });

    it("should fail because limit must be a number", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/adminPage/getServerLogs/a-1`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("params");
        expect(res.body.message).toContain("limit");
    });

    it("should fail because offset must be a number", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/adminPage/getServerLogs/1-a`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("params");
        expect(res.body.message).toContain("offset");
    });

    it("should fail because route is not valid", async () => {
        const res = await request(app).get(`/api/${ENV.API_VERSION}/adminPage/getServerLogs/1-`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(404);
    });
});
