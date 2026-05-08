const AGENT_APP_ID = '69f3622c3117e7478384228e';
const API_KEY = '2f8c3d3308ca4f2Sbedd5756ad6d06bf';
const BASE44_BASE = `https://app.base44.com/api/apps/${AGENT_APP_ID}/entities`;

const headers = {
  'Content-Type': 'application/json',
  'api_key': API_KEY
};

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, category_id, order } = body;

    if (action === 'create_order') {
      if (!order) return Response.json({ error: 'order requerido' }, { status: 400 });
      // Serializar items como string JSON
      const orderToSave = {
        ...order,
        items: typeof order.items === 'string' ? order.items : JSON.stringify(order.items)
      };
      const res = await fetch(`${BASE44_BASE}/Order`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderToSave)
      });
      const data = await res.json();
      if (!res.ok) return Response.json({ error: data }, { status: res.status });
      return Response.json({ ok: true, data });
    }

    return Response.json({ error: 'Acción no reconocida' }, { status: 400 });

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
