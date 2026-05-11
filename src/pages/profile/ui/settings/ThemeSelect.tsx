import { FieldLabel } from "@shared/ui";
import { useT } from "@shared/lib";
import { usePreferencesStore, type Theme } from "@entities/preferences";
import styles from "./ThemeSelect.module.css";

export function ThemeSelect() {
  const t = useT();
  const theme = usePreferencesStore((s) => s.theme);
  const setTheme = usePreferencesStore((s) => s.setTheme);

  return (
    <div>
      <FieldLabel>{t("profile.settings.theme")}</FieldLabel>
      <div className={styles.grid}>
        {(["dark", "light"] as Theme[]).map((th) => (
          <button
            key={th}
            type="button"
            onClick={() => setTheme(th)}
            className={styles.btn}
            data-active={theme === th}
          >
            {th === "dark" ? t("profile.settings.themeDark") : t("profile.settings.themeLight")}
          </button>
        ))}
      </div>
    </div>
  );
}
