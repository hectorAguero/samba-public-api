import { createRoute } from "@hono/zod-openapi";
import { supportedLanguages } from "../supported_languages.ts";
import { GenericResponses } from "../generic_responses.ts";
import { schoolTranslatedSchema } from "./schemas.ts";

export const schoolsAllRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['schools'],
    summary: 'Get all schools',
    description: 'Get all schools',
    query: {
        language: {
            type: 'string',
            enum: supportedLanguages
        }
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
    query: {
        language: {
            type: 'string',
            enum: supportedLanguages
        }
    },
    params: {
        id: {
            type: 'number',
            required: true
        }
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