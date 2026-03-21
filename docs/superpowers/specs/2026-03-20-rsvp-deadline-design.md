# Spec: RSVP Deadline + GitHub Action Auto-Migration

**Date:** 2026-03-20
**Status:** Approved
**Scope:** Two independent features — invitation expiration enforcement and automated DB migration workflow.

---

## Context

All wedding invitations have been sent via WhatsApp. Guests have until **March 30, 2026** to confirm their attendance. After that date, guests who have not responded should see an "invitation expired" screen and be blocked from submitting a new confirmation. Guests who already responded (yes or no) can continue editing their response freely, even after the deadline.

No new invitations will be sent after March 30, so the deadline is global — every guest shares the same cutoff date.

---

## Feature 1 — Invitation Expiration

### Decision: no DB changes

The deadline is identical for all guests. Storing it per-row would repeat the same value ~100 times with no benefit. A global env var is the correct model: single source of truth, changeable from the Vercel dashboard without a code deploy, zero migration required.

### Env var

```
RSVP_DEADLINE=2026-03-30T23:59:59-03:00
```

Added to `.env` (local) and Vercel project environment variables (production).

### Expiration rule

```
invitationExpired =
  RSVP_DEADLINE is set
  AND now() > RSVP_DEADLINE          ← both parsed as UTC-offset-aware timestamps
  AND guest has no existing confirmation
```

If `RSVP_DEADLINE` is not set, `invitationExpired` is always `false` — no expiration enforced. This is the intended behavior for local development and for any future guests added after the deadline window closes.

The env var must be parsed as an offset-aware timestamp: `new Date(process.env.RSVP_DEADLINE)`. Since the value includes `-03:00`, JavaScript parses it correctly relative to UTC. Comparing against `new Date()` (UTC) is safe.

Guests who already confirmed — regardless of whether they said yes or no — can edit their response freely after the deadline.

### API changes

**`GET /api/guests?code=`**

Adds two fields to the existing response shape:

```ts
rsvpDeadline: string | null; // ISO timestamp from env var; null if not set
invitationExpired: boolean; // computed server-side using the rule above
```

`rsvpDeadline` is included so the `InvitationExpiredStep` component can display the date dynamically (e.g. "Tu invitación venció el 30 de marzo") without hardcoding it in the UI.

The client must not compute expiration independently — the server is the source of truth.

**`POST /api/confirmations`**

The endpoint receives a list of guest confirmations (one person can confirm for the whole group). For **each guest** in the payload, before upserting:

1. Is `RSVP_DEADLINE` set and in the past?
2. Does **this specific guest** already have a confirmation row?

If both conditions are true for a guest (deadline past, no prior confirmation) → abort the entire request and return `403 Forbidden`:

```json
{ "error": "El plazo para confirmar tu asistencia ha expirado." }
```

The check is per-guest, not per-group. A guest who already confirmed unblocks only themselves, not other members of their group who haven't confirmed yet.

This is a defense-in-depth check. The primary gate is the frontend, but the API must not trust client state.

### Frontend changes

**`src/types/RSVPStep.ts`** — add new step:

```ts
export enum RSVPStep {
  CODE_INPUT = 1,
  ATTENDANCE_DECISION = 2,
  CONFIRMATION_GRID = 3,
  INVITATION_EXPIRED = 4, // new
}
```

**`src/types/api.ts`** — extend `GuestResponse`:

```ts
rsvpDeadline: string | null;
invitationExpired: boolean;
```

**`src/hooks/useRSVPFlow.ts`** — update `processGuestCode`:

Current behavior: on success → always navigate to `ATTENDANCE_DECISION`.
New behavior:

```
if data.invitationExpired → setStep(RSVPStep.INVITATION_EXPIRED)
else → setStep(RSVPStep.ATTENDANCE_DECISION)   // unchanged
```

**New component: `InvitationExpiredStep`**

Shown when `step === RSVPStep.INVITATION_EXPIRED`. Displays:

