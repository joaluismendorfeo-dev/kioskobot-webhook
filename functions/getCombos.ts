// Esta función retorna los combos activos hardcodeados.
// Para actualizar combos: avisale al agente y los actualiza en segundos.
Deno.serve(async (_req) => {
  const combos = [
    { id: "combo001", emoji: "🎬", name: "Combo Cine en Casa", price: 30000, description: "1 Gaseosa 500ml\n2 Snack Quento 90g\n2 Chocolates Cofler 55gr\n2 Gomitas Yummy 30gr" },
    { id: "combo002", emoji: "📺", name: "Combo Maratón Series", price: 30000, description: "1 Gaseosa 1500ml\n2 Snack Quento 90g\n2 Chocolates Cofler Air 55gr\n20 Caramelos ButterToffi" },
    { id: "combo003", emoji: "🚬", name: "Combo Fumador Ansioso", price: 30000, description: "1 Marlboro Box\n1 Encendedor Bic Maxi\n1 Snack Quento 90g\n1 Chocolate Milka 55g\n2 Alfajores Triple Arcor" },
    { id: "combo004", emoji: "🍫", name: "Combo Bajón Sweet/Salad", price: 30000, description: "1 Chocolate Cofler Block 110gr\n1 Kesitas 125gr\n1 Rex 125gr\n1 Coca Cola 500ml\n2 Gomitas Yummy 30gr" },
    { id: "combo005", emoji: "🎉", name: "Combo Previa", price: 30000, description: "2 Coca Cola 1500ml\n2 Cepita Naranja 1lt\n1 Hielo 3kg\n4 Gomitas Yummy 30gr" },
    { id: "combo006", emoji: "🧉", name: "Combo Matero", price: 30000, description: "1 Yerba Amanda 500gr\n1 Azúcar 1kg\n1 Surtido Diversión 390gr\n30 Caramelos Butter Toffie\n2 Alfajores Triple Arcor\n2 Don Satur" },
    { id: "combo007", emoji: "🛡️", name: "Combo Safe", price: 30000, description: "2 Prime\n2 Monster\n1 Beldent\n1 Halls" },
  ];
  return Response.json({ ok: true, data: combos });
});
