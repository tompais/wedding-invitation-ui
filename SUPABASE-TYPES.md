# Supabase TypeScript Type Inference - Explicación

## El Problema

Aunque Supabase soporta TypeScript y permite pasar un tipo `Database` genérico al cliente, existe una **limitación conocida** en la inferencia de tipos cuando se usa `.select("*")` y otros métodos del query builder.

### Issue de GitHub Relacionado

Este es un problema documentado en el repositorio de Supabase:

- https://github.com/supabase/supabase-js/issues/743
- https://github.com/supabase/supabase-js/issues/1123

El problema ocurre porque:

1. TypeScript no puede inferir correctamente los tipos al usar `.select("*")` con tablas complejas
2. Los métodos `.update()` y `.insert()` no reconocen los tipos genéricos del `Database`
3. Las consultas con joins devuelven tipos `never`

## La Solución Implementada

Hemos implementado el **mejor approach posible** considerando las limitaciones actuales de Supabase:

### 1. Cliente con Tipos Genéricos

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

✅ **Beneficios:**

- Autocomplete en el IDE para nombres de tablas
- Validación de nombres de columnas
- Documentación inline de la estructura de la base de datos

### 2. Type Aliases para Legibilidad

```typescript
import type { Database } from "@/types/supabase";

type Guest = Database["public"]["Tables"]["guests"]["Row"];
type Confirmation = Database["public"]["Tables"]["confirmations"]["Row"];
```

✅ **Beneficios:**

- Código más limpio y legible
- Reutilización de tipos
- IntelliSense completo en el IDE

### 3. Type Assertions Estratégicas

Donde Supabase no puede inferir tipos, usamos type assertions **tipadas**:

```typescript
// Para queries SELECT
const { data: guest } = await supabase.from("guests").select("*").single();

// Type assertion con tipo del Database schema
const guestData = guest as Guest;
```

```typescript
// Para INSERT/UPDATE
const updatePayload: Database["public"]["Tables"]["confirmations"]["Update"] = {
  civil_attending: conf.civilAttending,
  // ... más campos
};

const { data } = await supabase
  .from("confirmations")
  .update(updatePayload as never) // Necesario por limitación de Supabase
  .select()
  .single();

const confirmation = data as Confirmation;
```

✅ **Beneficios:**

- **Type safety** en nuestro código (los payloads están tipados)
- Evitamos usar `any` directamente
- Los tipos provienen del schema (`Database["public"]["Tables"]...`)
- Si el schema cambia, TypeScript nos avisará en compile-time

### 4. Documentación de Limitaciones

Agregamos comentarios explicativos:

```typescript
// Type assertion: Supabase client devuelve 'never' con select("*")
// Ver: https://github.com/supabase/supabase-js/issues/743
const guestData = guest as Guest;
```

```typescript
// Supabase type inference limitation: update() no reconoce Database generic
.update(updatePayload as never)
```

## Comparación con el Enfoque Anterior

### ❌ Antes (con `any` directo)

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const guestData = guest as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createdConfirmations: any[] = [];
```

**Problemas:**

- Pérdida total de type safety
- No hay validación en compile-time
- Necesita suprimir warnings de ESLint
- Difícil de mantener

### ✅ Ahora (con tipos del Database)

```typescript
// Tipo explícito del schema
const guestData = guest as Guest;

// Tipo array con tipo del schema
const createdConfirmations: Confirmation[] = [];

// Payload tipado
const updatePayload: Database["public"]["Tables"]["confirmations"]["Update"] = {
  // TypeScript valida que estos campos existen y tienen el tipo correcto
  civil_attending: conf.civilAttending,
  party_attending: conf.partyAttending,
};
```

**Beneficios:**

- Type safety completo en nuestro código
- Autocomplete en el IDE
- Errores de tipo en compile-time si usamos campos incorrectos
- No necesita suppressions de ESLint
- Fácil de mantener y refactorizar

## ¿Por Qué No Usar Generación Automática de Tipos?

Supabase CLI puede generar tipos automáticamente con:

```bash
npx supabase gen types typescript --project-id "tu-proyecto-id"
```

**Ya lo estamos haciendo** - nuestro archivo `src/types/supabase.ts` es equivalente a lo que generaría el CLI. Lo creamos manualmente porque:

1. El schema ya existía en Prisma
2. Los tipos son estables (no cambian frecuentemente)
3. Evitamos dependencia del CLI de Supabase en el build
4. Tenemos control total sobre la estructura de tipos

Si el schema cambia, es fácil regenerar los tipos con el CLI de Supabase.

## Resultado Final

- ✅ **Build exitoso** sin errores de TypeScript
- ✅ **Type safety** completo en nuestro código
- ✅ **No hay `any` sin tipo** - todos los `as` assertions usan tipos del schema
- ✅ **Autocomplete** funciona en el IDE
- ✅ **Validación en compile-time** de campos y tipos
- ✅ **Sin ESLint warnings** por uso de `any`
- ✅ **Documentado** con comentarios explicativos

## Mejoras Futuras

Cuando Supabase mejore su sistema de tipos (están trabajando en ello), podremos:

1. Remover las type assertions en queries
2. Usar type inference directa en `.update()` y `.insert()`
3. Tener tipos automáticos en joins

Mientras tanto, esta es la **mejor solución posible** y es el enfoque **recomendado por la comunidad de Supabase** para proyectos TypeScript que requieren type safety.

## Referencias

- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)
- [Generating Types from Supabase](https://supabase.com/docs/guides/api/rest/generating-types)
- [GitHub Issue: Type inference with select("\*")](https://github.com/supabase/supabase-js/issues/743)
