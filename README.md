# 💍 Wedding Invitation — Angie & Tomi

Invitación digital para la boda de Angie & Tomi (Julio 2026).
Desarrollada con Next.js 16 + Supabase. Flujo de confirmación RSVP grupal,
dos eventos (civil y fiesta), audiencia mobile vía WhatsApp.

---

## Stack

| Capa          | Tecnología                   |
| ------------- | ---------------------------- |
| Framework     | Next.js 16 (App Router)      |
| UI            | React 19 + TypeScript strict |
| Estilos       | Tailwind CSS 4 + CSS Modules |
| Animaciones   | Framer Motion + Lottie React |
| Base de datos | Supabase (PostgreSQL)        |
| Validación    | Zod + React Hook Form        |
| Calidad       | ESLint + Prettier + Husky    |

---

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Levantar servidor de desarrollo
npm run dev        # http://localhost:3000
```

---

## Comandos

```bash
# Desarrollo
npm run dev              # Servidor en :3000
npm run build            # Build de producción
npm run start            # Servidor de producción

# Calidad de código
npm run lint             # ESLint
npm run lint:fix          # ESLint con auto-fix
npm run format           # Prettier
npm run format:check     # Verificar formato

# Base de datos
npm run types            # Regenerar tipos TypeScript desde Supabase schema
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── actions/         # Server actions ("use server")
│   ├── api/             # Route handlers (endpoints externos)
│   │   ├── guests/      # GET /api/guests
│   │   └── confirmations/ # POST /api/confirmations
│   ├── layout.tsx
│   └── page.tsx         # Página principal (App Router)
├── components/          # Componentes React (colocated styles)
├── constants/           # Configuración (events, rsvp steps, theme)
├── hooks/               # Custom hooks
│   ├── useRSVPFlow.ts   # State machine del flujo RSVP
│   ├── useModal.ts
│   ├── useScrollAnimation.ts
│   └── useAudio.ts
├── lib/
│   ├── supabase.ts      # Singleton client (único punto de acceso a DB)
│   └── api.ts           # HTTP wrapper tipado
├── schemas/             # Schemas Zod (validación cliente + servidor)
└── types/               # TypeScript types
    ├── supabase.ts      # Auto-generado — no editar manualmente
    └── database.ts      # Tipos de dominio
```

---

## Colaboración IA

Este proyecto es desarrollado con dos colaboradores de IA:

| Rol      | Herramienta        | Responsabilidades                                     |
| -------- | ------------------ | ----------------------------------------------------- |
| Builder  | **Claude Code**    | Features, arquitectura, migraciones, agentes y skills |
| Reviewer | **GitHub Copilot** | Code reviews en PRs, GitHub Actions                   |

Ver [docs/AI-WORKFLOW.md](docs/AI-WORKFLOW.md) para el flujo completo, agentes disponibles, y convenciones de colaboración.

---

## Documentación

### Setup y configuración

| Doc                                                      | Descripción                                         |
| -------------------------------------------------------- | --------------------------------------------------- |
| [Configuración de base de datos](docs/DATABASE-SETUP.md) | Setup de Supabase, schema inicial, credenciales     |
| [Supabase CLI](docs/SUPABASE-CLI.md)                     | Migraciones, generación de tipos, comandos útiles   |
| [Tipos TypeScript de Supabase](docs/SUPABASE-TYPES.md)   | Cómo funciona el sistema de tipos generado          |
| [Deploy en Vercel](docs/VERCEL-DEPLOY.md)                | Configuración de deployment y variables de entorno  |
| [Setup de Claude Code](docs/CLAUDE-CODE-SETUP.md)        | Plugins, agentes y skills para colaboradores nuevos |

### Workflow y arquitectura

| Doc                                                   | Descripción                                                |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| [AI Workflow](docs/AI-WORKFLOW.md)                    | Colaboración Claude Code + Copilot, agentes, skills, hooks |
| [Workflow de migraciones](docs/MIGRATION-WORKFLOW.md) | Paso a paso para crear y aplicar migraciones de DB         |

### Historial / Referencia

| Doc                                                             | Descripción                                     |
| --------------------------------------------------------------- | ----------------------------------------------- |
| [Guía de migración Prisma → Supabase](docs/MIGRATION-GUIDE.md)  | Notas del proceso de migración del ORM original |
| [Migración Tailwind fase 3](docs/TAILWIND-MIGRATION-PHASE-3.md) | Referencia de la actualización a Tailwind CSS 4 |

---

## Deploy

1. Push a una rama (nunca directo a `master`)
2. Abrir PR — Copilot realiza el code review automáticamente
3. Merge a `master` → deploy automático en Vercel

Ver [docs/VERCEL-DEPLOY.md](docs/VERCEL-DEPLOY.md) para configuración detallada.

---

Proyecto privado — Angie & Tomi © 2026
