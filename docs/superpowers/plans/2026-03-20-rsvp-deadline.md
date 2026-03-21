# RSVP Deadline Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce a global RSVP deadline so that guests who haven't responded cannot confirm after March 30, while guests who already responded can still edit freely.

**Architecture:** A single env var `RSVP_DEADLINE` drives all expiration logic server-side. The API computes `invitationExpired` and returns it to the client; the hook routes expired guests to a new `INVITATION_EXPIRED` step rendered inline in `RSVP.tsx`. The `POST /api/confirmations` endpoint enforces the rule as a defense-in-depth check.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Supabase (no DB changes required), Tailwind CSS, Framer Motion

---

## File Map

| File                                 | Change                                                          |
| ------------------------------------ | --------------------------------------------------------------- |
| `.env`                               | Add `RSVP_DEADLINE`                                             |
| `.env.example`                       | Document `RSVP_DEADLINE`                                        |
| `src/types/RSVPStep.ts`              | Add `INVITATION_EXPIRED = 4`                                    |
| `src/types/api.ts`                   | Add `rsvpDeadline` + `invitationExpired` to `GuestResponse`     |
| `src/constants/rsvp.ts`              | Add `expired` message section                                   |
| `src/app/api/guests/route.ts`        | Compute + return `rsvpDeadline` + `invitationExpired`           |
| `src/app/api/confirmations/route.ts` | Add per-guest 403 check before upsert                           |
| `src/hooks/useRSVPFlow.ts`           | Route to `INVITATION_EXPIRED` when `invitationExpired === true` |
| `src/components/RSVP/RSVP.tsx`       | Render `INVITATION_EXPIRED` step inline                         |

---

## Chunk 1: Foundation — Env var + Types

### Task 1: Add RSVP_DEADLINE env var

**Files:**

- Modify: `.env`
- Modify: `.env.example`

- [ ] **Step 1.1: Add var to `.env`**

Open `.env` and add at the end:

```
# Fecha límite global para confirmar asistencia (ISO 8601 con offset horario)
# Si no está definida, no se aplica ningún límite.
RSVP_DEADLINE=2026-03-30T23:59:59-03:00
```

- [ ] **Step 1.2: Document var in `.env.example`**

Open `.env.example` and add after the Supabase block:

```
# Fecha límite global para que los invitados confirmen asistencia (ISO 8601 con offset)
# Si no está definida, no se aplica ningún límite de tiempo (útil en desarrollo).
# Ejemplo: RSVP_DEADLINE=2026-03-30T23:59:59-03:00
RSVP_DEADLINE=""
```

- [ ] **Step 1.3: Commit**

```bash
git add .env.example
git commit -m "chore: document RSVP_DEADLINE env var"
```

> Note: `.env` is gitignored — do not stage it.

---

### Task 2: Extend types

**Files:**

- Modify: `src/types/RSVPStep.ts`
- Modify: `src/types/api.ts`

- [ ] **Step 2.1: Add INVITATION_EXPIRED to the enum**

Current file (`src/types/RSVPStep.ts`):

```ts
export enum RSVPStep {
  CODE_INPUT = 1,
  ATTENDANCE_DECISION = 2,
  CONFIRMATION_GRID = 3,
}
```

Replace with:

```ts
export enum RSVPStep {
  CODE_INPUT = 1,
  ATTENDANCE_DECISION = 2,
  CONFIRMATION_GRID = 3,
  INVITATION_EXPIRED = 4,
}
```

- [ ] **Step 2.2: Extend GuestResponse in `src/types/api.ts`**

Add two fields to the `GuestResponse` interface after `confirmation`:

```ts
export interface GuestResponse {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  phone: string | null;
  group: { ... } | null;          // unchanged
  confirmation: { ... } | null;   // unchanged
  rsvpDeadline: string | null;    // ISO timestamp from env var; null if not set
  invitationExpired: boolean;     // computed server-side
}
```

- [ ] **Step 2.3: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no type errors (there will be errors about missing fields in the API route — those get fixed in Task 3).

- [ ] **Step 2.4: Commit**

```bash
git add src/types/RSVPStep.ts src/types/api.ts
git commit -m "feat: add INVITATION_EXPIRED step and rsvpDeadline types"
```

---

## Chunk 2: Backend — API changes

### Task 3: Update GET /api/guests

**File:** `src/app/api/guests/route.ts`

This route currently returns guest + group + confirmation. We need to add `rsvpDeadline` and `invitationExpired` to the response.

