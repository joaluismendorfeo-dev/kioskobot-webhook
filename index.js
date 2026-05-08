const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = '1157127870810904';
const VERIFY_TOKEN = 'kioskobot2026';
const MERCADOPAGO_ALIAS = 'fa24encasa';
const MIN_ORDER = 30000;

// ─── COMBOS DE LANZAMIENTO ───────────────────────────────────────────────────

const COMBOS = [
  {
    id: 'combo001',
    name: '🎬 Combo Cine en Casa',
    price: 30000,
    description:
      '• 1 Gaseosa 500ml\n• 2 Snack Quento 90g\n• 2 Chocolates Cofler 55gr\n• 2 Gomitas Yummy 30gr',
  },
  {
    id: 'combo002',
    name: '📺 Combo Maratón Series',
    price: 30000,
    description:
      '• 1 Gaseosa 1500ml\n• 2 Snack Quento 90g\n• 2 Chocolates Cofler Air 55gr\n• 20 Caramelos ButterToffi',
  },
  {
    id: 'combo003',
    name: '🚬 Combo Fumador Ansioso',
    price: 30000,
    description:
      '• 1 Marlboro Box\n• 1 Encendedor Bic Maxi\n• 1 Snack Quento 90g\n• 1 Chocolate Milka 55g\n• 2 Alfajores Triple Arcor',
  },
  {
    id: 'combo004',
    name: '🍫 Combo Bajón Sweet/Salad',
    price: 30000,
    description:
      '• 1 Chocolate Cofler Block 110gr\n• 1 Kesitas 125gr\n• 1 Rex 125gr\n• 1 Coca Cola 500ml\n• 2 Gomitas Yummy 30gr',
  },
  {
    id: 'combo005',
    name: '🎉 Combo Previa',
    price: 30000,
    description:
      '• 2 Coca Cola 1500ml\n• 2 Cepita Naranja 1lt\n• 1 Hielo 3kg\n• 4 Gomitas Yummy 30gr',
  },
  {
    id: 'combo006',
    name: '🧉 Combo Matero',
    price: 30000,
    description:
      '• 1 Yerba Amanda 500gr\n• 1 Azúcar 1kg\n• 1 Surtido Diversión 390gr\n• 30 Caramelos Butter Toffie\n• 2 Alfajores Triple Arcor\n• 2 Don Satur',
  },
  {
    id: 'combo007',
    name: '🛡️ Combo Safe',
    price: 30000,
    description:
      '• 2 Prime\n• 2 Monster\n• 1 Beldent\n• 1 Halls',
  },
];

// ─── CATÁLOGO ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: '69f000469cc4196e1b93ea27', name: 'Bebidas', emoji: '🥤', order: 1 },
  { id: '69f000469cc4196e1b93ea28', name: 'Golosinas', emoji: '🍬', order: 2 },
  { id: '69f0e4ef4de5adae291d0409', name: 'Snack Quento', emoji: '🛍️', order: 3 },
  { id: '69f000469cc4196e1b93ea2a', name: 'Almacén', emoji: '🛒', order: 4 },
  { id: '69f000469cc4196e1b93ea2b', name: 'Cigarrillos', emoji: '🚬', order: 5 },
  { id: '69f000469cc4196e1b93ea2c', name: 'Artículos de limpieza', emoji: '🧹', order: 6 },
];

