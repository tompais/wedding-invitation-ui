/**
 * Supabase Client Singleton
 *
 * Next.js en desarrollo hace hot-reload, lo que puede crear múltiples instancias.
 * Este patrón singleton previene ese problema.
 *
 * Docs: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const globalForSupabase = globalThis as unknown as {
  supabase: ReturnType<typeof createClient<Database>> | undefined;
};

// Validar que las variables de entorno existan
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Crear cliente Supabase
export const supabase =
  globalForSupabase.supabase ??
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false, // Disable auth persistence (no auth needed for this app)
      },
    }
  );

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabase = supabase;
}
