import app from "@/app";
import bcrypt from "bcrypt";
import { ENV } from "@/config/env";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import "../setup/testDbSetup";
import User from "@/models/user.model";

describe(`POST /api/${ENV.API_VERSION}/users/register - register a new User`, () => {
    it("should successfully register", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "Example",
            email: "example@example.com",
            password: "Test123!"
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
            username: "Example"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because body is missing password", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "Example",
            email: "example@example.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because username is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "ex",
            email: "example@example.com",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "exdfghndfgujoidsfgfijdsjfdsjuffdsjnojdsfnjuosjfn",
            email: "example@example.com",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "exdfghndf$",
            email: "example@example.com",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because email is not valid", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "exdfghnd",
            email: "example@examp",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("email");
    });

    it("should fail because password is to short", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "exdfgh",
            email: "example@example.com",
            password: "Test"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu klein");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because password is to long", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "exdfgh",
            email: "example@example.com",
            password: "Test123!468as8486468486a4"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Zu groß");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because password contain invalid character", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "exdfgh",
            email: "example@example.com",
            password: "Test123!`"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Anforderungen");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail because username can`t be SuperAdmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "SuperAdmin",
            email: "example@example.com",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "superadmin",
            email: "example@example.com",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username can`t be superadmin", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "superAdmin",
            email: "example@example.com",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("SuperAdmin");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("username");
    });

    it("should fail because username and email is already used", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/register`).send({
            username: "Example",
            email: "example@example.com",
            password: "Test123!"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("vergeben");
    });
});
describe(`POST /api/${ENV.API_VERSION}/users/login - user login`, () => {
    beforeAll(async () => {
        await User.create({ username: "testLogin", password: await bcrypt.hash("testLoginPassword", 10), email: "testLoginEmail@testLoginEmail.com", isActive: true });
    });

    it("should successfully login", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLoginPassword"
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
            username: "login"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toContain("Ungültige Eingabe");
        expect(res.body.message).toContain("body");
        expect(res.body.message).toContain("password");
    });

    it("should fail user does not exist", async () => {
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "login",
            password: "loginPassword"
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
            password: "testLoginPassword"
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
            password: "testLoginPassword"
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
            password: "testLoginPassword123"
        });
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toContain("Passwort");
        expect(res.body.message).toContain("nicht");
        expect(res.body.message).toContain("korrekt");
    });

    it("should fail because of too many faild logins and user should be deactivated", async () => {
        await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLoginPassword123"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLoginPassword123"
        });
        await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLoginPassword123"
        });
        const res = await request(app).post(`/api/${ENV.API_VERSION}/users/login`).send({
            username: "testLogin",
            password: "testLoginPassword123"
        });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain("zuvieler");
        expect(res.body.message).toContain("deaktiviert");

        const user = await User.findOne({ where: { username: "testLogin" } });
        if (user === null) throw new Error();

        expect(user.isActive).toBe(false);
    });
});
