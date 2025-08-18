import { useLanguageContext } from "../contexts/LanguageContext";
export type { SupportedLanguage } from "../contexts/LanguageContext";

export function useLanguage() {
  return useLanguageContext();
}
