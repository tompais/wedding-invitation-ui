# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 wedding invitation app for **Angie & Tomi (Julio 2026)** with Supabase backend.
Single-page RSVP flow with two events (civil ceremony & party), group-based guest management,
and multi-step confirmation process.

**Audience**: Family and friends (non-technical), primarily mobile via WhatsApp.
**Language**: Spanish (AR) — all UI copy and content must be in Spanish.

## Development Commands

```bash
# Development
npm run dev              # Start dev server on :3000
npm run build            # Production build
npm run start            # Production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Database
npm run types            # Generate TypeScript types from Supabase schema

# Supabase Migrations
supabase db diff -f <name>   # Generate migration file from schema changes
supabase db push             # Apply pending migrations to remote DB
```

## How to Work

- **Small, incremental changes** — no massive refactors
- **No new libraries** unless there's a clear benefit (performance, DX, or security)
- **Didactic code** — this project is developed alongside someone learning; prefer clarity
- **When in doubt**: make a reasonable decision, implement it, document the assumption. Only ask when truly blocked.
- **Always run quality checks before declaring done** (`npm run lint && npm run format:check`)

## Git Workflow

**Always work on a branch — never commit directly to `master`.**

### Branch naming convention

| Prefix          | When to use                                  |
| --------------- | -------------------------------------------- |
| `feature/*`     | New user-facing functionality                |
| `enhancement/*` | Improvements to existing features or tooling |
| `fix/*`         | Non-urgent bug fixes                         |
| `hotfix/*`      | Urgent production fixes                      |
| `refactor/*`    | Code restructuring with no behavior change   |

```bash
# Examples
git checkout -b feature/civil-ceremony-step
git checkout -b enhancement/mobile-layout
git checkout -b fix/rsvp-validation-error
git checkout -b refactor/extract-guest-service
```

**Rule:** create the branch _before_ making any changes. If changes were made on `master` by mistake, stash them, create the branch, and pop the stash.

### Atomic commits

- Each commit represents **one logical change** — it must compile and pass lint independently.
- No `WIP`, `temp`, or vague `fix` messages. Squash before opening a PR if needed.
- Stage only what belongs to the commit (`git add -p` is preferred over `git add .`).

### Commit message format

```
<type>: <short imperative description>

[optional body: explain WHY, not WHAT — the diff already shows what]
```

| Type       | When to use                                   |
| ---------- | --------------------------------------------- |
| `feat`     | New user-facing functionality                 |
| `enhance`  | Improvement to an existing feature or tooling |
| `fix`      | Bug fix                                       |
| `refactor` | Code restructuring with no behavior change    |
| `chore`    | Config, deps, CI — no production code change  |
| `docs`     | Documentation only                            |

```bash
# Good examples
feat: add civil ceremony RSVP step
fix: validate phone number format before submission
enhance: improve mobile layout for guest selection
refactor: extract confirmation logic into service layer

# Bad — avoid these
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "changes"
```

### Pull Request title convention

PR titles must carry a prefix that mirrors the branch type:

| Branch prefix   | PR prefix  |
| --------------- | ---------- |
| `feature/*`     | `[FTR]`    |
| `enhancement/*` | `[ENH]`    |
| `fix/*`         | `[FIX]`    |
| `hotfix/*`      | `[HOTFIX]` |
| `refactor/*`    | `[RFT]`    |

```
# Examples
[FTR] Add civil ceremony RSVP step
[ENH] Improve mobile layout for guest selection
[FIX] Validate phone number format before submission
[HOTFIX] Correct confirmation email subject
[RFT] Extract guest confirmation into service layer
```

## Architecture Patterns

### Layered Architecture (thin controllers)

API routes must be minimal — parse input, call a service, return response. No business logic in controllers.

```
src/app/api/**/route.ts  → Validate input (Zod), call service, return response
src/schemas/**           → Zod schemas (shared client/server)
src/application/**       → Use cases / services [create when needed]
src/domain/**            → Domain types, pure logic [create when needed]
src/lib/**               → Shared infra (Supabase singleton, HTTP helpers)
src/infrastructure/**    → Repositories/adapters [create when needed]
```

**Dependency Injection (no framework)**: use cases receive dependencies as parameters — never instantiate Supabase inside business logic.

### Data Flow

```
API Routes (/api/*)           → External-facing endpoints (GET/POST)
  /api/guests        → GET guests by group invitation code
  /api/confirmation  → POST submit RSVP for a group
Server Actions (/app/actions) → Form submissions & mutations
  rsvpActions.ts     → RSVP submission server action
Supabase Client (lib/)        → Direct DB access (singleton)
Zod Schemas (schemas/)        → Validation layer (shared client/server)
```

**When to use which:**

- **Server Actions**: Form submissions, mutations triggered by user actions
- **API Routes**: External access, webhooks, or client-side fetch calls
- **Direct Supabase**: Read operations in Server Components

