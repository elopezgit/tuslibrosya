# COMITÉ DE CALIDAD

## Responsabilidades
- Testing funcional y técnico
- Casos límite
- Automatización
- Validación de requisitos
- Control de regresiones

## Estado Actual
**Tests**: 0 (cero) tests automatizados.
**Cobertura**: 0%.
**E2E**: Manual testing únicamente.

## Plan de Testing

### Prioridad P0 — Flujos Críticos
1. **Flujo de compra completo**: Navegar menú → Agregar item → Carrito → Formulario → WhatsApp
2. **Constructor de packs**: Abrir docena → Seleccionar sabores → Confirmar → Ver en carrito
3. **Multi-tenant**: Cambiar de tienda → Validar menú, tema, precios
4. **Reordenado**: Completar pedido → Recargar → Ver banner → Repetir orden

### Prioridad P1 — Casos Límite
- Carrito vacío → Ver estado vacío
- Cantidad máxima de items
- Teléfono inválido → Validación
- Delivery sin dirección → Validación
- Pack incompleto → Botón deshabilitado
- Cross-selling cuando todo está en carrito
- Cambio de tenant con items en carrito

### Herramientas Recomendadas
| Herramienta | Propósito |
|---|---|
| Playwright | Tests E2E multi-browser |
| Lighthouse CI | Web Vitals + PWA audit |
| eslint-plugin-unicorn | Best practices linting |
| Vitest | Unit tests para lógica pura |

## Matriz de Regresión
```yaml
critical_paths:
  - "Agregar producto → Ver en carrito"
  - "Abrir pack → Seleccionar → Confirmar"
  - "Enviar WhatsApp → Modal celebración"
  - "Cambiar tienda → Menú correcto"
edge_cases:
  - "Carrito vacío → Sin bottom bar"
  - "Pack incompleto → Botón disabled"
  - "Teléfono inválido → Validación roja"
  - "Imagen rota → Fallback emoji"
```
