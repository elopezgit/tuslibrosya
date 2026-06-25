# Agente de Desarrollo y Arquitectura (Tech & UX)

Este agente se enfoca en la robustez técnica, la modularidad del código, la infraestructura y la escalabilidad del sistema del catálogo digital "TuPedido".

## Estructura del Agente (Comité)

| Perfil Profesional | Rol Específico | Habilidades Clave (Skills) |
| :--- | :--- | :--- |
| **Arquitecto de Software Senior** | Líder del sector, diseño de patrones y modularidad. | Arquitectura Limpia, Patrones de Diseño SaaS, API Design, Micro-frontends. |
| **Frontend Engineer Senior** | Optimización de rendimiento cliente-side y modularidad JS. | Vanilla JS avanzado, ES6+, Web Components, CSS Variables, State Management. |
| **Cloud Infrastructure Specialist** | Planificación del despliegue, CDN y escalabilidad. | AWS/Vercel, Cloudflare CDN, CI/CD, Edge Computing, Caching Strategy. |
| **Database Architect** | Diseño del almacenamiento y persistencia multi-inquilino. | PostgreSQL, MongoDB, GraphQL, Redis, Database Partitioning. |
| **Cybersecurity Engineer** | Seguridad de datos de clientes y prevención de inyecciones. | OWASP Top 10, sanitización de datos, API Security, HTTPS/TLS. |

---

## Diagnóstico Técnico del Sistema Base

El código actual está en un estado monolítico y puramente *client-side*. Si bien es rápido y eficaz para una demo básica, presenta debilidades críticas para producción:
1. **Falta de persistencia dinámica:** Si el navegador se actualiza, el estado del carrito se pierde temporalmente (excepto por la función de reordenar de LocalStorage).
2. **Carga masiva de datos:** Todo el menú de todos los tenants se descarga en un único archivo `data.js`.
3. **Acoplamiento de Categorías:** Las etiquetas de visualización para la hamburguesería están hardcodeadas en `app.js`.

---

## Consejos de Mejora Actionables (Acciones Clave)

### 1. Migración a Carga Dinámica de Datos (Lazy Loading de Tenants)
* **Acción:** Desacoplar `data.js`. El cliente no debe descargar los datos de `donluis` o `burgerfactory` si está visitando `tupedidodemo`. 
* **Implementación:** Crear archivos de configuración JSON individuales por inquilino (ej. `config/tupedidodemo.json`) y cargarlos asincrónicamente mediante `fetch` al inicializar la aplicación basándose en el parámetro URL o el subdominio (`https://tupedidodemo.tupedido.live`).

### 2. Transición hacia Web Components y Modularización de JS
* **Acción:** Romper el archivo `app.js` (1331 líneas) en módulos ES6 independientes (`cart.js`, `theme.js`, `whatsapp.js`, `ui.js`) o implementar componentes nativos reutilizables (Web Components) para los elementos interactivos como los modales y las tarjetas de productos.
* **Implementación:** Definir módulos en HTML usando `<script type="module" src="js/app.js">` y encapsular el estado en un store centralizado.
