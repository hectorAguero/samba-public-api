import { z } from "@hono/zod-openapi";
import { translatedSchoolSchema } from "./schemas.ts";
export const schoolsGetRequest = z
	.object({
		ids: z
			.array(z.coerce.number().int().positive())
			.openapi({ examples: [[1], [2, 3]] }),
		filter: z
			.string()
			.refine(
				(f) =>
					f
						.split(";")
						.map((filter) =>
							(([key, value]) => ({ key, value }))(filter.split("=")),
						)
						.every(({ key }) => {
							if (Object.keys(translatedSchoolSchema.shape).includes(key))
								return true;
							console.error(`Invalid filter in key ${key}`);
							return false;
						}),
				{
					message: `Invalid filter in some key. Valid keys: ${Object.keys(
						translatedSchoolSchema.shape,
					).join(", ")}`,
				},
			)
			.openapi({
				example: "name=Vila Isabel;country=Brazil;colors=Branco,Azul",
				description: "name=Vila Isabel;country=Brazil;colors=Branco,Azul",
			}),
		sort: z.string().openapi({ default: "id" }),
		sortOrder: z.enum(["asc", "desc"]).openapi({ default: "asc" }),
		page: z.coerce.number().int().positive().openapi({ default: 1 }),
		pageSize: z.coerce
			.number()
			.int()
			.positive()
			.default(1)
			.openapi({ default: 10 }),
		language: z.string().openapi({ default: "pt" }),
	})
	.partial()
	.openapi("SchoolSelectAll");

export const schoolsSearchRequest = schoolsGetRequest
	.omit({ ids: true })
	.extend({
		search: z.string().openapi({ example: "Imperio" }),
	});

export type SchoolsGetRequest = z.infer<typeof schoolsGetRequest>;
export type SchoolsSearchRequest = z.infer<typeof schoolsSearchRequest>;
