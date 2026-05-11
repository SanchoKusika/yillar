import { useState } from "react";
import { YButton, Banner, FieldLabel, TextInput } from "@shared/ui";
import styles from "../tabs/SettingsTab.module.css";
import { useT } from "@shared/lib";
import { updatePassword } from "@entities/session";

export function PasswordChange() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onOpen = () => {
    setOpen(true);
    setError(null);
    setSaved(false);
    setNewPw("");
  };

  const onSave = async () => {
    if (busy || newPw.length < 6) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updatePassword(newPw);
      setSaved(true);
      setOpen(false);
      setNewPw("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <FieldLabel>{t("profile.settings.changePassword")}</FieldLabel>
      {!open ? (
        <button
          type="button"
          onClick={onOpen}
          className={styles.pwDots}
        >
          ••••••••
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <TextInput
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder={t("profile.settings.newPasswordPlaceholder")}
            autoComplete="new-password"
          />
          {error && <Banner variant="error">{error}</Banner>}
          {saved && <Banner variant="gold">{t("profile.settings.saved")}</Banner>}
          <YButton disabled={busy || newPw.length < 6} onClick={onSave}>
            {busy ? t("profile.settings.saving") : t("profile.settings.savePassword")}
          </YButton>
        </div>
      )}
    </div>
  );
}
