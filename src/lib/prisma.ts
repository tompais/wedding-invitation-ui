/**
 * Prisma Client Singleton - Prisma 7.x
 *
 * Next.js en desarrollo hace hot-reload, lo que puede crear múltiples instancias
 * de PrismaClient. Este patrón singleton previene ese problema.
 *
 * IMPORTANTE: Prisma 7 requiere usar un adapter para conexiones directas.
 * La conexión a la base de datos solo se realiza en RUNTIME cuando se ejecuta una query.
 *
 * Docs: https://pris.ly/d/prisma7-client-config
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Crear pool de conexiones PostgreSQL
// Solo se conecta cuando realmente se ejecuta una query, no durante el build
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

const adapter = new PrismaPg(pool);

// Crear cliente Prisma con adapter
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
