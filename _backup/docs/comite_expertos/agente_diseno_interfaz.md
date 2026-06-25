# Agente de Diseño e Interfaz (Tech & UX)

Este agente tiene como misión elevar la estética visual de la aplicación, asegurar transiciones fluidas de 60 FPS (microinteracciones) y garantizar una experiencia móvil premium.

## Estructura del Agente (Comité)

| Perfil Profesional | Rol Específico | Habilidades Clave (Skills) |
| :--- | :--- | :--- |
| **Lead UI Designer** | Creación y mantenimiento de la guía de estilos y UI. | Figma, Design Systems, Typography, Color Theory, Visual Hierarchy. |
| **UX Designer** | Optimización de flujos y reducción de fricción física. | Wireframing, User Flow mapping, Accessibility (a11y), Heuristics. |
| **Motion Designer Specialist** | Creación de transiciones de alto impacto y micro-feedback. | CSS Keyframes, Web Animations API, SVG Animations, GSAP. |
| **Brand Designer** | Adaptabilidad visual del modelo SaaS/Multi-tenant. | Asset Creation, SVG Iconography, White-label Branding Guidelines. |
| **CSS Layout Specialist** | Estructuración técnica responsiva y optimización GPU. | CSS Grid, Flexbox, Hardware Acceleration, Responsive Fluid Design. |

---

## Diagnóstico Técnico del Sistema Base

El diseño visual actual incluye elementos modernos como el Bento Grid y efectos de cristal (glassmorphism), pero carece de consistencia en el rendimiento de animación:
1. **Rendimiento de animaciones:** La caída de partículas al agregar productos y el confeti utilizan animaciones CSS que tocan propiedades costosas de re-renderizado (como `top` y `left` en lugar de `transform: translate3d`), lo que puede causar saltos de fotogramas (*jank*) en dispositivos móviles de gama baja.
2. **Jerarquía Visual de Promociones:** El carrusel de promociones utiliza un scroll horizontal manual sin indicaciones visuales claras de scroll lateral (como sombras degradadas en los bordes) en pantallas de escritorio.

---

## Consejos de Mejora Actionables (Acciones Clave)

### 1. Refactorización de Partículas y Animaciones con Hardware Acceleration
* **Acción:** Asegurar que todas las micro-animaciones (partícula voladora del emoji, apertura del modal, barra de progreso) utilicen exclusivamente propiedades aceleradas por GPU (`transform` y `opacity`).
* **Implementación:** Modificar la función `spawnParticle` y la animación del confeti para calcular posiciones relativas iniciales y finales usando `translate3d(x, y, 0)` en lugar de modificar las propiedades `top` y `left` de forma iterativa.

### 2. Pulido de Usabilidad del Bento Grid y Carrusel de Promociones
* **Acción:** Incrementar el feedback de pulsación táctil (active state) en las tarjetas Bento y agregar una sombra de desvanecimiento (*fade overlay*) en el carrusel de promociones para indicar sutilmente que el contenido continúa de manera horizontal.
* **Implementación:** Utilizar pseudo-elementos `:after` en CSS con degradados lineales transparentes en los extremos del contenedor `#promoScroll` para suavizar visualmente los recortes y sugerir el desplazamiento lateral.
