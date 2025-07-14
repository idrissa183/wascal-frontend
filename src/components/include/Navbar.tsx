import React, { useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { useTheme } from "../../hooks/useTheme";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { APP_NAME } from "../../constants";

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const translations = {
    fr: {
      notifications: "Notifications",
      settings: "Paramètres",
      profile: "Profil",
      logout: "Déconnexion",
      login: "Connexion",
      register: "Inscription",
      theme: "Thème",
      language: "Langue",
      light: "Clair",
      dark: "Sombre",
      system: "Système",
      french: "Français",
      english: "English",
    },
    en: {
      notifications: "Notifications",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout",
      login: "Login",
      register: "Register",
      theme: "Theme",
      language: "Language",
      light: "Light",
      dark: "Dark",
      system: "System",
      french: "Français",
      english: "English",
    },
  };

  const t = translations[language];

  const themeIcons = {
    light: SunIcon,
    dark: MoonIcon,
    system: ComputerDesktopIcon,
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              onClick={onToggleSidebar}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">btn bars3</span>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <a href="/" className="flex ml-2 md:mr-24">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EW</span>
              </div>
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ml-2">
                {APP_NAME}
              </span>
            </a>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une zone géographique..."
                  className="w-64 px-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <span className="sr-only">btn theme</span>
                <ThemeIcon className="w-5 h-5" />
              </button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg dark:bg-gray-700 z-50">
                  <div className="py-1">
                    {(["light", "dark", "system"] as const).map(
                      (themeOption) => {
                        const Icon = themeIcons[themeOption];
                        return (
                          <button
                            key={themeOption}
                            onClick={() => {
                              setTheme(themeOption);
                              setShowThemeMenu(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                          >
                            <Icon className="w-4 h-4 mr-3" />
                            {t[themeOption]}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <span className="sr-only">btn language</span>
                <LanguageIcon className="w-5 h-5" />
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg dark:bg-gray-700 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setLanguage("fr");
                        setShowLanguageMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {t.french}
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setShowLanguageMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {t.english}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <span className="sr-only">btn user</span>
                <UserCircleIcon className="w-6 h-6" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg dark:bg-gray-700 z-50">
                  <div className="py-1">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {t.profile}
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {t.settings}
                    </a>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <a
                      href="/auth/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {t.logout}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
