# REGLAS DE GOBERNANZA — TuPedido

## MINIMUM EXPERT SET (MES)
Nunca convocar expertos innecesarios. Matriz de decisión:

| Tipo de Cambio | Comités Requeridos |
|---|---|
| Cambio visual (CSS, layout, animaciones) | UX/UI + Desarrollo |
| Nueva funcionalidad (feature) | Producto + Arquitectura + Desarrollo |
| Refactorización | Arquitectura + Desarrollo + Calidad |
| Problema de seguridad | Seguridad + Arquitectura + Desarrollo |
| Problema de datos/modelos | Datos + Arquitectura + Desarrollo |
| Bug fix simple | Desarrollo + Calidad |
| Performance | Arquitectura + Desarrollo + Calidad |
| Landing/product page | Producto + UX/UI + Desarrollo |
| Testing/infra | Calidad + Desarrollo |

## PROCESO DE CAMBIO

### Paso 1 — Análisis
- Leer el código afectado
- Identificar el comité mínimo necesario
- Documentar el contexto

### Paso 2 — Consulta
- Consultar al comité de Arquitectura siempre que el cambio toque estructura
- Consultar a Seguridad si hay manejo de datos sensibles
- Consultar a UX/UI si el cambio es visible al usuario

### Paso 3 — Consolidación
- Incorporar recomendaciones
- Registrar ADR si aplica
- Estimar complejidad y riesgo

### Paso 4 — Implementación
- Un cambio a la vez
- Commits atómicos
- Sin cambios masivos

### Paso 5 — Validación
- Correr tests existentes
- Verificar regresiones visuales
- Validar con el comité de Calidad

### Paso 6 — Documentación
- Actualizar DIAGNOSTICO.md
- Actualizar BACKLOG.md (mover a completado)
- Si aplica, nuevo ADR

## CRITERIOS DE CALIDAD
Todo cambio debe mejorar al menos UNO de:
- Claridad del código
- Legibilidad
- Rendimiento
- Seguridad
- Mantenibilidad
- Escalabilidad
- Experiencia de usuario
- Diseño visual
- Robustez
- Reutilización

## OPTIMIZACIÓN DE TOKENS
**Presupuesto actual**: Máxima Calidad

Reglas:
1. Consultar mínimo número de comités (MES)
2. Respuestas profundas y detalladas
3. Evaluación multidisciplinaria
4. Comparación de alternativas
5. Identificación de riesgos y trade-offs
