
import { z } from "@hono/zod-openapi";

const values = ["en", "es", "ja", "pt"] as const;
export const languages = z.enum(values).openapi({ example: 'en' });
export const languageValues = values as readonly string[];