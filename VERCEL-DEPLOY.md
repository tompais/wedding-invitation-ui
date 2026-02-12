# 🚀 Configuración de Deploy - Vercel

## 📋 Flujo de Build y Migraciones

### ✅ Script de Build Configurado

```json
{
  "scripts": {
    "build": "prisma migrate deploy && prisma generate && next build"
  }
}
```

**Orden de ejecución en Vercel:**

1. **`prisma migrate deploy`** → Aplica migraciones pendientes a la base de datos
2. **`prisma generate`** → Genera Prisma Client con los tipos actualizados
3. **`next build`** → Compila la aplicación Next.js

---

## 🔄 Flujo Completo de Deploy

### Desarrollo Local

```bash
# 1. Hacer cambios al código
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Husky pre-commit ejecuta automáticamente:
# - lint-staged (ESLint + Prettier en archivos modificados)

# 3. Push a GitHub
git push origin main
```

### Vercel (Automático)

```
1. Vercel detecta push en GitHub
2. Ejecuta npm install
3. Ejecuta npm run build:
   ├─> prisma migrate deploy  ← Aplica migraciones nuevas
   ├─> prisma generate        ← Genera cliente Prisma
   └─> next build             ← Compila app
4. Deploy exitoso ✅
```

---

## ✅ Ventajas de Esta Configuración

### Migraciones Automáticas

- ✅ **Idempotente** - Prisma solo aplica migraciones pendientes
- ✅ **Seguro** - Si falla, cancela el deploy
- ✅ **Sin intervención manual** - Todo automático
- ✅ **Versionado** - Las migraciones están en Git

**Ejemplo de salida:**

```bash
1 migration found in prisma/migrations
No pending migrations to apply.  ← Si ya están aplicadas
```

### Sin Migraciones en Dev

```bash
npm run dev  # ← NO ejecuta migraciones (rápido)
```

**Desarrollo local:**

- Usás `npm run db:migrate` cuando hacés cambios al schema
- El servidor dev inicia inmediatamente

---

## 🛡️ Validaciones en el Pipeline

### Pre-commit (Local)

```
Husky → lint-staged → ESLint + Prettier
```

**Archivos validados:**

- `*.{js,jsx,ts,tsx}` → ESLint + Prettier
- `*.{json,css,md}` → Prettier

### Build (Vercel)

```
prisma migrate deploy → Migraciones
next build → TypeScript + Build
```

**Si falla:**

- ❌ Migración con error → Deploy cancelado
- ❌ Error de TypeScript → Deploy cancelado
- ❌ Error de build → Deploy cancelado

---

## 📊 Variables de Entorno en Vercel

### Configuración Necesaria

**Dashboard de Vercel → Settings → Environment Variables:**

| Variable       | Valor           | Environment        |
| -------------- | --------------- | ------------------ |
| `DATABASE_URL` | URL de Supabase | Production ✅      |
| `DATABASE_URL` | URL de Supabase | Preview (opcional) |

**Ejemplo:**

```
DATABASE_URL="postgresql://postgres.xxx:PASSWORD@db.yckzrkriuqhlumuaydsb.supabase.co:5432/postgres"
```

---

## 🔍 Troubleshooting

### Error: "Migration failed"

**Posibles causas:**

- Base de datos no accesible desde Vercel
- `DATABASE_URL` mal configurada
- Migración con errores de SQL

**Solución:**

```bash
# Verificar localmente
npm run db:migrate:deploy

# Ver logs de Vercel
# Vercel Dashboard → Deployments → [deploy] → Function Logs
```

### Error: "Prisma Client not found"

**Causa:** `prisma generate` falló en el build

**Solución:**

- Verificar que `postinstall` esté en scripts
- Verificar que `@prisma/client` esté en `dependencies` (no devDependencies)

---

## 📝 Scripts Disponibles

### Desarrollo

```bash
npm run dev              # Servidor dev (NO ejecuta migraciones)
npm run build            # Build local (ejecuta migraciones)
npm run start            # Servidor producción
```

### Base de Datos

```bash
npm run db:migrate       # Crear + aplicar migración (dev)
npm run db:migrate:deploy # Solo aplicar migraciones (prod)
npm run db:generate      # Solo generar Prisma Client
npm run db:studio        # UI de Prisma
```

### Calidad

```bash
npm run lint             # Ejecutar ESLint
npm run lint:fix         # Corregir con ESLint
npm run format           # Formatear con Prettier
npm run format:check     # Verificar formato
```

---

## 🎯 Checklist de Deploy

Antes de hacer deploy a Vercel:

- [ ] `DATABASE_URL` configurada en Vercel
- [ ] Migraciones commiteadas a Git
- [ ] Build local exitoso (`npm run build`)
- [ ] Tests pasando (si tenés)
- [ ] ESLint sin errores (`npm run lint`)
- [ ] Prettier formateado (`npm run format:check`)

---

## 🚀 Primera Deploy a Vercel

### Paso 1: Conectar Repositorio

1. Ir a [vercel.com](https://vercel.com)
2. Click en "Import Project"
3. Seleccionar tu repositorio de GitHub
4. Framework Preset: **Next.js** (detectado automáticamente)

### Paso 2: Configurar Variables de Entorno

1. En "Environment Variables":
   ```
   DATABASE_URL = postgresql://postgres.xxx:PASSWORD@...
   ```
2. Seleccionar environments: Production ✅

### Paso 3: Deploy

1. Click en "Deploy"
2. Vercel ejecuta `npm run build`:
   - ✅ Aplica migraciones
   - ✅ Genera Prisma Client
   - ✅ Compila Next.js
3. ✅ Deploy exitoso!

### Paso 4: Verificar

1. Abrir la URL de Vercel
2. Verificar en Supabase Table Editor que las tablas existen
3. Probar funcionalidad

---

## 📖 Documentación Relacionada

- [DATABASE-SETUP.md](./DATABASE-SETUP.md) - Configuración de Supabase
- [MIGRATION-WORKFLOW.md](./MIGRATION-WORKFLOW.md) - Flujo de migraciones
- [SCHEMA-IMPROVEMENTS.md](./SCHEMA-IMPROVEMENTS.md) - Mejoras del schema

---

## ✅ Resumen

**Flujo automático:**

```
git push → Vercel → Migraciones → Build → Deploy ✅
```

**Sin intervención manual:**

- ✅ Migraciones se aplican automáticamente
- ✅ Código validado por Husky antes de commit
- ✅ Build falla si hay errores (seguro)

**Tu única responsabilidad:**

- Escribir código
- Commitear cambios
- Push a GitHub
- ✨ Vercel hace el resto
