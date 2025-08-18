import { useEffect, useState } from "react";
import { useLanguage } from "./useLanguage";

interface Translations {
  [key: string]: any;
}

export function useTranslations(): Translations {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadTranslations = async () => {
      try {
        setIsLoading(true);

        // Construire l'URL complète pour les traductions
        const translationUrl = `/locales/${language}/common.json`;
        const response = await fetch(translationUrl);

        if (!response.ok) {
          throw new Error(`Failed to load translations: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setTranslations(data);
        }
      } catch (error) {
        console.error("Error loading translations:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [language]);

  return translations;
}
