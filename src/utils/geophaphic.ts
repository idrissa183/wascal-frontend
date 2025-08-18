import type { Country } from "../services/geographic.service";

/**
 * Returns the localized name for a country depending on language.
 * Note: shape_name contains French names by default.
 * Falls back to `shape_name` if translation missing.
 */
export function getCountryName(country: Country, lang: "en" | "fr"): string {
  if (lang === "en") {
    // Pour l'anglais: UNIQUEMENT shape_name_en (pas de fallback car shape_name est en français)
    return country.shape_name_en || `${country.shape_name} (EN translation missing)`;
  }
  if (lang === "fr") {
    // Pour le français: shape_name_fr en priorité, sinon shape_name (qui est déjà en français)
    return country.shape_name_fr || country.shape_name;
  }
  return country.shape_name;
}

export default getCountryName;
