import { createRoute, z } from "@hono/zod-openapi";
import { GenericResponses } from "../generic_responses.ts";
import { translatedInstrumentSchema } from "./schemas.ts";
import { languages } from "../supported_languages.ts";
import { instrumentsGetRequest } from "./routes_schemas.ts";

export const instrumentsAllRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Instruments"],
	summary: "Get all instruments",
	description: "Get all Instruments with translated fields",
	request: { query: instrumentsGetRequest },
	responses: {
		200: {
			description: "List of Instruments",
			content: {
				"application/json": {
					schema: translatedInstrumentSchema.array(),
				},
			},
		},
		...GenericResponses,
	},
});

export const instrumentsByIdRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags: ["Instruments"],
	summary: "Get Instrument by id",
	description: "Get Instrument by id with translated fields",
	request: {
		params: translatedInstrumentSchema.pick({ id: true }),
		query: z.object({
			language: languages
				.default(languages.Values.en)
				.optional()
				.openapi({ example: "en" }),
		}),
	},
	responses: {
		200: {
			description: "Instrument",
			content: {
				"application/json": {
					schema: translatedInstrumentSchema,
				},
			},
		},
		404: {
			description: "Instrument not found",
		},
		...GenericResponses,
	},
});
