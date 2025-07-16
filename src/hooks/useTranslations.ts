import { useEffect, useState } from "react";
import { useLanguage } from "./useLanguage";

export function useTranslations() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/locales/${language}/common.json`)
      .then((res) => res.json())
      .then((data) => setTranslations(data))
      .catch(() => setTranslations({}));
  }, [language]);

  return translations;
}
