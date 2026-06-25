# COMITÉ DE SEGURIDAD

## Responsabilidades
- Vulnerabilidades y OWASP
- Protección de datos
- Autenticación y autorización
- Riesgos de seguridad

## Análisis de Seguridad

### Riesgos Identificados

| # | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| S1 | XSS en template literals (item.name, item.desc) | ALTA | Solo datos estáticos precargados en menu |
| S2 | Datos sensibles en localStorage (lastOrder) | MEDIA | Datos de pedidos sin expiración |
| S3 | Sin HTTPS enforcement | MEDIA | Asumido por GitHub Pages/hosting moderno |
| S4 | Navegación externa no validada (wa.me) | BAJA | URL generada internamente |
| S5 | Sin CSP headers | BAJA | Proyecto estático sin server |
| S6 | Manipulación de precios desde consola | MEDIA | Datos en memoria modificables |

### Evaluación

**Fortalezas**:
- ✅ Sin backend = sin superficie de ataque server-side
- ✅ Sin cookies de sesión
- ✅ Sin autenticación que comprometer
- ✅ Datos de clientes no persisten en servidor externo
- ✅ Sin formularios que envíen datos a server propio

**Debilidades**:
- ❌ Precios modificables desde DevTools (client-side trust)
- ❌ localStorage sin cifrado
- ❌ Sin validación server-side de pedidos

### Recomendaciones

1. **Validación de contenido HTML**: Asegurar que `item.name`, `item.desc` no contengan HTML inyectable
2. **Cifrado en localStorage**: Al menos ofuscar datos sensibles (teléfono, dirección)
3. **Firma de pedidos**: Incluir hash simple en el mensaje de WhatsApp para detectar manipulación
4. **Política de seguridad**: Agregar `Content-Security-Policy` vía meta tag
5. **Rate limiting client-side**: Prevenir spam de envío de pedidos (debounce)

### Veredicto
Riesgo general BAJO para una app demo. Sin embargo, las prácticas de sanitización y cifrado básico deberían implementarse antes de un despliegue productivo real.
