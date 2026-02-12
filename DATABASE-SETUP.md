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

Las tablas necesarias ya están definidas en las migraciones de Prisma que se aplicaron previamente. Si necesitas recrear el schema:

1. Ir a **SQL Editor** en el panel de Supabase
2. Ejecutar el siguiente script SQL:

```sql
-- Crear tablas según el schema de Prisma

-- Tabla de grupos
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_name ON groups(name);

-- Tabla de invitados
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  code VARCHAR(6) UNIQUE NOT NULL DEFAULT LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guests_code ON guests(code);
CREATE INDEX idx_guests_group_id ON guests(group_id);

-- Tabla de confirmaciones
CREATE TABLE confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  civil_attending BOOLEAN DEFAULT false,
  party_attending BOOLEAN DEFAULT false,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  confirmed_by_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id)
);

CREATE INDEX idx_confirmations_confirmed_by_id ON confirmations(confirmed_by_id);
CREATE INDEX idx_confirmations_group_id ON confirmations(group_id);
CREATE INDEX idx_confirmations_confirmed_at ON confirmations(confirmed_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confirmations_updated_at BEFORE UPDATE ON confirmations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. Verificar en panel de Supabase

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

