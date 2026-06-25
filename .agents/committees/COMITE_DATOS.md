# COMITÉ DE DATOS

## Justificación de Creación
El proyecto maneja datos estructurados significativos:
- Catálogo de productos multi-tenant
- Datos de clientes (nombre, teléfono, dirección)
- Historial de pedidos (localStorage)
- Configuración de tenant (temas, colores, números)

## Responsabilidades
- Modelado de datos
- Rendimiento de consultas
- Integridad y calidad de datos
- Esquemas y migraciones

## Modelo de Datos Actual

### Deficiencias
1. **IDs sin unicidad global**: Cada tenant tiene sus propios IDs (1, 2, 3...), colisionan entre tenants
2. **Categorías hardcodeadas**: `pizzas`, `empanadas`, `bebidas`, `postres` — no extensibles
3. **Precios sin moneda**: Números asumiendo ARS sin metadata de moneda
4. **Stock no modelado**: Sin concepto de disponibilidad
5. **Datos anidados**: Pack breakdown dentro del carrito, no como entidad separada
6. **Sin timestamps**: No hay fecha de creación/actualización en items

### Recomendaciones

#### Estructura de Datos Propuesta
```javascript
// Tenant mejorado
{
  id: 'donluis',
  name: "Pizzería Don Luis",
  phone: "+5493517654321",
  currency: 'ARS',
  locale: 'es-AR',
  timezone: 'America/Argentina/Buenos_Aires',
  features: {
    delivery: true,
    takeaway: true,
    packs: true,
    crossSell: true
  },
  categories: [
    { id: 'pizzas', name: 'Pizzas', icon: '🍕', order: 1 },
    { id: 'empanadas', name: 'Empanadas', icon: '🥟', order: 2 },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤', order: 3 },
    { id: 'postres', name: 'Postres', icon: '🍰', order: 4 }
  ],
  menu: [ ... ]
}
```

#### Producto Mejorado
```javascript
{
  id: 'donluis_pizza_001',  // tenant_prefix + category + number
  tenantId: 'donluis',
  sku: 'PZ-001',
  cat: 'pizzas',
  name: 'Muzzarella Clásica Don Luis',
  desc: '...',
  price: 5500,
  currency: 'ARS',
  compareAtPrice: 6500,  // Precio tachado
  cost: 2500,  // Para métricas
  stock: 50,
  maxQty: 10,
  images: {
    primary: 'img/menu/donluis/pizza-muzzarella.webp',
    thumbnail: 'img/menu/donluis/pizza-muzzarella-thumb.webp'
  },
  emoji: '🍕',
  tags: ['popular'],
  nutritionalInfo: { calories: 850, ... },
  modifiers: [
    { id: 'extra-cheese', name: 'Extra queso', price: 500 }
  ],
  isPack: false,
  enabled: true,
  sortOrder: 1,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-06-01T14:30:00Z'
}
```

### Pendientes
- [ ] Esquema de validación (JSON Schema o similar)
- [ ] Separar datos por archivo (data/tenant-donluis.js, etc.)
- [ ] Agregar versionado de datos
- [ ] Implementar migraciones forward-compatible
