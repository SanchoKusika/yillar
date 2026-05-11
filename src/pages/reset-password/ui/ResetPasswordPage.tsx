import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@shared/api";
import { updatePassword } from "@entities/session";
import { useT } from "@shared/lib";
import { CatalogLine, GirihOverlay, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "../../auth/ui/AuthPage.module.css";

type Stage = "waiting" | "ready" | "done" | "invalid";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const t = useT();
  const [stage, setStage] = useState<Stage>("waiting");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setStage("invalid");
      return;
    }

    // Supabase SDK automatically parses the recovery token from the URL hash
    // and fires PASSWORD_RECOVERY via onAuthStateChange.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStage("ready");
      }
    });

    // Fallback: if no hash is present at all, mark as invalid after a short delay
    const timer = setTimeout(() => {
      setStage((s) => (s === "waiting" ? "invalid" : s));
    }, 3000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      setStage("done");
      setTimeout(() => navigate("/", { replace: true }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col">
        <GirihOverlay size={200} opacity={0.05} />

        <div className="relative border-b border-gold px-[18px] py-[14px]">
          <CatalogLine left={t("auth.headerLeft")} right={`● ${t("auth.resetHeader")}`} />
        </div>

        <div className="relative flex flex-1 flex-col gap-5 overflow-auto px-5 pt-6 pb-4">
          <div className="text-center">
            <Wordmark size={44} />
            <div className="mt-2 font-condensed text-[10px] font-bold uppercase tracking-[0.32em] text-cream opacity-75">
              {t("auth.resetHeader")}
            </div>
          </div>

          {stage === "waiting" && (
            <div className="flex flex-1 items-center justify-center font-mono text-[11px] uppercase tracking-[0.18em] text-cream opacity-50">
              …
            </div>
          )}

          {stage === "invalid" && (
            <div className="border border-danger px-3 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-danger">
              {t("auth.resetInvalidLink")}
            </div>
          )}

          {stage === "done" && (
            <div className="border border-gold px-3 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-gold">
              {t("auth.passwordUpdated")}
            </div>
          )}

          {stage === "ready" && (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-[6px]">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
                  {t("auth.newPassword")}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={styles.input}
                />
              </label>

              <label className="flex flex-col gap-[6px]">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
                  {t("auth.confirmPassword")}
                </span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={styles.input}
                />
              </label>

              {error && (
                <div className="border border-danger px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-danger">
                  {error}
                </div>
              )}

              <YButton disabled={busy}>
                {busy ? "…" : t("auth.btnSetPassword")}
              </YButton>
            </form>
          )}

          {(stage === "invalid" || stage === "waiting") && (
            <button
              type="button"
              onClick={() => navigate("/auth", { replace: true })}
              className="self-start font-mono text-[10px] uppercase tracking-[0.14em] text-cream opacity-50 hover:opacity-80 transition-opacity"
            >
              {t("auth.backToSignIn")}
            </button>
          )}
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}
