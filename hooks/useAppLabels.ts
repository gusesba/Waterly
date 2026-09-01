import { useLocales } from "expo-localization";

import { labels, resolveAppLanguage } from "../constants/labels";

export function useAppLabels() {
  const locales = useLocales();
  const language = resolveAppLanguage(locales[0]?.languageCode);

  return {
    copy: labels[language],
    language,
  };
}