- [ ] **Step 3.1: Add expiration helper at top of route file**

After the imports (around line 6), add:

```ts
// ─── Expiration helpers ────────────────────────────────────────────────────

/**
 * Parses RSVP_DEADLINE env var as a UTC-offset-aware timestamp.
 * Returns null if the var is unset or unparseable.
 */
function getRsvpDeadline(): Date | null {
  const raw = process.env.RSVP_DEADLINE;
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Returns true if the deadline has passed AND the guest has no prior confirmation.
 * If RSVP_DEADLINE is unset, always returns false (no restriction).
 */
function computeInvitationExpired(
  deadline: Date | null,
  hasConfirmation: boolean
): boolean {
  if (!deadline) return false;
  return new Date() > deadline && !hasConfirmation;
}
```

- [ ] **Step 3.2: Update the return statement**

Find the final `return NextResponse.json({...})` (around line 144) and add the two new fields.

`confirmation` is already resolved from `confirmationsResult.data?.[0]` earlier in the route — reuse it directly to avoid an extra DB round-trip:

```ts
const deadline = getRsvpDeadline();
// confirmation comes from confirmationsResult.data?.[0] — already fetched above, no new query
const hasConfirmation = confirmation !== undefined;

return NextResponse.json({
  id: guestData.id,
  firstName: guestData.first_name,
  lastName: guestData.last_name,
  code: guestData.code,
  phone: guestData.phone,
  group,
  confirmation: confirmation
    ? {
        civilAttending: confirmation.civil_attending,
        partyAttending: confirmation.party_attending,
        confirmedBy: confirmation.confirmed_by,
        confirmedAt: confirmation.confirmed_at,
      }
    : null,
  rsvpDeadline: deadline ? deadline.toISOString() : null,
  invitationExpired: computeInvitationExpired(deadline, hasConfirmation),
});
```

- [ ] **Step 3.3: Verify manually**

```bash
npm run dev
```

Open browser (or curl):

```
http://localhost:3000/api/guests?code=TU_CODIGO
```

Expected response includes:

```json
{
  "rsvpDeadline": "2026-03-30T23:59:59.000-03:00",
  "invitationExpired": false
}
```

