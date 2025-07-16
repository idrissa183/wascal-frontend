import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { APP_NAME, APP_VERSION } from "../../constants";
import { useTranslations } from "../../hooks/useTranslations";

export default function Footer() {

  const t = useTranslations();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EW</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {APP_NAME}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                {t.platformDescription}
              </p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {t.version} {APP_VERSION}
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {t.quickLinks}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/about"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t.about}
                  </a>
                </li>
                <li>
                  <a
                    href="/documentation"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t.documentation}
                  </a>
                </li>
                <li>
                  <a
                    href="/support"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t.support}
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t.contact}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {t.legal}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t.privacy}
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t.terms}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} {APP_NAME}. {t.rights}.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {t.builtWith} ❤️ {t.forEnvironment}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
