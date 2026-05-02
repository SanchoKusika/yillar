import { usePreferencesStore } from "@entities/preferences";
import type { Language } from "@entities/preferences";
import { TRANSLATIONS, LANGUAGE_LABEL, type TranslationKey } from "./translations";

export type { TranslationKey };
export { LANGUAGE_LABEL };

export function t(key: TranslationKey, lang: Language, params?: Record<string, string | number>): string {
  let str = TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

export function useT(): (key: TranslationKey, params?: Record<string, string | number>) => string {
  const lang = usePreferencesStore((s) => s.language);
  return (key, params) => t(key, lang, params);
}
