import { useEffect, useState } from "react";

export function useLanguage() {
  const [language, setLanguage] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "fr" | "en";
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  return { language, setLanguage };
}
