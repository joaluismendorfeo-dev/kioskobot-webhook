const http = require('http');
const https = require('https');

const VERIFY_TOKEN = 'kioskobot2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = '1157127870810904';

function sendWhatsAppMessage(to, message) {
  const data = JSON.stringify({
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: message }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: '/v25.0/' + PHONE_NUMBER_ID + '/messages',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + WHATSAPP_TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    console.log('WhatsApp API status: ' + res.statusCode);
  });

  req.on('error', (e) => {
    console.error('Error enviando mensaje: ' + e.message);
  });

  req.write(data);
  req.end();
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET') {
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

    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
          const entry = payload.entry && payload.entry[0];
          const changes = entry && entry.changes && entry.changes[0];
          const value = changes && changes.value;
          const messages = value && value.messages;

          if (messages && messages[0]) {
            const msg = messages[0];
            const from = msg.from;
            const text = msg.text && msg.text.body;
            console.log('Mensaje de ' + from + ': ' + text);

            // Respuesta automatica
            sendWhatsAppMessage(from, 'Hola! Recibimos tu mensaje. En breve te respondemos. 👋');
          }
        } catch (e) {
          console.error('Error procesando mensaje: ' + e.message);
        }
        res.writeHead(200);
        res.end('OK');
      });

    } else {
      res.writeHead(200);
      res.end('OK');
    }

  } catch (e) {
    res.writeHead(500);
    res.end('Error');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('KioskoBot corriendo en puerto ' + PORT);
});
