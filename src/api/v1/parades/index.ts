import { OpenAPIHono } from "@hono/zod-openapi";
import Negotiator from "negotiator";
import { languageValues } from "../supported_languages.ts";
import { getParadesRoute, paradeByIdRoute } from "./routes.ts";
import { getParadeById, getParades } from "./model.ts";
import { paradesSearchRoute } from "./routes.ts";
import { searchParades } from "./model.ts";

const paradesApi = new OpenAPIHono();

// Set the `/posts` as a base path in the document.
paradesApi.openapi(getParadesRoute, async (c) => {
	let { language, ...params } = c.req.query();
	const ids = c.req.queries("id")?.flatMap((id) => Number.parseInt(id));
	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	if (!languageValues.includes(language)) {
		language = "en";
	}
	const parades = await getParades({
		...params,
		language: language as "en" | "es" | "ja" | "pt",
		ids,
	});
	return c.json(parades);
});

paradesApi.openapi(paradesSearchRoute, async (c) => {
	let { language, search, ...query } = c.req.query();

	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const schools = await searchParades({
		search,
		language: language as "en" | "es" | "ja" | "pt",
		...query,
	});
	return c.json(schools);
});

paradesApi.openapi(paradeByIdRoute, async (c) => {
	const id = Number.parseInt(c.req.param("id"));
	let { language } = c.req.query();
	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const parade = await getParadeById(id, language);
	if (!parade) {
		console.error("Parade not found");
		return c.json({ error: "Parade not found" }, 404);
	}
	return c.json(parade);
});

export default paradesApi;
