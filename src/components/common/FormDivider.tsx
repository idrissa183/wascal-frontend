import { useTranslations } from "../../hooks/useTranslations";

export default function FormDivider() {
  const t = useTranslations();

  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
          {t.orContinueWith}
        </span>
      </div>
    </div>
  );
}
