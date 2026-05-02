import { useEffect, type ReactNode } from "react";
import { supabase } from "@shared/api";
import { ensureProfile, fetchProfile, useSessionStore, type AuthUserSummary } from "@entities/session";
import type { Session, User } from "@supabase/supabase-js";

const GET_SESSION_TIMEOUT_MS = 6000;
const ANON_SIGNIN_TIMEOUT_MS = 8000;

function summarize(user: User | null | undefined): AuthUserSummary | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
    isAnonymous: user.is_anonymous ?? false,
  };
}

function metadataDisplayName(user: User | null | undefined): string | null {
  const raw = user?.user_metadata?.display_name;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      },
    );
  });
}

async function syncProfile(user: User): Promise<void> {
  const store = useSessionStore.getState();
  try {
    const profile = await fetchProfile(user.id);
    const meta = metadataDisplayName(user);
    if (!profile) {
      const created = await ensureProfile(user.id, meta);
      store.setProfile(created);
      return;
    }
    if (!profile.displayName && meta) {
      try {
        const updated = await ensureProfile(user.id, meta);
        store.setProfile(updated);
        return;
      } catch (err) {
        console.warn("[YILLAR] could not sync display_name from metadata:", err);
      }
    }
    store.setProfile(profile);
  } catch (err) {
    console.warn("[YILLAR] failed to load profile:", err);
    store.setProfile(null);
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const sb = supabase;
    const store = useSessionStore.getState();

    if (!sb) {
      store.setUser(null);
      store.setProfile(null);
      store.setLoading(false);
      return;
    }

    let cancelled = false;
    store.setLoading(true);

    const apply = async (session: Session | null) => {
      if (cancelled) return;
      const user = session?.user ?? null;
      const summary = summarize(user);
      store.setUser(summary);
      if (summary && user) await syncProfile(user);
      else store.setProfile(null);
      store.setLoading(false);
    };

    const bootstrap = async () => {
      let session: Session | null = null;
      try {
        const result = await withTimeout(sb.auth.getSession(), GET_SESSION_TIMEOUT_MS, "getSession");
        if (cancelled) return;
        if (result.error) console.warn("[YILLAR] getSession error:", result.error.message);
        session = result.data?.session ?? null;
      } catch (err) {
        console.warn("[YILLAR] getSession failed:", err);
      }

      if (session?.user) {
        await apply(session);
        return;
      }

      try {
        const result = await withTimeout(sb.auth.signInAnonymously(), ANON_SIGNIN_TIMEOUT_MS, "signInAnonymously");
        if (cancelled) return;
        if (result.error) throw result.error;
        // onAuthStateChange will fire SIGNED_IN and run apply()
      } catch (err) {
        if (cancelled) return;
        console.warn("[YILLAR] anonymous sign-in failed:", err);
        store.setUser(null);
        store.setProfile(null);
        store.setLoading(false);
      }
    };

    bootstrap();

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      void apply(session);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
