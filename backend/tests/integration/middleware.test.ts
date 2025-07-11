import app from "@/app";
import { ENV } from "@/config/env";
import User from "@/models/user.model";
import UserToken from "@/models/userToken.model";
import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe("MIDDLEWARE verifyAuth", () => {
    let accessToken = "";
    beforeEach(async () => {
        await User.create({
            username: "testVerifyAuth",
            password: await bcrypt.hash("testVerifyAuth123!", 10),
            email: "testVerifyAuth@testVerifyAuth.com",
            isActive: true
        });

        const resLogin = await request(app).post(`/api/${ENV.API_VERSION}/auth/login`).send({
            username: "testVerifyAuth",
            password: "testVerifyAuth123!"
        });
        expect(resLogin.statusCode).toBe(200);
        accessToken = resLogin.body.accessToken;
    });

    it("should successfully verify", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/logout`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
    });

    it("should fail because token is not in database", async () => {
        const databaseUserToken = await UserToken.findOne({ where: { token: accessToken } });
        if (databaseUserToken === null) throw new Error("token could not be found");
        await databaseUserToken.destroy();

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/logout`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("gültig");
    });

    it("should fail because token can not be verified", async () => {
        const databaseUser = await User.findOne({ where: { username: "testVerifyAuth" } });
        if (databaseUser === null) throw new Error("user could not be found");

        const databaseUserToken = await UserToken.findOne({ where: { token: accessToken } });
        if (databaseUserToken === null) throw new Error("token could not be found");

        databaseUserToken.token = databaseUserToken.token + "123";
        await databaseUserToken.save();

        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/logout`).set("authorization", `Bearer ${databaseUserToken.token}`).send();

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("verifiziert");
    });
});

describe("MIDDLEWARE 404", () => {
    it("should return 404 because route not found", async () => {
        const res = await request(app).get(`/`).send();

        expect(res.statusCode).toBe(404);
    });
});
