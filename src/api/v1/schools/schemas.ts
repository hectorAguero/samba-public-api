import { z } from "@hono/zod-openapi";

const schoolSchema = z.object({
    id: z.coerce.number().int().positive().openapi({ default: 1 }),
    image_url: z.string().openapi({ default: "/static/images/schools/vila_isabel.jpg" }),
    name: z.string().openapi({ default: 'Grêmio Recreativo Escola de Samba Unidos de Vila Isabel' }),
    foundation_date: z.string().openapi({ default: '1946/4/4' }),
    godmother_school: z.string().openapi({ default: 'Portela' }),
    colors: z.array(z.string()).openapi({ default: ['Branco', 'Azul'] }),
    symbols: z.array(z.string()).openapi({ default: ['Coroa', 'Clave de Sol', 'Pandeiro', 'Pena'] }),
    league: z.string().openapi({ default: 'LIESA' }),
    division_number: z.coerce.number().int().positive().openapi({ default: 1 }),
}).openapi('School');

const schoolTranslationSchema = z.object({
    id: z.coerce.number().int().positive().openapi({ default: 1 }),
    school_id: z.coerce.number().int().positive().openapi({ default: 1 }),
    language_code: z.string().openapi({ default: 'pt' }),
    name: z.string().openapi({ default: 'Unidos de Vila Isabel' }),
    godmother_school: z.string().openapi({ default: 'Portela' }),
    colors: z.array(z.string()).openapi({ default: ['Branco', 'Azul'] }),
    symbols: z.array(z.string()).openapi({ default: ['Coroa', 'Clave de Sol', 'Pandeiro', 'Pena'] }),
    league: z.string().openapi({ default: 'LIESA' }),
    current_divison: z.string().openapi({ default: 'Grupo Especial' }),
}).openapi('SchoolTranslation');

export const schoolTranslatedSchema = schoolSchema.omit({}).openapi('SchoolTranslated');

export const schoolGetAllQuerySchema = z.object({
    filter: z.string().refine((f) => f.split(';')
        .map(filter => (([key, value]) => ({ key, value }))(filter.split('=')))
        .every(({ key }) => Object.keys(schoolTranslatedSchema.shape).includes(key)),
        { message: "Key not found to filter." })
        .transform((f) => f.split(';').map(filter => (([key, value]) => ({ key, value }))(filter.split('='))))
        .openapi({ default: [{ key: 'colors', value: 'blue,branco' }, { key: 'league', value: 'liesa' }] }),
    sort: z.string().openapi({ default: 'id' }),
    sort_order: z.enum(['asc', 'desc']).openapi({ default: 'asc' }),
    page: z.coerce.number().int().positive().openapi({ default: 1 }),
    page_size: z.coerce.number().int().positive().default(1).openapi({ default: 10 }),
    language: z.string().openapi({ default: 'pt' }),
}).partial().openapi('SchoolSelectAll');


export type School = z.infer<typeof schoolSchema>;
export type SchoolTranslation = z.infer<typeof schoolTranslationSchema>;
export type SchoolTranslated = z.infer<typeof schoolTranslatedSchema>;
export type SchoolAllSelect = z.infer<typeof schoolGetAllQuerySchema>;