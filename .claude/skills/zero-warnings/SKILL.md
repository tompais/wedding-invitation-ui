---
name: zero-warnings
description: >
  Escanea el proyecto (Next.js 16 + React + TypeScript) en busca de warnings de
  ESLint, Prettier, y el IDE (SonarQube/WebStorm via getDiagnostics) y los corrige
  automáticamente. Úsalo cuando el usuario pida "revisar warnings", "limpiar el proyecto",
  "0 warnings", "chequear SonarQube", "fix warnings", o al completar una sesión de cambios.
  También invocarlo proactivamente al terminar una tarea importante de código que haya
  tocado varios archivos. El objetivo es siempre dejar el proyecto en estado zero-warnings.
user-invocable: true
---

## Cuándo usar este skill

- Explícito: usuario pide revisar, limpiar, o fixear warnings del IDE o del linter
- Proactivo: después de cambios que tocaron múltiples archivos en una sesión
- Pre-commit/pre-PR: como último paso del Definition of Done

---

## Paso 1 — Determinar el alcance

Ejecutá `git status --short` para detectar el contexto:

- **Si hay archivos modificados sin commitear**: el alcance son esos archivos (staged + unstaged). Obtené la lista con:

  ```bash
  git diff --name-only && git diff --cached --name-only
  ```

  Filtrá solo archivos `.ts` y `.tsx` — los otros no generan warnings relevantes.

- **Si el árbol está limpio**: el alcance es todo el proyecto. El IDE diagnostics, lint y format check
  aplican globalmente.

---

## Paso 2 — Recolectar warnings de las tres fuentes

Ejecutá estas tres acciones **en paralelo** (no secuencialmente):

### A) IDE / SonarQube / WebStorm

Usá la herramienta `mcp__ide__getDiagnostics`. Filtrá solo severidad `Warning` (ignorá `Info` a menos
que el usuario pida explícitamente incluirlos).

### B) ESLint

```bash
npm run lint 2>&1
```

Anotá los archivos afectados y si el error es auto-fixable (la mayoría lo son con `--fix`).

### C) Prettier

```bash
npm run format:check 2>&1
```

Anotá los archivos con problemas de formato.

---

## Paso 3 — Aplicar fixes automáticamente

### Prettier (siempre auto-fixable)

Si hay archivos con problemas de formato:

```bash
npm run format
```

### ESLint (auto-fix primero)

Si hay warnings de ESLint:

```bash
npm run lint:fix
```

Luego re-ejecutá `npm run lint` para identificar los que quedaron sin resolver (requieren edición manual).

### IDE / SonarQube (requieren edición de código)

Para cada warning del IDE, aplicá el fix correspondiente. Patrones comunes en este proyecto:

| Warning                                        | Fix                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "Mark the props of the component as read-only" | Envolver el tipo de props en `Readonly<>`                                                                    |
| "Referenced UMD global variable"               | Importar el tipo directamente desde `"react"` (ej: `MouseEvent`, `RefObject`) en lugar de `React.MouseEvent` |
| "'X' is defined but never used"                | Eliminar la variable/import, o prefijar con `_` si es intencional                                            |
| "Cognitive complexity too high"                | Extraer lógica a funciones auxiliares pequeñas                                                               |
| "Unexpected any"                               | Reemplazar `any` con el tipo correcto o documentar la excepción                                              |

Editá el archivo mínimamente — solo lo necesario para eliminar el warning sin cambiar el comportamiento.

---

## Paso 4 — Verificar

Después de todos los fixes, confirmá que quedó limpio:

```bash
npm run lint && npm run format:check
```

Y volvé a ejecutar `mcp__ide__getDiagnostics` para confirmar que el IDE no reporta más warnings.

Si quedaron warnings que no pudiste resolver automáticamente, reportalos claramente al usuario
con el archivo, línea, mensaje, y por qué no se pudo auto-resolver.

---

## Paso 5 — Reportar

Usá este formato conciso:

```
✅ Zero warnings — el proyecto está limpio.

Fixes aplicados:
- Prettier: X archivo(s) formateados
- ESLint: X warning(s) corregidos (npm run lint:fix)
- IDE/SonarQube: X warning(s) corregidos manualmente
  - SubmitButton.tsx: Readonly<Props> + MouseEvent importado desde "react"
  - [otros...]
```

Si quedaron warnings sin resolver:

```
⚠️ Quedan N warning(s) sin resolver:
- archivo:línea — mensaje — [motivo por el que no se auto-resolvió]
```

---

## Notas importantes

- `src/types/supabase.ts` está excluido de ESLint (archivo auto-generado) — ignorar warnings ahí
- No modificar archivos de configuración (`.eslintrc`, `tailwind.config.ts`) para silenciar warnings —
  solo corregir el código fuente
- Si un warning requiere un cambio de arquitectura grande, reportarlo como pendiente en lugar de
  hacer un refactor invasivo no solicitado
