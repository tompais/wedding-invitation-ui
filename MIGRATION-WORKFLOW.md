# 🔄 Flujo de Migraciones - Mejores Prácticas

## ✅ Enfoque Correcto: Migraciones Evolutivas

Cuando necesités hacer cambios al schema, **NO borres las migraciones existentes**. En su lugar, creá nuevas migraciones que evolucionen el schema.

---

## 📋 Ejemplos de Flujo Evolutivo

### Caso 1: Agregar una nueva columna

**❌ MAL: Borrar migraciones y recrear todo**

```bash
rm -rf prisma/migrations/
npm run db:migrate
```

**✅ BIEN: Crear migración nueva**

```bash
# 1. Editar schema.prisma
# Agregar: email String? @db.VarChar(100) a model Guest

# 2. Crear migración
npm run db:migrate -- --name add_email_to_guests

# Resultado:
# prisma/migrations/
#   ├── 20260212030028_initial_schema/
#   └── 20260212030045_add_email_to_guests/  ← Nueva
```

---

### Caso 2: Eliminar un índice (como hicimos)

**✅ BIEN:**

```prisma
// En schema.prisma, eliminar:
@@index([lastName, firstName], name: "idx_guests_name")

// Luego:
npm run db:migrate -- --name remove_name_index
```

Esto genera SQL automáticamente:

```sql
DROP INDEX "idx_guests_name";
```

---

### Caso 3: Agregar datos iniciales

**Cuando estés listo para agregar invitados:**

```bash
# 1. Crear migración vacía
npm run db:migrate -- --create-only --name seed_initial_guests

# 2. Editar el archivo migration.sql generado
# Agregar los INSERT INTO ...

# 3. Aplicar la migración
npm run db:migrate:deploy
```

---

## 🎯 Ventajas del Enfoque Evolutivo

1. **Historial completo** - Podés ver cómo evolucionó la base de datos
2. **Rollback fácil** - Prisma lleva control de qué migraciones se aplicaron
3. **Deploy seguro** - Vercel aplica solo las migraciones nuevas
4. **Trabajo en equipo** - Otros developers ven el historial de cambios
5. **Producción segura** - No perdés datos en producción

---

## ⚠️ Cuándo SÍ borrar migraciones

Solo en estas situaciones:

1. **Desarrollo inicial** (antes del primer deploy a producción)
2. **Proyecto sin datos importantes**
3. **Desarrollo local** (tu máquina, no afecta a nadie más)

**NUNCA** en:

- ❌ Producción
- ❌ Staging con datos de prueba importantes
- ❌ Cuando otros developers trabajan en el mismo proyecto

---

## 📊 Estado Actual del Proyecto

```
prisma/migrations/
├── migration_lock.toml
└── 20260212030028_initial_schema/
    └── migration.sql
```

**Base de datos:** Vacía, solo con estructura (tablas, índices, constraints)

**Próximos pasos cuando agregues invitados:**

```bash
npm run db:migrate -- --create-only --name seed_initial_guests
# Editar el archivo SQL generado
npm run db:migrate:deploy
```

---

## 🔍 Verificar migraciones aplicadas

```bash
# Ver estado de migraciones
npx prisma migrate status

# Ver historial en base de datos
psql $DATABASE_URL -c 'SELECT * FROM _prisma_migrations ORDER BY finished_at;'
```

---

## 💡 Tip: Migraciones como Documentación

Las migraciones son documentación viva de cómo evolucionó tu base de datos:

```
20260212030028_initial_schema          ← Creación inicial
20260215120000_add_email_to_guests     ← Agregaste emails
20260220145000_add_rsvp_notes          ← Agregaste notas en RSVP
20260301100000_seed_initial_guests     ← Cargaste invitados reales
```

Cada nombre de migración cuenta una historia. 📖

---

## ✅ Resumen

- ✅ **Migraciones son evolutivas**, no destructivas
- ✅ **Cada cambio = nueva migración**
- ✅ **Prisma maneja el SQL por vos** (en la mayoría de casos)
- ✅ **Git trackea las migraciones** (commitealas)
- ✅ **Vercel aplica migraciones automáticamente** en deploy

**Filosofía:** Tratá las migraciones como commits de Git - cada una representa un cambio atómico e incremental.