const PRODUCTS = {
  '69f000469cc4196e1b93ea27': [
    { id: 'beb001', name: 'Coca Cola Lata 473ML', price: 3200 },
    { id: 'beb002', name: 'Monster Mango 473ML', price: 5200 },
    { id: 'beb003', name: 'Monster Peachy 473ML', price: 5200 },
    { id: 'beb004', name: 'Monster Verde 473ML', price: 5200 },
    { id: 'beb005', name: 'Red Bull 250ML', price: 4500 },
    { id: 'beb006', name: 'Sprite Lata 473ML', price: 3200 },
    { id: 'beb007', name: 'Fanta Lata 473ML', price: 3200 },
    { id: 'beb008', name: 'Powerade 500ML', price: 3000 },
    { id: 'beb009', name: 'Gatorade 500ML', price: 2800 },
    { id: 'beb010', name: 'Agua 500ML Benedictino', price: 1600 },
    { id: 'beb011', name: 'Agua 1500ML Benedictino', price: 2300 },
    { id: 'beb012', name: 'Aquarius 1500ML Manzana', price: 3800 },
    { id: 'beb013', name: 'Aquarius 1500ML Naranja', price: 3800 },
    { id: 'beb014', name: 'Aquarius 1500ML Pera', price: 3800 },
    { id: 'beb015', name: 'Aquarius 1500ML Uva', price: 3800 },
  ],
  '69f000469cc4196e1b93ea28': [
    { id: 'gol001', name: 'Alfajor Fantoche Pescado Raul Negro', price: 1100 },
    { id: 'gol002', name: 'Alfajor Fantoche Pescado Raul Blanco', price: 1100 },
    { id: 'gol003', name: 'Alfajor Fantoche Red Velvet', price: 1600 },
    { id: 'gol004', name: 'Alfajor Jorgelin Glaseado Triple', price: 2200 },
    { id: 'gol005', name: 'Alfajor Jorgelin Triple Negro', price: 2200 },
    { id: 'gol006', name: 'Alfajor Arcor Triple CHOCOTORTA', price: 2400 },
    { id: 'gol007', name: 'Alfajor Arcor Triple BON O BON Blanco', price: 2400 },
    { id: 'gol008', name: 'Alfajor Arcor Triple B&N', price: 2400 },
    { id: 'gol009', name: 'Alfajor Arcor Triple Tofi Negro', price: 2400 },
    { id: 'gol010', name: 'Alfajor Arcor Triple Tofi Blanco', price: 2400 },
    { id: 'gol011', name: 'Alfajor Arcor Triple Tatin Negro', price: 1400 },
    { id: 'gol012', name: 'Alfajor Arcor Triple Tatin Blanco', price: 1400 },
    { id: 'gol013', name: 'Alfajor Milka Terrabussi Triple', price: 2800 },
    { id: 'gol014', name: 'Alfajor Milka Blanco Triple', price: 2800 },
    { id: 'gol015', name: 'Alfajor Milka Mousse Negro Triple', price: 2800 },
    { id: 'gol016', name: 'Alfajor Milka Oreo Triple', price: 2800 },
    { id: 'gol017', name: 'Alfajor Milka Pepitos Triple', price: 2800 },
    { id: 'gol018', name: 'Alfajor MILKA SHOT Triple', price: 2800 },
  ],
  '69f0e4ef4de5adae291d0409': [
    { id: 'snk001', name: 'Papas Clasicas 92g', price: 3900 },
    { id: 'snk002', name: 'Papas Onduladas 92g', price: 3900 },
    { id: 'snk003', name: 'Papas Asado Criollo 92g', price: 3900 },
    { id: 'snk004', name: 'Papas Cheddar 92g', price: 3900 },
    { id: 'snk005', name: 'Papas Ketchup 82g', price: 3900 },
    { id: 'snk006', name: 'Papas Limon 82g', price: 3900 },
    { id: 'snk007', name: 'Papas Salame 82g', price: 3900 },
    { id: 'snk008', name: 'Papas Jamon Serrano 82g', price: 3900 },
    { id: 'snk009', name: 'Papas Barbacoa 82g', price: 3900 },
    { id: 'snk010', name: 'Papas Crema Y Ciboulette 82g', price: 3900 },
    { id: 'snk011', name: 'Nachos Queso 82g', price: 3900 },
    { id: 'snk012', name: 'Conos Queso 80g', price: 3900 },
    { id: 'snk013', name: 'Batatas Cebolla Caramelizada', price: 3900 },
    { id: 'snk014', name: 'Batatas Mostaza y Miel 70g', price: 3900 },
    { id: 'snk015', name: 'Batatas Capresse 70g', price: 3900 },
    { id: 'snk016', name: 'Chizitos MegaQueso 95g', price: 3500 },
    { id: 'snk017', name: 'Papas Mix 100g', price: 3900 },
    { id: 'snk018', name: 'Palitos Clasicos 82g', price: 3200 },
    { id: 'snk019', name: 'Palitos Panceta 85g', price: 3200 },
    { id: 'snk020', name: 'Palitos Queso 85g', price: 3200 },
  ],
  '69f000469cc4196e1b93ea2a': [
    { id: 'alm001', name: 'Galletitas Vocación x200g', price: 2500 },
    { id: 'alm002', name: 'Galletitas Oreo x119g', price: 2800 },
    { id: 'alm003', name: 'Maní Con Chocolate', price: 1800 },
    { id: 'alm004', name: 'Chicle Beldent x10u', price: 1200 },
  ],
  '69f000469cc4196e1b93ea2b': [
    { id: 'cig001', name: 'Marlboro Rojo x20', price: 4500 },
    { id: 'cig002', name: 'Marlboro Gold x20', price: 4500 },
    { id: 'cig003', name: 'Lucky Strike x20', price: 4200 },
    { id: 'cig004', name: 'Parliament x20', price: 5000 },
  ],
  '69f000469cc4196e1b93ea2c': [
    { id: 'lim001', name: 'Lavandina 1L', price: 1800 },
    { id: 'lim002', name: 'Detergente 500ML', price: 2200 },
    { id: 'lim003', name: 'Jabón en Polvo 250g', price: 2500 },
  ],
};

