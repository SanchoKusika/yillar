import FlagRU from "@shared/assets/svg/flags/ru.svg?react";
import FlagUZ from "@shared/assets/svg/flags/uz.svg?react";
import FlagEN from "@shared/assets/svg/flags/en.svg?react";
import { FieldLabel } from "@shared/ui";
import { useT, type Language } from "@shared/lib";
import { usePreferencesStore } from "@entities/preferences";
import styles from "./LanguageSelect.module.css";

const LANGS: { lng: Language; code: string; Flag: typeof FlagRU }[] = [
  { lng: "ru", code: "RU", Flag: FlagRU },
  { lng: "uz", code: "O'Z", Flag: FlagUZ },
  { lng: "en", code: "EN", Flag: FlagEN },
];

export function LanguageSelect() {
  const t = useT();
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);

  return (
    <div>
      <FieldLabel>{t("profile.settings.language")}</FieldLabel>
      <div className={styles.grid}>
        {LANGS.map(({ lng, code, Flag }) => (
          <button
            key={lng}
            type="button"
            onClick={() => setLanguage(lng)}
            className={styles.btn}
            data-active={language === lng}
          >
            <Flag className={styles.flag} aria-hidden />
            <span className={styles.code}>{code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
