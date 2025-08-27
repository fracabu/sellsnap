import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
        focus-visible:ring-white focus-visible:ring-opacity-75
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
          : 'bg-gradient-to-r from-orange-400 to-yellow-400'
        }
        ${className}
      `}
      title={`Passa al tema ${theme === 'light' ? 'scuro' : 'chiaro'}`}
    >
      <span className="sr-only">Cambia tema</span>
      <span
        className={`
          pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 
          transition duration-200 ease-in-out flex items-center justify-center
          ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {theme === 'light' ? (
          // Icona sole
          <svg
            className="h-4 w-4 text-orange-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          // Icona luna
          <svg
            className="h-4 w-4 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            />
          </svg>
        )}
      </span>
    </button>
  );
};