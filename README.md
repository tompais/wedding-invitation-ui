# 💍 Wedding Invitation - Angie & Tomi

Invitación digital para la boda de Angie & Tomi (Julio 2026).

## 🚀 Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + CSS Modules
- **Animaciones:** Framer Motion + Lottie React
- **Base de Datos:** Supabase (PostgreSQL)
- **Validación:** Zod + React Hook Form
- **Calidad:** ESLint + Prettier + Husky

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Copiar .env.example a .env.local y configurar con tus credenciales de Supabase
cp .env.example .env.local
# Editar .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 🗄️ Configuración de Base de Datos

**Ver guía completa:** [docs](docs/DATABASE-SETUP.md)

**Configuración con Supabase:**

1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener las credenciales de API (URL y anon key)
3. Configurar `.env.local` con las credenciales
4. Aplicar el schema SQL en Supabase SQL Editor

```bash
# Verificar conexión
npm run dev
```

**NOTA:** La base de datos está vacía (solo estructura). Los datos de invitados se agregarán mediante SQL cuando estén formalizados.

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

## 📚 Documentación

- [docs](docs/DATABASE-SETUP.md) - Guía de configuración de Supabase
- [docs](docs/SUPABASE-CLI.md) - Guía de Supabase CLI, migraciones y generación de tipos
- [docs](docs/SUPABASE-TYPES.md) - Explicación del sistema de tipos TypeScript
- [docs](docs/MIGRATION-GUIDE.md) - Guía completa de migración de Prisma a Supabase
- [docs](docs/VERCEL-DEPLOY.md) - Configuración de deploy
- [docs](docs/ESLINT-PRETTIER-SETUP.md) - Configuración de linting y formateo

## 🚀 Deploy en Vercel

1. Push a tu repositorio de Git
2. Importar proyecto en [Vercel](https://vercel.com)
3. Integrar con Supabase (automático) o configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` manualmente en Environment Variables
4. Deploy automático ✨

Ver [docs](docs/VERCEL-DEPLOY.md) para más detalles.

## 🎨 Estructura del Proyecto

```
wedding-invitation-ui/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   ├── hooks/            # Custom hooks
│   ├── schemas/          # Schemas de validación (Zod)
│   ├── constants/        # Constantes del proyecto
│   ├── lib/              # Utilidades (Supabase client)
│   └── types/            # TypeScript types
└── public/               # Assets estáticos
```

## 📄 Licencia

Proyecto privado - Angie & Tomi © 2026