// ─── SESIONES ─────────────────────────────────────────────────────────────────

const sessions = {};

function getSession(phone) {
  if (!sessions[phone]) {
    sessions[phone] = { step: 'inicio', cart: [], name: null, address: null, currentCategory: null };
  }
  return sessions[phone];
}

function resetSession(phone) {
  sessions[phone] = { step: 'inicio', cart: [], name: null, address: null, currentCategory: null };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}

function getCartTotal(cart) {
  return cart.reduce((t, i) => t + i.price * i.qty, 0);
}

function cartSummary(cart) {
  if (cart.length === 0) return '_(vacío)_';
  return cart.map(i => `• ${i.name} x${i.qty} = ${formatPrice(i.price * i.qty)}`).join('\n');
}

async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } },
      { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (err) {
    console.error('Error enviando mensaje:', err.response?.data || err.message);
  }
}

// ─── LÓGICA DEL BOT ──────────────────────────────────────────────────────────

async function handleMessage(phone, text) {
  const session = getSession(phone);
  const msg = text.trim().toLowerCase();

  if (['reiniciar', 'inicio', 'hola', 'menu', 'menú', '0'].includes(msg)) {
    resetSession(phone);
    return sendWelcome(phone);
  }

  switch (session.step) {
    case 'inicio':             return sendWelcome(phone);
    case 'combos_o_catalogo':  return handleCombosOCatalogo(phone, session, msg);
    case 'viendo_combos':      return handleViendoCombos(phone, session, msg);
    case 'menu_principal':     return handleMenuPrincipal(phone, session, msg);
    case 'seleccionando_categoria': return handleSeleccionandoCategoria(phone, session, msg);
    case 'seleccionando_producto':  return handleSeleccionandoProducto(phone, session, msg);
    case 'esperando_nombre':   return handleEsperandoNombre(phone, session, text);
    case 'esperando_direccion': return handleEsperandoDireccion(phone, session, text);
    case 'confirmando_pedido': return handleConfirmandoPedido(phone, session, msg);
    default:
      resetSession(phone);
      return sendWelcome(phone);
  }
}

// ── BIENVENIDA con combos proactivos ─────────────────────────────────────────

