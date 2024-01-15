import { z } from "@hono/zod-openapi";

export const paradeSchema = z.object({
    id: z.number().openapi({ default: 1 }),
    schoolId: z.number().openapi({ default: 1 }),
    carnivalName: z.string().openapi({ default: 'Carnaval do Rio de Janeiro' }),
    enredo: z.string().openapi({ default: 'O Aperreio do Cabra que o Excomungado Tratou com Má-Querença e o Santíssimo não Deu Guarida' }),
    carnavalescos: z.array(z.string()).openapi({ default: ['Leandro Vieira'] }),
    division: z.string().openapi({ default: 'Grupo Especial' }),
    divisionNumber: z.number().openapi({ default: 1 }),
    paradeYear: z.number().openapi({ default: 2023 }),
    date: z.string().openapi({}),
    championParade: z.string().openapi({}),
    components: z.number().openapi({ default: 3000 }),
    numberOfWings: z.number().openapi({ default: 24 }),
    numberOfFloats: z.number().openapi({ default: 5 }),
    numberOfTripods: z.number().openapi({ default: 2 }),
    placing: z.number().openapi({ default: 1 }),
    relegated: z.boolean().openapi({ default: false }),
    performanceOrder: z.number().openapi({ default: 4 }),
    points: z.number().openapi({ default: 269.8 }),
}).openapi('Parade');

export const paradeTranslationSchema = z.object({
    id: z.number().openapi({ default: 1 }),
    paradeId: z.number().openapi({ default: 1 }),
    languageCode: z.string().openapi({ default: 'pt' }),
    carnivalName: z.string().openapi({ default: 'Carnaval do Rio de Janeiro' }),
    enredo: z.string().openapi({ default: 'O Aperreio do Cabra que o Excomungado Tratou com Má-Querença e o Santíssimo não Deu Guarida' }),
    carnavalescos: z.array(z.string()).openapi({ default: ['Leandro Vieira'] }),
    division: z.string().openapi({ default: 'Grupo Especial' }),
}).openapi('ParadeTranslation');

export const paradeTranslatedSchema = z.object({
    id: z.number().openapi({ default: 1 }),
    schoolId: z.number().openapi({ default: 1 }),
    carnivalName: z.string().openapi({ default: 'Carnaval do Rio de Janeiro' }),
    originalCarnivalName: z.string().openapi({ default: 'Carnaval do Rio de Janeiro' }),
    enredo: z.string().openapi({ default: 'The Trouble of the Man Who Was Excommunicated and Treated with Malice, Unprotected by the Holiest' }),
    originalEnredo: z.string().openapi({ default: 'O Aperreio do Cabra que o Excomungado Tratou com Má-Querença e o Santíssimo não Deu Guarida' }),
    carnavalescos: z.array(z.string()).openapi({ default: ['Leandro Vieira'] }),
    division: z.string().openapi({ default: 'Special Group' }),
    originalDivision: z.string().openapi({ default: 'Grupo Especial' }),
    divisionNumber: z.number().openapi({ default: 1 }),
    paradeYear: z.number().openapi({ default: 2023 }),
    date: z.string().openapi({}),
    championParade: z.string().nullable().openapi({}),
    components: z.number().openapi({ default: 3000 }),
    numberOfWings: z.number().openapi({ default: 24 }),
    numberOfFloats: z.number().openapi({ default: 5 }),
    numberOfTripods: z.number().openapi({ default: 2 }),
    placing: z.number().openapi({ default: 1 }),
    relegated: z.boolean().openapi({ default: false }),
    performanceOrder: z.number().openapi({ default: 4 }),
    points: z.number().openapi({ default: 269.8 }),
}).openapi('ParadeTranslated');

export const paradeTranslatedKeys = paradeTranslatedSchema.keyof();

export type Parade = z.infer<typeof paradeSchema>;
export type ParadeTranslation = z.infer<typeof paradeTranslationSchema>;
export type ParadeTranslated = z.infer<typeof paradeTranslatedSchema>;