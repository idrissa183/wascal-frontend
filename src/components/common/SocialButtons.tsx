import React from "react";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "../../hooks/useTranslations";

export default function SocialButtons() {
  const t = useTranslations();

  const handleGoogleAuth = () => {
    // Implement Google OAuth
    window.location.href = "/auth/google";
  };

  const handleGithubAuth = () => {
    // Implement GitHub OAuth
    window.location.href = "/auth/github";
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGoogleAuth}
        className="cursor-pointer w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FcGoogle className="w-5 h-5 mr-2" />
        {t.continueWith} Google
      </button>

      <button
        onClick={handleGithubAuth}
        className="cursor-pointer w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FaGithub className="w-5 h-5 mr-2" />
        {t.continueWith} GitHub
      </button>

      <button
        onClick={handleGithubAuth}
        className="cursor-pointer w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FaFacebook className="w-5 h-5 mr-2" />
        {t.continueWith} Facebook
      </button>

      <button
        onClick={handleGithubAuth}
        className="cursor-pointer w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FaLinkedin className="w-5 h-5 mr-2" />
        {t.continueWith} LinkedIn
      </button>
    </div>
  );
}
