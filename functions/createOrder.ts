import { base44 } from "npm:@base44/sdk@0.8.25/functions";

Deno.serve(async (req: Request) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { order } = body;

    if (!order) {
      return Response.json({ error: "order requerido" }, { status: 400 });
    }

    // Serializar items si no es string
    const data = {
      ...order,
      items: typeof order.items === "string" ? order.items : JSON.stringify(order.items),
    };

    const created = await base44.entities.Order.create(data);
    return Response.json({ ok: true, data: created });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
