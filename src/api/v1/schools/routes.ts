import { createRoute } from "@hono/zod-openapi";
import { GenericResponses } from "../generic_responses.ts";
import { schoolGetAllQuerySchema, schoolTranslatedSchema } from "./schemas.ts";

export const schoolsAllRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['schools'],
    summary: 'Get all schools',
    description: 'Get all schools',
    request: {
        query: schoolGetAllQuerySchema
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
        params: schoolTranslatedSchema.pick({ id: true }).openapi('School id'),
        query: schoolGetAllQuerySchema.pick({ language: true }).partial()
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