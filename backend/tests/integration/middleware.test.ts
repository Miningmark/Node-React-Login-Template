import app from "@/app";
import { ENV } from "@/config/env";
import User from "@/models/user.model";
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

    it("should successfully logout a user", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/auth/logout`).set("authorization", `Bearer ${accessToken}`).send();

        expect(res.statusCode).toBe(200);
    });
});
