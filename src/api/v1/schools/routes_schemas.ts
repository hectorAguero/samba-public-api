import { z } from "@hono/zod-openapi";
import { translatedSchoolSchema } from "./schemas.ts";

export const schoolsGetRequest = z
	.object({
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

export type SchoolsGetRequest = z.infer<typeof schoolsGetRequest>;
