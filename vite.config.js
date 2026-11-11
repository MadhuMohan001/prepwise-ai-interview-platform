import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { createGeminiHandler } from './src/server/gemini.js';

function localApiPlugin(apiKey) {
  const routes = [
    ['/api/generate-question', createGeminiHandler('generate', { env: { GEMINI_API_KEY: apiKey } })],
    ['/api/evaluate-answer', createGeminiHandler('evaluate', { env: { GEMINI_API_KEY: apiKey } })],
  ];

  return {
    name: 'prepwise-local-api',
    configureServer(server) {
      routes.forEach(([path, handler]) => {
        server.middlewares.use(path, (req, res) => {
          if (req.method !== 'POST') {
            invokeHandler(handler, req, res);
            return;
          }

          let body = '';
          let oversized = false;
          req.setEncoding('utf8');
          req.on('data', (chunk) => {
            if (body.length + chunk.length > 16_000) {
              oversized = true;
            } else if (!oversized) {
              body += chunk;
            }
          });
          req.on('end', () => {
            if (oversized) {
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({
                error: { code: 'REQUEST_TOO_LARGE', message: 'The request is too large. Shorten your answer and retry.' },
              }));
              return;
            }

            try {
              req.body = body ? JSON.parse(body) : undefined;
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({
                error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' },
              }));
              return;
            }

            invokeHandler(handler, req, res);
          });
          req.on('error', () => {
            if (!res.headersSent) {
              res.statusCode = 400;
              res.end();
            }
          });
        });
      });
    },
  };
}

function invokeHandler(handler, req, res) {
  const response = {
    setHeader(name, value) {
      res.setHeader(name, value);
      return this;
    },
    status(statusCode) {
      res.statusCode = statusCode;
      return this;
    },
    json(payload) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
      return this;
    },
  };
  handler(req, response).catch(() => {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({
        error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' },
      }));
    }
  });
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), localApiPlugin(loadEnv(mode, globalThis.process.cwd(), 'GEMINI_').GEMINI_API_KEY)],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**'],
    },
  },
}));
