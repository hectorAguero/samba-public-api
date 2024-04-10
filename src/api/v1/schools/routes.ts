import { createRoute } from "@hono/zod-openapi";
import { GenericResponses } from "../generic_responses.ts";
import { translatedSchoolSchema } from "./schemas.ts";
import { schoolsGetRequest, schoolsSearchRequest } from "./routes_schemas.ts";

export const schoolsAllRoute = createRoute({
	method: "get",
	path: "/",
	tags: ["Schools"],
	summary: "Get all schools",
	description: "Get all schools",
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
	tags: ["Schools"],
	summary: "Search schools",
	description: "Search schools",
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
	tags: ["Schools"],
	summary: "Get school by id",
	description: "Get school by id",
	request: {
		params: translatedSchoolSchema.pick({ id: true }).openapi("School id"),
		query: schoolsGetRequest.pick({ language: true }).partial(),
	},
	responses: {
		200: {
			description: "school",
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