(false because the deadline hasn't passed yet)

- [ ] **Step 3.4: Commit**

```bash
git add src/app/api/guests/route.ts
git commit -m "feat: return rsvpDeadline and invitationExpired from GET /api/guests"
```

---

### Task 4: Update POST /api/confirmations

**File:** `src/app/api/confirmations/route.ts`

Add the expiration check INSIDE `upsertConfirmation`, after it already fetches `existingConfirmation`. This way the check reuses the query that's already there — no extra DB round-trip per guest.

`upsertConfirmation` needs to return a new sentinel value `{ expired: true }` when the check fails. The caller in the POST handler handles it as a 403.

- [ ] **Step 4.1: Update `upsertConfirmation` return type and add deadline guard**

Find `upsertConfirmation` (around line 40). Update its return type and add the expiration check after fetching `existingConfirmation`:

```ts
async function upsertConfirmation(
  conf: { guestId: string; civilAttending: boolean; partyAttending: boolean },
  confirmedById: string,
  groupId: string | null
): Promise<Confirmation | { error: string } | { expired: true }> {
  // Verificar si ya existe confirmación
  const { data: existingConfirmation } = await supabase
    .from("confirmations")
    .select("*")
    .eq("guest_id", conf.guestId)
    .single();

  // ─── Verificar si la invitación expiró ────────────────────────────────
  // Solo aplica si el invitado NO tiene confirmación previa.
  // Reusa existingConfirmation ya fetcheado — sin query extra.
  if (!existingConfirmation) {
    const raw = process.env.RSVP_DEADLINE;
    if (raw) {
      const deadline = new Date(raw);
      if (!isNaN(deadline.getTime()) && new Date() > deadline) {
        return { expired: true };
      }
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  if (existingConfirmation) {
    // ... update (unchanged)
  } else {
    // ... insert (unchanged)
  }
}
```

- [ ] **Step 4.2: Handle `{ expired: true }` in the POST handler**

In the for-loop in `POST`, after calling `upsertConfirmation`, add the expired case:

```ts
const result = await upsertConfirmation(
  conf,
  confirmedById,
  confirmerGuest.group_id
);

if ("expired" in result) {
  return NextResponse.json(
    { error: "El plazo para confirmar tu asistencia ha expirado." },
    { status: 403 }
  );
}
if ("error" in result) {
  return NextResponse.json({ error: result.error }, { status: 500 });
}
createdConfirmations.push(result);
```

- [ ] **Step 4.2: Verify manually**

With the dev server running, test the happy path (before the deadline) by completing an RSVP from the browser. It should work normally.

To simulate the expired case, temporarily change `RSVP_DEADLINE` in `.env` to a past date (e.g. `2020-01-01T00:00:00-03:00`) and try submitting for a guest with no prior confirmation. Expected: 403 response.

Revert the test date after verifying.

- [ ] **Step 4.3: Commit**

```bash
git add src/app/api/confirmations/route.ts
git commit -m "feat: enforce 403 for expired guests with no prior confirmation"
```

---

## Chunk 3: Frontend — Hook + Component

### Task 5: Update useRSVPFlow

**File:** `src/hooks/useRSVPFlow.ts`

`processGuestCode` currently always navigates to `ATTENDANCE_DECISION` on success. Update it to route to `INVITATION_EXPIRED` when the API says so.

- [ ] **Step 5.1: Update processGuestCode**

Find the `processGuestCode` function. Currently:

```ts
setCurrentGuest(data);
setStep(RSVPStep.ATTENDANCE_DECISION);
return { success: true };
```

Replace with:

```ts
setCurrentGuest(data);
setStep(
  data.invitationExpired
    ? RSVPStep.INVITATION_EXPIRED
    : RSVPStep.ATTENDANCE_DECISION
);
return { success: true };
```

- [ ] **Step 5.2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no errors (INVITATION_EXPIRED is now a valid enum value).

> **Note on `PREV_STEP`:** `useRSVPFlow.ts` has a `PREV_STEP` map that drives the back button. `INVITATION_EXPIRED` is intentionally NOT added to this map — it's a terminal dead-end state with no back navigation. Missing keys return `undefined`, which `goBack()` already handles safely (no-op).

- [ ] **Step 5.3: Commit**

```bash
git add src/hooks/useRSVPFlow.ts
git commit -m "feat: route to INVITATION_EXPIRED step when invite has expired"
```

---

### Task 6: Add expired copy to RSVP_CONFIG

**File:** `src/constants/rsvp.ts`

All UI text lives here. Add the expired messages so they're not scattered in the component.

- [ ] **Step 6.1: Add expired section to RSVPMessages interface**

Extend the `RSVPMessages` interface:

```ts
interface RSVPMessages {
  errors: {
    codeNotFound: string;
    submitting: string;
    error: string;
  };
  success: {
    attendance: { title: string; subtitle: string };
    noAttendance: { title: string; subtitle: string };
  };
  expired: {
    // ← new
    title: string;
    subtitle: string;
  };
}
```

- [ ] **Step 6.2: Add expired messages to the runtime `RSVP_CONFIG` object**

Both the TypeScript interface (Step 6.1) AND the `RSVP_CONFIG` object literal must be updated — they live in the same file. Inside the `messages` object in `RSVP_CONFIG`, add:

```ts
expired: {
  title: "Tu invitación venció",
  subtitle: "El plazo para confirmar asistencia ya cerró.",
},
```

> The `as const` assertion on `RSVP_CONFIG` is fine here — it just makes the values readonly literal types, which TypeScript accepts without issue.

- [ ] **Step 6.3: Commit**

```bash
git add src/constants/rsvp.ts
git commit -m "feat: add expired messages to RSVP_CONFIG"
```

---

### Task 7: Render INVITATION_EXPIRED step in RSVP.tsx

**File:** `src/components/RSVP/RSVP.tsx`

Add the expired step inline, following the exact same pattern as steps 1–3 (motion.div inside AnimatePresence).

- [ ] **Step 7.1: Add date formatting helper inside the component**

At the top of the `RSVP` function body (after the hooks), add:

```ts
// Formatea la fecha límite en español (ej: "30 de marzo de 2026")
const formattedDeadline = currentGuest?.rsvpDeadline
  ? new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date(currentGuest.rsvpDeadline))
  : null;
```

- [ ] **Step 7.2: Add the expired step block inside AnimatePresence**

After the closing tag of "PASO 3" (around line 654) and before the "Éxito" block, add:

```tsx
{
  /* PASO: Invitación expirada */
}
{
  step === RSVPStep.INVITATION_EXPIRED &&
    currentGuest &&
    !showSuccessOverlay && (
      <motion.div
        key="step-expired"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className={`${formContainerStyles} text-center`}
        style={{
          backgroundColor: "rgba(250, 240, 230, 0.1)",
          borderColor: "rgba(250, 240, 230, 0.2)",
        }}
      >
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{ background: "rgba(250, 240, 230, 0.15)" }}
          aria-hidden="true"
        >
          ⏰
        </div>
        <h3
          className={`${formHeadingStyles} mb-3`}
          style={{ color: "var(--hueso)" }}
        >
          {RSVP_CONFIG.messages.expired.title}
        </h3>
        <p
          className="mb-2 font-body text-base leading-relaxed opacity-80"
          style={{ color: "var(--text-light)" }}
        >
          {RSVP_CONFIG.messages.expired.subtitle}
        </p>
        {formattedDeadline && (
          <p
            className="font-body text-sm opacity-60"
            style={{ color: "var(--text-light)" }}
          >
            El plazo era hasta el {formattedDeadline}.
          </p>
        )}
      </motion.div>
    );
}
```

- [ ] **Step 7.3: Verify visually**

```bash
npm run dev
```

To test the expired UI, temporarily set `invitationExpired: true` in the `processGuestCode` mock or change `RSVP_DEADLINE` to a past date in `.env`. Enter any valid guest code. Expected: the expired screen appears instead of the identity confirmation step.

Revert after verifying.

- [ ] **Step 7.4: Run quality checks**

```bash
npm run lint && npm run format:check
```

Expected: no errors, no warnings.

- [ ] **Step 7.5: Run build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 7.6: Commit**

```bash
git add src/components/RSVP/RSVP.tsx
git commit -m "feat: render INVITATION_EXPIRED step with deadline date in Spanish"
```

---

## Chunk 4: GitHub Action — Copilot Handoff

### Task 8: Create GitHub issue for Copilot

The GitHub Action implementation is delegated to GitHub Copilot. Deliver the prompt as a GitHub issue so Copilot can pick it up.

- [ ] **Step 8.1: Create the issue**

```bash
gh issue create \
  --title "feat: GitHub Action to auto-apply Supabase migrations on merge to master" \
  --body "$(cat <<'EOF'
## Context

We need a GitHub Actions workflow that automatically applies Supabase DB migrations whenever a PR that includes new migration files is merged to \`master\`.

## Workflow spec

Create \`.github/workflows/supabase-migrate.yml\` with the following behavior:

**Trigger:** \`push\` to the \`master\` branch, but **only** when the pushed commit includes changes under \`supabase/migrations/**\` (use a \`paths\` filter).

**Job:** runs on \`ubuntu-latest\`, performs these steps in order:

1. Checkout the repository (\`actions/checkout@v4\`)
2. Install the Supabase CLI (use the official \`supabase/setup-cli\` action, pin to a recent stable version)
3. Link the project: \`supabase link --project-ref \$SUPABASE_PROJECT_REF\`
4. Apply pending migrations: \`supabase db push --linked\`

**Secrets:** the job needs two repository secrets (already configured):
- \`SUPABASE_ACCESS_TOKEN\` — used to authenticate the CLI
- \`SUPABASE_PROJECT_REF\` — the project reference ID

Set these as environment variables on the steps that need them.

**Additional requirements:**
- Add a clear workflow name (e.g. "Apply Supabase Migrations")
- Name the job meaningfully (e.g. "migrate")
- Add a concise comment at the top explaining when and why this workflow runs
- \`supabase db push\` is idempotent — it tracks applied migrations and skips already-applied ones

## Notes
- This action is intentionally NOT triggered on every push — only when migration files change
- No dry-run or approval gate needed; migrations are reviewed as part of the PR process before merge
EOF
)"
```

- [ ] **Step 8.2: Verify issue was created**

```bash
gh issue list --limit 5
```

Expected: the new issue appears at the top.

---

## Final verification

- [ ] Run end-to-end test: enter a valid guest code → normal RSVP flow works
- [ ] Temporarily set `RSVP_DEADLINE` to a past date + enter a code for a guest with no confirmation → expired screen appears
- [ ] Temporarily set `RSVP_DEADLINE` to a past date + enter a code for a guest who already confirmed → normal flow (can still edit)
- [ ] `npm run build && npm run lint && npm run format:check` all pass
- [ ] Open `https://vercel.com/[project]/settings/environment-variables` and add `RSVP_DEADLINE=2026-03-30T23:59:59-03:00`
