# BACKLOG PRIORIZADO DE MEJORAS

## P0 — CRÍTICO

### P0.1 — Validación Robusta de Formularios
- **Problema**: Validación de teléfono solo cuenta dígitos, sin formato real
- **Impacto**: Pedidos inválidos llegan al comercio
- **Riesgo**: Bajo
- **Complejidad**: Baja
- **Beneficio**: Calidad de datos de pedido
- **Comité**: Desarrollo + Calidad

### P0.2 — Manejo de Errores Estructurado
- **Problema**: `console.error` sin feedback al usuario
- **Impacto**: Fallos silenciosos, UX confusa
- **Riesgo**: Bajo
- **Complejidad**: Baja
- **Beneficio**: Robustez, depuración
- **Comité**: Desarrollo

### P0.3 — Sanitización de Strings en Template Literals
- **Problema**: Posible XSS si datos del menú contienen HTML malicioso
- **Impacto**: Seguridad de usuarios
- **Riesgo**: Medio
- **Complejidad**: Baja
- **Beneficio**: Seguridad
- **Comité**: Seguridad + Desarrollo

---

## P1 — ALTO IMPACTO

### P1.1 — Separación en Módulos JS
- **Problema**: app.js monolítico (1,343 lines)
- **Impacto**: Mantenibilidad, testing, colaboración
- **Riesgo**: Medio (refactor)
- **Complejidad**: Alta
- **Beneficio**: Calidad de código, escalabilidad
- **Comité**: Arquitectura + Desarrollo

### P1.2 — Tests E2E con Playwright
- **Problema**: Cero tests, regresiones manuales
- **Impacto**: Calidad, confianza en deploys
- **Riesgo**: Bajo
- **Complejidad**: Alta
- **Beneficio**: Calidad, velocidad de desarrollo
- **Comité**: Calidad

### P1.3 — Imágenes Locales Optimizadas
- **Problema**: Imágenes externas de Wikipedia (lentas, frágiles)
- **Impacto**: CLS, velocidad de carga, dependencia externa
- **Riesgo**: Bajo
- **Complejidad**: Media
- **Beneficio**: Rendimiento, confiabilidad
- **Comité**: Desarrollo + UX/UI

### P1.4 — Notas por Producto
- **Problema**: Notas generales no permiten especificar por item
- **Impacto**: Pedidos incompletos, insatisfacción
- **Riesgo**: Bajo
- **Complejidad**: Media
- **Beneficio**: Experiencia de usuario
- **Comité**: Producto + Desarrollo

### P1.5 — Mejora de Accesibilidad
- **Problema**: Sin ARIA, sin keyboard nav, sin focus visible
- **Impacto**: Exclusión de usuarios con discapacidad
- **Riesgo**: Bajo
- **Complejidad**: Baja
- **Beneficio**: Inclusión, cumplimiento
- **Comité**: UX/UI

---

## P2 — MEJORA IMPORTANTE

### P2.1 — Service Worker + PWA
- **Problema**: Sin offline, sin instalación
- **Impacto**: Dependencia total de red
- **Riesgo**: Bajo
- **Complejidad**: Media
- **Beneficio**: UX, retención
- **Comité**: Desarrollo + UX/UI

### P2.2 — Landing Page del Producto
- **Problema**: No hay página de presentación del SaaS
- **Impacto**: Conversión de leads
- **Riesgo**: Bajo
- **Complejidad**: Media
- **Beneficio**: Negocio, adquisición
- **Comité**: Producto + UX/UI

### P2.3 — Estado Reactivo Centralizado
- **Problema**: 10+ variables globales mutables
- **Impacto**: Bugs, difícil de trackear cambios
- **Riesgo**: Medio
- **Complejidad**: Alta
- **Beneficio**: Mantenibilidad, testing
- **Comité**: Arquitectura + Desarrollo

### P2.4 — Cifrado de Datos en localStorage
- **Problema**: Teléfono y dirección en texto plano
- **Impacto**: Privacidad
- **Riesgo**: Bajo
- **Complejidad**: Baja
- **Beneficio**: Seguridad
- **Comité**: Seguridad

### P2.5 — Temas Configurables por Tenant
- **Problema**: Solo colores, no layout ni iconos
- **Impacto**: Personalización limitada
- **Riesgo**: Bajo
- **Complejidad**: Media
- **Beneficio**: Diferenciación visual
- **Comité**: Arquitectura + UX/UI

---

## P3 — OPTIMIZACIÓN FUTURA

### P3.1 — TypeScript Progresivo
- **Problema**: Sin tipos, errores en runtime
- **Impacto**: Calidad, developer experience
- **Riesgo**: Bajo
- **Complejidad**: Alta
- **Beneficio**: Robuster, autocompletado
- **Comité**: Desarrollo

### P3.2 — Panel de Administración
- **Problema**: Sin dashboard para negocios
- **Impacto**: Gestión de pedidos
- **Riesgo**: Medio
- **Complejidad**: Alta
- **Beneficio**: Producto completo
- **Comité**: Producto + Arquitectura

### P3.3 — Múltiples Monedas y Locales
- **Problema**: Precios asumiendo ARS
- **Impacto**: Expansión geográfica
- **Riesgo**: Bajo
- **Complejidad**: Media
- **Beneficio**: Internacionalización
- **Comité**: Producto + Datos

### P3.4 — Gestión de Stock
- **Problema**: Sin concepto de disponibilidad
- **Impacto**: Pedidos de items no disponibles
- **Riesgo**: Medio
- **Complejidad**: Alta
- **Beneficio**: Precisión operativa
- **Comité**: Producto + Datos

### P3.5 — Dark Mode Automático
- **Problema**: Solo tema claro
- **Impacto**: Experiencia nocturna
- **Riesgo**: Bajo
- **Complejidad**: Baja
- **Beneficio**: UX moderna
- **Comité**: UX/UI

### P3.6 — Optimización CSS (Purge + Minify)
- **Problema**: 2,298 lines de CSS sin purgar
- **Impacto**: Tamaño de descarga
- **Riesgo**: Bajo
- **Complejidad**: Baja
- **Beneficio**: Rendimiento
- **Comité**: Desarrollo

### P3.7 — Cross-Selling con Machine Learning contextual
- **Problema**: Cross-selling basado en reglas fijas
- **Impacto**: Upsell limitado
- **Riesgo**: Bajo
- **Complejidad**: Alta
- **Beneficio**: Revenue
- **Comité**: Producto + Datos
