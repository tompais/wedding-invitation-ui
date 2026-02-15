# 🚀 Configuración de Deploy - Vercel

## 📋 Flujo de Build Simplificado

### ✅ Script de Build Configurado

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

**Con Supabase, el build es mucho más simple:**

1. **`next build`** → Compila la aplicación Next.js

**No se necesita:**

- ❌ Aplicar migraciones durante el build
- ❌ Generar cliente de Prisma
- ❌ Conexión a base de datos durante el build

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
   └─> next build             ← Compila app (¡sin migraciones!)
4. Deploy exitoso ✅
```

---

## ✅ Ventajas de Esta Configuración

### Sin Problemas de Conexión

- ✅ **No requiere conexión a DB durante el build** - Supabase se conecta solo en runtime
- ✅ **Sin IPv6** - Usa la API HTTP de Supabase (compatible con IPv4/IPv6)
- ✅ **Sin timeouts** - No hay operaciones de base de datos bloqueantes
- ✅ **Builds más rápidos** - Sin migraciones ni generación de cliente

### Desarrollo Local

```bash
npm run dev  # ← Inicia inmediatamente, sin migraciones
```

**Desarrollo local:**

- El cliente de Supabase se inicializa en runtime
- No se necesita generar código antes de desarrollar
- Cambios instantáneos con hot-reload

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
next build → TypeScript + Build
```

**Si falla:**

- ❌ Error de TypeScript → Deploy cancelado
- ❌ Error de build → Deploy cancelado

---

## 📊 Variables de Entorno en Vercel

### Configuración Necesaria

**Dashboard de Vercel → Settings → Environment Variables:**

| Variable                        | Valor                       | Environment   |
| ------------------------------- | --------------------------- | ------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL de tu proyecto Supabase | Production ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase        | Production ✅ |

**Ejemplo:**

```
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Integración Automática con Supabase

Si integraste Vercel con Supabase desde el dashboard, estas variables ya deberían estar configuradas automáticamente.

---

## 🔍 Troubleshooting

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Causa:** Variables de entorno no configuradas en Vercel

**Solución:**

1. Ir a Vercel Dashboard → Settings → Environment Variables
2. Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy el proyecto

### Error: "Invalid API key"

**Causa:** Anon key incorrecta

**Solución:**

- Verificar en Supabase Dashboard → Settings → API
- Copiar la `anon` key correctamente
- Actualizar en Vercel Environment Variables

---

## 📝 Scripts Disponibles

### Desarrollo

```bash
npm run dev              # Servidor dev
npm run build            # Build local
npm run start            # Servidor producción
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

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada en Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada en Vercel
- [ ] Schema de base de datos aplicado en Supabase (SQL Editor)
- [ ] Build local exitoso (`npm run build`)
- [ ] ESLint sin errores (`npm run lint`)
- [ ] Prettier formateado (`npm run format:check`)

---

## 🚀 Primera Deploy a Vercel

### Paso 1: Conectar Repositorio

1. Ir a [vercel.com](https://vercel.com)
2. Click en "Import Project"
3. Seleccionar tu repositorio de GitHub
4. Framework Preset: **Next.js** (detectado automáticamente)

### Paso 2: Integrar con Supabase (Opcional pero Recomendado)

1. En la página de import, buscar "Integrations"
2. Click en "Add" junto a Supabase
3. Seleccionar tu proyecto de Supabase
4. Las variables de entorno se configurarán automáticamente

### Paso 3: Configurar Variables de Entorno (si no usaste integración)

1. En "Environment Variables":
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJI...
   ```
2. Seleccionar environments: Production ✅

### Paso 4: Deploy

1. Click en "Deploy"
2. Vercel ejecuta `npm run build`:
   - ✅ Compila Next.js
3. ✅ Deploy exitoso!

### Paso 5: Verificar

1. Abrir la URL de Vercel
2. Verificar en Supabase Table Editor que las tablas existen
3. Probar funcionalidad de RSVP

---

## 📖 Documentación Relacionada

- [DATABASE-SETUP.md](DATABASE-SETUP.md) - Configuración de Supabase
- [README.md](../README.md) - Información general del proyecto

---

## ✅ Resumen

**Flujo automático:**

```
git push → Vercel → Build → Deploy ✅
```

**Sin intervención manual:**

- ✅ Código validado por Husky antes de commit
- ✅ Build falla si hay errores (seguro)
- ✅ No requiere conexión a DB durante build

**Tu única responsabilidad:**

- Escribir código
- Commitear cambios
- Push a GitHub
- ✨ Vercel hace el resto

**Mejoras respecto a Prisma:**

- ✅ Builds más rápidos (sin migraciones)
- ✅ Sin problemas de IPv6
- ✅ Integración nativa con Vercel
- ✅ Variables de entorno configuradas automáticamente
