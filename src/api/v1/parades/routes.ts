import { createRoute, z } from "@hono/zod-openapi";
import { GenericResponses } from "../generic_responses.ts";
import { paradeGetAllSchema, paradeTranslatedSchema } from "./schemas.ts";
import { languages } from "../supported_languages.ts";

export const paradesAllRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Parades'],
    summary: 'Get all Parades',
    description: 'Get all Parades',
    request: {
        query: paradeGetAllSchema
    },
    responses: {
        200: {
            description: 'List of Parades',
            content: {
                'application/json': {
                    schema: paradeTranslatedSchema.array()
                }
            }
        },
        ...GenericResponses
    }
})

export const paradesByIdRoute = createRoute({
    method: 'get',
    path: '/{id}',
    tags: ['Parades'],
    summary: 'Get Parade by id',
    description: 'Get Parade by id',
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
            description: 'Parade',
            content: {
                'application/json': {
                    schema: paradeTranslatedSchema
                }
            }
        },
        404: {
            description: 'Parade not found'
        },
        ...GenericResponses
    }
})