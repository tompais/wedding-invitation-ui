---
name: rsvp-flow-check
description: >
  Verifica que el flujo RSVP y la state machine de useRSVPFlow.ts no rompan los invariantes
  del sistema. Usalo antes y después de modificar useRSVPFlow.ts, componentes RSVP, el schema
  de Zod, o las server actions de confirmación. También invocarlo cuando se agrega un nuevo paso
  al flujo o se cambia la lógica de selección de eventos.
user-invocable: true
---

## Cuándo usar este skill

- Antes de modificar `useRSVPFlow.ts`, `RSVP.tsx`, `rsvpActions.ts`, o `rsvp.schema.ts`
- Al agregar un nuevo paso al flujo o cambiar el orden de steps
- Después de cambios en la lógica de selección de invitados o eventos
- Como parte del Definition of Done para cualquier PR que toque el flujo RSVP

---

## Paso 1 — Leer los archivos clave

Leé estos archivos antes de evaluar:

- `src/hooks/useRSVPFlow.ts` — la state machine completa
- `src/app/actions/rsvpActions.ts` — la server action de confirmación
- `src/schemas/rsvp.schema.ts` — el schema de validación
- `src/components/RSVP/RSVP.tsx` — el componente principal del flujo
- `src/constants/rsvp.ts` — definición de los steps

---

## Paso 2 — Verificar los invariantes del sistema

Para cada invariante, confirmá que el código lo respeta:

### Confirmación grupal

- [ ] Solo una persona confirma por grupo (`confirmedById` se setea en el submit)
- [ ] El loop de confirmación itera sobre **todos** los guests del grupo, no solo el que confirma
- [ ] Los flags `civilAttending` / `partyAttending` se setean **por guest**, no por grupo

### Secuencia de steps

- [ ] El flujo sigue estrictamente: `search → selectGuests → selectEvents → confirm → success`
- [ ] No hay salto de steps (ej: no se puede llegar a `confirm` sin pasar por `selectEvents`)
- [ ] El step `success` es terminal — no hay transición desde él excepto reinicio completo

### Acceso sin auth

- [ ] El acceso al grupo se hace **solo** via invitation code (no hay userId ni session)
- [ ] El invitation code no se persiste en localStorage ni cookies
- [ ] Los errores de código inválido no revelan si el código existe o no

### Validación antes de escritura

- [ ] `rsvp.schema.ts` valida el payload **completo** antes de cualquier escritura a Supabase
- [ ] La server action (`rsvpActions.ts`) llama al schema antes de tocar la DB
- [ ] No hay bypass de validación para casos edge (grupos de 1 persona, etc.)

### Selección de eventos

- [ ] Se puede asistir a ambos eventos, solo uno, o ninguno (no forzado)
- [ ] La selección de eventos es **por guest** (no se aplica el mismo valor a todo el grupo)
- [ ] Si un guest no va a ningún evento, igual se persiste el registro de confirmación

---

## Paso 3 — Correr el flujo mentalmente

Trazá este escenario end-to-end con el código que estás revisando:

1. Usuario ingresa código de grupo válido → API devuelve guests
2. Usuario selecciona un subconjunto de guests (no todos)
3. Para cada guest seleccionado, elige eventos distintos
4. Usuario confirma → server action recibe el payload
5. Payload pasa por Zod → se persiste en DB
6. Estado pasa a `success`

¿Hay algún punto donde los datos se pierden, se sobreescriben, o la UI queda en estado inconsistente?

---

## Formato del reporte

```
[CRITICO] <archivo>:<linea> — <invariante roto>
  → Fix: <descripcion de la correccion>

[RIESGO] <archivo>:<linea> — <riesgo potencial>
  → Contexto: <por que es un riesgo y cuando se dispara>

[OK] Invariante: <descripcion> — verificado en <archivo>:<linea>
```

Si todos los invariantes pasan:

```
Flujo RSVP verificado. Todos los invariantes del sistema se respetan.
Steps: search → selectGuests → selectEvents → confirm → success ✓
Confirmacion grupal: confirmedById + flags por guest ✓
Validacion: Zod antes de DB write ✓
```
