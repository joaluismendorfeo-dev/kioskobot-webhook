import { createClient } from 'npm:@base44/sdk@0.8.25';

const QUICKORDER_APP_ID = '69effe843588f736a78e361e';
const API_KEY = '2f8c3d3308ca4f2Sbedd5756ad6d06bf';

Deno.serve(async (req) => {
  try {
    const base44 = createClient({
      appId: QUICKORDER_APP_ID,
      headers: { 'api_key': API_KEY }
    });

    const body = await req.json().catch(() => ({}));
    const { action, category_id, order } = body;

    if (action === 'get_categories') {
      const records = await base44.entities.Category.filter({ active: true });
      const sorted = records.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      return Response.json({ ok: true, data: sorted });
    }

    if (action === 'get_products') {
      if (!category_id) return Response.json({ error: 'category_id requerido' }, { status: 400 });
      const records = await base44.entities.Product.filter({ category_id, active: true });
      const available = records.filter((p: any) => p.stock > 0);
      return Response.json({ ok: true, data: available });
    }

    if (action === 'get_store_config') {
      const records = await base44.entities.StoreConfig.list();
      return Response.json({ ok: true, data: records[0] || {} });
    }

    if (action === 'create_order') {
      if (!order) return Response.json({ error: 'order requerido' }, { status: 400 });
      const created = await base44.entities.Order.create(order);
      return Response.json({ ok: true, data: created });
    }

    return Response.json({ error: 'Acción no reconocida' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
