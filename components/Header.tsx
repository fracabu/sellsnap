import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PushButton } from './PushButton';
import { ThemeToggle } from '../src/components/ThemeToggle';
import { LanguageToggle } from '../src/components/LanguageToggle';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 100; // Increased offset for better visibility (was 80)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-300 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">
              SellSnap
            </h1>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('hero')} className="text-text-secondary hover:text-orange-500 transition-colors duration-200 font-medium">
              {t('common.home')}
            </button>
            <button onClick={() => scrollToSection('come-funziona')} className="text-text-secondary hover:text-orange-500 transition-colors duration-200 font-medium">
              {t('common.howItWorks')}
            </button>
            <button onClick={() => scrollToSection('carica-foto')} className="text-text-secondary hover:text-orange-500 transition-colors duration-200 font-medium">
              {t('common.uploadPhoto')}
            </button>
            <LanguageToggle className="ml-2" />
            <ThemeToggle className="ml-2" />
          </nav>
          
          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-3">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-text-secondary hover:text-orange-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-base-300 bg-base-100/95 backdrop-blur-md">
            <nav className="px-4 py-4 space-y-4">
              <button
                onClick={() => scrollToSection('hero')}
                className="block text-text-secondary hover:text-orange-500 transition-colors font-medium text-left w-full"
              >
                {t('common.home')}
              </button>
              <button
                onClick={() => scrollToSection('come-funziona')}
                className="block text-text-secondary hover:text-orange-500 transition-colors font-medium text-left w-full"
              >
                {t('common.howItWorks')}
              </button>
              <button
                onClick={() => scrollToSection('carica-foto')}
                className="block text-text-secondary hover:text-orange-500 transition-colors font-medium text-left w-full"
              >
                {t('common.uploadPhoto')}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};