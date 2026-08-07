import "server-only";

import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return null;
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  };
}

export type SupabaseServerConfig = NonNullable<
  ReturnType<typeof getSupabaseServerConfig>
>;

export function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  return authorization?.replace(/^Bearer\s+/i, "") ?? null;
}

export function createSupabaseUserClient(
  config: SupabaseServerConfig,
  accessToken: string,
) {
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export function createSupabaseAdminClient(config: SupabaseServerConfig) {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
