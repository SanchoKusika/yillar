const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function normalizeSupabaseUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

const supabaseUrl = normalizeSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey && rawKey.length > 20 ? rawKey : null;

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  hasSupabase: Boolean(supabaseUrl && supabaseAnonKey),
} as const;
