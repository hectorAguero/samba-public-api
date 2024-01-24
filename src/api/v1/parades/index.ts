import { OpenAPIHono } from "@hono/zod-openapi";
import Negotiator from "negotiator";
import { languageValues } from '../supported_languages.ts';
import { paradesAllRoute, paradesByIdRoute } from "./routes.ts";
import { getParadeById, getParades } from "./model.ts";


const paradesApi = new OpenAPIHono();

// Set the `/posts` as a base path in the document.
paradesApi.openapi(paradesAllRoute,
    async (c) => {
        let { language, ...params } = c.req.query();
        if (language == null || language == undefined) {
            const negotiator = new Negotiator(c.req.raw.headers)
            language = negotiator.language([...languageValues])
        }
        language = language != null && languageValues.includes(language) ? language : 'en'
        const parades = await getParades({ ...params, language: language as "en" | "es" | "ja" | "pt" | undefined });
        return c.json(parades);
    },
);

paradesApi.openapi(paradesByIdRoute,
    async (c) => {
        const id = parseInt(c.req.param('id'));
        let { language } = c.req.query();
        if (language == null || language == undefined) {
            const negotiator = new Negotiator(c.req.raw.headers)
            language = negotiator.language([...languageValues])
        }
        language = language != null && languageValues.includes(language) ? language : 'en'
        const parade = await getParadeById(id, language);
        if (!parade) {
            console.log('Parade not found');
            return c.json({ error: 'Parade not found' }, 404);
        }
        return c.json(parade);
    },
);
export default paradesApi;