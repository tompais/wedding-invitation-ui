# 🗄️ Configuración de Base de Datos PostgreSQL

## 📋 Arquitectura de Variables de Entorno

```
.env              → Desarrollo local (NO SE COMMITEA) - tus credenciales reales
.env.example      → Template de ejemplo (SÍ SE COMMITEA) - sin credenciales
Vercel Dashboard  → Producción (variables configuradas en la nube)
```

**⚠️ IMPORTANTE:** `.env` **NUNCA** se commitea a Git. Contiene tus credenciales reales.

---

## 🚀 Opción A: PostgreSQL Local (Desarrollo)

### 1. Instalar PostgreSQL

```bash
# macOS con Homebrew
brew install postgresql@16
brew services start postgresql@16

# Verificar instalación
psql --version
```

### 2. Crear la base de datos

```bash
# Crear base de datos
createdb wedding_invitation

# Verificar que se creó
psql -l | grep wedding_invitation
```

### 3. Configurar `.env`

Editá el archivo `.env` (en la raíz del proyecto) y reemplazá con tu configuración:

```env
# Reemplazar TU_USUARIO con el usuario de tu Mac
DATABASE_URL="postgresql://TU_USUARIO@localhost:5432/wedding_invitation?schema=public"
```

**Ejemplo real:**

```env
DATABASE_URL="postgresql://tom.pais@localhost:5432/wedding_invitation?schema=public"
```

### 4. Ejecutar migraciones

```bash
# Crear y aplicar migración inicial
npm run db:migrate
# Cuando te pida nombre, escribí: "initial_schema"

# Verificar tablas creadas
psql wedding_invitation -c '\dt'
```

### 5. (Opcional) Poblar Datos de Prueba

**NOTA:** Por ahora, la base de datos está vacía (solo estructura). Los datos de invitados se cargarán cuando estén formalizados.

Si necesitás agregar invitados de prueba para testing local, podés crear una migración:

```bash
# Crear migración de datos
npm run db:migrate -- --create-only --name seed_test_guests

# Editar el archivo SQL generado
# Agregar INSERT INTO statements

# Aplicar migración
npm run db:migrate:deploy
```

Ver [MIGRATION-WORKFLOW.md](./MIGRATION-WORKFLOW.md) para más detalles sobre el flujo de migraciones.

### 6. Verificar conexión

```bash
# Verificar que Prisma puede conectarse
npm run db:generate

# Probar el servidor
npm run dev
```

---

## ☁️ Opción B: Supabase (Cloud - Desarrollo/Producción)

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

### 2. Obtener URL de conexión

1. En el panel de Supabase → **Settings** → **Database**
2. Scroll hasta **Connection string** → **URI**
3. Copiar el string (empieza con `postgresql://postgres.xxx...`)
4. **Importante:** Reemplazar `[YOUR-PASSWORD]` con la contraseña que creaste

### 3. Configurar `.env`

Editá el archivo `.env` (en la raíz del proyecto):

```env
DATABASE_URL="postgresql://postgres.xxxxx:TU_PASSWORD@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### 4. Ejecutar migraciones

```bash
npm run db:migrate
# Nombre: "initial_schema"
```

### 5. Verificar en panel de Supabase

1. Ir a **Table Editor** en el panel de Supabase
2. Verificar que aparecen las tablas: `Guest`, `Group`, `Confirmation`

---

## 🚀 Configurar en Vercel (Producción)

### Cuando estés listo para deployar a Vercel:

1. Ir a tu proyecto en Vercel: [https://vercel.com](https://vercel.com)
2. Click en tu proyecto → **Settings** → **Environment Variables**
3. Agregar variable:
   - **Key:** `DATABASE_URL`
   - **Value:** Tu URL de Supabase (la misma de `.env.local`)
   - **Environments:** Marcar `Production`, `Preview`, `Development`
4. Click en **Save**

### Redeploy

```bash
# Hacer push a tu repo
git push origin main

# Vercel automáticamente hace redeploy con la nueva variable
```

---

## 🔍 Verificar que Todo Funciona

### Checklist:

```bash
# ✅ 1. Variables de entorno configuradas
cat .env # Debe tener DATABASE_URL real

# ✅ 2. Prisma puede generar cliente
npm run db:generate

# ✅ 3. Build pasa
npm run build

# ✅ 4. Desarrollo funciona
npm run dev

# ✅ 5. Probar API en otra terminal
curl http://localhost:3000/api/guest/CODIGO123
```

---

## 🛠️ Comandos Útiles

```bash
# Migraciones
npm run db:migrate         # Crear y aplicar migración
npm run db:migrate:deploy  # Solo aplicar migraciones (producción)
npm run db:push            # Push directo sin migración (solo desarrollo)

# Datos
npm run db:seed            # Poblar datos de prueba
npm run db:studio          # Abrir UI de Prisma para ver/editar datos

# Prisma
npm run db:generate        # Regenerar Prisma Client
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**PostgreSQL Local:**

```bash
# Verificar que PostgreSQL está corriendo
brew services list | grep postgresql

# Reiniciar si es necesario
brew services restart postgresql@16
```

**Supabase:**

- Verificar que la URL en `.env.local` es correcta
- Verificar que reemplazaste `[YOUR-PASSWORD]` con la contraseña real
- Verificar que tu IP no está bloqueada (Supabase permite todas las IPs por defecto)

### Error: "Database does not exist"

```bash
# Crear la base de datos
createdb wedding_invitation
```

### Error: "Role does not exist"

```bash
# Verificar tu usuario de PostgreSQL
whoami  # Este es tu usuario por defecto en PostgreSQL local
```

---

## 📊 Estado Esperado Final

Después de seguir esta guía:

- ✅ `.env` configurado con DATABASE_URL real (NO se commitea)
- ✅ Base de datos creada (local o Supabase)
- ✅ Tablas creadas por Prisma migrate
- ✅ Prisma Client generado
- ✅ Build exitoso
- ✅ API routes funcionando

---

## 🎯 Próximos Pasos

1. **Ahora:** Seguí los pasos de Opción A o B según lo que prefieras
2. **Después:** Probá crear invitados y hacer confirmaciones
3. **Finalmente:** Deploy a Vercel con Supabase en producción