### React / Next.js Rules

- **Server Components by default**; Client Components only for forms, animations, or state
- **Type all boundaries**: payloads, responses, DTOs — `strict: true` is active, never use `any` (document exceptions)
- **No inline styles** (`style={{}}`); use Tailwind CSS or CSS Modules

### TypeScript: Enums vs String Literals

For finite-value states, prefer enumerable types over scattered string literals:

```ts
// ✅ Preferred
export const RSVP_STATUS = { PENDING: 'pending', CONFIRMED: 'confirmed' } as const;
export type RsvpStatus = typeof RSVP_STATUS[keyof typeof RSVP_STATUS];

// ❌ Avoid
if (status === 'confirmed') { ... }  // strings scattered everywhere
```

Centralize in `src/constants/` or `src/types/`.

### Validation Pattern

All validation uses Zod schemas in `src/schemas/rsvp.schema.ts`:

- Schemas define business rules (UUID validation, phone format, event selection)
- TypeScript types inferred from schemas (`z.infer<typeof schema>`)
- Shared between client (React Hook Form) and server (API validation)

### Component Organization

```
src/
├── app/
│   ├── actions/           # Server actions ("use server")
│   ├── api/              # Route handlers (external endpoints)
│   └── page.tsx          # Main page (App Router)
├── components/           # React components (colocated styles)
├── hooks/               # Custom React hooks
│   ├── useRSVPFlow.ts   # RSVP state machine
│   ├── useModal.ts      # Modal management
│   ├── useScrollAnimation.ts # Scroll-triggered animation helper
│   └── useAudio.ts      # Music player
├── lib/
│   ├── supabase.ts      # Supabase singleton client
│   └── api.ts           # HTTP wrapper (typed fetch)
├── schemas/             # Zod validation schemas
├── constants/           # Config (events, RSVP steps, theme)
└── types/               # TypeScript types
    └── supabase.ts      # Generated from DB schema
```

### State Management

- **RSVP Flow**: Multi-step state machine in `hooks/useRSVPFlow.ts`
- **Form State**: React Hook Form + Zod resolver pattern
- **Server State**: Server Actions with `useActionState` hook

## Key Database Concepts

**Three main tables:**

- `groups`: Family/invitation groups
- `guests`: Individual invitees (linked to group)
- `confirmations`: RSVP responses (per guest, per event)

**Group-based RSVP:**

- One person confirms for entire group
- `confirmedById` tracks who submitted the confirmation
- Each guest has separate `civilAttending`/`partyAttending` flags

**Naming conventions:**

- Tables: `snake_case` plural | Columns: `snake_case`
- PK: `id` (UUID preferred) | FK: `<singular_table>_id`
- Constraints: `pk_<table>`, `fk_<table>__<ref>`, `uq_<table>__<cols>`, `ck_<table>__<rule>`
- Indexes: `ix_<table>__<cols>`

## API Design

- Resource-oriented endpoints
- Correct status codes: `400` invalid input, `409` conflict, `500` unexpected
- Consistent error response shape — never leak sensitive data in errors

## Environment Setup

Required env vars in `.env` (not `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get credentials from Supabase project → Settings → API.
**Never expose the service role key to the client.**

## Important Notes

- **Type Generation**: Always run `npm run types` after schema changes - types are not auto-generated
- **Supabase Singleton**: Never create new Supabase clients - always import from `lib/supabase.ts`
- **No Auth System**: Auth disabled (`persistSession: false`) - app uses guest codes for access
- **Validation Layer**: All input validation goes through Zod schemas - never skip validation
- **Server Actions**: Prefix files with `"use server"` directive for server actions
- **Git Pre-commit**: Husky + lint-staged runs on commit (ESLint + Prettier)

## Definition of Done

Before marking any task complete:

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] No obvious console errors
- [ ] RSVP flow works end-to-end (or mock + clear TODO)
- [ ] Mobile responsive (primary audience is on mobile via WhatsApp)
- [ ] Basic accessibility (labels, focus, keyboard navigation)

## Output Format

When finishing a task, respond with:

1. **What changed** (bullets)
2. **Files touched**
3.
4. **How to test locally** (commands)
5. **Assumptions / follow-ups**

## Documentation

**All additional docs must live in `docs/`** — not in the repo root.

See `docs/` for detailed guides:

- `DATABASE-SETUP.md` - Supabase setup & schema
- `SUPABASE-CLI.md` - CLI usage & migrations
- `MIGRATION-WORKFLOW.md` - Step-by-step migration workflow
- `SUPABASE-TYPES.md` - Type system explanation
- `MIGRATION-GUIDE.md` - Prisma → Supabase migration notes
- `VERCEL-DEPLOY.md` - Deployment configuration
- `CLAUDE-CODE-SETUP.md` - Claude Code plugins & setup for new collaborators
