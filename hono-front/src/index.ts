import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

// Global middlewares for fast and fluid frontend connections
app.use('*', logger());
app.use('*', compress());
app.use('*', cors());

// Odoo REST API requests are handled directly by Nginx for speed and proper Set-Cookie support.
// Hono serves the frontend purely for blazing fast static content delivery with aggressive cache.

// Cache control for static assets to ensure fluid experiences
app.use('*', async (c, next) => {
  await next();
  const url = c.req.url;
  if (url.match(/\.(js|css|mp4|webm|png|jpg|jpeg|gif|svg)$/)) {
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.endsWith('.html') || url === '/') {
    c.header('Cache-Control', 'no-cache, max-age=0, must-revalidate');
  }
});

// Serve frontend static files
app.use('/*', serveStatic({ 
  root: '../pc builder',
  rewriteRequestPath: (path) => path === '/' ? '/index.html' : path
}));

// Fallback to index.html for SPA routing
app.notFound(async (c) => {
  c.status(200); // 200 instead of 404 for React SPA
  const fs = await import('fs/promises');
  try {
    const html = await fs.readFile('../pc builder/index.html', 'utf-8');
    return c.html(html);
  } catch(e) {
    return c.text('Not Found', 404);
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`[Hono] Fast & Fluid Frontend Server running on http://localhost:${info.port}`);
});
