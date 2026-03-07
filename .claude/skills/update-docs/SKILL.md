---
name: update-docs
description: >
  Sincroniza README.md y la carpeta docs/ con el estado actual del proyecto.
  Usalo cuando se agreguen nuevas docs, cambie la estructura del proyecto, se agreguen
  agentes o skills, o cuando el README esté desactualizado. También parte del Definition
  of Done de cualquier sesión que modifique la arquitectura o el workflow.
user-invocable: true
---

## Cuándo usar este skill

- Al agregar un nuevo archivo en `docs/`
- Al agregar un nuevo agente en `.claude/agents/`
- Al agregar o modificar un skill en `.claude/skills/`
- Al cambiar la estructura de directorios del proyecto
- Al final de una sesión que modificó convenciones, workflow, o arquitectura
- Cuando el README referencia un doc que no existe (link roto)

---

## Paso 1 — Auditar el estado actual

Ejecutar en paralelo:

1. Listar todos los archivos en `docs/` (`Glob: docs/**/*.md`)
2. Listar todos los agentes en `.claude/agents/` (`Glob: .claude/agents/*.md`)
3. Listar todos los skills en `.claude/skills/` (`Glob: .claude/skills/*/SKILL.md`)
4. Leer `README.md` completo
5. Leer `docs/CLAUDE-CODE-SETUP.md` (tabla de assets del repo)

---

## Paso 2 — Detectar discrepancias

### README.md

- [ ] ¿Todos los archivos de `docs/` están referenciados en el README?
- [ ] ¿Todos los links del README apuntan a archivos que existen? (No hay links rotos)
- [ ] ¿Los links tienen texto descriptivo? (No "docs" genérico, sino el nombre real)
- [ ] ¿La sección de estructura del proyecto refleja los directorios actuales de `src/`?
- [ ] ¿La sección de instalación menciona `.env` (no `.env.local`)?

### docs/CLAUDE-CODE-SETUP.md

- [ ] ¿La tabla de assets lista todos los agentes actuales?
- [ ] ¿La tabla de assets lista todos los skills invocables?
- [ ] ¿Los hooks descriptos coinciden con los de `settings.json`?

### docs/AI-WORKFLOW.md

- [ ] ¿Los agentes listados coinciden con los archivos en `.claude/agents/`?
- [ ] ¿Los skills listados coinciden con los archivos en `.claude/skills/`?
- [ ] ¿Los GitHub Actions listados coinciden con los archivos en `.github/workflows/`?

---

## Paso 3 — Aplicar actualizaciones

### Actualizar README.md

El README funciona como **índice** — no como documentación técnica. Reglas:

- Cada doc en `docs/` tiene una línea: `[NOMBRE-DESCRIPTIVO](docs/ARCHIVO.md) — descripción de una línea`
- Descripción máximo una línea — el detalle vive en el doc
- Los links tienen texto descriptivo del contenido (no "ver doc" ni "docs")
- La sección **Estructura del proyecto** refleja la estructura real de `src/`

### Actualizar docs/CLAUDE-CODE-SETUP.md

Actualizar la tabla "Lo que ya viene con el repo":

- Agregar nuevos agentes
- Agregar nuevos skills invocables
- Actualizar descripción de hooks si cambiaron

### Actualizar docs/AI-WORKFLOW.md

- Agregar nuevos agentes con su descripción y cuándo disparan
- Agregar nuevos skills con su descripción
- Actualizar la tabla de GitHub Actions si hay nuevos workflows

---

## Paso 4 — Verificar links

Después de actualizar, confirmar que todos los links en README.md apuntan a archivos que existen:

```bash
# Verificar que no hay refs rotas
grep -o '\[.*\](docs/[^)]*)'  README.md
```

Para cada link encontrado, verificar que el archivo existe en `docs/`.

---

## Formato del reporte

```
ACTUALIZADO — [archivo]: [qué se cambió]
CREADO      — [archivo]: [qué se agregó]
SIN CAMBIOS — [archivo]: [estaba al día]
PENDIENTE   — [item]: [requiere acción manual o decisión del usuario]
```

Si todo estaba sincronizado:

```
README y docs sincronizados. No se detectaron discrepancias.
```
