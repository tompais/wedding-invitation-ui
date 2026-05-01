# RSVP Deadline Update — 30 de mayo de 2026

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cambiar la fecha límite de RSVP del 30 de marzo al 30 de mayo de 2026.

**Architecture:** El deadline vive en la variable de entorno `RSVP_DEADLINE` (formato ISO 8601 con offset `-03:00`). El cambio requiere actualizar dos lugares: el `.env` local y la variable en Vercel (producción). No hay cambios en `src/` — es puro config.

**Tech Stack:** `.env` local · Vercel dashboard / CLI

---

## Archivos involucrados

| Archivo | Acción | Qué cambia |
|---------|--------|------------|
| `.env` | Modificar | `RSVP_DEADLINE=2026-03-30T23:59:59-03:00` → `2026-05-30T23:59:59-03:00` |
| Vercel env var | Actualizar en dashboard | Mismo valor nuevo en producción |

> `.env` está en `.gitignore` — no se versiona. No se necesita rama ni PR.

---

### Task 1: Actualizar `.env` local

**Files:**
- Modify: `.env`

- [ ] **Step 1: Editar `.env`**

Cambiar la línea:
```
RSVP_DEADLINE=2026-03-30T23:59:59-03:00
```
por:
```
RSVP_DEADLINE=2026-05-30T23:59:59-03:00
```

- [ ] **Step 2: Verificar que el servidor de desarrollo toma el nuevo valor**

```bash
npm run dev
```

Abrir la app localmente y verificar que la fecha mostrada en el componente de deadline sea "30 de mayo de 2026". Si la fecha ya pasó en el entorno local, el flujo mostrará la pantalla de expiración — en ese caso alcanza con confirmar que el valor está correctamente seteado.

---

### Task 2: Actualizar la variable en Vercel (producción)

La variable `RSVP_DEADLINE` debe actualizarse en el dashboard de Vercel para que el cambio se refleje en producción.

**Opción A — Vercel CLI (si está instalado):**

- [ ] **Step 1: Actualizar la variable**

```bash
vercel env rm RSVP_DEADLINE production
vercel env add RSVP_DEADLINE production
# Cuando pregunte el valor, ingresar:
# 2026-05-30T23:59:59-03:00
```

- [ ] **Step 2: Triggear redeploy**

```bash
vercel --prod
```

**Opción B — Dashboard (si el CLI no está disponible):**

- [ ] **Step 1:** Ir a https://vercel.com → proyecto `wedding-invitation-ui` → Settings → Environment Variables
- [ ] **Step 2:** Encontrar `RSVP_DEADLINE` → Edit
- [ ] **Step 3:** Cambiar el valor a `2026-05-30T23:59:59-03:00` → Save
- [ ] **Step 4:** Ir a Deployments → hacer Redeploy del último deployment de producción para que tome el nuevo valor

---

### Task 3: Verificación en producción

- [ ] **Step 1:** Una vez hecho el redeploy, abrir la URL de producción con un código de invitación válido
- [ ] **Step 2:** Confirmar que el flujo RSVP funciona correctamente (no muestra pantalla de expiración, ya que la fecha límite es futura)
- [ ] **Step 3:** Si hay tests end-to-end o el skill `rsvp-flow-check`, ejecutarlo:

```bash
# Si está disponible:
# /rsvp-flow-check
```
