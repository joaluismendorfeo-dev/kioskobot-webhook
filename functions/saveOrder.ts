import { base44 } from 'npm:@base44/sdk@0.8.25/functions';

// Endpoint para recibir pedidos del bot de WhatsApp y guardarlos en la entidad Order
Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { order, secret } = body;

    // Verificación básica
    if (secret !== 'kioskobot2026') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!order) return Response.json({ error: 'order requerido' }, { status: 400 });

    const orderToSave = {
      ...order,
      items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items)
    };

    const created = await base44.entities.Order.create(orderToSave);
    return Response.json({ ok: true, data: created });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
