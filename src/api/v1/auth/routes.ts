import { createRoute, z } from "@hono/zod-openapi";
import {
	GenericResponses,
	genericResponseSchema,
} from "../generic_responses.ts";

export const authLoginRoute = createRoute({
	method: "post",
	path: "/login",
	tags: ["Auth"],
	summary: "Login",
	description: "Login with username and password",
	request: {
		body: {
			content: {
				"application/json": {
					schema: z
						.object({
							username: z.string(),
							password: z.string(),
						})
						.openapi({
							default: { username: "admin", password: "admin" },
						}),
				},
			},
		},
	},
	responses: {
		200: {
			description: "JWT Token",
			content: {
				"application/json": {
					schema: z.object({
						token: z.string(),
						refreshToken: z.string(),
					}),
				},
			},
		},
		...GenericResponses,
	},
});

export const requireAuthRoute = createRoute({
	method: "get",
	path: "/require-auth",
	tags: ["Auth"],
	summary: "Require Auth",
	security: [{ Bearer: [] }],
	description: "This route requires authentication",
	responses: {
		200: {
			description: "JWT Token",
			content: {
				"application/json": {
					schema: genericResponseSchema,
				},
			},
		},
		...GenericResponses,
	},
});

export const refreshTokenRoute = createRoute({
	method: "post",
	path: "/refresh-token",
	tags: ["Auth"],
	summary: "Refresh Token",
	description: "Refresh the JWT token",
	request: {
		body: {
			content: {
				"application/json": {
					schema: z
						.object({
							refreshToken: z.string(),
						})
						.openapi({
							default: { refreshToken: "THE_USER_REFRESH_TOKEN" },
						}),
				},
			},
		},
	},
	responses: {
		200: {
			description: "JWT Token",
			content: {
				"application/json": {
					schema: z.object({
						token: z.string(),
					}),
				},
			},
		},
		...GenericResponses,
	},
});
