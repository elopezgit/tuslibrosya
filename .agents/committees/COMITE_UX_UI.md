# COMITÉ UX/UI

## Responsabilidades
- Experiencia de usuario y diseño visual
- Responsive Design y accesibilidad
- Consistencia visual y usabilidad

## Evaluación de UX Actual

### Fortalezas (Ya Premium)
- ✅ Splash cinemático con efecto Netflix
- ✅ Glassmorphism coherente en paneles
- ✅ Animaciones fluidas con will-change y GPU acceleration
- ✅ Bento grid moderno para categorías
- ✅ Cross-selling contextual no intrusivo
- ✅ Confetti celebration en pedido completado
- ✅ Skeleton loaders para imágenes
- ✅ Scroll reveal con IntersectionObserver
- ✅ Stagger animations en cards
- ✅ Bottom bar con animación spring

### Oportunidades de Mejora

#### Alta Prioridad
1. **Accesibilidad**: Sin etiquetas ARIA, contraste insuficiente en algunos textos
2. **Keyboard navigation**: Sin soporte para navegación por teclado
3. **Loading states**: Más allá de imágenes, el menú mismo no tiene skeleton
4. **Error states**: No hay feedback visual cuando algo falla (ej: WhatsApp no disponible)

#### Media Prioridad
5. **Responsive avanzado**: La versión desktop es funcional pero no aprovecha el espacio
6. **Micro-interacciones**: Faltan en botones de cantidad y toggle delivery
7. **Empty states**: Mejorar el estado vacío del carrito con ilustraciones
8. **Gestos touch**: Swipe para cerrar paneles, pull-to-refresh

#### Baja Prioridad
9. **Dark mode**: No implementado
10. **Font loading**: Sin control de FOUT (Flash of Unstyled Text)
11. **Print styles**: No definidos

### Recomendaciones de Diseño

```css
/* Mejoras de accesibilidad */
:focus-visible {
  outline: 3px solid var(--brand);
  outline-offset: 2px;
}
```

```html
<!-- ARIA para carrito -->
<button class="cart-fab" onclick="openCart()"
        aria-label="Abrir carrito"
        aria-live="polite"
        aria-atomic="true">
```

### Consistencia Visual
| Elemento | Estado | Acción |
|---|---|---|
| Border radius tokens | ✅ Consistentes | OK |
| Shadow tokens | ✅ Consistentes | OK |
| Font scale | ✅ Buena jerarquía | OK |
| Color palette | ✅ Coherente | OK |
| Spacing scale | ⚠️ Algunos valores sueltos | Estandarizar |
| Icon system | ⚠️ Emojis (no SVG) | Evaluar migración |
