import React, { useEffect, useState } from "react";
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
} from "@heroicons/react/24/outline";
import { APP_NAME } from "../../constants";
import { useTranslations } from "../../hooks/useTranslations";
import { Tooltip } from "../ui/Tooltip";
import { useAuthStore } from "../../stores/useAuthStore";

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useAuthStore();
  const t = useTranslations();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const userMenu = document.querySelector('[data-user-menu]');
      
      if (showUserMenu && userMenu && !userMenu.contains(target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);
  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    window.location.href = "/auth/login";
  };

  const themeIcons = {
    light: SunIcon,
    dark: MoonIcon,
    system: ComputerDesktopIcon,
  };

  const toggleLanguage = () => {
    const newLang = language === "fr" ? "en" : "fr";
    setLanguage(newLang);
  };
  const toggleTheme = () => {
    const order = ["light", "dark", "system"] as const;
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };
  const ThemeIcon = themeIcons[theme];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed w-full z-30 top-0 left-0 right-0">
      <div className="px-3 py-3 sm:px-4 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start min-w-0">
            <button
              data-sidebar-toggle
              onClick={onToggleSidebar}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <span className="sr-only">btn bars3</span>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <a href="/" className="flex ml-2 md:mr-24 items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EW</span>
              </div>
              <span className="self-center text-lg sm:text-xl lg:text-2xl font-semibold whitespace-nowrap dark:text-white ml-2 hidden xs:block">
                {APP_NAME}
              </span>
            </a>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            {/* Search Bar */}
            {/* <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full px-4 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>

            {/* Theme Switch */}
            <Tooltip content={t.theme}>
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">btn theme</span>
                <ThemeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </Tooltip>

            {/* Language Switch */}
            <Tooltip content={t.language}>
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 p-1.5 sm:p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">btn language</span>
                <LanguageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === "fr" && (
                  <span className="hidden sm:inline rounded bg-blue-100 dark:bg-blue-500/20 px-1.5 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-300">
                    fr
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Notifications */}
            <button className="p-1.5 sm:p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative transition-colors">
              <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="relative" data-user-menu>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center p-1.5 sm:p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="sr-only">btn user</span>
                <UserCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg dark:bg-gray-700 z-50 border border-gray-200 dark:border-gray-600">
                  <div className="py-1">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t.profile}
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t.settings}
                    </a>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      {t.logout}
                    </button>
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
