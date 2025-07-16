import React from "react";
import Footer from "../include/Footer";
import { APP_NAME } from "../../constants";

interface BaseAuthProps {
  showHeader?: boolean;
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function BaseAuth({
  children,
  showFooter = false,
}: BaseAuthProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <a href="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EW</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              {APP_NAME}
            </span>
          </a>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
