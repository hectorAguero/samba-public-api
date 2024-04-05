import { OpenAPIHono } from "@hono/zod-openapi";
import { schoolsAllRoute, schoolsByIdRoute } from "./routes.ts";
import { getSchools, getSchoolById } from "./model.ts";
import { languageValues } from "../supported_languages.ts";
import { env } from "hono/adapter";

const schoolsApi = new OpenAPIHono();

schoolsApi.openapi(schoolsAllRoute, async (c) => {
	let { language, ...query } = c.req.query();
	language =
		language != null && languageValues.includes(language) ? language : "en";

	const namespace = env(c).__STATIC_CONTENT as KVNamespace<string> | undefined;
	const imageServer = env(c).IMAGE_SERVER as string;
	console.log("schoolsAllRoute", namespace);
	const schools = await getSchools(namespace, imageServer, {
		language,
		...query,
	});
	return c.json(schools);
});

schoolsApi.openapi(schoolsByIdRoute, async (c) => {
	const id = Number.parseInt(c.req.param("id"));
	let { language } = c.req.query();
	language =
		language != null && languageValues.includes(language) ? language : "en";
	const namespace = env(c).__STATIC_CONTENT as KVNamespace<string> | undefined;
	const imageServer = env(c).IMAGE_SERVER as string;
	const school = await getSchoolById({ id, language, namespace, imageServer });
	if (!school) {
		console.error("School not found");
		return c.json({ error: "School not found" }, 404);
	}
	return c.json(school);
});
export default schoolsApi;
