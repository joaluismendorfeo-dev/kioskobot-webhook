const fs = require('fs');
let code = fs.readFileSync('index.js', 'utf8');

const oldBlock = `  // Guardar pedido en archivo JSON local
  try {
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
      orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    }
    const newOrder = {
      order_number: orderNum,
      customer_name: session.name,
      customer_phone: phone,
      address: session.address,
      items: session.cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      subtotal: total,
      shipping: shipping,
      total: totalFinal,
      status: 'pending',
      payment_method: 'mercadopago',
      created_at: new Date().toISOString(),
      synced: false
    };
    orders.push(newOrder);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    console.log(\`✅ Pedido #\${orderNum} guardado localmente\`);
  } catch (err) {
    console.error('❌ Error guardando pedido:', err.message);
  }`;

const newBlock = `  // Guardar pedido en Base44
  const newOrder = {
    order_number: orderNum,
    customer_name: session.name,
    customer_phone: phone,
    address: session.address,
    items: session.cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    subtotal: total,
    shipping: shipping,
    total: totalFinal,
    status: 'pending',
    payment_method: 'mercadopago',
  };

  try {
    const BASE44_API_KEY = process.env.BASE44_API_KEY || '2f8c3d3308ca4f2Sbedd5756ad6d06bf';
    const BASE44_APP_ID = process.env.BASE44_APP_ID || '69f3622c3117e7478384228e';
    const response = await axios.post(
      \`https://api.base44.com/api/apps/\${BASE44_APP_ID}/entities/Order\`,
      newOrder,
      { headers: { 'api_key': BASE44_API_KEY, 'Content-Type': 'application/json' } }
    );
    console.log(\`✅ Pedido #\${orderNum} guardado en Base44, id: \${response.data.id}\`);
  } catch (err) {
    console.error('❌ Error guardando en Base44:', err.response?.data || err.message);
    // Respaldo: guardar localmente si falla Base44
    try {
      let orders = [];
      if (fs.existsSync(ORDERS_FILE)) {
        orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      }
      orders.push({ ...newOrder, created_at: new Date().toISOString(), synced: false });
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
      console.log(\`📁 Pedido #\${orderNum} guardado localmente como respaldo\`);
    } catch (err2) {
      console.error('❌ Error guardando pedido localmente:', err2.message);
    }
  }`;

if (code.includes(oldBlock)) {
  code = code.replace(oldBlock, newBlock);
  fs.writeFileSync('index.js', code);
  console.log('✅ Patch aplicado correctamente');
} else {
  console.log('❌ No se encontró el bloque a reemplazar');
  // Mostrar contexto para debugging
  const idx = code.indexOf('Guardar pedido en archivo JSON local');
  console.log('Posición del texto:', idx);
}
