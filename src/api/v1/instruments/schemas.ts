import { z } from "@hono/zod-openapi";

export const instrumentSchema = z.object({
	id: z.coerce.number().int(),
	name: z.string(),
	type: z.string(),
	description: z.string(),
	imageUrl: z.string(),
	gallery: z.array(z.string()),
});

export const instrumentTranslationSchema = instrumentSchema.extend({
	instrumentId: instrumentSchema.shape.id,
	languageCode: z.string(),
});

export const translatedInstrumentSchema = instrumentSchema
	.omit({})
	.extend({
		translatedName: instrumentTranslationSchema.shape.name,
		translatedType: instrumentTranslationSchema.shape.type,
		translatedDescription: instrumentTranslationSchema.shape.description,
	})
	.openapi("InstrumentTranslated");

export type Instrument = z.infer<typeof instrumentSchema>;
export type InstrumentTranslation = z.infer<typeof instrumentTranslationSchema>;
export type TranslatedInstrument = z.infer<typeof translatedInstrumentSchema>;
