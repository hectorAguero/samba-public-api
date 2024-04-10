import { z } from "@hono/zod-openapi";
import { languages } from "../supported_languages.ts";
import { instrumentSchema } from "./schemas.ts";
import { translatedInstrumentSchema } from "./schemas.ts";

export const instrumentsGetRequest = z
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
							Object.keys(translatedInstrumentSchema.shape).includes(key),
						),
				{ message: "Key not found in schema to filter" },
			)
			.openapi({
				example: "components=3001,3500;division=Grupo Especial",
				description: "components=3001,3500;division=Grupo Especial",
			}),
		sort: z.enum(instrumentSchema.keyof().options).openapi("id"),
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
	.openapi("InstrumentGetRequest");

export type InstrumentsGetRequest = z.infer<typeof instrumentsGetRequest>;
