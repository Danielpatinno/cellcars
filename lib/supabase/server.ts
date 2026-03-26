import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabasePublicKey, getSupabaseUrl } from "./env";

/** Cliente com sessão do utilizador (Server Components, Server Actions com cookies) */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublicKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // setAll pode ser chamado desde um Server Component; o middleware renova a sessão.
        }
      },
    },
  });
}

/** Operações que ignoram RLS (apenas no servidor; nunca expor ao browser) */
export function createServerAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Defina SUPABASE_SERVICE_ROLE_KEY para createServerAdmin");
  }
  return createSupabaseClient(getSupabaseUrl(), serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
