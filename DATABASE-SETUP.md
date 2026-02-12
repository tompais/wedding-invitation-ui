# 🗄️ Configuración de Base de Datos con Supabase

## 📋 Arquitectura de Variables de Entorno

```
.env.local         → Desarrollo local (NO SE COMMITEA) - tus credenciales reales
.env.example       → Template de ejemplo (SÍ SE COMMITEA) - sin credenciales
Vercel Dashboard   → Producción (variables configuradas en la nube)
```

**⚠️ IMPORTANTE:** `.env.local` **NUNCA** se commitea a Git. Contiene tus credenciales reales.

---

## ☁️ Configuración de Supabase

### 1. Crear cuenta y proyecto

1. Ir a [https://supabase.com](https://supabase.com)
2. Loguearse con GitHub
3. Click en "New project"
4. Configurar:
   - **Name:** `wedding-invitation`
   - **Database Password:** Generar uno fuerte y **guardarlo**
   - **Region:** `South America (São Paulo)` ← más cercano a Argentina
   - **Plan:** Free
5. Click en "Create new project" (tarda ~2 minutos)

### 2. Obtener credenciales de API

1. En el panel de Supabase → **Settings** → **API**
2. Copiar:
   - **Project URL** (ej: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (una clave larga que empieza con `eyJ...`)

### 3. Configurar `.env.local`

Crear el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Reemplazar con tus valores reales de Supabase.**

### 4. Aplicar schema de base de datos

El schema de la base de datos está definido en la migración de Supabase: `supabase/migrations/20260212_initial_schema.sql`

**Opción A: SQL Editor (Recomendado - Más Simple)**

1. Ir a **SQL Editor** en el panel de Supabase: https://supabase.com/dashboard/project/yckzrkriuqhlumuaydsb/sql
2. Abrir el archivo `supabase/migrations/20260212_initial_schema.sql` en tu editor
3. Copiar todo el contenido
4. Pegar en el SQL Editor de Supabase
5. Click en "Run" para ejecutar

**Opción B: Usando Supabase CLI**

Si prefieres usar el CLI de Supabase:

```bash
# Instalar Supabase CLI (si no lo tenés)
npm install -g supabase

# Login y link al proyecto
supabase login
supabase link --project-ref yckzrkriuqhlumuaydsb

# Aplicar la migración
supabase db push
```

Ver [SUPABASE-CLI.md](./SUPABASE-CLI.md) para instrucciones completas sobre el uso del CLI.

### 5. (Opcional) Regenerar tipos TypeScript

Los tipos TypeScript en `src/types/supabase.ts` fueron creados manualmente y son correctos. Sin embargo, si querés regenerarlos automáticamente desde el schema de Supabase:

```bash
npx supabase gen types typescript --project-id yckzrkriuqhlumuaydsb > src/types/supabase.ts
```

Esto genera tipos idénticos a los actuales pero sincronizados directamente con la base de datos.

### 6. Verificar en panel de Supabase

1. Ir a **Table Editor** en el panel de Supabase
2. Verificar que aparecen las tablas: `guests`, `groups`, `confirmations`

### 6. Verificar conexión

```bash
# Probar el servidor de desarrollo
npm run dev
```

---

## 🚀 Configurar en Vercel (Producción)

### Integración automática con Supabase

Si ya integraste Vercel con Supabase desde el dashboard, las variables ya deberían estar configuradas. Para verificar:

1. Ir a tu proyecto en Vercel: [https://vercel.com](https://vercel.com)
2. Click en tu proyecto → **Settings** → **Environment Variables**
3. Verificar que existen:
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Si no existen, agregarlas manualmente con los valores de Supabase
5. **Environments:** Marcar `Production`, `Preview`, `Development`

### Redeploy

```bash
# Hacer push a tu repo
git push origin main

# Vercel automáticamente hace redeploy con las nuevas variables
```

---

## 🔍 Verificar que Todo Funciona

### Checklist:

```bash
# ✅ 1. Variables de entorno configuradas
cat .env.local # Debe tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# ✅ 2. Build pasa
npm run build

# ✅ 3. Desarrollo funciona
npm run dev

# ✅ 4. Probar API en otra terminal
curl http://localhost:3000/api/guest/123456
```

---

## 🐛 Troubleshooting

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Solución:**

- Verificar que `.env.local` existe en la raíz del proyecto
- Verificar que las variables están correctamente escritas (sin espacios)
- Reiniciar el servidor de desarrollo

### Error: "Invalid API key"

**Solución:**

- Verificar que copiaste la `anon` key correcta desde Supabase
- Verificar que no hay espacios al principio o al final de la key

### Error al conectar desde Vercel

**Solución:**

- Verificar que las variables de entorno están configuradas en Vercel
- Verificar que la configuración de Row Level Security (RLS) en Supabase permite acceso público (o deshabilitarla para testing)

---

## 📊 Estado Esperado Final

Después de seguir esta guía:

- ✅ `.env.local` configurado con credenciales de Supabase (NO se commitea)
- ✅ Base de datos creada en Supabase
- ✅ Tablas creadas en Supabase
- ✅ Build exitoso
- ✅ API routes funcionando

---

## 🎯 Ventajas de Supabase vs Prisma

**Resuelto:**

- ✅ No más problemas de conexión IPv6
- ✅ Integración nativa con Vercel
- ✅ No necesita migraciones durante el build
- ✅ SDK TypeScript-first con tipos automáticos
- ✅ Realtime capabilities (para futuras funcionalidades)
- ✅ Dashboard visual para administrar datos

**Compatibilidad:**

- ✅ Usa PostgreSQL (misma base de datos que antes)
- ✅ Todas las tablas y relaciones se mantienen iguales
- ✅ Los datos existentes se conservan
