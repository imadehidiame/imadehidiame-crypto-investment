// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { asyncInitSocket } from './lib/socket';



const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
let io;

app.prepare().then(async () => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  console.log('Initializing Socket.IO...');
  try {
    await asyncInitSocket(server);
    console.log('✅ Socket.IO ready');
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
  }
  
  server.listen(port, hostname, () => {
    console.log(`\n🚀 Socket Server running on http://localhost:${port}`);
  });
});

