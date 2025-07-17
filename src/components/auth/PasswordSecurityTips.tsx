import React from "react";
import { useTranslations } from "../../hooks/useTranslations";

export const PasswordSecurityTips: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
        {t.auth?.password_security?.title ||
          "Conseils pour un mot de passe sécurisé :"}
      </h4>
      <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
        <li>
          •{" "}
          {t.auth?.password_security?.use_at_least_8_characters ||
            "Utilisez au moins 8 caractères"}
        </li>
        <li>
          •{" "}
          {t.auth?.password_security?.mix_upper_lower_numbers_symbols ||
            "Mélangez majuscules, minuscules, chiffres et symboles"}
        </li>
        <li>
          •{" "}
          {t.auth?.password_security?.avoid_common_words ||
            "Évitez les mots courants ou informations personnelles"}
        </li>
        <li>
          •{" "}
          {t.auth?.password_security?.unique_password ||
            "N'utilisez pas ce mot de passe ailleurs"}
        </li>
      </ul>
    </div>
  );
};

export default PasswordSecurityTips;
