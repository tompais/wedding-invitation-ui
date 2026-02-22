---
name: rsvp-flow-check
description: Background context about the RSVP state machine — step ordering, group-based confirmation logic, and event selection rules. Load this before modifying
useRSVPFlow.ts or any RSVP form component.
user-invocable: false
---

Key invariants to preserve:

- One person confirms for entire group (confirmedById)
- Each guest has separate civilAttending / partyAttending flags
- Steps follow: search → select guests → select events → confirm → success
- No auth system: access via guest codes only
- Zod validation must run before any DB write
