import { OpenAPIHono } from "@hono/zod-openapi";
import { schoolsAllRoute, schoolsByIdRoute } from './routes.ts';
import { supportedLanguages } from "../supported_languages.ts";
import { getSchools, getSchoolById } from './model.ts';
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

schoolsApi.openapi(schoolsByIdRoute,
    async (c) => {
        const id = parseInt(c.req.param('id'));
        let { language } = c.req.query();
        if (language == null || language == undefined) {
            const negotiator = new Negotiator(c.req.raw.headers)
            language = negotiator.language(supportedLanguages)
        }
        language = language != null && supportedLanguages.includes(language) ? language : 'en'
        const school = await getSchoolById(id, language);
        if (!school) {
            console.log('School not found');
            return c.json({ error: 'School not found' }, 404);
        }
        return c.json(school);
    },
);
export default schoolsApi;