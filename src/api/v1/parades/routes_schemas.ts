import { z } from "@hono/zod-openapi";
import { languages } from "../supported_languages.ts";
import { paradeSchema } from "./schemas.ts";
import { translatedParadeSchema } from "./schemas.ts";

export const paradesGetRequest = z
	.object({
		ids: z
			.array(z.coerce.number().int().positive())
			.openapi({ examples: [[1], [2, 3]] }),
		language: languages.openapi({ example: "ja" }),
		filter: z
			.string()
			.refine(
				(f) =>
					f
						.split(";")
						.map((filter) =>
							(([key, value]) => ({ key, value }))(filter.split("=")),
						)
						.every(({ key }) =>
							Object.keys(translatedParadeSchema.shape).includes(key),
						),
				{ message: "Key not found in schema to filter" },
			)
			.openapi({
				example: "components=3001,3500;division=Grupo Especial",
				description: "components=3001,3500;division=Grupo Especial",
			}),
		sort: z.enum(paradeSchema.keyof().options).openapi("id"),
		sortOrder: z.enum(["asc", "desc"]).openapi({ example: "asc" }),
		page: z.coerce.number().int().positive().default(1).openapi({ default: 1 }),
		pageSize: z.coerce
			.number()
			.int()
			.positive()
			.default(10)
			.openapi({ default: 10 }),
	})
	.partial()
	.openapi("ParadesGetRequest");

export const paradesSearchRequest = paradesGetRequest
	.omit({ ids: true })
	.extend({
		search: z.string().openapi({ example: "Imperatriz" }),
	});

export type ParadesGetRequest = z.infer<typeof paradesGetRequest>;
export type ParadesSearchRequest = z.infer<typeof paradesSearchRequest>;
