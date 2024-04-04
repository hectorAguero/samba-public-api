import { z } from "zod";

export const genericResponseSchema = z.object({
	success: z.boolean().default(false),
	message: z.string(),
});

export const GenericResponses = {
	400: {
		description: "Bad request",
		content: { "application/json": { schema: genericResponseSchema } },
	},
	401: {
		description: "Unauthorized",
		content: { "application/json": { schema: genericResponseSchema } },
	},
	403: {
		description: "Forbidden",
		content: { "application/json": { schema: genericResponseSchema } },
	},
	500: {
		description: "Internal server error",
		content: { "application/json": { schema: genericResponseSchema } },
	},
};
