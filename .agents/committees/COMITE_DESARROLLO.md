# COMITÉ DE DESARROLLO

## Responsabilidades
- Calidad del código, implementación, refactorización
- Elección de frameworks y librerías
- Testing técnico
- Buenas prácticas

## Diagnóstico del Código

### Fortalezas
- Código funcional y bien comentado
- Animaciones fluidas y consistentes
- Buen uso de CSS Custom Properties
- Cross-selling inteligente
- Patrón de imagen con skeleton loader

### Deuda Técnica Identificada
1. **Monolithic app.js (1,343 lines)**: Sin separación de módulos
2. **Estado global mutable**: `let cart = {}`, `let currentCat = 'todos'`, etc. sin control de cambios
3. **DOM coupling**: IDs frágiles, `document.getElementById()` disperso
4. **HTML en JS**: Template literals con lógica embebida (difícil de testear)
5. **Código duplicado**: Patrón de imagen con skeleton repetido en 4+ lugares
6. **Error handling**: `console.error` sin feedback al usuario
7. **Magic strings**: `'menuList'`, `'cartPanel'`, `'panelOverlay'` usados como strings
8. **Funciones largas**: `sendWhatsApp()` (89 lines), `renderCartPanel()` (76 lines)
9. **Sin constantes**: Delivery price ($500) hardcodeado
10. **Validaciones básicas**: Teléfono solo valida largo, no formato real

## Prácticas Recomendadas

### Inmediatas (P0-P1)
```javascript
// En lugar de:
let cart = {};
document.getElementById('cartCount').textContent = count;

// Usar:
const state = createStore({ cart: {} });
state.subscribe('cart', () => renderCartBadge());
```

### Corto Plazo (P1-P2)
- Extraer constantes (`DELIVERY_PRICE = 500`, `WA_NAMESPACE = 'TP-'`)
- Centralizar IDs de DOM como constantes
- Crear helpers reutilizables para el patrón skeleton+img+fallback

### Mediano Plazo (P2-P3)
- Migrar a TypeScript progresivo (`.d.ts` para empezar)
- Implementar barrel exports para módulos
- ESLint + Prettier config
