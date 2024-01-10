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