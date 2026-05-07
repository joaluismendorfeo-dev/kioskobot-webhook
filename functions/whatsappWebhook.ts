const VERIFY_TOKEN = 'kioskobot2026';

Deno.serve(async (req) => {
  // Verificación del webhook (GET request de Meta)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    console.log(`Verificación recibida: mode=${mode}, token=${token}, challenge=${challenge}`);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verificado correctamente');
      return new Response(challenge, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    } else {
      console.log(`Token incorrecto. Recibido: "${token}", Esperado: "${VERIFY_TOKEN}"`);
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Recepción de mensajes (POST request de Meta)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Mensaje recibido:', JSON.stringify(body));

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const text = message.text?.body || '';
        console.log(`Mensaje de ${from}: ${text}`);
      }

      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return new Response('Error', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});
