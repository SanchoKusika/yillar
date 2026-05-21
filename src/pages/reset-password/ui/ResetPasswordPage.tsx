import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@shared/api";
import { updatePassword } from "@entities/session";
import { useT } from "@shared/lib";
import { GirihOverlay, PhoneFrame, Wordmark, YButton, Banner, FieldLabel } from "@shared/ui";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "./ResetPasswordPage.module.css";

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

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStage("ready");
    });

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

        <div className={styles.body}>
          <div className="text-center">
            <Wordmark size={44} />
            <div className={styles.subtitle}>
              {t("auth.resetHeader")}
            </div>
          </div>

          {stage === "waiting" && (
            <div className={styles.waiting}>…</div>
          )}

          {stage === "invalid" && <Banner variant="error">{t("auth.resetInvalidLink")}</Banner>}
          {stage === "done" && <Banner variant="gold">{t("auth.passwordUpdated")}</Banner>}

          {stage === "ready" && (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-[6px]">
                <FieldLabel>{t("auth.newPassword")}</FieldLabel>
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
                <FieldLabel>{t("auth.confirmPassword")}</FieldLabel>
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

              {error && <Banner variant="error">{error}</Banner>}

              <YButton disabled={busy}>
                {busy ? "…" : t("auth.btnSetPassword")}
              </YButton>
            </form>
          )}

          {(stage === "invalid" || stage === "waiting") && (
            <button
              type="button"
              onClick={() => navigate("/auth", { replace: true })}
              className={styles.linkBtn}
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