async function sendWelcome(phone) {
  const session = getSession(phone);
  session.step = 'combos_o_catalogo';

  await sendMessage(phone,
    `¡Hola! 👋 Bienvenido al delivery de *FA24* 🏪\n\n` +
    `🔥 *¡COMBOS DE LANZAMIENTO!* 🔥\n` +
    `Tenemos 7 combos armados a *$30.000 c/u con ENVÍO GRATIS* 🚚\n\n` +
    `¿Querés verlos?\n\n` +
    `1️⃣ Ver los Combos (¡recomendado!)\n` +
    `2️⃣ Ver el catálogo completo\n\n` +
    `_Escribí 1 o 2_`
  );
}

async function handleCombosOCatalogo(phone, session, msg) {
  if (msg === '1') {
    session.step = 'viendo_combos';
    return sendCombos(phone);
  }
  if (msg === '2') {
    session.step = 'menu_principal';
    return sendMenuPrincipal(phone, session);
  }
  await sendMessage(phone, '❓ Respondé *1* para ver combos o *2* para el catálogo.');
}

async function sendCombos(phone) {
  const lista = COMBOS.map((c, i) =>
    `*${i + 1}.* ${c.name}\n${c.description}\n💰 *${formatPrice(c.price)} — ENVÍO GRATIS* 🚚`
  ).join('\n\n');

  await sendMessage(phone,
    `🔥 *COMBOS DE LANZAMIENTO FA24* 🔥\n\n${lista}\n\n` +
    `─────────────────\n` +
    `Respondé con el *número del combo* para agregarlo al carrito.\n` +
    `Escribí *cat* para ir al catálogo completo.\n` +
    `Escribí *menu* para volver al inicio.`
  );
}

async function handleViendoCombos(phone, session, msg) {
  if (msg === 'cat' || msg === 'catalogo' || msg === 'catálogo') {
    session.step = 'menu_principal';
    return sendMenuPrincipal(phone, session);
  }

  const idx = parseInt(msg) - 1;
  if (isNaN(idx) || idx < 0 || idx >= COMBOS.length) {
    await sendMessage(phone, `❓ Respondé con un número del 1 al ${COMBOS.length}, o escribí *cat* para ver el catálogo.`);
    return;
  }

  const combo = COMBOS[idx];
  const existing = session.cart.find(i => i.id === combo.id);
  if (existing) {
    existing.qty += 1;
  } else {
    session.cart.push({ id: combo.id, name: combo.name, price: combo.price, qty: 1 });
  }

  const total = getCartTotal(session.cart);
  session.step = 'menu_principal';

  await sendMessage(phone,
    `✅ *${combo.name}* agregado al carrito!\n\n` +
    `🛒 Total actual: *${formatPrice(total)}*\n\n` +
    `¿Qué hacemos?\n` +
    `1️⃣ Seguir comprando\n` +
    `2️⃣ Ver mi carrito\n` +
    `3️⃣ Finalizar pedido`
  );
}

// ── MENÚ PRINCIPAL ────────────────────────────────────────────────────────────

async function sendMenuPrincipal(phone, session) {
  await sendMessage(phone,
    `📋 *Menú principal:*\n\n` +
    `🔥 Escribí *combos* para ver los combos de lanzamiento\n` +
    `1️⃣ Ver catálogo y pedir\n` +
    `2️⃣ Ver mi carrito\n` +
    `3️⃣ Finalizar pedido\n` +
    `0️⃣ Reiniciar`
  );
}

async function handleMenuPrincipal(phone, session, msg) {
  if (msg === 'combos' || msg === 'combo') {
    session.step = 'viendo_combos';
    return sendCombos(phone);
  }
  if (msg === '1') {
    session.step = 'seleccionando_categoria';
    return sendCategorias(phone);
  }
  if (msg === '2') return sendCarrito(phone, session);
  if (msg === '3') return iniciarCheckout(phone, session);

  await sendMessage(phone, '❓ Opción no válida. Respondé *1*, *2* o *3*, o escribí *combos* para ver las ofertas.');
}

// ── CATÁLOGO ──────────────────────────────────────────────────────────────────

