# Agente de Psicología y Comunicación (Tech & UX)

Este agente se enfoca en optimizar la usabilidad cognitiva, la redacción persuasiva orientada a la conversión y la comunicación conversacional para que el cliente final concrete el pedido sin abandonar.

## Estructura del Agente (Comité)

| Perfil Profesional | Rol Específico | Habilidades Clave (Skills) |
| :--- | :--- | :--- |
| **Analista Cognitivo de Usabilidad** | Reducción de la carga cognitiva y claridad del flujo. | Cognitive Load Theory, Heuristic Evaluation, User Psychology. |
| **UX Copywriter Creativo** | Redacción de microcopias persuasivas y llamadas a la acción. | Microcopy, Conversational Writing, Conversion Copywriting. |
| **Behavioral Economist** | Aplicación de empujones de comportamiento (*nudges*). | Choice Architecture, Anchoring, Social Proof, Loss Aversion. |
| **Conversational UX Designer** | Optimización de la estructura del mensaje final de WhatsApp. | Chatbot UX, Text Formatting (Bold, Lists), Structured Messaging. |
| **Inclusion & Accessibility Auditor** | Asegurar facilidad de lectura y uso para todos. | WCAG 2.1, Contrast Ratios, Tap Target Sizes (min 48px). |

---

## Diagnóstico Técnico del Sistema Base

El flujo psicológico de compra tiene puntos fuertes, pero cuenta con importantes áreas de fricción emocional:
1. **La barrera del Splash Screen:** 10.8 segundos de carga generan una sensación de "lentitud artificial". El cerebro del usuario asocia esto con sistemas inestables o pesados, aumentando la tasa de abandono antes de ver el primer producto.
2. **Formato del Mensaje de WhatsApp:** El texto que se genera tiene muchos emojis y datos juntos. Un comerciante estresado o con baja visión en una cocina ruidosa puede tener dificultades para leer rápidamente la orden.

---

## Consejos de Mejora Actionables (Acciones Clave)

### 1. Reestructuración Visual y Jerarquía del Mensaje de WhatsApp
* **Acción:** Diseñar el mensaje de WhatsApp saliente utilizando un formato más "escanearle" y limpio. Agrupar los productos por tipo de preparación (cocina, barra, postres) para facilitarle el trabajo operativo al comercio.
* **Implementación:** Refactorizar la función `sendWhatsApp()` para añadir saltos de línea estratégicos, reducir emojis redundantes y destacar el ID del Pedido y la Dirección de entrega en la primera línea.

### 2. Implementación de "Microcopias de Tranquilidad" (Security Nudges)
* **Acción:** Mitigar el miedo del usuario a ingresar sus datos. Muchos clientes abandonan al ver formularios de dirección y teléfono pensando que serán bombardeados por spam o que su tarjeta será guardada.
* **Implementación:** Fortalecer el banner de "Conexión Directa y Segura" de la sección del carrito. Utilizar frases como: *"Tus datos vuelan directo a la tienda en este mensaje de WhatsApp. No guardamos información en bases de datos externas"*.
