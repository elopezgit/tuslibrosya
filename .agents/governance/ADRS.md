# ARCHITECTURE DECISION RECORDS

## ADR-001: Zero-Framework Vanilla JS
**Estado**: ACEPTADO · **Fecha**: Original  
**Contexto**: El proyecto debía ser 100% auto-contenido, sin backend, sin build step.  
**Decisión**: Usar vanilla JS con un único `index.html`, `styles.css`, `data.js`, `app.js`.  
**Consecuencias**:  
- ✅ Carga instantánea, sin dependencias  
- ✅ Ideal para demo y despliegue simple  
- ❌ Escalabilidad limitada, monolithic JS, sin tipos  

---

## ADR-002: Multi-Tenancy via Static Object
**Estado**: ACEPTADO · **Fecha**: Original  
**Contexto**: Necesidad de mostrar múltiples marcas/negocios en una sola demo.  
**Decisión**: Objeto `TENANTS` en `data.js` con toda la data de cada tenant.  
**Consecuencias**:  
- ✅ Simple, efectivo para demo  
- ❌ Toda la data carga para todos los tenants  
- ❌ Escalable solo hasta ~5-10 tenants  

---

## ADR-003: WhatsApp como Único Canal de Pedido
**Estado**: ACEPTADO  
**Contexto**: Privacidad, cero comisiones, sin backend.  
**Decisión**: Generar mensaje formateado + `wa.me` redirect.  
**Consecuencias**:  
- ✅ 100% privado, sin servidores  
- ✅ Sin costos de infraestructura  
- ❌ Sin trazabilidad de pedidos  
- ❌ Sin gestión de estados de pedido  

---

## ADR-004: CSS Custom Properties para Theming Dinámico
**Estado**: ACEPTADO  
**Contexto**: Soporte multi-tenant con diferentes colores de marca.  
**Decisión**: `changeTheme()` actualiza `--brand`, `--brand2`, `--brand-rgb` en `:root`.  
**Consecuencias**:  
- ✅ Theming instantáneo sin recompilación  
- ✅ Compatible con glassmorphism y gradientes  
- ❌ Sin soporte para temas complejos (layout variations)  

---

## ADR-005: localStorage como Única Persistencia
**Estado**: ACEPTADO  
**Contexto**: Sin backend, sin base de datos.  
**Decisión**: `localStorage` para activeTenant, lastOrder, customBrandName.  
**Consecuencias**:  
- ✅ Simple y funcional  
- ❌ Sin sincronización entre dispositivos  
- ❌ Límite de ~5MB  
