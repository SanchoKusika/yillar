import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { env } from "@shared/config/env";

function init(): SupabaseClient | null {
  if (!env.hasSupabase || !env.supabaseUrl || !env.supabaseAnonKey) return null;
  try {
    return createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        // detectSessionInUrl: false — на RN сессии прилетают через deep link (yillar://reset-password),
        // не через URL hash на странице. Раздаём через expo-router useLocalSearchParams.
      },
    });
  } catch (err) {
    console.warn("[YILLAR] Supabase init failed, falling back to demo mode:", err);
    return null;
  }
}

export const supabase = init();
