---
name: code-quality
description: >
  Auditoría de calidad de código para este proyecto (Next.js 16 + React + Supabase + TypeScript).
  Úsala SIEMPRE después de escribir o modificar código — no esperes a que el usuario la pida.
  Detecta violaciones de SOLID, DRY, KISS, YAGNI, Clean Architecture, y patrones específicos
  del stack, y reporta issues con severidad [ALTO / MEDIO / BAJO].
user-invocable: true
---

## Cuándo ejecutar esta auditoría

Ejecutá esta auditoría **automáticamente** al finalizar cualquier tarea que modifique código:
nuevas funciones, refactors, bug fixes, o cambios en componentes. No la ejecutes para cambios
de solo configuración, estilos puros o migraciones de DB.

Si el usuario invoca `/code-quality` directamente, auditá los archivos que él mencione, o los
que hayas modificado más recientemente en la sesión.

---

## Cómo auditar

### 1. Identificar el alcance

Lee los archivos modificados en la tarea. Si no está claro cuáles cambiaron, usá `git diff` para
obtener la lista de archivos modificados.

### 2. Revisar contra principios

Para cada archivo relevante, verificá las siguientes categorías:

#### SOLID

- **SRP** (Single Responsibility): ¿Cada módulo, componente, hook o función hace una sola cosa?
  Un hook que mezcla lógica de negocio con fetching y presentación viola SRP. Un componente que
  contiene lógica de dominio viola SRP.
- **OCP** (Open/Closed): ¿Se puede extender el comportamiento sin modificar código existente?
  Ojo con condiciones `if/else` que crecen cada vez que se agrega un tipo nuevo.
- **DIP** (Dependency Inversion): ¿Las dependencias se inyectan como parámetros? Las use cases /
  servicios no deben instanciar Supabase directamente — siempre recibir el cliente como argumento.

#### DRY, KISS, YAGNI

- **DRY**: ¿Hay lógica duplicada en 3+ lugares que merezca una abstracción?
- **KISS**: ¿Hay complejidad innecesaria — abstracciones prematuras, patrones sobredimensionados
  para el problema? Tres líneas similares son mejores que una abstracción prematura.
- **YAGNI**: ¿Hay código que anticipa requisitos que no existen? Si no hay un caso de uso
  concreto hoy, no debería estar.

#### Clean Architecture (capas del proyecto)

```
API Routes (app/api/)       → solo: validar input (Zod), llamar servicio, devolver respuesta
Server Actions (app/actions/) → solo: mutaciones disparadas por formularios
Hooks (hooks/)              → lógica de orquestación, NO lógica de dominio pura
Componentes (components/)   → solo presentación, sin lógica de negocio
lib/                        → infraestructura compartida (Supabase singleton, HTTP wrapper)
```

Señalá cualquier lógica de negocio que esté en el lugar equivocado.

#### Patrones específicos del stack

- **TypeScript**: ¿Se usa `any`? ¿Hay `as unknown as X` sin comentario explicativo?
  ¿Los tipos en los boundaries (API, formularios, DB) usan Zod + tipos inferidos?
- **React / Next.js**:
  - Client Components solo si hay estado, eventos o animaciones (`useState`, `onClick`, etc.)
  - `useEffect` para sincronizar con sistemas externos, no para ajustar estado propio
    (el patrón `if (prev !== next) { set() }` durante render es preferible para estado derivado)
  - Sin `style={{}}` inline — usar Tailwind o CSS Modules
- **Supabase**: ¿Se crea un cliente Supabase fuera de `lib/supabase.ts`? Es un error.
- **Queries DB**:
  - ¿Hay queries secuenciales que podrían correr en paralelo con `Promise.all`?
  - ¿Se podría usar un nested select de Supabase para evitar N+1 roundtrips?
- **Validación**: ¿Hay inputs de usuario o datos externos que no pasan por Zod antes de usarse?

---

## Formato del reporte

Reportá solo issues reales — no busques problemas donde no los hay. Si el código está bien, decilo
brevemente ("Sin issues de calidad detectados en estos archivos."). No hagas el reporte más largo
del necesario.

Para cada issue encontrado, usá este formato:

```
[ALTO] <archivo>:<línea> — <descripción del problema>
  → Sugerencia: <cómo resolverlo en 1-2 líneas>

[MEDIO] <archivo>:<línea> — <descripción del problema>
  → Sugerencia: <cómo resolverlo en 1-2 líneas>

[BAJO] <archivo>:<línea> — <descripción del problema>
  → Sugerencia: <cómo resolverlo en 1-2 líneas>
```

**Criterio de severidad:**

| Nivel | Cuándo usarlo                                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| ALTO  | Viola Clean Architecture, introduce `any` sin justificación, crea acoplamiento directo a infraestructura en lógica de dominio, duplica lógica crítica |
| MEDIO | Viola SRP de forma notoria, función con demasiadas responsabilidades, lógica de presentación en hooks, YAGNI evidente                                 |
| BAJO  | Oportunidad de simplificación (KISS), nombre poco descriptivo, comentario innecesario, abstracción prematura menor                                    |

Si hay 0 issues, un mensaje breve alcanza. Si hay muchos, priorizá los ALTO y agrupá los BAJO
en una línea al final si son del mismo tipo.

---

## Ejemplos

**Issue ALTO:**

```
[ALTO] src/app/api/guests/route.ts:45 — Lógica de mapeo de guests anidada directamente en
  el route handler, mezclando responsabilidades de presentación con infraestructura.
  → Sugerencia: Extraer la función de mapeo a src/application/guestMapper.ts e importarla.
```

**Issue MEDIO:**

```
[MEDIO] src/components/RSVP/RSVP.tsx:820 — getStatusLabel() definida dentro del render
  con IIFE (()=>{})(). Dificulta la lectura y no puede reutilizarse.
  → Sugerencia: Moverla afuera del componente como función pura al nivel del módulo.
```

**Sin issues:**

```
Sin issues de calidad detectados. El código sigue los principios del proyecto.
```
