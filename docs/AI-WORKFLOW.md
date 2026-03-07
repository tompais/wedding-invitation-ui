# AI Workflow — Colaboración Claude Code + GitHub Copilot

Este proyecto es desarrollado con dos colaboradores de IA con roles distintos y complementarios.

## División de responsabilidades

| Rol      | Herramienta        | Responsabilidades                                                            |
| -------- | ------------------ | ---------------------------------------------------------------------------- |
| Builder  | **Claude Code**    | Feature development, refactors, migraciones DB, arquitectura, agents, skills |
| Reviewer | **GitHub Copilot** | Code reviews en PRs, GitHub Actions (crear, configurar, mantener)            |

---

## Claude Code

### Configuración del proyecto

El contexto de Claude Code vive en `.claude/`:

```
.claude/
├── agents/                      # Agentes autónomos (se disparan automáticamente)
│   ├── security-reviewer.md     # Revisa seguridad en API routes y acceso a DB
│   ├── architecture-reviewer.md # Detecta violaciones de la arquitectura en capas
│   ├── accessibility-reviewer.md # Verifica a11y en componentes nuevos/modificados
│   └── ux-consistency-reviewer.md # Verifica consistencia visual y UX mobile-first
├── skills/                      # Skills invocables con /nombre-skill
│   ├── create-migration/        # /create-migration — crea migraciones Supabase
│   ├── rsvp-flow-check/         # /rsvp-flow-check — verifica invariantes del flujo
│   ├── code-quality/            # /code-quality — auditoría SOLID/DRY/KISS
│   ├── update-docs/             # /update-docs — sincroniza README y docs/
│   └── zero-warnings/           # /zero-warnings — ESLint + Prettier + IDE warnings
├── settings.json                # Plugins habilitados + hooks automáticos
└── settings.local.json          # Permisos pre-aprobados (no commitear)
```

### Agentes (autónomos)

Los agentes se disparan automáticamente cuando Claude detecta el contexto correcto.
No necesitan ser invocados manualmente.

| Agente                    | Cuándo dispara                                          | Qué revisa                                      |
| ------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `security-reviewer`       | Al tocar API routes, server actions, o queries Supabase | Validación Zod, RLS, exposición de datos        |
| `architecture-reviewer`   | Al tocar routes, hooks, o componentes                   | Capas arquitectónicas, dependencias invertidas  |
| `accessibility-reviewer`  | Al crear/modificar componentes UI                       | Labels, roles ARIA, keyboard nav, touch targets |
| `ux-consistency-reviewer` | Al crear/modificar componentes UI                       | Design system, mobile UX, cohesión visual       |

### Skills (invocables)

```bash
/create-migration    # Crear migración Supabase con naming correcto + regenerar tipos
/rsvp-flow-check     # Verificar invariantes del flujo RSVP antes/después de cambios
/code-quality        # Auditoría de código contra SOLID, DRY, KISS, Clean Architecture
/update-docs         # Sincronizar README.md y docs/ con el estado actual del proyecto
/zero-warnings       # Eliminar todos los warnings de ESLint, Prettier, e IDE
```

### Hooks automáticos

Los hooks corren automáticamente al editar archivos:

| Evento                          | Qué hace                                 |
| ------------------------------- | ---------------------------------------- |
| Edit/Write en `.ts`/`.tsx`      | ESLint `--fix` → luego Prettier          |
| Edit/Write en cualquier archivo | Prettier                                 |
| Edit/Write en `.env*`           | Bloqueado — requiere confirmación manual |
| `git commit` en `master`        | Bloqueado — hay que trabajar en una rama |

### Plugins habilitados

Ver lista completa en `.claude/settings.json` → `enabledPlugins`.
Para instalar como colaborador, ver [CLAUDE-CODE-SETUP.md](CLAUDE-CODE-SETUP.md).

---

## GitHub Copilot

### Configuración

El contexto de Copilot vive en `.github/copilot-instructions.md`.
Este archivo es leído automáticamente por Copilot en cada interacción dentro del repo.

Incluye:

- Arquitectura del proyecto y reglas de capas
- Convenciones de TypeScript y React
- Invariantes del flujo RSVP
- Design system (colores, tipografía)
- Convenciones de git/PR
- Checklist de code review
- Patrones para GitHub Actions
- Lista de cosas que NO flagear

### Code reviews

Copilot revisa cada PR evaluando:

- Violaciones de Clean Architecture
- Tipos `any`, falta de Zod en boundaries
- Props sin `Readonly<>`
- Componentes Client sin necesidad de estado/eventos
- Colores o fuentes hardcodeadas (fuera de `theme.ts`)
- Copy en idioma que no sea español (AR)

### GitHub Actions existentes

| Workflow          | Archivo               | Cuándo corre                                       |
| ----------------- | --------------------- | -------------------------------------------------- |
| Claude Code       | `claude.yml`          | Al mencionar `@claude` en comentarios de PR/issues |
| Sourcery + Claude | `sourcery-claude.yml` | Cuando Sourcery AI envía un review en un PR        |

Para agregar o modificar workflows, pedirle a Copilot. Seguirá los patrones establecidos:
`actions/checkout@v4`, `anthropics/claude-code-action@v1`, SHA inmutables en checkout.

---

## Session Workflow

Para cada nueva solicitud de cambio, el flujo es:

```
1. Plan Mode (EnterPlanMode)
   ↓
2. Batch planning — planificar todos los cambios encadenados
   ↓
3. Branch strategy — determinar estructura de ramas
   • Cambio único → una rama + un PR → master
   • Cambios dependientes → ramas encadenadas: feature/A → feature/B → feature/C
   ↓
4. Loki Mode (/loki-mode) — implementación autónoma
   ↓
5. Definition of Done
   • npm run build + lint + format:check
   • Mobile responsive + a11y básica
   • Sync copilot-instructions.md si cambiaron convenciones
   • /update-docs si cambiaron docs o estructura
```

---

## Sincronización entre herramientas

Cuando cambian convenciones, arquitectura, o el workflow, actualizar **ambos** archivos:

| Cambio                            | Actualizar                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Convención de código/arquitectura | `CLAUDE.md` + `copilot-instructions.md`                                          |
| Workflow de sesión                | `CLAUDE.md` + `copilot-instructions.md` + `MEMORY.md`                            |
| Nueva doc en `docs/`              | `README.md` (sección Documentación)                                              |
| Nuevo agente o skill              | `CLAUDE-CODE-SETUP.md` (tabla de assets) + `AI-WORKFLOW.md`                      |
| Nuevo GitHub Action               | `copilot-instructions.md` (sección GitHub Actions existentes) + `AI-WORKFLOW.md` |