async function sendCategorias(phone) {
  const lista = CATEGORIES.map((c, i) => `${i + 1}️⃣ ${c.emoji} ${c.name}`).join('\n');
  await sendMessage(phone,
    `📦 *Categorías disponibles:*\n\n${lista}\n\n` +
    `Respondé con el número de la categoría.\n` +
    `Escribí *combos* para ver los combos o *menu* para volver.`
  );
}

async function handleSeleccionandoCategoria(phone, session, msg) {
  if (msg === 'combos') {
    session.step = 'viendo_combos';
    return sendCombos(phone);
  }
  const idx = parseInt(msg) - 1;
  if (isNaN(idx) || idx < 0 || idx >= CATEGORIES.length) {
    await sendMessage(phone, `❓ Respondé con un número del 1 al ${CATEGORIES.length}.`);
    return;
  }
  const cat = CATEGORIES[idx];
  session.currentCategory = cat.id;
  session.step = 'seleccionando_producto';
  return sendProductos(phone, cat);
}

async function sendProductos(phone, cat) {
  const prods = PRODUCTS[cat.id] || [];
  if (prods.length === 0) {
    await sendMessage(phone, '😕 No hay productos disponibles en esta categoría.');
    return;
  }
  const lista = prods.map((p, i) => `*${i + 1}.* ${p.name} — ${formatPrice(p.price)}`).join('\n');
  await sendMessage(phone,
    `${cat.emoji} *${cat.name}*\n\n${lista}\n\n` +
    `Respondé con el número del producto y la cantidad.\n` +
    `Ejemplos: *3* (agrega 1) o *3 2* (agrega 2 unidades)\n\n` +
    `Escribí *cat* para ver otras categorías o *menu* para volver.`
  );
}

async function handleSeleccionandoProducto(phone, session, msg) {
  if (msg === 'cat' || msg === 'categorias') {
    session.step = 'seleccionando_categoria';
    return sendCategorias(phone);
  }
  if (msg === 'combos') {
    session.step = 'viendo_combos';
    return sendCombos(phone);
  }

  const parts = msg.split(/\s+/);
  const idx = parseInt(parts[0]) - 1;
  const qty = parseInt(parts[1]) || 1;
  const prods = PRODUCTS[session.currentCategory] || [];

  if (isNaN(idx) || idx < 0 || idx >= prods.length) {
    await sendMessage(phone, `❓ Número no válido. Respondé con un número del 1 al ${prods.length}.\nEscribí *cat* para ver otras categorías.`);
    return;
  }
  if (qty < 1 || qty > 20) {
    await sendMessage(phone, '❓ La cantidad debe ser entre 1 y 20.');
    return;
  }

  const prod = prods[idx];
  const existing = session.cart.find(i => i.id === prod.id);
  if (existing) {
    existing.qty += qty;
  } else {
    session.cart.push({ ...prod, qty });
  }

  const total = getCartTotal(session.cart);
  session.step = 'menu_principal';

  await sendMessage(phone,
    `✅ *${qty}x ${prod.name}* agregado al carrito.\n\n` +
    `🛒 Total actual: *${formatPrice(total)}*\n\n` +
    `¿Qué hacemos?\n` +
    `1️⃣ Seguir comprando\n` +
    `2️⃣ Ver carrito\n` +
    `3️⃣ Finalizar pedido`
  );
}

// ── CARRITO Y CHECKOUT ────────────────────────────────────────────────────────

async function sendCarrito(phone, session) {
  const total = getCartTotal(session.cart);
  if (session.cart.length === 0) {
    await sendMessage(phone, `🛒 Tu carrito está vacío.\n\nEscribí *1* para ver el catálogo o *combos* para ver las ofertas.`);
    return;
  }
  await sendMessage(phone,
    `🛒 *Tu carrito:*\n\n${cartSummary(session.cart)}\n\n` +
    `💰 *Total: ${formatPrice(total)}*\n\n` +
    `1️⃣ Seguir comprando\n` +
    `3️⃣ Finalizar pedido\n` +
    `🗑️ Escribí *vaciar* para vaciar el carrito`
  );
}

