# GOVERNANZA DEL PROYECTO — TuPedido

## Estructura de Gobierno

```
.agents/
├── committees/
│   ├── COMITE_ARQUITECTURA.md    — Diseño del sistema, patrones, ADRs
│   ├── COMITE_DESARROLLO.md      — Calidad de código, implementación
│   ├── COMITE_CALIDAD.md         — Testing, automatización, regresiones
│   ├── COMITE_SEGURIDAD.md       — Vulnerabilidades, OWASP, datos
│   ├── COMITE_UX_UI.md           — Experiencia de usuario, diseño visual
│   ├── COMITE_DATOS.md           — Modelado, integridad, esquemas
│   └── COMITE_PRODUCTO.md        — Roadmap, valor de negocio, features
├── skills/                        — Skills de diseño y desarrollo
└── governance/
    ├── README.md                  — Este archivo
    ├── DIAGNOSTICO.md             — Análisis completo del proyecto
    ├── ADRS.md                    — Architecture Decision Records
    ├── BACKLOG.md                 — Backlog priorizado (P0-P3)
    └── REGLAS_GOBERNANZA.md       — Reglas de proceso y MES
```

## Uso
1. Antes de cualquier cambio, consultar DIAGNOSTICO.md y BACKLOG.md
2. Aplicar Minimum Expert Set (MES)
3. Seguir el proceso de 6 pasos
4. Mantener ADRs actualizados

## Estado del Proyecto
- **Madurez**: Prototipo funcional / Early MVP
- **Deuda Técnica**: Alta (monolithic JS, sin tests)
- **Prioridad Inmediata**: P0 items del backlog
