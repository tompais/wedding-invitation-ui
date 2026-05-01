# Copilot Instructions — wedding-invitation-ui

## Project Overview

Next.js 16 wedding invitation app for **Angie & Tomi (Julio 2026)** with Supabase backend.
Single-page RSVP flow with two events (civil ceremony & party), group-based guest management,
and multi-step confirmation process.

- **Audience**: Non-technical family and friends, primarily on mobile via WhatsApp
- **Language**: Spanish (AR) — all UI copy must be in Spanish
- **Stack**: Next.js 16 (App Router), Supabase, TypeScript (strict), Tailwind CSS, Zod, React Hook Form

---

## Collaboration Model

This project is developed with two AI collaborators:

| Role     | Tool               | Responsibilities                                                  |
| -------- | ------------------ | ----------------------------------------------------------------- |
| Builder  | **Claude Code**    | Feature development, refactors, migrations, architecture, skills  |
| Reviewer | **GitHub Copilot** | Code reviews on PRs, GitHub Actions (create, configure, maintain) |

**Existing GitHub Actions** (do not remove or restructure without explicit request):

- `.github/workflows/claude.yml` — triggers Claude Code on `@claude` mentions in PR comments/issues
- `.github/workflows/sourcery-copilot.yml` — when Sourcery AI submits a review, creates a GitHub Issue
  with all suggestions and assigns Copilot coding agent to evaluate them and create a chained PR targeting the feature branch

When building or editing GitHub Actions, follow the patterns established in those files:
use `actions/checkout@v4` for checkout, and always use immutable SHA refs
(`github.event.pull_request.head.sha`) to avoid branch-name injection. For Claude integration,
use `anthropics/claude-code-action@v1` (see `claude.yml`). For Copilot-based automation,
create issues via `gh issue create` and assign via the GitHub API (see `sourcery-copilot.yml`).

---

## Code Review Responsibilities

When reviewing PRs, evaluate against the following:

### Architecture (Clean Architecture — dependencies flow inward)

```
UI (components/, app/page.tsx)
  ↓ imports from
Hooks (hooks/) — orchestration, state machines
  ↓ imports from
Application (app/actions/, app/api/) — thin controllers
  ↓ imports from
Infrastructure (lib/, schemas/) — Supabase singleton, Zod schemas
  ↓ imports from
Domain (types/, constants/) — pure types, enums, constants
```

**Flag these violations:**

- Business logic inside `app/api/route.ts` files (should only: parse → call service → respond)
- Supabase client instantiated outside `lib/supabase.ts`
- Components importing from `lib/supabase.ts` or `app/api/` directly
- Zod schemas defined inline in route handlers (should live in `src/schemas/`)

### TypeScript

- `strict: true` is active — no `any` without documented justification
- All API boundaries (request body, response, form data, DB results) must use Zod schemas
- Types are inferred from schemas: `z.infer<typeof schema>` — no manual type duplication
- Props interfaces must be `Readonly<Props>` (SonarQube requirement)
- Use named imports from `"react"` (`MouseEvent`, `RefObject`) — not `React.MouseEvent`

### React / Next.js

- **Server Components by default** — flag `"use client"` added without `useState`, event handlers, or browser APIs
- No `useEffect` for synchronizing derived state — use the render-time pattern `if (prev !== next) { set() }`
- No `style={{}}` inline — Tailwind or CSS Modules only
- `useEffect` is valid only for syncing with external systems (timers, DOM APIs, subscriptions)

### Supabase / Database

- Never create a new Supabase client — always import from `lib/supabase.ts`
- Parallel queries should use `Promise.all`, not sequential `await`
- New tables must have RLS enabled and explicit policies in the migration file
- Naming conventions: `pk_<table>`, `fk_<table>__<ref>`, `uq_<table>__<cols>`, `ck_<table>__<rule>`, `ix_<table>__<cols>`

### Validation

- All user input goes through Zod before touching the database — no exceptions
- Schemas live in `src/schemas/` — shared between client and server
- Server actions call schema validation before any DB write

### RSVP Flow Invariants

The RSVP state machine (`hooks/useRSVPFlow.ts`) has these invariants — flag any PR that breaks them:

- One person confirms for the entire group (`confirmedById`)
- Each guest has **separate** `civilAttending` / `partyAttending` flags (not group-level)
- Step sequence is strict: `search → selectGuests → selectEvents → confirm → success`
- Access is via invitation code only — no auth, no session, no localStorage persistence
- Zod validation runs before every DB write in `rsvpActions.ts`

---

## Design System

All visual values are centralized in `src/constants/theme.ts`. Flag hardcoded colors or fonts:

```ts
// Colors
bourdeaux: { dark: "#5A1F28", base: "#722F37", light: "#8B4450" }
hueso:     { base: "#FAF0E6", dark: "#F5E6D3" }
text:      { dark: "#2C1810", muted: "rgba(44,24,16,0.7)", light: "rgba(250,240,230,0.95)" }

// Typography
display: "'Playfair Display', Georgia, serif"
body:    "'Lora', Georgia, serif"
```

**Flag:** hardcoded hex values, hardcoded font families, or `style={{}}` instead of Tailwind classes.

---

## Git & PR Conventions

### Branch naming

`feature/*` | `enhancement/*` | `fix/*` | `hotfix/*` | `refactor/*`

### PR title prefix (must match branch prefix)

`[FTR]` | `[ENH]` | `[FIX]` | `[HOTFIX]` | `[RFT]`

### Commit messages

Format: `<type>: <short imperative description>`
Types: `feat` | `enhance` | `fix` | `refactor` | `chore` | `docs`

### Chained PRs

Complex changes use chained branches: `feature/A → feature/B → feature/C`.
Each PR targets the **previous branch**, not `master`. Review each independently.

### PR checklist to verify

- [ ] `npm run build` passes (check CI if configured)
- [ ] `npm run lint` passes (Biome)
- [ ] `npm run format:check` passes (Biome formatter)
- [ ] Mobile responsive (primary audience on mobile)
- [ ] All UI copy in Spanish (AR)
- [ ] No `any` types introduced
- [ ] No direct Supabase instantiation outside `lib/supabase.ts`

---

## GitHub Actions Guidelines

When creating or modifying workflows:

- Use `actions/checkout@v4` with `fetch-depth: 1` unless full history is needed
- Use immutable SHA refs for checkout on PR events: `ref: ${{ github.event.pull_request.head.sha }}`
- Scope permissions to minimum needed (`contents: read`, add `pull-requests: write` only if posting comments)
- For Claude Code integration, use `anthropics/claude-code-action@v1`
- Environment variables for secrets: `${{ secrets.SECRET_NAME }}` — never hardcode
- Job names should be lowercase kebab-case: `build-and-test`, `deploy-preview`
- Always add `id-token: write` when using OIDC-based authentication

**Existing secrets in use:**

- `CLAUDE_CODE_OAUTH_TOKEN` — Claude Code Action authentication (used only by `claude.yml`)

---

## What NOT to Flag

- `src/types/supabase.ts` — auto-generated from Supabase schema, never edited manually
- `persistSession: false` in Supabase client — intentional, app uses guest codes not auth sessions
- Spanish copy — this is intentional for the target audience, do not suggest English alternatives
- Lack of a full auth system — intentional design decision, invitation codes are the access mechanism
