import { base44 } from 'npm:@base44/sdk@0.8.25/functions';

// Recibe pedidos del bot de WhatsApp y los guarda en Base44
Deno.serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { order, secret } = body;

    if (secret !== 'kioskobot2026') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!order) return Response.json({ error: 'Se requiere el campo order' }, { status: 400 });

    const orderToSave = {
      order_number: order.order_number || String(Date.now()).slice(-6),
      customer_name: order.customer_name || '',
      customer_phone: order.customer_phone || '',
      address: order.address || '',
      items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items || []),
      subtotal: Number(order.subtotal) || 0,
      shipping: Number(order.shipping) || 0,
      total: Number(order.total) || 0,
      status: order.status || 'pending',
      payment_method: order.payment_method || 'mercadopago',
    };

    const created = await base44.asServiceRole.entities.Order.create(orderToSave);
    return Response.json({ ok: true, id: created.id, order_number: orderToSave.order_number });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
