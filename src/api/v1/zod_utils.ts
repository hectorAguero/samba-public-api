import { z } from "@hono/zod-openapi";

export const zFilterObject = z.string().transform((filter) => filter.split(';').map(filter => {
    const [key, value] = filter.split('=');
    return { key, value };
}))