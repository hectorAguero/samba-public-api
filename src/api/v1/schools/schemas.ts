import { z } from "@hono/zod-openapi";

const schoolSchema = z.object({
    id: z.number().openapi({ default: 1 }),
    shortName: z.string().openapi({ default: 'Vila Isabel' }),
    name: z.string().openapi({ default: 'Unidos de Vila Isabel' }),
    fullName: z.string().openapi({ default: 'Grêmio Recreativo Escola de Samba Unidos de Vila Isabel' }),
    foundationDate: z.string().openapi({ default: '1946/4/4' }),
    godmotherSchool: z.string().openapi({ default: 'Portela' }),
    colors: z.array(z.string()).openapi({ default: ['Branco', 'Azul'] }),
    symbols: z.array(z.string()).openapi({ default: ['Coroa', 'Clave de Sol', 'Pandeiro', 'Pena'] }),
    location: z.string().openapi({ default: 'Vila Isabel' }),
    president: z.string().openapi({ default: 'Luiz Guimarães' }),
    honoraryPresident: z.string().openapi({ default: 'Martinho da Vila' }),
    image_url: z.string().openapi({ default: "/static/images/schools/vila_isabel.jpg" }),
    league: z.string().openapi({ default: 'LIESA' }),

}).openapi('School');

const schoolTranslationSchema = z.object({
    id: z.number().openapi({ default: 1 }),
    schoolId: z.number().openapi({ default: 1 }),
    languageCode: z.string().openapi({ default: 'pt' }),
    name: z.string().openapi({ default: 'Unidos de Vila Isabel' }),
    godmotherSchool: z.string().openapi({ default: 'Portela' }),
    colors: z.array(z.string()).openapi({ default: ['Branco', 'Azul'] }),
    symbols: z.array(z.string()).openapi({ default: ['Coroa', 'Clave de Sol', 'Pandeiro', 'Pena'] }),
    league: z.string().openapi({ default: 'LIESA' }),
    currentDivison: z.string().openapi({ default: 'Grupo Especial' }),
}).openapi('SchoolTranslation');


export const schoolTranslatedSchema = z.object({
    id: z.number().openapi({ default: 1 }),
    shortName: z.string().openapi({ default: 'Vila Isabel' }),
    name: z.string().openapi({ default: 'Unidos de Vila Isabel' }),
    fullName: z.string().openapi({ default: 'Grêmio Recreativo Escola de Samba Unidos de Vila Isabel' }),
    godmotherSchool: z.string().openapi({ default: 'Portela' }),
    colors: z.array(z.string()).openapi({ default: ['Branco', 'Azul'] }),
    symbols: z.array(z.string()).openapi({ default: ['Coroa', 'Clave de Sol', 'Pandeiro', 'Pena'] }),
    location: z.string().openapi({ default: 'Vila Isabel' }),
    president: z.string().openapi({ default: 'Luiz Guimarães' }),
    honoraryPresident: z.string().openapi({ default: 'Martinho da Vila' }),
    league: z.string().openapi({ default: 'LIESA' }),
}).openapi('SchoolTranslated');


export const schoolGetAllQuerySchema = z.object({
    filter: z.string().refine((f) => f.split(';')
        .map(filter => (([key, value]) => ({ key, value }))(filter.split('=')))
        .every(({ key }) => Object.keys(schoolTranslatedSchema.shape).includes(key)),
        { message: "Key not found to filter." })
        .transform((f) => f.split(';').map(filter => (([key, value]) => ({ key, value }))(filter.split('='))))
        .openapi({ default: [{ key: 'colors', value: 'blue,branco' }, { key: 'league', value: 'liesa' }] }),
    sort: z.string().openapi({ default: 'id' }),
    sortOrder: z.enum(['asc', 'desc']).openapi({ default: 'asc' }),
    page: z.coerce.number().int().positive().openapi({ default: 1 }),
    pageSize: z.coerce.number().int().positive().default(1).openapi({ default: 10 }),
    language: z.string().openapi({ default: 'pt' }),
}).partial().openapi('SchoolSelectAll');


export type School = z.infer<typeof schoolSchema>;
export type SchoolTranslation = z.infer<typeof schoolTranslationSchema>;
export type SchoolTranslated = z.infer<typeof schoolTranslatedSchema>;
export type SchoolAllSelect = z.infer<typeof schoolGetAllQuerySchema>;