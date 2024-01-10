import { serveStatic } from "hono/serveStatic"
import { prettyJSON } from "hono/prettyJSON"
import { cors } from "hono/cors"
import { etag } from "hono/etag"
import { Context } from 'hono'
import { OpenAPIHono } from '@hono/zod-openapi'
import { apiReference } from "@scalar/hono-api-reference";
import schoolsApi from "./api/v1/schools/index.ts";

const app = new OpenAPIHono();


app.use('/static/*', serveStatic({ root: '/assets' }));
app.use('/favicon.ico', serveStatic({ path: '/assets/favicon.ico' }));
// pretty json
app.use('*', prettyJSON());
// cors
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