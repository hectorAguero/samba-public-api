import { OpenAPIHono } from "@hono/zod-openapi";
import { instrumentsAllRoute, instrumentsByIdRoute } from "./routes.ts";
import { getInstruments, getInstrumentById } from "./model.ts";
import { languageValues } from "../supported_languages.ts";
import { env } from "hono/adapter";

const instrumentsApi = new OpenAPIHono();

instrumentsApi.openapi(instrumentsAllRoute, async (c) => {
	let { language, ...query } = c.req.query();
	if (!languageValues.includes(language)) {
		language = "en";
	}
	const namespace = env(c).__STATIC_CONTENT as KVNamespace<string> | undefined;
	const imageServer = env(c).IMAGE_SERVER as string;
	console.log("instrumentsAllRoute", namespace);
	const instruments = await getInstruments(namespace, imageServer, {
		language: language as "en" | "es" | "ja" | "pt",
		...query,
	});

	return c.json(instruments);
});

instrumentsApi.openapi(instrumentsByIdRoute, async (c) => {
	const id = Number.parseInt(c.req.param("id"));
	let { language } = c.req.query();
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const namespace = env(c).__STATIC_CONTENT as KVNamespace<string> | undefined;
	const imageServer = env(c).IMAGE_SERVER as string;
	const instrument = await getInstrumentById({
		namespace,
		imageServer,
		id,
		language,
	});
	if (!instrument) {
		console.error("Instrument not found");
		return c.json({ error: "Instrument not found" }, 404);
	}
	return c.json(instrument);
});
export default instrumentsApi;
