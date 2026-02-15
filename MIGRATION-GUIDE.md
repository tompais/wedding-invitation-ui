# 🔄 Migración de Prisma a Supabase - Guía Completa

## 📋 Resumen de Cambios

Este proyecto ha sido migrado de **Prisma ORM** a **Supabase Client** para resolver problemas de conectividad IPv6 y simplificar el proceso de deployment.

### ✅ Qué se cambió

1. **Cliente de Base de Datos**
   - ❌ Antes: Prisma Client con PostgreSQL Adapter
   - ✅ Ahora: Supabase JS Client

2. **Variables de Entorno**
   - ❌ Antes: `DATABASE_URL` (connection string PostgreSQL)
   - ✅ Ahora: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Scripts de NPM**
   - ❌ Eliminados: `db:migrate`, `db:generate`, `db:push`, `db:studio`, `postinstall`
   - ✅ Simplificado: Solo `dev`, `build`, `start`, `lint`, `format`

4. **Proceso de Build**
   - ❌ Antes: `prisma migrate deploy && prisma generate && next build`
   - ✅ Ahora: `next build` (sin migraciones durante el build)

5. **Archivos Eliminados**
   - `prisma/` - Directorio completo con schema y migraciones
   - `src/lib/prisma.ts` - Cliente Prisma
   - `prisma.config.ts` - Configuración Prisma

6. **Archivos Nuevos**
   - `src/lib/supabase.ts` - Cliente Supabase
   - `src/types/supabase.ts` - Tipos TypeScript para la base de datos

---

## 🚀 Cómo Configurar después de la Migración

### 1. Obtener Credenciales de Supabase