async function iniciarCheckout(phone, session) {
  if (session.cart.length === 0) {
    await sendMessage(phone, '🛒 Tu carrito está vacío. Escribí *1* para ver el catálogo o *combos* para ver las ofertas.');
    return;
  }
  const total = getCartTotal(session.cart);
  if (total < MIN_ORDER) {
    await sendMessage(phone,
      `⚠️ El pedido mínimo es *${formatPrice(MIN_ORDER)}*.\n` +
      `Tu total es ${formatPrice(total)}. Agregá más productos o elegí un *combo* que ya alcanza el mínimo con envío gratis.`
    );
    return;
  }
  session.step = 'esperando_nombre';
  await sendMessage(phone, `📋 Vamos a confirmar tu pedido.\n\n*¿Cuál es tu nombre completo?*`);
}

async function handleEsperandoNombre(phone, session, text) {
  if (text.trim().length < 2) {
    await sendMessage(phone, '❓ Por favor ingresá tu nombre completo.');
    return;
  }
  session.name = text.trim();
  session.step = 'esperando_direccion';
  await sendMessage(phone,
    `Perfecto, *${session.name}*! 👍\n\n*¿Cuál es tu dirección de entrega?*\n_(Calle, número y piso/depto si corresponde)_`
  );
}

async function handleEsperandoDireccion(phone, session, text) {
  if (text.trim().length < 5) {
    await sendMessage(phone, '❓ Por favor ingresá tu dirección completa.');
    return;
  }
  session.address = text.trim();
  session.step = 'confirmando_pedido';

  const total = getCartTotal(session.cart);

  await sendMessage(phone,
    `📝 *Resumen de tu pedido:*\n\n` +
    `${cartSummary(session.cart)}\n\n` +
    `💰 *Total: ${formatPrice(total)}*\n` +
    `🚚 *Envío: GRATIS* ✅\n\n` +
    `👤 Nombre: ${session.name}\n` +
    `📍 Dirección: ${session.address}\n\n` +
    `¿Confirmás el pedido?\n` +
    `✅ Escribí *sí* para confirmar\n` +
    `❌ Escribí *no* para cancelar`
  );
}

async function handleConfirmandoPedido(phone, session, msg) {
  if (['si', 'sí', 's', 'yes', 'confirmar', 'confirmo'].includes(msg)) {
    return confirmarPedido(phone, session);
  }
  if (['no', 'cancelar', 'n'].includes(msg)) {
    resetSession(phone);
    await sendMessage(phone, '❌ Pedido cancelado. Escribí *hola* para volver a empezar.');
    return;
  }
  await sendMessage(phone, '❓ Respondé *sí* para confirmar o *no* para cancelar.');
}

async function confirmarPedido(phone, session) {
  const total = getCartTotal(session.cart);
  const orderNum = Date.now().toString().slice(-6);

  await sendMessage(phone,
    `🎉 *¡Pedido confirmado!* Nro. #${orderNum}\n\n` +
    `${cartSummary(session.cart)}\n\n` +
    `💰 *Total: ${formatPrice(total)}*\n` +
    `🚚 *Envío: GRATIS* ✅\n\n` +
    `📍 Entrega en: ${session.address}\n\n` +
    `💳 *Pagá con MercadoPago:*\n` +
    `Alias: *${MERCADOPAGO_ALIAS}*\n\n` +
    `⏱️ Tiempo estimado: *30-45 min*\n\n` +
    `¡Gracias por elegirnos! 🙏 Escribí *hola* para hacer otro pedido.`
  );

  resetSession(phone);
}

// ─── WEBHOOK ──────────────────────────────────────────────────────────────────

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages || messages.length === 0) return;

    const message = messages[0];
    const phone = message.from;
    const text = message.text?.body;
    if (!text) return;

    console.log(`📩 [${phone}]: ${text}`);
    await handleMessage(phone, text);
  } catch (err) {
    console.error('Error procesando webhook:', err.message);
  }
});

app.get('/', (req, res) => res.send('KioskoBot ✅ funcionando'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🤖 KioskoBot corriendo en puerto ${PORT}`));
