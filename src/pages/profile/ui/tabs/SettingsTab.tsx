import { useEffect, useState } from "react";
import { YButton, SectionHeader, FieldLabel, EraSelect, Banner, TextInput } from "@shared/ui";
import { useT, type Era } from "@shared/lib";
import { AvatarUploader } from "../settings/AvatarUploader";
import { PasswordChange } from "../settings/PasswordChange";
import { ThemeSelect } from "../settings/ThemeSelect";
import { LanguageSelect } from "../settings/LanguageSelect";
import styles from "./SettingsTab.module.css";

type SettingsTabProps = {
  initialName: string;
  initialEra: Era | null;
  avatarUrl: string | null;
  initial: string;
  isAnon: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
  onSave: (name: string | null, era: Era | null) => Promise<void>;
  onSignOut: () => Promise<void>;
  onCreateAccount: () => void;
};

export function SettingsTab({
  initialName,
  initialEra,
  avatarUrl,
  initial,
  isAnon,
  onAvatarUpload,
  onSave,
  onSignOut,
  onCreateAccount,
}: SettingsTabProps) {
  const t = useT();
  const [name, setName] = useState(initialName);
  const [era, setEra] = useState<Era | null>(initialEra);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialName);
    setEra(initialEra);
  }, [initialName, initialEra]);

  const dirty = (name.trim() || null) !== (initialName.trim() || null) || era !== initialEra;

  const handleSave = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const trimmed = name.trim();
      await onSave(trimmed.length > 0 ? trimmed.toUpperCase().slice(0, 20) : null, era);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.saveFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title={t("profile.settings.sectionProfile")} />

      <div className="flex flex-col gap-3">
        <AvatarUploader avatarUrl={avatarUrl} initial={initial} onUpload={onAvatarUpload} />

        <label className="flex flex-col">
          <FieldLabel>{t("profile.settings.displayName")}</FieldLabel>
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="DILNOZA"
          />
        </label>

        <div>
          <FieldLabel>{t("profile.settings.generation")}</FieldLabel>
          <EraSelect value={era} onChange={setEra} />
        </div>

        {error && <Banner variant="error">{error}</Banner>}

        <YButton onClick={handleSave} disabled={busy || !dirty}>
          {busy ? t("profile.settings.saving") : dirty ? t("profile.settings.save") : t("profile.settings.saved")}
        </YButton>
      </div>

      <SectionHeader title={t("profile.settings.sectionApp")} />

      <div className="flex flex-col gap-3">
        <ThemeSelect />
        <LanguageSelect />
      </div>

      <SectionHeader title={t("profile.settings.sectionAccount")} />

      <div className="flex flex-col gap-3">
        {!isAnon && <PasswordChange />}

        {isAnon ? (
          <div className="flex flex-col gap-2">
            <Banner variant="gold">{t("profile.guestBanner")}</Banner>
            <YButton onClick={onCreateAccount}>{t("profile.createAccount")}</YButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignOut}
            className={styles.signOutBtn}
          >
            {t("profile.signOut")}
          </button>
        )}
      </div>
    </div>
  );
}
