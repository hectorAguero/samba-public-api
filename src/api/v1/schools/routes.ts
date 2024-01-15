import { createRoute, z } from "@hono/zod-openapi";
import { GenericResponses } from "../generic_responses.ts";
import { schoolTranslatedSchema } from "./schemas.ts";
import { languages } from "../supported_languages.ts";

export const schoolsAllRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['schools'],
    summary: 'Get all schools',
    description: 'Get all schools',
    request: {
        query: z.object({
            language: languages.default(languages.Values.en).optional().openapi({ example: 'en' }),
        })
    },
    responses: {
        200: {
            description: 'List of schools',
            content: {
                'application/json': {
                    schema: schoolTranslatedSchema.array()
                }
            }
        },
        ...GenericResponses
    }
})

export const schoolsByIdRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['schools'],
    summary: 'Get school by id',
    description: 'Get school by id',
    request: {
        params: z.object({
            id: z.coerce.number().int().min(1).openapi({ example: 1 })
        }),
        query: z.object({
            language: languages.default(languages.Values.en).optional().openapi({ example: 'en' }),
        })
    },
    responses: {
        200: {
            description: 'School',
            content: {
                'application/json': {
                    schema: schoolTranslatedSchema
                }
            }
        },
        404: {
            description: 'School not found'
        },
        ...GenericResponses
    }
})