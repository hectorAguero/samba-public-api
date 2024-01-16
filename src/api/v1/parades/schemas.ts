import { z } from "@hono/zod-openapi";
import { languages } from "../supported_languages.ts";
import { zArrayFromString } from "../zod_utils.ts";



export const paradeSchema = z.object({
    id: z.coerce.number().int().openapi({ default: 1 }),
    schoolId: z.coerce.number().openapi({ default: 1 }),
    carnivalName: z.string().openapi({ default: 'Carnaval do Rio de Janeiro' }),
    enredo: z.string().openapi({ default: 'O Aperreio do Cabra que o Excomungado Tratou com Má-Querença e o Santíssimo não Deu Guarida' }),
    carnavalescos: z.array(z.string()).openapi({ default: ['Leandro Vieira'] }),
    division: z.string().openapi({ default: 'Grupo Especial' }),
    divisionNumber: z.coerce.number().int().openapi({ default: 1 }),
    paradeYear: z.coerce.number().int().openapi({ default: 2023 }),
    date: z.string().openapi({}),
    championParade: z.string().nullable().openapi({}),
    components: z.coerce.number().int().openapi({ default: 3000 }),
    numberOfWings: z.coerce.number().int().openapi({ default: 24 }),
    numberOfFloats: z.coerce.number().int().openapi({ default: 5 }),
    numberOfTripods: z.coerce.number().int().openapi({ default: 2 }),
    placing: z.coerce.number().int().openapi({ default: 1 }),
    relegated: z.boolean().openapi({ default: false }),
    performanceOrder: z.coerce.number().int().openapi({ default: 4 }),
    points: z.coerce.number().openapi({ default: 269.8 }),
}).openapi('Parade');

export const paradeTranslationSchema = paradeSchema.pick({
    id: true,
    schoolId: true,
    carnivalName: true,
    enredo: true,
    carnavalescos: true,
    division: true,
}).extend({
    paradeId: z.number().openapi({ default: 1 }),
    languageCode: z.string().openapi({ default: 'pt' })
}).openapi('ParadeTranslation');

export const paradeTranslatedSchema = paradeSchema.omit({}).extend({
    originalCarnivalName: paradeTranslationSchema.shape.carnivalName,
    originalEnredo: paradeTranslationSchema.shape.enredo,
    originalDivision: paradeTranslationSchema.shape.division,
}).openapi('ParadeTranslated');

export const paradeGetAllSchema = z.object({
    championParade: z.coerce.number().int().min(0).max(1).openapi({ example: 1 }),
    language: languages.openapi({ default: 'pt' }),
    components: zArrayFromString(z.coerce.number()).openapi({ example: [1000, 2000] }),
    sort: z.enum(paradeSchema.keyof().options).openapi({ example: 'id' }),
    sortOrder: z.enum(['asc', 'desc']).openapi({ example: 'asc' }),
}).partial().openapi('ParadeAllSelect');

export const paradeGetByIdSchema = paradeSchema.pick({ id: true })
    .extend({ language: paradeGetAllSchema.shape.language })
    .openapi('ParadeByIdSelect');


export type Parade = z.infer<typeof paradeSchema>;
export type ParadeTranslation = z.infer<typeof paradeTranslationSchema>;
export type ParadeTranslated = z.infer<typeof paradeTranslatedSchema>;
export type ParadeAllSelect = z.infer<typeof paradeGetAllSchema>;
export type ParadeByIdSelect = z.infer<typeof paradeGetByIdSchema>;
export const paradeSelectKeys = paradeGetAllSchema.keyof().Values;