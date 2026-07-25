import { createClient } from "@supabase/supabase-js";

// Note: This client should ONLY be used in server environments (like Server Actions or Route Handlers).
// It bypasses Row Level Security (RLS) and has full administrative privileges.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
