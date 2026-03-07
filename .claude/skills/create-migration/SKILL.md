---
name: create-migration
description: >
  Crea una nueva migración de Supabase con naming correcto, la aplica al proyecto,
  y regenera los tipos TypeScript. Usalo siempre que haya que agregar tablas, columnas,
  constraints, índices, o políticas RLS. Nunca editar `src/types/supabase.ts` a mano.
user-invocable: true
---

## Paso 1 — Entender el cambio

Preguntá (o inferí del contexto) qué hace la migración. Ejemplos:

- "agregar columna phone a guests"
- "crear tabla confirmations"
- "agregar índice en guests.group_id"

---

## Paso 2 — Generar el nombre del archivo

**Formato obligatorio:** `YYYYMMDD_<descripcion_en_snake_case>.sql`

Usá la fecha de hoy. La descripción debe ser clara y en inglés:

```
20260306_add_phone_to_guests.sql
20260306_create_confirmations_table.sql
20260306_add_index_guests_group_id.sql
```

Ubicación: `supabase/migrations/`

---

## Paso 3 — Escribir el SQL

### Convenciones de naming obligatorias (del proyecto)

| Elemento | Formato               | Ejemplo                       |
| -------- | --------------------- | ----------------------------- |
| Tablas   | `snake_case` plural   | `guests`, `confirmations`     |
| Columnas | `snake_case`          | `group_id`, `civil_attending` |
| PK       | `pk_<tabla>`          | `pk_guests`                   |
| FK       | `fk_<tabla>__<ref>`   | `fk_guests__groups`           |
| Unique   | `uq_<tabla>__<cols>`  | `uq_guests__email`            |
| Check    | `ck_<tabla>__<regla>` | `ck_guests__attending_valid`  |
| Index    | `ix_<tabla>__<cols>`  | `ix_guests__group_id`         |

### Template base para nueva tabla

```sql
-- Migration: <descripcion>
-- Date: YYYY-MM-DD

create table <tabla> (
  id uuid primary key default gen_random_uuid() constraint pk_<tabla> primary key,
  -- columnas...
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS (siempre habilitar en tablas nuevas)
alter table <tabla> enable row level security;

-- Politicas RLS (ajustar segun el caso de uso)
create policy "anon_read_<tabla>"
  on <tabla> for select
  to anon
  using (true);

-- Indices (agregar si hay FK o queries frecuentes)
create index ix_<tabla>__<col> on <tabla>(<col>);
```

### Checklist antes de continuar

- [ ] Nombre de tabla en `snake_case` plural
- [ ] Toda FK tiene su constraint nombrado `fk_<tabla>__<ref>`
- [ ] RLS habilitado en tablas nuevas
- [ ] Políticas RLS definidas (no dejar tablas con RLS habilitado pero sin políticas)
- [ ] Índices en columnas que se van a usar en WHERE o JOIN

---

## Paso 4 — Revisar con el usuario

Mostrá el SQL generado y esperá confirmación antes de aplicar. Si hay dudas sobre el schema,
revisar `src/types/supabase.ts` (tipos actuales) y `supabase/migrations/` (historial).

---

## Paso 5 — Aplicar la migración

```bash
supabase db push
```

Si hay error de conexión o de permisos, verificar que las variables de entorno estén en `.env`.

---

## Paso 6 — Regenerar tipos TypeScript

```bash
npm run types
```

Esto regenera `src/types/supabase.ts` desde el schema actual. **Nunca editar ese archivo a mano.**

---

## Paso 7 — Verificar

```bash
npm run build
```

Confirmá que no hay errores de TypeScript derivados del cambio de schema. Si los hay, actualizá
los tipos en `src/types/database.ts` o los componentes afectados.

---

## Notas importantes

- `src/types/supabase.ts` está en `globalIgnores` de ESLint — no reportará errores aunque esté desactualizado
- Siempre hacer `npm run types` después de cualquier cambio de schema, incluso pequeño
- Si la migración falla a mitad, revisar el estado con `supabase db diff` antes de reintentar
