import { useEffect, useState } from "react";

type SupportedLanguage = "fr" | "en";

export function useLanguage() {
  // Initialiser avec le français par défaut
  const [language, setLanguageState] = useState<SupportedLanguage>("fr");
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger la langue depuis localStorage au montage
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(
        "ecowatch_language"
      ) as SupportedLanguage;
      if (savedLanguage && ["fr", "en"].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      } else {
        // Si aucune langue sauvegardée, détecter la langue du navigateur
        const browserLanguage = navigator.language.split(
          "-"
        )[0] as SupportedLanguage;
        if (["fr", "en"].includes(browserLanguage)) {
          setLanguageState(browserLanguage);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la langue:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Fonction pour changer de langue
  const setLanguage = (newLanguage: SupportedLanguage) => {
    try {
      // Valider la langue
      if (!["fr", "en"].includes(newLanguage)) {
        console.warn(
          `Langue non supportée: ${newLanguage}. Utilisation du français par défaut.`
        );
        newLanguage = "fr";
      }

      // Mettre à jour l'état
      setLanguageState(newLanguage);

      // Sauvegarder dans localStorage
      localStorage.setItem("ecowatch_language", newLanguage);

      // Mettre à jour l'attribut lang du document
      document.documentElement.lang = newLanguage;

      // Déclencher un événement personnalisé pour d'autres composants
      window.dispatchEvent(
        new CustomEvent("languageChanged", {
          detail: { language: newLanguage },
        })
      );

      console.log(`Langue changée vers: ${newLanguage}`);
    } catch (error) {
      console.error("Erreur lors du changement de langue:", error);
    }
  };

  // Mettre à jour l'attribut lang du document quand la langue change
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = language;
    }
  }, [language, isInitialized]);

  return {
    language,
    setLanguage,
    isInitialized,
    supportedLanguages: ["fr", "en"] as const,
  };
}
