
import { z } from "@hono/zod-openapi";

const values = ["en", "es", "ja", "pt"] as const;
export const languages = z.enum(values).openapi({ example: 'en' });
export const languageValues = values as readonly string[];


// deno-lint-ignore no-explicit-any
export function getValues<T extends Record<string, any>>(obj: T) {
    return Object.values(obj) as [(typeof obj)[keyof T]]
}