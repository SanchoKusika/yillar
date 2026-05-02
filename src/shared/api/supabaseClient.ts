import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@shared/config/env";

function init(): SupabaseClient | null {
  if (!env.hasSupabase || !env.supabaseUrl || !env.supabaseAnonKey) return null;
  try {
    return createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn("[YILLAR] Supabase init failed, falling back to demo mode:", err);
    return null;
  }
}

export const supabase = init();