1. Ir a [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleccionar tu proyecto (o crear uno nuevo)
3. Ir a **Settings** → **API**
4. Copiar:
   - **Project URL** (ej: `https://xxxxx.supabase.co`)
   - **anon public** key (empieza con `eyJ...`)

### 2. Configurar Variables de Entorno

#### Desarrollo Local

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**⚠️ IMPORTANTE:** `.env.local` está en `.gitignore` y no se commitea.

#### Producción (Vercel)

Si ya hiciste la integración Vercel ↔ Supabase desde el dashboard, las variables ya están configuradas.

Si no:

1. Ir a [Vercel Dashboard](https://vercel.com) → Tu Proyecto → **Settings** → **Environment Variables**
2. Agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = Tu URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Tu anon key
3. Seleccionar environments: **Production**, **Preview**, **Development**

### 3. Aplicar Schema de Base de Datos

Las tablas ya deberían existir si migraste desde Prisma. Si necesitas recrearlas:

1. Ir a **SQL Editor** en Supabase Dashboard
2. Copiar y ejecutar el script SQL de [DATABASE-SETUP.md](./DATABASE-SETUP.md#4-aplicar-schema-de-base-datos)

### 4. Verificar que Funciona

```bash
# Instalar dependencias (si es necesario)
npm install

# Iniciar desarrollo
npm run dev

# Build de producción
npm run build
```

---

## 🔍 Diferencias en el Código

### Antes (Prisma)

```typescript
import { prisma } from "@/lib/prisma";

const guest = await prisma.guest.findUnique({
  where: { code: "123456" },
  include: {
    group: {
      include: {
        guests: true,
      },
    },
  },
});
```

### Ahora (Supabase)

```typescript
import { supabase } from "@/lib/supabase";

const { data: guest } = await supabase
  .from("guests")
  .select("*")
  .eq("code", "123456")
  .single();

// Para joins, hacemos queries separadas
if (guest?.group_id) {
  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", guest.group_id)
    .single();
}
```

---

## ✅ Ventajas de la Migración

| Aspecto                  | Prisma                       | Supabase                 |
| ------------------------ | ---------------------------- | ------------------------ |
| **Conexión IPv6**        | ❌ Solo IPv6 (problemas)     | ✅ HTTP API (IPv4/IPv6)  |
| **Build en Vercel**      | ❌ Requiere DB en build time | ✅ No requiere DB        |
| **Tiempo de Build**      | ~2-3 min (con migraciones)   | ~1 min (sin migraciones) |
| **Integración Vercel**   | ⚠️ Manual                    | ✅ Automática            |
| **Variables de Entorno** | 1 (`DATABASE_URL`)           | 2 (pero auto-config)     |
| **Migraciones**          | SQL + Prisma Migrate         | SQL directo en Supabase  |
| **Tipos TypeScript**     | Auto-generados               | Definidos manualmente    |

---

## ⚠️ Puntos a Considerar

### 1. Tipos TypeScript

Supabase no genera tipos automáticamente como Prisma. Los tipos en `src/types/supabase.ts` se definen manualmente basados en el schema.

**Solución:** Usar Supabase CLI para generar tipos automáticamente (opcional):

```bash
npx supabase gen types typescript --project-id "tu-proyecto-id" > src/types/supabase.ts
```

### 2. Queries Complejas

Supabase tiene limitaciones en joins complejos. Para relaciones, a veces es necesario hacer múltiples queries.

**Antes (Prisma):**

```typescript
const guest = await prisma.guest.findUnique({
  where: { id },
  include: { group: { include: { guests: true } }, confirmations: true },
});
```

**Ahora (Supabase):**

```typescript
const { data: guest } = await supabase
  .from("guests")
  .select("*")
  .eq("id", id)
  .single();
const { data: group } = await supabase
  .from("groups")
  .select("*, guests(*)")
  .eq("id", guest.group_id)
  .single();
const { data: confirmations } = await supabase
  .from("confirmations")
  .select("*")
  .eq("guest_id", id);
```

### 3. Transacciones

Prisma tiene `$transaction` nativo. Con Supabase, las transacciones se manejan a nivel de base de datos (stored procedures o RPC).

**Para este proyecto:** No afecta porque no usamos transacciones complejas.

---

## 📚 Documentación Actualizada

Todos los archivos de documentación han sido actualizados:

- ✅ [README.md](./README.md) - Stack tecnológico actualizado
- ✅ [DATABASE-SETUP.md](./DATABASE-SETUP.md) - Guía de configuración con Supabase
- ✅ [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - Proceso de deploy simplificado
- ✅ `.env.example` - Variables de entorno actualizadas

---

## 🐛 Troubleshooting

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Causa:** Variables de entorno no configuradas.

**Solución:**

1. Crear `.env.local` con las credenciales correctas
2. Reiniciar el servidor de desarrollo

### Error: "Invalid API key"

**Causa:** Anon key incorrecta o expirada.

**Solución:**

1. Verificar en Supabase Dashboard → Settings → API
2. Copiar la `anon` key (NO la `service_role` key)
3. Actualizar `.env.local`

### Error de TypeScript: "Property 'group_id' does not exist on type 'never'"

**Causa:** Supabase client tiene problemas de inferencia de tipos en TypeScript estricto.

**Solución:** Ya implementado con type assertions (`as any`) en las API routes.

### Base de datos vacía después de migración

**Causa:** Los datos no se migraron automáticamente.

**Solución:**

1. Si tenías datos en Prisma/PostgreSQL, exportarlos con `pg_dump`
2. Importarlos en Supabase usando SQL Editor
3. O agregar datos manualmente desde Table Editor

---

## 🎯 Próximos Pasos

1. ✅ Configurar `.env.local` con credenciales de Supabase
2. ✅ Verificar que `npm run dev` funciona
3. ✅ Verificar que `npm run build` funciona
4. ✅ Hacer push a GitHub
5. ✅ Deploy automático en Vercel
6. ✅ Verificar que la app funciona en producción

---

## 📞 Soporte

Si tenés problemas con la migración:

1. Revisar [DATABASE-SETUP.md](./DATABASE-SETUP.md)
2. Verificar logs de Vercel en Dashboard → Deployments → Function Logs
3. Revisar logs de Supabase en Dashboard → Logs

---

# MIGRATION-GUIDE.md fue movido a docs/MIGRATION-GUIDE.md

**Fecha de Migración:** Febrero 2026  
**Versión:** 1.0.0  
**Autor:** GitHub Copilot Coding Agent
