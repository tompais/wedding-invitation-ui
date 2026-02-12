# 🔧 Guía de Supabase CLI y Generación de Tipos

## 📋 Instalación de Supabase CLI

```bash
# Instalar Supabase CLI globalmente
npm install -g supabase

# Verificar instalación
supabase --version
```

## 🔑 Autenticación y Configuración Inicial

### 1. Login en Supabase

```bash
# Autenticarte con tu cuenta de Supabase
supabase login
```

Esto abrirá una ventana del navegador para autenticarte.

### 2. Link al Proyecto Existente

```bash
# En la raíz del proyecto
supabase link --project-ref yckzrkriuqhlumuaydsb
```

Cuando te pida la contraseña de la base de datos, usa la contraseña que configuraste al crear el proyecto en Supabase.

## 🗄️ Gestión de Migraciones

### Aplicar Migración Inicial

La migración inicial ya está creada en `supabase/migrations/20260212_initial_schema.sql`. Para aplicarla:

**Opción A: Desde SQL Editor en Supabase Dashboard**

1. Ir a https://supabase.com/dashboard/project/yckzrkriuqhlumuaydsb/sql
2. Copiar el contenido de `supabase/migrations/20260212_initial_schema.sql`
3. Pegar y ejecutar

**Opción B: Con Supabase CLI (después de link)**

```bash
# Aplicar todas las migraciones pendientes
supabase db push
```

### Reset de Base de Datos (Desarrollo)

Si necesitas limpiar todo y empezar de cero:

```bash
# ADVERTENCIA: Esto eliminará todos los datos
supabase db reset
```

Esto:

1. Elimina todas las tablas
2. Vuelve a aplicar todas las migraciones desde `supabase/migrations/`
3. Ejecuta el seed si existe

### Crear Nueva Migración

Cuando hagas cambios al schema:

```bash
# Opción 1: Crear migración vacía
supabase migration new nombre_de_la_migracion

# Opción 2: Generar diff automático (requiere supabase local)
supabase db diff -f nombre_de_la_migracion
```

## 🎯 Generación Automática de Tipos TypeScript

### Generar Tipos desde el Schema de Supabase

```bash
# Generar tipos TypeScript basados en el schema actual de tu base de datos
npx supabase gen types typescript --project-id yckzrkriuqhlumuaydsb --schema public > src/types/supabase.ts
```

Esto:

- Se conecta a tu proyecto de Supabase
- Lee el schema actual de la base de datos
- Genera tipos TypeScript automáticamente
- Sobrescribe `src/types/supabase.ts`

### ¿Cuándo Regenerar los Tipos?

Deberías regenerar los tipos cada vez que:

- Agregues o elimines tablas
- Cambies nombres de columnas
- Modifiques tipos de datos
- Agregues o quites constraints

### Tipos Actuales vs Generados

Los tipos en `src/types/supabase.ts` fueron creados **manualmente** basándose en el schema de Prisma. Son **equivalentes** a lo que generaría el CLI de Supabase.

**Ventajas de tipos manuales:**

- No requieren CLI instalado
- No requieren autenticación
- Versionados con el código

**Ventajas de generar con CLI:**

- Siempre sincronizado con la base de datos
- Detecta cambios automáticamente
- Menos propenso a errores

## 🔄 Workflow Recomendado

### Para Desarrollo Local

1. **Primera vez:**

   ```bash
   supabase login
   supabase link --project-ref yckzrkriuqhlumuaydsb
   ```

2. **Aplicar schema inicial:**

   ```bash
   # Opción A: Desde SQL Editor (más simple)
   # Copiar/pegar supabase/migrations/20260212_initial_schema.sql

   # Opción B: Con CLI
   supabase db push
   ```

3. **Generar tipos:**

   ```bash
   npx supabase gen types typescript --project-id yckzrkriuqhlumuaydsb > src/types/supabase.ts
   ```

4. **Desarrollar:**
   ```bash
   npm run dev
   ```

### Para Nuevas Migraciones

1. **Crear migración:**

   ```bash
   supabase migration new add_nueva_tabla
   ```

2. **Editar el archivo SQL** en `supabase/migrations/`

3. **Aplicar migración:**

   ```bash
   supabase db push
   ```

4. **Regenerar tipos:**

   ```bash
   npx supabase gen types typescript --project-id yckzrkriuqhlumuaydsb > src/types/supabase.ts
   ```

5. **Commitear:**
   ```bash
   git add supabase/migrations/ src/types/supabase.ts
   git commit -m "feat: add nueva_tabla"
   ```

## 📊 Estado Actual del Proyecto

### ✅ Lo que YA está hecho:

- Migración inicial creada en `supabase/migrations/20260212_initial_schema.sql`
- Tipos TypeScript definidos en `src/types/supabase.ts`
- Cliente Supabase configurado con tipos en `src/lib/supabase.ts`

### 📝 Lo que necesitas hacer:

1. **Aplicar la migración inicial** (una sola vez):
   - Opción A: SQL Editor en Supabase Dashboard
   - Opción B: `supabase login` → `supabase link` → `supabase db push`

2. **(Opcional) Regenerar tipos con CLI:**
   ```bash
   npx supabase gen types typescript --project-id yckzrkriuqhlumuaydsb > src/types/supabase.ts
   ```
   Esto debería generar tipos idénticos a los actuales.

## 🔗 Enlaces Útiles

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
- [Generating Types](https://supabase.com/docs/guides/api/rest/generating-types)
- [Local Development](https://supabase.com/docs/guides/local-development)

## ⚠️ Notas Importantes

1. **No commitear `.env.local`** - Contiene credenciales reales
2. **Las migraciones se ejecutan en orden** - Los nombres de archivo importan
3. **Regenerar tipos después de cada migración** - Mantiene sincronía
4. **Usar Supabase Dashboard** es más simple para la migración inicial
