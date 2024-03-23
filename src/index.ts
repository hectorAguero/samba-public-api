import { cors, serveStatic } from "hono/middleware"
import { prettyJSON } from "hono/prettyJSON"
import { etag } from "hono/etag"
import type { Context } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from "@scalar/hono-api-reference";
import schoolsApi from "./api/v1/schools/index.ts";
import paradesApi from "./api/v1/parades/index.ts";

const app = new OpenAPIHono();

//TODO(hectorAguero): Still not working in Deno Deploy 2023-01-15
// app.get('*',cache({cacheName: 'samba-cache',cacheControl: 'max-age=3600',wait: true}))

//@ts-expect-error Hono middleware is from a differnt dependency, deno
app.use('/static/*', serveStatic({ root: '/assets' }));
//@ts-expect-error Hono middleware is from a differnt dependency, deno
app.use('/favicon.ico', serveStatic({ path: '/assets/favicon.ico' }));

// pretty json
app.use('*', prettyJSON());
// cors from deno depency
//@ts-expect-error Hono middleware is from a differnt dependency, deno
app.use('*', cors());
// etag hash
app.use('*', etag());
// Routing
app.get('/', (c: Context) => c.redirect('/doc'));
// Custom Not Found Message
app.notFound((c: Context) => {
    return c.text('Custom Batu 404 Not Found', 404);
});
// Error handling
app.onError((err, c: Context) => {
    console.error(err);
    // Handle other errors
    return c.text('Internal Server Error', 500);
});

// Grouping, Nested Routes
app.route('/schools', schoolsApi);
app.route('/parades', paradesApi);
// The OpenAPI documentation will be available at /doc
app.doc('/openapi.json', {
    openapi: '3.1.0',
    info: {
        version: '1.0.0',
        title: 'Samba API',
        description: 'API for Samba',
    },
    tags: [
        {
            name: 'Schools',
            description: 'Schools API Endpoints',
        },
        {
            name: 'Parades',
            description: 'Parades API Endpoints',
        },

    ],
})

app.get(
    '/doc',
    apiReference({
        pageTitle: 'Samba API Reference',
        theme: 'purple',
        spec: {
            url: 'openapi.json',
        },
    }),
)

Deno.serve({ port: 8787 }, app.fetch);