import { createRoute } from "@hono/zod-openapi";
import { GenericResponses } from "../generic_responses.ts";
import { translatedSchoolSchema } from "./schemas.ts";
import { schoolsGetRequest, schoolsSearchRequest } from "./routes_schemas.ts";

export const schoolsAllRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["schools"],
	summary: "Get all Schools",
	description: "Get all Schools",
	request: {
		query: schoolsGetRequest,
	},
	responses: {
		200: {
			description: "List of schools",
			content: {
				"application/json": {
					schema: translatedSchoolSchema.array(),
				},
			},
		},
		...GenericResponses,
	},
});

export const schoolsSearchRoute = createRoute({
	method: "get",
	path: "/search",
	tags: ["schools"],
	summary: "Search Schools",
	description: "Search Schools",
	request: {
		query: schoolsSearchRequest,
	},
	responses: {
		200: {
			description: "List of schools",
			content: {
				"application/json": {
					schema: translatedSchoolSchema.array(),
				},
			},
		},
		...GenericResponses,
	},
});

export const schoolsByIdRoute = createRoute({
	method: "get",
	path: "/{id}",
	tags: ["schools"],
	summary: "Get School by id",
	description: "Get School by id",
	request: {
		params: translatedSchoolSchema.pick({ id: true }).openapi("School id"),
		query: schoolsGetRequest.pick({ language: true }).partial(),
	},
	responses: {
		200: {
			description: "School",
			content: {
				"application/json": {
					schema: translatedSchoolSchema,
				},
			},
		},
		404: {
			description: "School not found",
		},
		...GenericResponses,
	},
});
