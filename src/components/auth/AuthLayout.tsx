import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { useTheme } from "../../hooks/useTheme";
import { APP_NAME } from "../../constants";
import {
  LanguageIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const themeIcons = {
    light: SunIcon,
    dark: MoonIcon,
    system: ComputerDesktopIcon,
  };

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
  };

  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header avec contrôles */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {/* Sélecteur de langue */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="flex h-[38px] items-center space-x-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
          aria-label={t.toggleLanguage || "Changer de langue"}
        >
          <LanguageIcon className="h-5 w-5" />
          {language === "fr" && (
            <span className="rounded bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-300">
              fr
            </span>
          )}
        </button>

        {/* Sélecteur de thème */}
        <div className="relative">
          <select
            value={theme}
            onChange={(e) =>
              setTheme(e.target.value as "light" | "dark" | "system")
            }
            className="appearance-none text-gray-800 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
          >
            <option value="light">{t.light}</option>
            <option value="dark">{t.dark}</option>
            <option value="system">{t.system}</option>
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            {React.createElement(themeIcons[theme], {
              className: "h-4 w-4 text-gray-400",
            })}
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">EW</span>
          </div>
        </div>

        {/* Titre de l'application */}
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          {APP_NAME}
        </h1>

        {/* Titre et sous-titre personnalisés */}
        {title && (
          <h2 className="mt-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} {APP_NAME}. {t.rights}.
        </p>
        <div className="mt-2 space-x-4">
          <a
            href="https://doc-hosting.flycricket.io/la-cause-rurale-privacy-policy/d328883c-83a8-477a-a5fc-1a27aec79002/privacy"
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t.privacy}
          </a>
          <a
            href="https://doc-hosting.flycricket.io/la-cause-rurale-terms-of-use/78422ce1-34a2-4405-80b7-512c558512f7/terms"
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t.termsText}
          </a>
        </div>
      </div>
    </div>
  );
};
