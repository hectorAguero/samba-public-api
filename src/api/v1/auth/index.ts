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

const authApi = new OpenAPIHono();

authApi.openapi(authLoginRoute, async (c) => {
	const { username, password } = await c.req.json();
	if (!username || !password) {
		throw new HTTPException(400, {
			message: "Username and password are required",
		});
	}
	if (!verifyUserAndPassword(username, password)) {
		throw new HTTPException(401, { message: "Invalid username or password" });
	}
	const { token, refreshToken } = await createTokens({ username });

	return c.json({ token, refreshToken });
});

authApi.openapi(refreshTokenRoute, async (c) => {
	const { refreshToken } = await c.req.json();
	if (!refreshToken) {
		throw new HTTPException(400, { message: "RefreshToken is required" });
	}
	const { username } = await verifyRefreshToken(refreshToken);
	if (!username) {
		throw new HTTPException(401, { message: "Invalid refresh token" });
	}
	const { token } = await createTokens({ username, withRefresh: false });
	return c.json({ token: token });
});

authApi.use(requireAuthRoute.getRoutingPath(), requireAuthMiddleware);
authApi.openapi(requireAuthRoute, (c) => {
	return c.json({ success: true, message: "Authenticated" });
});

export default authApi;
