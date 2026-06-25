# COMITÉ DE ARQUITECTURA

## Responsabilidades
- Diseño del sistema y patrones arquitectónicos
- Escalabilidad y modularidad
- ADRs y trade-offs técnicos
- Evolución arquitectónica

## Diagnóstico Actual
- **Arquitectura**: SPA monolítica client-side pura
- **Punto crítico**: `app.js` (1,343 lines) concentra toda la lógica:
  - Render (DOM manipulation)
  - Estado global mutable
  - Lógica de negocio (cart, filters, payments)
  - UI/UX (splash, animations, toast, confetti)
  - Integración WhatsApp
- **Sin separación de concerns**: Datos (data.js), Lógica (app.js), Presentación (styles.css + index.html)

## Recomendaciones Inmediatas
1. **Separación en módulos JS**: data/, state/, ui/, business/, utils/
2. **Patrón de estado reactivo**: Implementar un store simple con suscripciones
3. **Modularización del CSS**: styles.css → components/, themes/, layouts/
4. **Preparar para migración futura**: Dejar el proyecto listo para adoptar un framework SPA si crece

## Trade-offs Pendientes
| Decisión | Opción A | Opción B |
|---|---|---|
| Framework | Mantener vanilla JS | Migrar a React/Vue/Svelte |
| Build Step | Sin bundler (manual) | Adoptar Vite/Webpack |
| Data Layer | Static JS object | JSON remoto / API REST |
| Estado | Global mutable | Store con suscripciones |

## Veredicto: Mantener vanilla JS pero modularizar progresivamente
Razón: El proyecto es pequeño y zero-dependency es su principal ventaja competitiva.
