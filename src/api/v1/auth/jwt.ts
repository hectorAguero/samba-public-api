import { sign, verify } from "hono/jwt";
import { bearerAuth } from "hono/bearer-auth";
import { ADMIN_USERNAME } from "./consts.ts";
import { env } from "hono/adapter";
import type { Context } from "hono";
import { verifyPassword } from "../workers_util.ts";

export const createTokens = async ({
	secret,
	refreshSecret,
	username,
	withRefresh = true,
}: {
	username: string;
	withRefresh?: boolean;
	secret: string;
	refreshSecret: string;
}) => {
	const exp = Math.floor(Date.now() / 1000) + 15 * 60;
	const jwt = await sign({ username, exp: exp }, secret);
	if (!withRefresh) return { token: jwt, refreshToken: "" };
	const refreshJWT = await sign({ username }, refreshSecret);
	return { token: jwt, refreshToken: refreshJWT };
};

export const verifyRefreshToken = async ({
	refreshSecret,
	jwt,
}: { refreshSecret: string; jwt: string }) => {
	const data = await verify(jwt, refreshSecret);
	return data;
};

export const verifyUserAndPassword = async ({
	username,
	passwordAttempt,
	storedHash,
}: {
	username: string;
	passwordAttempt: string;
	storedHash: string;
}) => {
	const isPasswordValid = await verifyPassword({
		storedHash,
		passwordAttempt,
	});
	const isAdminUser = username === ADMIN_USERNAME;
	console.log(isAdminUser, isPasswordValid);

	return isPasswordValid && isAdminUser;
};

export const requireAuthMiddleware = bearerAuth({
	verifyToken: async (token, c) => {
		const { JWT_SECRET: secret } = env<{ JWT_SECRET: string }>(c);
		console.log("secret", secret);
		console.log("token", token);
		const data = await verify(token, secret);
		return data;
	},
});
