import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import type { Context } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
// @ts-expect-error __STATIC_CONTENT_MANIFEST is not typed
import manifest from "__STATIC_CONTENT_MANIFEST";
import { cache } from "hono/cache";
import { cors } from "hono/cors";
import { etag } from "hono/etag";
import { trimTrailingSlash } from "hono/trailing-slash";
import { HTTPException } from "hono/http-exception";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";

import authApi from "./api/v1/auth/index.ts";
import instrumentsApi from "./api/v1/instruments/index.ts";
import paradesApi from "./api/v1/parades/index.ts";
import schoolsApi from "./api/v1/schools/index.ts";

const app = new OpenAPIHono<{
	Bindings: { __STATIC_CONTENT: KVNamespace };
	strict: true;
}>();

app.get("/static/*", serveStatic({ root: "./", manifest }));
app.get("/favicon.ico", serveStatic({ path: "./favicon.ico", manifest }));
app.use(
	"*",
	trimTrailingSlash(),
	cors(),
	secureHeaders(),
	prettyJSON(),
	etag(),
	cache({
		cacheName: "samba",
		cacheControl: "max-age=3600",
	}),
);

// Main Route
app.get("/", (c: Context) => c.redirect("/doc"));
// Grouping, Nested Routes
app.route("/schools", schoolsApi);
app.route("/parades", paradesApi);
app.route("/instruments", instrumentsApi);
app.route("/auth", authApi);
// Error Handling
app.onError((err, c) => {
	console.error(err);
	if (err instanceof HTTPException) {
		return c.json({ success: false, message: err.message }, err.status);
	}

	return c.json({ success: false, message: "Internal Server Error" }, 500);
});

// The OpenAPI documentation will be available at /doc
app.doc("/openapi.json", {
	openapi: "3.1.0",
	info: {
		version: "1.0.0",
		title: "Samba API",
		description: "API for Samba",
	},
	tags: [
		{
			name: "Auth",
			description: "Auth API Endpoints",
		},
		{
			name: "Schools",
			description: "Schools API Endpoints",
		},
		{
			name: "Parades",
			description: "Parades API Endpoints",
		},
	],
});

app.get(
	"/doc",
	apiReference({
		pageTitle: "Samba API Reference",
		theme: "purple",
		spec: {
			url: "openapi.json",
		},
	}),
);

// Registering Security Schemes
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
});

export default app;
