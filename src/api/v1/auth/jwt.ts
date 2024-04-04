import { sign, verify } from "hono/jwt";
import * as bcrypt from "bcrypt";
import "@std/dotenv/load";
import { bearerAuth } from "hono/middleware";
import { ADMIN_USERNAME } from "./consts.ts";

export const requireAuthMiddleware = bearerAuth({
	verifyToken: (token, _) => verifyToken(token),
});

function getSecrets() {
	const secret = Deno.env.get("JWT_SECRET");
	const refreshSecret = Deno.env.get("JWT_REFRESH_SECRET");

	if (!secret || !refreshSecret) {
		throw new Error("JWT secrets are not defined in environment variables");
	}

	return { secret, refreshSecret };
}

export const createTokens = async ({
	username,
	withRefresh = true,
}: { username: string; withRefresh?: boolean }) => {
	const { secret, refreshSecret } = getSecrets();
	const exp = Math.floor(Date.now() / 1000) + 15 * 60;
	const jwt = await sign({ username, exp: exp }, secret);
	if (!withRefresh) return { token: jwt, refreshToken: "" };
	const refreshJWT = await sign({ username }, refreshSecret);
	return { token: jwt, refreshToken: refreshJWT };
};

export const verifyToken = async (jwt: string) => {
	const { secret } = getSecrets();
	const data = await verify(jwt, secret);
	return data;
};

export const verifyRefreshToken = async (jwt: string) => {
	const { refreshSecret } = getSecrets();
	const data = await verify(jwt, refreshSecret);
	return data;
};

export const verifyPassword = (password: string, hash: string) => {
	return bcrypt.compareSync(password, hash);
};

export const verifyUserAndPassword = (username: string, password: string) => {
	// This is a simple example, in a real application you should use a database
	const adminHash = Deno.env.get("ADMIN_PASSWORD_HASH");
	if (!adminHash) {
		throw new Error("ADMIN_PASSWORD_HASH is not defined in environment");
	}
	if (username === ADMIN_USERNAME && verifyPassword(password, adminHash)) {
		return true;
	}
	return false;
};
