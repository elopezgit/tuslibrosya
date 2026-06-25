# Agente de Calidad y Pruebas (Tech & UX)

Este agente se encarga de asegurar que la aplicación funcione perfectamente en todos los entornos móviles, no tenga regresiones de código y mantenga los estándares de seguridad para el cliente final.

## Estructura del Agente (Comité)

| Perfil Profesional | Rol Específico | Habilidades Clave (Skills) |
| :--- | :--- | :--- |
| **Lead QA Manual** | Diseño de planes de prueba y pruebas exploratorias. | Test Plan Design, Exploratory Testing, Bug Tracking, UX Validation. |
| **QA Automation Engineer** | Automatización de flujos críticos de compra (E2E). | Playwright, Cypress, CI/CD Integration, JavaScript Test Frameworks. |
| **Performance QA Engineer** | Optimización de tiempos de carga y Web Vitals. | Lighthouse, WebPageTest, Bundle Size Analysis, Chrome DevTools. |
| **Mobile QA Specialist** | Validación en dispositivos y navegadores móviles. | BrowserStack, iOS/Android Simulators, Responsive Auditing. |
| **Security Penetration Tester** | Verificación de sanitización y manipulación de datos. | Burp Suite, Fuzzing, XSS/CSRF Prevention Testing, Input Sanitization. |

---

## Diagnóstico Técnico del Sistema Base

El flujo actual carece de una suite de pruebas automatizadas y es propenso a errores silenciosos de JavaScript que detienen la ejecución en navegadores antiguos (por ejemplo, el uso de ES6 sin transpilación en algunos entornos móviles). Además:
1. **Validación de campos débil:** Aunque hay validación para el teléfono, el envío de WhatsApp no sanitiza del todo caracteres de control o inyecciones simples en el campo de Notas o Dirección.
2. **Dependencia extrema de IDs del DOM:** Muchos selectores en `app.js` dependen de IDs dinámicos concatenados (`qn-${changedId}`, `ctrl-${changedId}`). Si la estructura cambia sutilmente, las referencias fallan sin lanzar excepciones controladas.

---

## Consejos de Mejora Actionables (Acciones Clave)

### 1. Implementación de E2E con Playwright para Flujos Críticos
* **Acción:** Crear pruebas automatizadas que simulen la compra de un producto, el armado de una docena de empanadas (asegurando el límite exacto de 12) y el llenado del formulario de envío.
* **Implementación:** Añadir scripts de prueba sencillos usando Playwright para validar que al llegar a 12 empanadas se habilite el botón de confirmación y al hacer click se genere correctamente la cadena codificada para WhatsApp.

### 2. Monitoreo de Web Vitals en Dispositivos Móviles de Gama Media
* **Acción:** Realizar pruebas continuas de performance móvil. La carga ininterrumpida de imágenes grandes desde Wikipedia en los productos ralentiza la interactividad y la respuesta visual.
* **Implementación:** Sustituir los links externos de imágenes de prueba por imágenes locales optimizadas en formato WebP con dimensiones predefinidas (`aspect-ratio` en CSS) para evitar el Cumulative Layout Shift (CLS).
