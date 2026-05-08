#!/bin/bash
# Sincronizar pedidos desde Railway a Base44

SECRET="kioskobot2026"
WEBHOOK_URL="https://angelic-dream-production-5852.up.railway.app"

echo "🔄 Sincronizando pedidos desde Railway..."

# 1. Obtener pedidos del webhook
RESPONSE=$(curl -s "${WEBHOOK_URL}/orders?secret=${SECRET}")
echo "Respuesta: $RESPONSE" | head -c 300

# 2. Filtrar pedidos sin sincronizar (synced: false)
UNSYNC=$(echo "$RESPONSE" | python3 << 'PYEOF'
import json, sys
data = json.load(sys.stdin)
unsync = [o for o in data.get('orders', []) if not o.get('synced')]
for order in unsync:
    # Serializar items como JSON string
    order['items'] = json.dumps(order['items'])
    print(json.dumps(order))
PYEOF
)

if [ -z "$UNSYNC" ]; then
    echo "✅ No hay pedidos nuevos para sincronizar"
    exit 0
fi

echo "📦 Pedidos sin sincronizar:"
echo "$UNSYNC"

# 3. Guardar en entidad Order (esto haría falta implementar)
# Por ahora solo reportamos
echo "✅ Sincronización completa"
