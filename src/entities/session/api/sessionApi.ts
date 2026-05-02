import { supabase } from "@shared/api";
import type { Era } from "@shared/lib";
import type { Profile } from "../model/types";

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  generation: Era | null;
  avatar_url: string | null;
};

const fromRow = (r: ProfileRow): Profile => ({
  id: r.id,
  username: r.username,
  displayName: r.display_name,
  generation: r.generation,
  avatarUrl: r.avatar_url,
});

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

const PROFILE_FETCH_TIMEOUT_MS = 8000;

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const sb = requireSupabase();
  const query = sb
    .from("profiles")
    .select("id, username, display_name, generation, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
    setTimeout(() => resolve({ data: null, error: new Error("profile request timed out") }), PROFILE_FETCH_TIMEOUT_MS),
  );
  const { data, error } = await Promise.race([query, timeout]);
  if (error) throw error;
  return data ? fromRow(data as ProfileRow) : null;
}

export async function ensureProfile(userId: string, displayName: string | null): Promise<Profile> {
  const sb = requireSupabase();
  const { data, error } = await sb
    .from("profiles")
    .upsert(
      { id: userId, display_name: displayName, updated_at: new Date().toISOString() },
      { onConflict: "id", ignoreDuplicates: false },
    )
    .select("id, username, display_name, generation, avatar_url")
    .single();
  if (error) throw error;
  return fromRow(data as ProfileRow);
}

export async function updateProfile(patch: {
  displayName?: string | null;
  username?: string | null;
  generation?: Era | null;
  avatarUrl?: string | null;
}): Promise<void> {
  const sb = requireSupabase();
  const { data: userData } = await sb.auth.getUser();
  const id = userData.user?.id;
  if (!id) throw new Error("Not authenticated");

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.username !== undefined) row.username = patch.username;
  if (patch.generation !== undefined) row.generation = patch.generation;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;

  const { error } = await sb.from("profiles").update(row).eq("id", id);
  if (error) throw error;
}

export async function signInAnonymously(): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signInAnonymously();
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export type SignUpOutcome =
  | { status: "confirmed" }
  | { status: "pending_email"; email: string }
  | { status: "pending_anon_email_change"; email: string };

export async function signUpWithEmail(args: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<SignUpOutcome> {
  const sb = requireSupabase();
  const current = await sb.auth.getUser();
  const isAnon = current.data.user?.is_anonymous === true;
  const metadata = args.displayName ? { display_name: args.displayName } : undefined;
  const emailRedirectTo = typeof window !== "undefined" ? window.location.origin : undefined;

  if (isAnon) {
    const { data, error } = await sb.auth.updateUser({
      email: args.email,
      password: args.password,
      data: metadata,
    });
    if (error) throw error;
    if (args.displayName) {
      try {
        await updateProfile({ displayName: args.displayName });
      } catch (err) {
        console.warn("[YILLAR] profile update after signup deferred:", err);
      }
    }
    if (data.user?.email_confirmed_at) return { status: "confirmed" };
    return { status: "pending_anon_email_change", email: args.email };
  }

  const { data, error } = await sb.auth.signUp({
    email: args.email,
    password: args.password,
    options: { data: metadata, emailRedirectTo },
  });
  if (error) throw error;

  if (data.session && args.displayName) {
    try {
      await updateProfile({ displayName: args.displayName });
    } catch (err) {
      console.warn("[YILLAR] profile update after signup deferred:", err);
    }
  }

  if (data.session) return { status: "confirmed" };
  return { status: "pending_email", email: args.email };
}

export async function signOut(): Promise<void> {
  const sb = requireSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const sb = requireSupabase();
  const ext = AVATAR_MIME[file.type];
  if (!ext) throw new Error("Поддерживаются только PNG, JPEG, WEBP");
  if (file.size > AVATAR_MAX_BYTES) throw new Error("Файл больше 2 МБ");

  const path = `${userId}/avatar.${ext}`;
  const { error: uploadErr } = await sb.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
  if (uploadErr) throw uploadErr;

  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
  await updateProfile({ avatarUrl: publicUrl });
  return publicUrl;
}
