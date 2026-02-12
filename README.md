# 💍 Wedding Invitation - Angie & Tomi

Invitación digital para la boda de Angie & Tomi (Julio 2026).

## 🚀 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + CSS Modules
- **Animaciones:** Framer Motion + Lottie React
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Validación:** Zod + React Hook Form
- **Calidad:** ESLint + Prettier + Husky

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tu DATABASE_URL
# (El archivo ya existe, solo necesitás cambiar la URL)
```

## 🗄️ Configuración de Base de Datos

**Ver guía completa:** [DATABASE-SETUP.md](./DATABASE-SETUP.md)

Opciones:

- **PostgreSQL Local** (desarrollo)
- **Supabase** (desarrollo/producción)

```bash
# Ejecutar migraciones
npm run db:migrate
```

**NOTA:** La base de datos está vacía (solo estructura). Los datos de invitados se agregarán mediante migraciones cuando estén formalizados.

## 🛠️ Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Servidor de producción
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📝 Scripts Disponibles

### Desarrollo

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción

### Calidad de Código

- `npm run lint` - Ejecutar ESLint
- `npm run lint:fix` - Corregir errores de ESLint
- `npm run format` - Formatear código con Prettier
- `npm run format:check` - Verificar formato

### Base de Datos (Prisma)

- `npm run db:generate` - Generar Prisma Client
- `npm run db:migrate` - Crear y aplicar migración (desarrollo)
- `npm run db:migrate:deploy` - Aplicar migraciones (producción)
- `npm run db:push` - Push schema sin migración
- `npm run db:studio` - Abrir Prisma Studio (UI para ver/editar datos)

## 📚 Documentación

- [DATABASE-SETUP.md](./DATABASE-SETUP.md) - Guía de configuración de base de datos
- [MIGRATION-WORKFLOW.md](./MIGRATION-WORKFLOW.md) - Flujo de trabajo con migraciones
- [SCHEMA-IMPROVEMENTS.md](./SCHEMA-IMPROVEMENTS.md) - Mejoras aplicadas al schema
- [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) - Configuración de deploy y migraciones automáticas
- [ESLINT-PRETTIER-SETUP.md](./ESLINT-PRETTIER-SETUP.md) - Configuración de linting y formateo

## 🚀 Deploy en Vercel

1. Push a tu repositorio de Git
2. Importar proyecto en [Vercel](https://vercel.com)
3. Configurar `DATABASE_URL` en Environment Variables
4. Deploy automático ✨

Ver [DATABASE-SETUP.md](./DATABASE-SETUP.md#-configurar-en-vercel-producción) para más detalles.

## 🎨 Estructura del Proyecto

```
wedding-invitation-ui/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   ├── hooks/            # Custom hooks
│   ├── schemas/          # Schemas de validación (Zod)
│   ├── constants/        # Constantes del proyecto
│   └── lib/              # Utilidades (Prisma client)
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   └── seed.ts           # Datos de prueba
└── public/               # Assets estáticos
```

## 📄 Licencia

Proyecto privado - Angie & Tomi © 2026
