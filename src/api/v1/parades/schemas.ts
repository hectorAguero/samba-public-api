import { z } from "@hono/zod-openapi";
import { languages } from "../supported_languages.ts";
import { schoolTranslatedSchema } from '../schools/schemas.ts';

const paradeSchema = z.object({
    id: z.coerce.number().int().positive().openapi({ default: 1 }),
    school_id: z.coerce.number().openapi({ default: 1 }),
    carnival_name: z.string().openapi({ default: 'Carnaval do Rio de Janeiro' }),
    enredo: z.string().openapi({ default: 'O Aperreio do Cabra que o Excomungado Tratou com Má-Querença e o Santíssimo não Deu Guarida' }),
    carnavalescos: z.array(z.string()).openapi({ default: ['Leandro Vieira'] }),
    division: z.string().openapi({ default: 'Grupo Especial' }),
    division_number: z.coerce.number().int().openapi({ default: 1 }),
    parade_year: z.coerce.number().int().openapi({ default: 2023 }),
    date: z.string().datetime().openapi({}),
    champion_parade: z.string().datetime().nullable().openapi({}),
    components: z.coerce.number().int().openapi({ default: 3000 }),
    number_of_wings: z.coerce.number().int().openapi({ default: 24 }),
    number_of_floats: z.coerce.number().int().openapi({ default: 5 }),
    number_of_tripods: z.coerce.number().int().openapi({ default: 2 }),
    placing: z.coerce.number().int().openapi({ default: 1 }),
    relegated: z.boolean().openapi({ default: false }),
    performance_order: z.coerce.number().int().openapi({ default: 4 }),
    points: z.coerce.number().openapi({ default: 269.8 }),
}).openapi('Parade');

const paradeTranslationSchema = paradeSchema.pick({
    id: true,
    school_id: true,
    carnival_name: true,
    enredo: true,
    carnavalescos: true,
    division: true,
}).extend({
    paradeId: z.number().openapi({ default: 1 }),
    language_code: z.string().openapi({ default: 'pt' })
}).openapi('ParadeTranslation');

export const paradeTranslatedSchema = paradeSchema.omit({}).extend({
    originalcarnival_name: paradeTranslationSchema.shape.carnival_name,
    school: schoolTranslatedSchema,
    originalEnredo: paradeTranslationSchema.shape.enredo,
    originalDivision: paradeTranslationSchema.shape.division,
}).openapi('ParadeTranslated');

export const paradeGetAllSchema = z.object({
    language: languages.openapi({ default: 'pt' }),
    filter: z.string().refine((f) => f.split(';')
        .map(filter => (([key, value]) => ({ key, value }))(filter.split('=')))
        .every(({ key }) => Object.keys(paradeTranslatedSchema.shape).includes(key)),
        { message: 'Key not found in schema to filter' })
        .transform((f) => f.split(';').map(filter => (([key, value]) => ({ key, value }))(filter.split('=')))).openapi({ default: [{ key: 'components', value: '3000,3100' }, { key: 'league', value: 'liesa' }] }),
    sort: z.enum(paradeSchema.keyof().options).openapi({ example: 'id' }),
    sort_order: z.enum(['asc', 'desc']).openapi({ example: 'asc' }),
    page: z.coerce.number().int().positive().openapi({ default: 1 }),
    page_size: z.coerce.number().int().positive().default(1).openapi({ default: 10 }),
}).partial().openapi('ParadeAllSelect');

export type Parade = z.infer<typeof paradeSchema>;
export type ParadeTranslation = z.infer<typeof paradeTranslationSchema>;
export type ParadeTranslated = z.infer<typeof paradeTranslatedSchema>;
export type ParadeAllSelect = z.infer<typeof paradeGetAllSchema>;
export const paradeSelectKeys = paradeTranslatedSchema.keyof().Values;