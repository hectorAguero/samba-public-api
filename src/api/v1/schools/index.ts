import { OpenAPIHono } from "@hono/zod-openapi";
import {
	schoolsAllRoute,
	schoolsByIdRoute,
	schoolsSearchRoute,
} from "./routes.ts";
import { getSchools, getSchoolById } from "./model.ts";
import Negotiator from "negotiator";
import { languageValues } from "../supported_languages.ts";
import { searchSchools } from "./model.ts";

const schoolsApi = new OpenAPIHono();

schoolsApi.openapi(schoolsAllRoute, async (c) => {
	let { language, ...query } = c.req.query();
	const ids = c.req.queries("id")?.flatMap((id) => Number.parseInt(id));
	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const schools = await getSchools({ language, ...query, ids });
	return c.json(schools);
});

schoolsApi.openapi(schoolsSearchRoute, async (c) => {
	let { language, search, ...query } = c.req.query();

	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const schools = await searchSchools({
		search,
		language,
		...query,
	});
	return c.json(schools);
});

schoolsApi.openapi(schoolsByIdRoute, async (c) => {
	const id = Number.parseInt(c.req.param("id"));
	let { language } = c.req.query();
	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const school = await getSchoolById(id, language);
	if (!school) {
		console.error("School not found");
		return c.json({ error: "School not found" }, 404);
	}
	return c.json(school);
});
export default schoolsApi;
