import { z } from "@hono/zod-openapi";

export const schoolSchema = z.object({
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
    league: z.string().openapi({ default: 'LIESA' }),
}).openapi('School');

export const schoolTranslationSchema = z.object({
    id: z.number().openapi({ default: 1 }),
    language: z.string().openapi({ default: 'pt' }),
    shortName: z.string().openapi({ default: 'Vila Isabel' }),
    name: z.string().openapi({ default: 'Unidos de Vila Isabel' }),
    fullName: z.string().openapi({ default: 'Grêmio Recreativo Escola de Samba Unidos de Vila Isabel' }),
    godmotherSchool: z.string().openapi({ default: 'Portela' }),
    colors: z.array(z.string()).openapi({ default: ['Branco', 'Azul'] }),
    symbols: z.array(z.string()).openapi({ default: ['Coroa', 'Clave de Sol', 'Pandeiro', 'Pena'] }),
    location: z.string().openapi({ default: 'Vila Isabel' }),
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

export type School = z.infer<typeof schoolSchema>;
export type SchoolTranslation = z.infer<typeof schoolTranslationSchema>;
export type SchoolTranslated = z.infer<typeof schoolTranslatedSchema>;