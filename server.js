import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import { createServer } from 'node:http';

import { Server as SocketServer } from 'socket.io';

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js';
const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PORT = Number.parseInt(process.env.PORT || '3000');

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

app.use(compression());
app.disable('x-powered-by');

const sockets = new Set();
io.on('connection', (socket) => {
  console.log(socket.id, 'connected');
  sockets.add(socket);

  for (const s of sockets) {
    s.emit('message', `User ${socket.id} connected`);
  }

  socket.on('disconnect', (reason) => {
    console.log(socket.id, 'disconnected:', reason);
    sockets.delete(socket);
  });

  socket.on('message', (message) => {
    for (const s of sockets) {
      s.emit('message', `${socket.id}: ${message}`);
    }
  });
});

if (DEVELOPMENT) {
  console.log('Starting development server');
  const viteDevServer = await import('vite').then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule('./server/app.ts');
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === 'object' && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log('Starting production server');
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' })
  );
  app.use(express.static('build/client', { maxAge: '1h' }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}

app.use(morgan('tiny'));

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
