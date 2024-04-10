import { OpenAPIHono } from "@hono/zod-openapi";
import { instrumentsAllRoute, instrumentsByIdRoute } from "./routes.ts";
import { getInstruments, getInstrumentById } from "./model.ts";
import Negotiator from "negotiator";
import { languageValues } from "../supported_languages.ts";

const instrumentsApi = new OpenAPIHono();

instrumentsApi.openapi(instrumentsAllRoute, async (c) => {
	let { language, ...query } = c.req.query();
	const ids = c.req.queries("id")?.flatMap((id) => Number.parseInt(id));
	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	if (!languageValues.includes(language)) {
		language = "en";
	}
	const instruments = await getInstruments({
		language: language as "en" | "es" | "ja" | "pt",
		...query,
		ids,
	});

	return c.json(instruments);
});

instrumentsApi.openapi(instrumentsByIdRoute, async (c) => {
	const id = Number.parseInt(c.req.param("id"));
	let { language } = c.req.query();
	if (language == null || language === undefined) {
		const negotiator = new Negotiator(c.req.raw.headers);
		language = negotiator.language([...languageValues]);
	}
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const instrument = await getInstrumentById(id, language);
	if (!instrument) {
		console.error("Instrument not found");
		return c.json({ error: "Instrument not found" }, 404);
	}
	return c.json(instrument);
});
export default instrumentsApi;
