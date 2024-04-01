import { z } from "@hono/zod-openapi";
import { translatedSchoolSchema } from "../schools/schemas.ts";

export const paradeSchema = z
	.object({
		id: z.coerce.number().int().positive().openapi({ default: 1 }),
		schoolId: z.coerce.number().openapi({ default: 1 }),
		carnivalName: z.string().openapi({ default: "Carnaval do Rio de Janeiro" }),
		enredo: z.string().openapi({
			default:
				"O Aperreio do Cabra que o Excomungado Tratou com Má-Querença e o Santíssimo não Deu Guarida",
		}),
		carnavalescos: z.array(z.string()).openapi({ default: ["Leandro Vieira"] }),
		division: z.string().openapi({ default: "Grupo Especial" }),
		divisionNumber: z.coerce.number().int().openapi({ default: 1 }),
		paradeYear: z.coerce.number().int().openapi({ default: 2023 }),
		date: z.string().datetime().openapi({}),
		championParade: z.string().datetime().nullable().openapi({}),
		components: z.coerce.number().int().openapi({ default: 3000 }),
		numberOfWings: z.coerce.number().int().openapi({ default: 24 }),
		numberOfFloats: z.coerce.number().int().openapi({ default: 5 }),
		numberOfTripods: z.coerce.number().int().openapi({ default: 2 }),
		placing: z.coerce.number().int().openapi({ default: 1 }),
		relegated: z.boolean().openapi({ default: false }),
		performanceOrder: z.coerce.number().int().openapi({ default: 4 }),
		points: z.coerce.number().openapi({ default: 269.8 }),
	})
	.openapi("Parade");

export const paradeTranslationSchema = paradeSchema
	.pick({
		id: true,
		schoolId: true,
		carnivalName: true,
		enredo: true,
		carnavalescos: true,
		division: true,
	})
	.extend({
		paradeId: z.number().openapi({ default: 1 }),
		languageCode: z.string().openapi({ default: "pt" }),
	})
	.openapi("ParadeTranslation");

export const translatedParadeSchema = paradeSchema
	.omit({})
	.extend({
		translatedCarnivalName: paradeTranslationSchema.shape.carnivalName,
		translatedEnredo: paradeTranslationSchema.shape.enredo,
		translatedDivision: paradeTranslationSchema.shape.division,
		translatedCarnavalescos: paradeTranslationSchema.shape.carnavalescos,
		school: translatedSchoolSchema.nullish(),
	})
	.openapi("ParadeTranslated");

export type Parade = z.infer<typeof paradeSchema>;
export type ParadeTranslation = z.infer<typeof paradeTranslationSchema>;
export type TranslatedParade = z.infer<typeof translatedParadeSchema>;
export const paradeSelectKeys = translatedParadeSchema.keyof().Values;
