import { z } from "@hono/zod-openapi";
import { ZodTypeAny } from "zod";

export const zArrayFromString = <T extends ZodTypeAny>(schema: T) => {
    return z.preprocess((obj) => {
        if (Array.isArray(obj)) {
            return obj;
        } else if (typeof obj === "string") {
            return obj.split(",");
        } else {
            return [];
        }
    }, z.array(schema));
};