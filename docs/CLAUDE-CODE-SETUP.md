# Claude Code — Setup para colaboradores

Esta guía explica cómo configurar Claude Code para trabajar en este proyecto.
Está pensada para quienes se suman al repo sin tener Claude Code previamente configurado.

## 1. Instalación de Claude Code

```bash
npm install -g @anthropic/claude-code
```

Luego autenticarse con tu cuenta de Anthropic:

```bash
claude
```

## 2. Instalación de plugins

El repo ya tiene definido qué plugins deben estar activos (en `.claude/settings.json`).
Solo necesitás instalarlos una vez en tu máquina:

```bash
# Esenciales para este proyecto
claude plugin install superpowers@claude-plugins-official
claude plugin install supabase@claude-plugins-official
claude plugin install playwright@claude-plugins-official
claude plugin install commit-commands@claude-plugins-official
claude plugin install pr-review-toolkit@claude-plugins-official
claude plugin install claude-md-management@claude-plugins-official
claude plugin install context7@claude-plugins-official
claude plugin install typescript-lsp@claude-plugins-official
claude plugin install frontend-design@claude-plugins-official
claude plugin install code-review@claude-plugins-official
claude plugin install code-simplifier@claude-plugins-official
claude plugin install feature-dev@claude-plugins-official
claude plugin install github@claude-plugins-official
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Una vez instalados, se activan automáticamente al abrir el proyecto porque ya están
listados en `.claude/settings.json`.

## 3. Lo que ya viene con el repo (sin instalar nada)

Al clonar el repo ya tenés disponible sin configuración extra:

| Qué     | Dónde                   | Para qué                                                                                          |
| ------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| Skills  | `.claude/skills/`       | `/create-migration`, `/rsvp-flow-check`, `/code-quality`, `/zero-warnings`                        |
| Agentes | `.claude/agents/`       | `security-reviewer`, `architecture-reviewer`, `accessibility-reviewer`, `ux-consistency-reviewer` |
| Hooks   | `.claude/settings.json` | ESLint + Prettier automático al editar `.ts`/`.tsx`, protección de `.env`                         |

## 4. Variables de entorno

Copiá `.env.example` a `.env` y completá con las credenciales del proyecto Supabase:

```bash
cp .env.example .env
```

Las credenciales están en Supabase → Settings → API.

## 5. Verificar que todo funciona

```bash
npm run dev       # Debería levantar en :3000
npm run lint      # Sin errores
npm run build     # Build limpio
```
