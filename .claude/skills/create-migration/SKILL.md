---
name: create-migration
description: Create a new Supabase migration with proper naming, apply it, and regenerate TypeScript types
disable-model-invocation: false
---

1. Ask the user what the migration does (e.g., "add phone column to guests")
2. Generate a snake*case migration name with format: `YYYYMMDD*<description>`
3. Create the SQL file in `supabase/migrations/`
4. Review the SQL with the user before applying
5. Run `supabase db push` to apply locally or ask which environment
6. Run `npm run types` to regenerate `src/types/supabase.ts`
7. Confirm types are updated and no TypeScript errors remain

Invoke with: /create-migration
