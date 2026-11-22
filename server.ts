import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { serverEnv } from './server/lib/env.ts';
import { createApiApp } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = createApiApp();

  // Vite dev middleware or production static build
  if (serverEnv.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(serverEnv.PORT, '0.0.0.0', () => {
    console.log(`LearnNest server running on http://0.0.0.0:${serverEnv.PORT}`);
  });
}

startServer().catch((err) => {
  console.error(
    'Failed to start LearnNest server:',
    err instanceof Error ? err.message : 'Unknown error'
  );
  process.exit(1);
});
