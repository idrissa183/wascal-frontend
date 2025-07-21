import { useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";

interface TitleUpdaterProps {
  titleKey: string;
}

export const TitleUpdater: React.FC<TitleUpdaterProps> = ({ titleKey }) => {
  const t = useTranslations();

  useEffect(() => {
    const title = (t as Record<string, string>)[titleKey];
    if (title) {
      document.title = title;
    }
  }, [t, titleKey]);

  return null;
};
