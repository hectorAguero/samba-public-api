import { OpenAPIHono } from "@hono/zod-openapi";
import { languageValues } from "../supported_languages.ts";
import { getParadesRoute, paradeByIdRoute } from "./routes.ts";
import { getParadeById, getParades } from "./model.ts";
import { env } from "hono/adapter";

const paradesApi = new OpenAPIHono();

// Set the `/posts` as a base path in the document.
paradesApi.openapi(getParadesRoute, async (c) => {
	let { language, ...params } = c.req.query();
	if (!languageValues.includes(language)) {
		language = "en";
	}
	const namespace = env(c).__STATIC_CONTENT as KVNamespace<string> | undefined;
	const imageServer = env(c).IMAGE_SERVER as string;
	const parades = await getParades(imageServer, namespace, {
		...params,
		language: language as "en" | "es" | "ja" | "pt",
	});
	return c.json(parades);
});

paradesApi.openapi(paradeByIdRoute, async (c) => {
	const id = Number.parseInt(c.req.param("id"));
	let { language } = c.req.query();
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const namespace = env(c).__STATIC_CONTENT as KVNamespace<string> | undefined;
	const imageServer = env(c).IMAGE_SERVER as string;
	const parade = await getParadeById({
		id,
		language,
		imageServer,
		namespace,
	});
	if (!parade) {
		console.error("Parade not found");
		return c.json({ error: "Parade not found" }, 404);
	}
	return c.json(parade);
});

export default paradesApi;
