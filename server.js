// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('/lib/socket');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3001');   // Default to 3001 for socket server

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize Socket.IO
  initSocket(server);

  server.listen(port, hostname, () => {
    console.log(`\n🚀 Socket.IO + Next.js Server running on http://localhost:${port}`);
    console.log(`🔌 WebSocket available at ws://localhost:${port}\n`);
  });
});