import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CatalogLine, GirihOverlay, GoldRule, PhoneFrame, Wordmark, YButton } from "@shared/ui";
import { env } from "@shared/config";
import { useT } from "@shared/lib";
import {
  signInAnonymously,
  signInWithEmail,
  signUpWithEmail,
  useSessionStore,
} from "@entities/session";
import { BottomNav } from "@widgets/bottom-nav";
import styles from "./AuthPage.module.css";

type Mode = "signin" | "signup";

export function AuthPage() {
  const navigate = useNavigate();
  const t = useT();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isAuthed = useSessionStore((s) => s.user !== null);
  const isAnon = useSessionStore((s) => s.user?.isAnonymous ?? false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        await signInWithEmail(email.trim(), password);
        navigate("/", { replace: true });
      } else {
        const outcome = await signUpWithEmail({
          email: email.trim(),
          password,
          displayName: displayName.trim() || undefined,
        });
        if (outcome.status === "confirmed") {
          setNotice(t("auth.successConfirmed"));
          setTimeout(() => navigate("/", { replace: true }), 800);
        } else {
          setNotice(
            `${t("auth.emailSentPrefix")} ${outcome.email.toUpperCase()} ${t("auth.emailSentSuffix")}`,
          );
          setEmail("");
          setPassword("");
          setDisplayName("");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  const onGuest = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInAnonymously();
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  };

  if (!env.hasSupabase) {
    return (
      <PhoneFrame>
        <div className="relative flex h-full flex-col">
          <div className="relative border-b border-gold px-[18px] py-[14px]">
            <CatalogLine left={t("auth.headerLeft")} right={t("home.demo")} />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <Wordmark size={48} />
            <div className="max-w-[280px] font-condensed text-[14px] uppercase tracking-[0.12em] text-cream opacity-80">
              {t("auth.demoNotice")}
            </div>
          </div>
          <BottomNav />
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col">
        <GirihOverlay size={200} opacity={0.05} />

        <div className="relative border-b border-gold px-[18px] py-[14px]">
          <CatalogLine
            left={t("auth.headerLeft")}
            right={
              isAuthed
                ? isAnon
                  ? t("auth.guest")
                  : t("auth.signedIn")
                : t("auth.signIn")
            }
          />
        </div>

        <div className="relative flex flex-1 flex-col gap-5 overflow-auto px-5 pt-6 pb-4">
          <div className="text-center">
            <Wordmark size={44} />
            <div className="mt-2 font-condensed text-[10px] font-bold uppercase tracking-[0.32em] text-cream opacity-75">
              {mode === "signin" ? t("auth.headerSignIn") : t("auth.headerSignUp")}
            </div>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              onClick={() => setMode("signin")}
              data-active={mode === "signin"}
              className={styles.tab}
            >
              {t("auth.tabSignIn")}
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              data-active={mode === "signup"}
              className={styles.tab}
            >
              {t("auth.tabSignUp")}
            </button>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <Field
                label={t("auth.fieldName")}
                value={displayName}
                onChange={setDisplayName}
                placeholder="DILNOZA"
              />
            )}
            <Field
              label={t("auth.fieldEmail")}
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="you@example.com"
            />
            <Field
              label={t("auth.fieldPassword")}
              type="password"
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              placeholder="••••••••"
            />

            {error && (
              <div className="border border-danger px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-danger">
                {error}
              </div>
            )}
            {notice && (
              <div className="border border-gold px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-gold">
                {notice}
              </div>
            )}

            <YButton disabled={busy}>
              {busy ? "…" : mode === "signin" ? t("auth.btnSignIn") : t("auth.btnSignUp")}
            </YButton>
          </form>

          <GoldRule style={{ opacity: 0.3 }} />

          <YButton variant="ghost" onClick={onGuest} disabled={busy}>
            {t("auth.btnGuest")}
          </YButton>

          <div className="text-center text-[11px] italic text-cream opacity-55">
            {t("auth.guestHint")}
          </div>
        </div>

        <BottomNav />
      </div>
    </PhoneFrame>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoCapitalize="off"
        autoComplete={type === "password" ? "current-password" : "email"}
        className={styles.input}
      />
    </label>
  );
}
