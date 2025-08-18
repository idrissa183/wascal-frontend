import React, { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type SupportedLanguage = "fr" | "en";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

interface ProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<ProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("fr");

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(
        "ecowatch_language"
      ) as SupportedLanguage | null;
      if (savedLanguage && ["fr", "en"].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
      } else {
        const browserLanguage = navigator.language.split(
          "-"
        )[0] as SupportedLanguage;
        if (["fr", "en"].includes(browserLanguage)) {
          setLanguageState(browserLanguage);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la langue:", error);
    }
  }, []);

  const setLanguage = (newLanguage: SupportedLanguage) => {
    try {
      if (!["fr", "en"].includes(newLanguage)) {
        console.warn(
          `Langue non supportée: ${newLanguage}. Utilisation du français par défaut.`
        );
        newLanguage = "fr";
      }
      setLanguageState(newLanguage);
      localStorage.setItem("ecowatch_language", newLanguage);
      document.documentElement.lang = newLanguage;
      console.log(`Langue changée vers: ${newLanguage}`);
    } catch (error) {
      console.error("Erreur lors du changement de langue:", error);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
