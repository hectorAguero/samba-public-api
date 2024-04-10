import { createRoute, z } from "@hono/zod-openapi";
import { GenericResponses } from "../generic_responses.ts";
import { translatedParadeSchema } from "./schemas.ts";
import { languages } from "../supported_languages.ts";
import { paradesGetRequest } from "./routes_schemas.ts";
import { paradesSearchRequest } from "./routes_schemas.ts";

// Route to get all parades
export const getParadesRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Parades"],
	summary: "Get all parades",
	description: "Get all parades with translated fields",
	request: { query: paradesGetRequest },
	responses: {
		200: {
			description: "List of Parades",
			content: {
				"application/json": { schema: translatedParadeSchema.array() },
			},
		},
		...GenericResponses,
	},
});

export const paradesSearchRoute = createRoute({
	method: "get",
	path: "/search",
	tags: ["Parades"],
	summary: "Search parade",
	description: "Search parade",
	request: {
		query: paradesSearchRequest,
	},
	responses: {
		200: {
			description: "List of parades",
			content: {
				"application/json": {
					schema: translatedParadeSchema.array(),
				},
			},
		},
		...GenericResponses,
	},
});

// Route to get parade by id
export const paradeByIdRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags: ["Parades"],
	summary: "Get parade by id",
	description: "Get parade by id with translated fields",
	request: {
		params: translatedParadeSchema.pick({ id: true }),
		query: z.object({
			language: languages
				.default(languages.Values.en)
				.optional()
				.openapi({ example: "en" }),
		}),
	},
	responses: {
		200: {
			description: "parade",
			content: { "application/json": { schema: translatedParadeSchema } },
		},
		404: { description: "Parade not found" },
		...GenericResponses,
	},
});
