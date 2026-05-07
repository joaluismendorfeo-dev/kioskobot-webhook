const http = require('http');

const VERIFY_TOKEN = 'kioskobot2026';

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    
    if ([req.me](https://req.me)thod === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        res.writeHead(200);
        res.end(challenge);
      } else {
        res.writeHead(403);
        res.end('Forbidden');
      }
    } else {
      res.writeHead(200);
      res.end('OK');
    }
  } catch (e) {
    res.writeHead(500);
    res.end('Error');
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Webhook corriendo en puerto ' + PORT);
});
