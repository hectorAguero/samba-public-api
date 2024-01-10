import { OpenAPIHono } from "@hono/zod-openapi";
import { schoolsAllRoute } from './routes.ts';
import { supportedLanguages } from "../supported_languages.ts";
import { getSchools } from './model.ts';
import Negotiator from "negotiator";


const schoolsApi = new OpenAPIHono();

// Set the `/posts` as a base path in the document.
schoolsApi.openapi(schoolsAllRoute,
    async (c) => {
        let { language } = c.req.query();
        if (language == null || language == undefined) {
            const negotiator = new Negotiator(c.req.raw.headers)
            language = negotiator.language(supportedLanguages)
        }
        language = language != null && supportedLanguages.includes(language) ? language : 'en'
        const schools = await getSchools(language);
        return c.json(schools);
    },
);
export default schoolsApi;