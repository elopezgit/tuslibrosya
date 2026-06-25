# DIAGNÓSTICO GENERAL — TuPedido

## FICHA DEL PROYECTO
| Campo | Valor |
|---|---|
| Proyecto | TuPedido |
| Rubro | Food Tech / SaaS de Pedidos Multi-Tenant |
| Objetivo | Plataforma de pedidos online sin backend, conectada a WhatsApp |
| Usuarios | Negocios gastronómicos + sus clientes finales |
| Arquitectura | SPA 100% client-side, vanilla JS, zero dependencies |
| Estado | Funcional con deuda técnica significativa |

## MAPA ARQUITECTÓNICO
```
index.html (488 lines) → Estructura DOM única
      ├── data.js (548 lines) → Datos multi-tenant + menús
      ├── app.js (1,343 lines) → Toda la lógica de negocio
      └── styles.css (2,298 lines) → Todos los estilos
```
- **Sin framework, sin bundler, sin npm, sin backend, sin base de datos**
- **Estado global**: 10+ variables globales mutables (cart, currentCat, deliveryMode, etc.)
- **Persistencia**: localStorage (activeTenant, lastOrder, customBrandName)
- **Única integración externa**: WhatsApp API via `wa.me` URL

## MAPA FUNCIONAL
1. **Splash Cinemático** → Netflix-style intro con taglines rotativos
2. **Catálogo Multi-Tenant** → 3 tiendas (Pizzería, Hamburguesería, Demo)
3. **Filtrado por Categoría** → Bento grid con 5 categorías
4. **Búsqueda** → Filtro por texto en nombre/descripción
5. **Carrito de Compras** → CRUD completo con persistencia en memoria
6. **Selector de Packs** → Constructor de docenas/media docena de empanadas
7. **Cross-Selling** → Sugerencias inteligentes de bebidas/postres
8. **Formulario de Pedido** → Nombre, teléfono, dirección, notas, pago
9. **Envío por WhatsApp** → Generación de mensaje formateado + redirección
10. **Reordenado Rápido** → Recuperación de último pedido desde localStorage
11. **Tema Dinámico** → Colores de marca aplicados vía CSS Custom Properties

## MAPA DE RIESGOS

| # | Riesgo | Severidad | Probabilidad | Impacto |
|---|---|---|---|---|
| R1 | Código monolítico sin separación de concerns | ALTA | 100% | Mantenibilidad, bugs |
| R2 | Sin tests automatizados | ALTA | 100% | Regresiones no detectadas |
| R3 | Estado global mutable sin control | ALTA | 100% | Bugs difíciles de rastrear |
| R4 | Imágenes externas (Wikipedia) sin control | MEDIA | 80% | CLS, rotura de enlaces |
| R5 | Sin manejo de errores estructurado | MEDIA | 100% | Fallos silenciosos, UX pobre |
| R6 | Sin PWA/offline | MEDIA | 100% | Dependencia total de red |
| R7 | DOM dependiente con IDs frágiles | ALTA | 60% | Rotura por cambios HTML |
| R8 | Sin TypeScript ni tipos | MEDIA | 100% | Errores en runtime |
| R9 | Código duplicado (photoHTML patterns) | BAJA | 100% | Inconsistencias visuales |
| R10 | Sin optimización de imágenes | MEDIA | 100% | Carga lenta, CLS |
| R11 | Sin analytics ni métricas | BAJA | 100% | Ciego al rendimiento real |

## MAPA DE MEJORAS (OPORTUNIDADES)

| # | Oportunidad | Categoría | Esfuerzo | Impacto |
|---|---|---|---|---|
| M1 | Separar lógica en módulos JS | Arquitectura | ALTO | CRÍTICO |
| M2 | Implementar patrón de estado reactivo | Arquitectura | ALTO | CRÍTICO |
| M3 | Agregar tests E2E con Playwright | Calidad | ALTO | ALTO |
| M4 | Migrar imágenes a assets locales o CDN gestionado | Rendimiento | MEDIO | ALTO |
| M5 | Implementar Service Worker + PWA | UX/Rendimiento | MEDIO | ALTO |
| M6 | Agregar TypeScript progresivo | Desarrollo | ALTO | ALTO |
| M7 | Mejorar validación de formularios | UX/Seguridad | BAJO | ALTO |
| M8 | Sistema de logging y monitoreo | Calidad | BAJO | MEDIO |
| M9 | Soporte para notas por producto | Producto | BAJO | MEDIO |
| M10 | Gestión de inventario (stock) | Producto | MEDIO | ALTO |
| M11 | Panel de administración simple | Producto | ALTO | ALTO |
| M12 | internacionalización (i18n) | Producto | MEDIO | BAJO |
| M13 | Optimización CSS (purge, minify) | Rendimiento | BAJO | MEDIO |
| M14 | Temas oscuros automáticos | UX | BAJO | BAJO |
| M15 | Landing page de presentación del SaaS | Producto | MEDIO | ALTO |
