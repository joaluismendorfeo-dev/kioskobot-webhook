const http = require('http');
const https = require('https');

const VERIFY_TOKEN = 'kioskobot2026';
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = '1157127870810904';
const BASE44_APP_ID = '69effe843588f736a78e361e';
const BASE44_API = 'api.base44.com';

// Sesiones activas por usuario: { from: { step, cart, name, address } }
const sessions = {};

// ─── Base44 API ───────────────────────────────────────────────────────────────

function base44Request(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const options = {
      hostname: BASE44_API,
      path: `/api/apps/${BASE44_APP_ID}/entities${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.BASE44_API_KEY || ''
      }
    };
    if (body) options.headers['Content-Length'] = Buffer.byteLength(body);

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(responseBody)); }
        catch (e) { resolve({}); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getCategories() {
  try {
    const result = await base44Request('GET', '/Category/?active=true');
    return (result.records || result || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (e) { return []; }
}

async function getProductsByCategory(categoryId) {
  try {
    const result = await base44Request('GET', `/Product/?category_id=${categoryId}&active=true`);
    return result.records || result || [];
  } catch (e) { return []; }
}

async function getStoreConfig() {
  try {
    const result = await base44Request('GET', '/StoreConfig/');
    const records = result.records || result || [];
    return records[0] || {};
  } catch (e) { return {}; }
}

async function createOrder(orderData) {
  try {
    const result = await base44Request('POST', '/Order/', orderData);
    return result;
  } catch (e) { return null; }
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

function sendMessage(to, message) {
  const data = JSON.stringify({
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: { body: message }
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/v19.0/${PHONE_NUMBER_ID}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log('WA response:', res.statusCode, body));
  });
  req.on('error', e => console.error('Error WA:', e.message));
  req.write(data);
  req.end();
}

// ─── Lógica del bot ───────────────────────────────────────────────────────────

function formatPrice(price) {
  return `$${Number(price).toLocaleString('es-AR')}`;
}

function getSession(from) {
  if (!sessions[from]) {
    sessions[from] = { step: 'inicio', cart: [], name: '', address: '' };
  }
  return sessions[from];
}

function resetSession(from) {
  sessions[from] = { step: 'inicio', cart: [], name: '', address: '' };
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartSummary(cart) {
  return cart.map(i => `  • ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}`).join('\n');
}

async function handleMessage(from, text) {
  const session = getSession(from);
  const input = (text || '').trim().toLowerCase();

  // Comandos globales
  if (input === 'cancelar' || input === 'cancel') {
    resetSession(from);
    sendMessage(from, '❌ Pedido cancelado. Escribí *hola* para empezar de nuevo.');
    return;
  }

  if (input === 'carrito') {
    if (session.cart.length === 0) {
      sendMessage(from, '🛒 Tu carrito está vacío.');
    } else {
      sendMessage(from, `🛒 *Tu carrito:*\n${cartSummary(session.cart)}\n\n*Total: ${formatPrice(cartTotal(session.cart))}*`);
    }
    return;
  }

  // ── PASO: inicio ─────────────────────────────────────────────────────────
  if (session.step === 'inicio' || input === 'hola' || input === 'menu' || input === 'menú') {
    const config = await getStoreConfig();
    const categories = await getCategories();

    if (!config.open) {
      sendMessage(from, '😴 Lo sentimos, el local está cerrado ahora. ¡Volvé más tarde!');
      return;
    }

    let msg = `${config.welcome_message || '¡Hola! Bienvenido a FA24 🛍️'}\n\n`;
    msg += `📋 *Categorías disponibles:*\n`;
    categories.forEach((cat, i) => {
      msg += `${i + 1}. ${cat.emoji || ''} ${cat.name}\n`;
    });
    msg += `\nRespondé con el *número* de la categoría que querés ver.\n`;
    msg += `\n💡 Otros comandos:\n• *carrito* - ver tu pedido\n• *confirmar* - finalizar pedido\n• *cancelar* - empezar de nuevo`;

    session.step = 'elegir_categoria';
    session.categories = categories;
    sendMessage(from, msg);
    return;
  }

  // ── PASO: elegir categoría ────────────────────────────────────────────────
  if (session.step === 'elegir_categoria') {
    const num = parseInt(input);
    const categories = session.categories || [];

    if (isNaN(num) || num < 1 || num > categories.length) {
      sendMessage(from, `Por favor respondé con un número del 1 al ${categories.length}.`);
      return;
    }

    const cat = categories[num - 1];
    const products = await getProductsByCategory(cat.id);
    const available = products.filter(p => p.active && p.stock > 0);

    if (available.length === 0) {
      sendMessage(from, `😕 No hay productos disponibles en *${cat.name}* ahora mismo. Elegí otra categoría.`);
      return;
    }

    let msg = `${cat.emoji || ''} *${cat.name}*\n\n`;
    available.forEach((p, i) => {
      msg += `${i + 1}. ${p.name} - ${formatPrice(p.price)}\n`;
    });
    msg += `\nRespondé con el *número* del producto que querés agregar al carrito.\nO escribí *volver* para ver las categorías.`;

    session.step = 'elegir_producto';
    session.currentCategory = cat;
    session.currentProducts = available;
    sendMessage(from, msg);
    return;
  }

  // ── PASO: elegir producto ─────────────────────────────────────────────────
  if (session.step === 'elegir_producto') {
    if (input === 'volver') {
      session.step = 'elegir_categoria';
      const categories = session.categories || [];
      let msg = `📋 *Categorías disponibles:*\n`;
      categories.forEach((cat, i) => { msg += `${i + 1}. ${cat.emoji || ''} ${cat.name}\n`; });
      msg += `\nElegí una categoría:`;
      sendMessage(from, msg);
      return;
    }

    if (input === 'confirmar') {
      if (session.cart.length === 0) {
        sendMessage(from, '🛒 Tu carrito está vacío. Agregá productos primero.');
        return;
      }
      session.step = 'pedir_nombre';
      sendMessage(from, `¿Cuál es tu *nombre y apellido*?`);
      return;
    }

    const num = parseInt(input);
    const products = session.currentProducts || [];

    if (isNaN(num) || num < 1 || num > products.length) {
      sendMessage(from, `Por favor respondé con un número del 1 al ${products.length}, *volver* o *confirmar*.`);
      return;
    }

    const product = products[num - 1];
    const existing = session.cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      session.cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }

    const total = cartTotal(session.cart);
    let msg = `✅ *${product.name}* agregado al carrito!\n\n`;
    msg += `🛒 *Carrito actual:*\n${cartSummary(session.cart)}\n\n`;
    msg += `*Total: ${formatPrice(total)}*\n\n`;
    msg += `Respondé con:\n• Un *número* para agregar otro producto\n• *volver* para cambiar de categoría\n• *confirmar* para finalizar el pedido`;

    sendMessage(from, msg);
    return;
  }

  // ── PASO: pedir nombre ────────────────────────────────────────────────────
  if (session.step === 'pedir_nombre') {
    if (text.trim().length < 3) {
      sendMessage(from, 'Por favor ingresá tu nombre completo.');
      return;
    }
    session.name = text.trim();
    session.step = 'pedir_direccion';
    sendMessage(from, `📍 ¿Cuál es tu *dirección de entrega*? (calle, número, piso/depto si aplica)`);
    return;
  }

  // ── PASO: pedir dirección ─────────────────────────────────────────────────
  if (session.step === 'pedir_direccion') {
    if (text.trim().length < 5) {
      sendMessage(from, 'Por favor ingresá una dirección válida.');
      return;
    }
    session.address = text.trim();
    session.step = 'confirmar_pedido';

    const config = await getStoreConfig();
    const total = cartTotal(session.cart);
    const minOrder = config.min_order || 0;

    if (total < minOrder) {
      sendMessage(from, `⚠️ El pedido mínimo es ${formatPrice(minOrder)}. Tu total actual es ${formatPrice(total)}. Agregá más productos con *volver*.`);
      session.step = 'elegir_producto';
      return;
    }

    let msg = `📦 *Resumen de tu pedido:*\n\n`;
    msg += `👤 *Nombre:* ${session.name}\n`;
    msg += `📍 *Dirección:* ${session.address}\n\n`;
    msg += `🛒 *Productos:*\n${cartSummary(session.cart)}\n\n`;
    msg += `💰 *Total: ${formatPrice(total)}*\n`;
    if (config.delivery_fee > 0) msg += `🚚 *Envío: ${formatPrice(config.delivery_fee)}*\n`;
    if (config.mercadopago_alias) msg += `\n💳 *Pago:* Transferencia al alias *${config.mercadopago_alias}*\n`;
    msg += `\n¿Confirmás el pedido?\n✅ Respondé *SI* para confirmar\n❌ Respondé *NO* para cancelar`;

    sendMessage(from, msg);
    return;
  }

  // ── PASO: confirmación final ──────────────────────────────────────────────
  if (session.step === 'confirmar_pedido') {
    if (input === 'si' || input === 'sí' || input === 's') {
      const config = await getStoreConfig();
      const total = cartTotal(session.cart);

      const orderData = {
        customer_name: session.name,
        customer_phone: from,
        customer_address: session.address,
        items: session.cart.map(i => ({ product_id: i.id, name: i.name, price: i.price, quantity: i.qty })),
        total: total + (config.delivery_fee || 0),
        status: 'pending',
        notes: '',
        whatsapp_session_id: from
      };

      await createOrder(orderData);

      let msg = `🎉 *¡Pedido confirmado!*\n\n`;
      msg += `Tu pedido fue recibido y está siendo preparado.\n`;
      if (config.mercadopago_alias) {
        msg += `\n💳 Recordá transferir *${formatPrice(total)}* al alias *${config.mercadopago_alias}*\n`;
      }
      msg += `\n¡Gracias por elegirnos! 🙌`;

      sendMessage(from, msg);
      resetSession(from);

    } else if (input === 'no' || input === 'n') {
      resetSession(from);
      sendMessage(from, '❌ Pedido cancelado. Escribí *hola* para empezar de nuevo.');
    } else {
      sendMessage(from, 'Respondé *SI* para confirmar o *NO* para cancelar.');
    }
    return;
  }

  // ── Mensaje no reconocido ─────────────────────────────────────────────────
  sendMessage(from, '👋 Escribí *hola* para ver el menú y hacer tu pedido.');
}

// ─── Servidor HTTP ────────────────────────────────────────────────────────────

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
      req.on('end', async () => {
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
            console.log(`Mensaje de ${from}: ${text}`);
            await handleMessage(from, text || '');
          }
        } catch (e) {
          console.error('Error procesando mensaje:', e.message);
        }
        res.writeHead(200);
        res.end('OK');
      });

    } else {
      res.writeHead(200);
      res.end('OK');
    }

  } catch (e) {
    console.error('Error servidor:', e.message);
    res.writeHead(500);
    res.end('Error');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`KioskoBot corriendo en puerto ${PORT}`);
});
