import {
	serveStatic,
	secureHeaders,
	cors,
	prettyJSON,
	etag,
} from "hono/middleware";
import type { Context } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { apiReference } from "@scalar/hono-api-reference";
import schoolsApi from "./api/v1/schools/index.ts";
import paradesApi from "./api/v1/parades/index.ts";
import instrumentsApi from "./api/v1/instruments/index.ts";
import authApi from "./api/v1/auth/index.ts";
import { HTTPException } from "hono/http-exception";

const app = new OpenAPIHono();

//TODO(hectorAguero): Cache is not working in Deno Deploy at 2024-04-4
app.use("*", cors(), secureHeaders(), prettyJSON(), etag());
app.use("/static/*", serveStatic({ root: "/assets" }));
app.use("/favicon.ico", serveStatic({ path: "/assets/favicon.ico" }));

// Routing
app.get("/", (c: Context) => c.redirect("/doc"));
// Custom Not Found Message
app.notFound((c: Context) => {
	return c.text("Custom Batu 404 Not Found", 404);
});

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

Deno.serve({ port: 8787 }, app.fetch);
