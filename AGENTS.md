# AGENTS.md

## Purpose and Product Context

- Wedding invitation app for Angie & Tomi (Julio 2026), optimized for mobile guests arriving from WhatsApp links.
- UI copy is Spanish (AR); preserve tone and wording style across flows.
- Core feature is RSVP by invitation code (no auth/session flow).

## Architecture You Need to Keep in Mind

- Single-page composition in `src/app/page.tsx` (section-based landing + RSVP block).
- RSVP orchestration lives in `src/hooks/useRSVPFlow.ts`; UI rendering lives in `src/components/RSVP/RSVP.tsx`.
- Server writes are handled by `src/app/actions/rsvpActions.ts` (form submit path) and API routes in `src/app/api/**/route.ts` (fetch/external path).
- Validation boundary is centralized in `src/schemas/rsvp.schema.ts`; avoid inline schema definitions.
- DB access must use the singleton in `src/lib/supabase.ts` (typed client, `persistSession: false`).

## End-to-End Data Flow (RSVP)

- Code lookup: `RSVP.tsx` -> `useRSVPFlow.processGuestCode()` -> `GET /api/guests` (`src/app/api/guests/route.ts`).
- Step machine currently uses `RSVPStep`: `CODE_INPUT -> ATTENDANCE_DECISION -> CONFIRMATION_GRID` (+ `INVITATION_EXPIRED`) in `src/types/RSVPStep.ts`.
- Final confirmation submit uses `useActionState` + `confirmAttendanceAction` (server action) in `src/app/actions/rsvpActions.ts`.
- Confirmation persistence is per guest (`civil_attending`, `party_attending`) and grouped by `confirmed_by_id` / `group_id`.

## Database and Integrations

- Main tables: `groups`, `guests`, `confirmations` in `supabase/migrations/20260212_initial_schema.sql`.
- `confirmations_guest_id_key` enforces at most one confirmation row per guest; writes use upsert semantics.
- Deadline gate is controlled by optional `RSVP_DEADLINE` env var in guest/confirmation APIs.
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Project-Specific Conventions (from existing guidance)

- Keep boundaries typed with Zod + `z.infer` (`src/schemas/rsvp.schema.ts`).
- Prefer parallel DB reads for independent queries (`Promise.all` pattern in `src/app/api/guests/route.ts`).
- `src/types/supabase.ts` is generated (`npm run types`), do not hand-edit.
- Theme tokens are centralized in `src/constants/theme.ts`; prefer shared tokens over new hardcoded values.
- Existing guidance says no inline styles, but legacy parts (notably `src/components/RSVP/RSVP.tsx`) still contain `style={{}}`; avoid expanding this pattern.

## Developer Workflow (high-signal commands)

- Dev: `npm run dev`
- Quality gates: `npm run lint` and `npm run format:check`
- Production check: `npm run build`
- Supabase types refresh after schema changes: `npm run types`

## CI / Agent Collaboration Notes

- AI collaboration model: builder conventions in `CLAUDE.md`, reviewer conventions in `.github/copilot-instructions.md`.
- Existing workflows to preserve: `.github/workflows/claude.yml` and `.github/workflows/sourcery-copilot.yml`.
- `claude.yml` uses `anthropics/claude-code-action@v1` and `CLAUDE_CODE_OAUTH_TOKEN` secret.
- `sourcery-copilot.yml` uses only `GITHUB_TOKEN`; on Sourcery reviews it creates a GitHub Issue and assigns the Copilot coding agent to evaluate suggestions and open a chained PR.
