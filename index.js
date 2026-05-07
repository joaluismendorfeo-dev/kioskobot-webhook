const http = require('http');

const VERIFY_TOKEN = 'kioskobot2026';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
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
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Webhook corriendo en puerto ${PORT}`));