- A clear heading: _"Tu invitación venció"_
- A body message with the deadline date formatted in Spanish, read from `currentGuest.rsvpDeadline` (e.g. _"El plazo para confirmar era hasta el 30 de marzo de 2026."_)
- A WhatsApp CTA button linking to the couple's contact number so the guest can reach out if they need help

Follows existing component patterns (Tailwind, no inline styles, mobile-first, accessible). The WhatsApp phone number should be sourced from a constant (not hardcoded inline).

### Data flow summary

```
User enters code
  → GET /api/guests
    → server reads RSVP_DEADLINE env var
    → server checks guest.confirmation
    → returns { ..., invitationExpired: boolean }
  → useRSVPFlow.processGuestCode
    → invitationExpired === true → INVITATION_EXPIRED step
    → invitationExpired === false → ATTENDANCE_DECISION step (existing flow)
```

---

## Feature 2 — GitHub Action: Auto-Migration on Merge

### Purpose

Run `supabase db push` automatically when a PR that includes new migration files is merged to `master`. Keeps the production DB in sync without manual intervention.

### Design notes

- `supabase db push` is idempotent: it tracks applied migrations in `supabase_migrations` and skips already-applied ones. Running it on a PR with no new migrations is harmless but wasteful — the path filter avoids unnecessary runs.
- This Action is independent of Feature 1 (no DB migration is needed for the deadline feature).
- Implementation is **delegated to GitHub Copilot** via a prompt (see below).

### Workflow spec

**File:** `.github/workflows/supabase-migrate.yml`

| Property         | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| Trigger          | `push` to `master`, path filter: `supabase/migrations/**`     |
| Runner           | `ubuntu-latest`                                               |
| Steps            | checkout → install Supabase CLI → `supabase db push --linked` |
| Secrets required | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`               |

### Copilot prompt

The following prompt should be given to GitHub Copilot to implement this Action:

---

> Create a GitHub Actions workflow file at `.github/workflows/supabase-migrate.yml`.
>
> **Trigger:** `push` to the `master` branch, but **only** when the pushed files include changes under `supabase/migrations/**` (use a path filter).
>
> **Job:** runs on `ubuntu-latest`, performs these steps in order:
>
> 1. Checkout the repository (`actions/checkout@v4`)
> 2. Install the Supabase CLI (use the official `supabase/setup-cli` action, pin to a recent stable version)
> 3. Link the project: `supabase link --project-ref $SUPABASE_PROJECT_REF`
> 4. Run `supabase db push --linked` to apply pending migrations to the linked Supabase project
>
> **Secrets:** the job needs two repository secrets:
>
> - `SUPABASE_ACCESS_TOKEN` — used to authenticate the CLI
> - `SUPABASE_PROJECT_REF` — the project reference ID
>
> Set these as environment variables for the step that runs `supabase db push`.
>
> The workflow should have a clear name (e.g., "Apply Supabase Migrations") and the job should be named meaningfully (e.g., "migrate"). Add a concise comment at the top of the file explaining when and why this workflow runs.

---

## Out of scope

- Per-guest or per-group deadline variation (all guests share one global deadline)
- Migrating solo guests into single-person groups (unnecessary with the global env var approach)
- Admin UI to change the deadline (Vercel dashboard is sufficient)
- Notifications or reminders to guests who haven't responded

---

## Definition of Done

- [ ] `RSVP_DEADLINE` env var documented in `.env.example` (or equivalent)
- [ ] `GET /api/guests` returns `rsvpDeadline` and `invitationExpired`
- [ ] `POST /api/confirmations` returns `403` for expired guests with no prior confirmation
- [ ] `RSVPStep.INVITATION_EXPIRED` added and handled in `useRSVPFlow`
- [ ] `InvitationExpiredStep` component renders correctly on mobile
- [ ] `npm run build && npm run lint && npm run format:check` pass
- [ ] GitHub Copilot prompt delivered for the migration Action
