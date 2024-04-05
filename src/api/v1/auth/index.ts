import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { authLoginRoute, refreshTokenRoute } from "./routes.ts";
import {
	createTokens,
	requireAuthMiddleware,
	verifyRefreshToken,
	verifyUserAndPassword,
} from "./jwt.ts";
import { requireAuthRoute } from "./routes.ts";
import { env } from "hono/adapter";

const authApi = new OpenAPIHono();

authApi.openapi(authLoginRoute, async (c) => {
	const { username, password } = await c.req.json();
	if (!username || !password) {
		throw new HTTPException(400, {
			message: "Username and password are required",
		});
	}
	// This is a simple example, you should use a database to store the user data
	const storedHash = env<{ ADMIN_PASSWORD_HASH: string }>(
		c,
	).ADMIN_PASSWORD_HASH;
	if (!storedHash) {
		throw new HTTPException(500, { message: "Admin hash is not set" });
	}
	const isVerified = await verifyUserAndPassword({
		storedHash,
		username,
		passwordAttempt: password,
	});
	if (!isVerified) {
		throw new HTTPException(401, { message: "Invalid username or password" });
	}
	const { JWT_SECRET: secret, JWT_REFRESH_SECRET: refreshSecret } = env<{
		JWT_SECRET: string;
		JWT_REFRESH_SECRET: string;
	}>(c);
	const { token, refreshToken } = await createTokens({
		secret,
		refreshSecret,
		username,
	});

	return c.json({ token, refreshToken });
});

authApi.openapi(refreshTokenRoute, async (c) => {
	const { refreshToken } = await c.req.json();
	if (!refreshToken) {
		throw new HTTPException(400, { message: "RefreshToken is required" });
	}
	const { JWT_REFRESH_SECRET: refreshSecret, JWT_SECRET: secret } = env<{
		JWT_REFRESH_SECRET: string;
		JWT_SECRET: string;
	}>(c);

	const { username } = await verifyRefreshToken({
		refreshSecret,
		jwt: refreshToken,
	});
	if (!username) {
		throw new HTTPException(401, { message: "Invalid refresh token" });
	}
	const { token } = await createTokens({
		secret,
		refreshSecret,
		username,
		withRefresh: false,
	});

	return c.json({ token: token });
});

authApi.use(requireAuthRoute.getRoutingPath(), requireAuthMiddleware);
authApi.openapi(requireAuthRoute, (c) => {
	return c.json({ success: true, message: "Authenticated" });
});

export default authApi;
