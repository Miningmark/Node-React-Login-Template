import crypto from "crypto";

import { Op } from "@sequelize/core";
import { Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import ms from "ms";
import { injectable } from "tsyringe";

import { parseTimeOffsetToDate } from "@/utils/misc.util.js";
import UserToken, { UserTokenType } from "@/models/userToken.model.js";
import User from "@/models/user.model.js";
import { ENV } from "@/config/env.js";

@injectable()
export class TokenService {
    constructor() {}

    clearRefreshTokenCookie(res: Response) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "lax",
            ...(ENV.NODE_ENV === "production" ? { secure: true } : {})
        });
    }

    setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            ...(ENV.NODE_ENV === "production" ? { secure: true } : {}),
            maxAge: ms(ENV.REFRESH_TOKEN_EXPIRY as ms.StringValue)
        });
    }

    async generateJWTs(databaseUser: User, routeGroupsArray: string[]) {
        const accessToken = await this.generateJWT(
            databaseUser,
            UserTokenType.ACCESS_TOKEN,
            routeGroupsArray,
            ENV.ACCESS_TOKEN_SECRET,
            ENV.ACCESS_TOKEN_EXPIRY as ms.StringValue
        );
        const refreshToken = await this.generateJWT(
            databaseUser,
            UserTokenType.REFRESH_TOKEN,
            routeGroupsArray,
            ENV.REFRESH_TOKEN_SECRET,
            ENV.REFRESH_TOKEN_EXPIRY as ms.StringValue
        );

        return { accessToken: accessToken, refreshToken: refreshToken };
    }

    async generateJWT(
        databaseUser: User,
        tokenType: UserTokenType,
        routeGroupsArray: string[],
        secret: string,
        expiresIn: ms.StringValue
    ) {
        const token = jsonwebtoken.sign(
            {
                userId: databaseUser.id,
                routeGroups: routeGroupsArray
            },
            secret,
            { expiresIn: expiresIn }
        );

        await UserToken.create({
            userId: databaseUser.id,
            token: token,
            type: tokenType,
            expiresAt: new Date(Date.now() + ms(expiresIn))
        });

        return token;
    }

    async removeJWTs(databaseUser: User) {
        const userTokens = await databaseUser.getUserTokens({
            where: { type: { [Op.or]: [UserTokenType.ACCESS_TOKEN, UserTokenType.REFRESH_TOKEN] } }
        });

        await Promise.all(
            userTokens.map(async (userToken) => {
                await userToken.destroy();
            })
        );
    }

    async removeJWT(databaseUser: User, tokenType: UserTokenType) {
        const userTokens = await databaseUser.getUserTokens({ where: { type: tokenType } });

        await Promise.all(
            userTokens.map(async (userToken) => {
                await userToken.destroy();
            })
        );
    }

    async generateHexUserToken(userId: number, type: UserTokenType, expiresIn: string | null) {
        const token = crypto.randomBytes(32).toString("hex");
        let expiresAt = null;

        if (expiresIn !== null) expiresAt = parseTimeOffsetToDate(expiresIn);

        await UserToken.create({ userId: userId, token: token, type: type, expiresAt: expiresAt });

        return token;
    }
}
