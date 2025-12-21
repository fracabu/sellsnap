import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'it' ? 'en' : 'it';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center justify-center w-10 h-10 rounded-lg bg-base-300 hover:bg-base-100 text-text-primary transition-colors duration-200 font-medium text-sm ${className}`}
      title={i18n.language === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
    >
      {i18n.language === 'it' ? 'EN' : 'IT'}
    </button>
  );
};
