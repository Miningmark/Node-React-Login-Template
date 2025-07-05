import app from "@/app";
import { ENV } from "@/config/env";
import User from "@/models/user.model";
import bcrypt from "bcrypt";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

describe(`POST /api/${ENV.API_VERSION}/users/updatePassword - updates password for an user`, () => {
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

    it("should successfully update an password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testLogout123!",
            newPassword: "testLogout1234!"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("erfolgreich");
    });

    it("should fail because body is missing", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send();
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
    });

    it("should fail because body is missing currentPassword", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({});
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("currentPassword");
    });

    it("should fail because body is missing newPassword", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testLogout123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because newPassword is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testLogout123!",
            newPassword: "t"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because newPassword is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testLogout123!",
            newPassword: "testLogout1234!5165816566165616846846"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because newPassword contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testLogout123!",
            newPassword: "testLogout1234!`"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("newPassword");
    });

    it("should fail because currentPassword is not matching", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testLogout1235!",
            newPassword: "testLogout1234!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Passwörter");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("überein");
    });

    it("should fail because currentPassword and newPassword can`t be the same", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/updatePassword`).set("authorization", `Bearer ${accessToken}`).send({
            currentPassword: "testLogout123!",
            newPassword: "testLogout123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("alten");
    });
});
