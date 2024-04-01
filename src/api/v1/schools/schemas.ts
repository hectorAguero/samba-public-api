import { z } from "@hono/zod-openapi";

const schoolSchema = z
	.object({
		id: z.coerce.number().int().positive().openapi({ example: 1 }),
		imageUrl: z.string().openapi({ example: "vila_isabel.jpg" }),
		name: z.string().openapi({
			example: "Grêmio Recreativo Escola de Samba Unidos de Vila Isabel",
		}),
		foundationDate: z.string().openapi({ example: "1946/4/4" }),
		godmotherSchool: z.string().openapi({ example: "Portela" }),
		colors: z.array(z.string()).openapi({ example: ["Branco", "Azul"] }),
		symbols: z
			.array(z.string())
			.openapi({ example: ["Coroa", "Clave de Sol", "Pandeiro", "Pena"] }),
		league: z.string().openapi({ example: "LIESA" }),
		divisionNumber: z.coerce.number().int().positive().openapi({ example: 1 }),
		firstDivisionChampionships: z.coerce
			.number()
			.int()
			.nonnegative()
			.openapi({ example: 3 }),
		country: z.string().openapi({ example: "Brazil" }),
		leagueLocation: z.string().openapi({ example: "Rio de Janeiro" }),
		lastPosition: z.coerce.number().int().positive().openapi({ default: 1 }),
	})
	.openapi("School");

const schoolTranslationSchema = schoolSchema
	.pick({
		id: true,
		name: true,
		godmotherSchool: true,
		colors: true,
		symbols: true,
		currentDivison: true,
	})
	.extend({
		schoolId: z.number().openapi({ example: 1 }),
		languageCode: z.string().openapi({ example: "pt" }),
		country: z.string().openapi({ example: "Brazil" }),
		leagueLocation: z.string().openapi({ example: "Rio de Janeiro" }),
	})
	.openapi("SchoolTranslation");

export const translatedSchoolSchema = schoolSchema
	.omit({})
	.extend({
		translatedName: schoolTranslationSchema.shape.name,
		translatedColors: schoolTranslationSchema.shape.colors,
		translatedSymbols: schoolTranslationSchema.shape.symbols,
		translatedGodmotherSchool: schoolTranslationSchema.shape.godmotherSchool,
		translatedCountry: schoolSchema.shape.country,
		translatedLeagueLocation: schoolSchema.shape.leagueLocation,
	})
	.openapi("SchoolTranslated");

export type School = z.infer<typeof schoolSchema>;
export type SchoolTranslation = z.infer<typeof schoolTranslationSchema>;
export type TranslatedSchool = z.infer<typeof translatedSchoolSchema>;
