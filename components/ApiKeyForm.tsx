import React, { useState, useEffect } from 'react';
import { hasApiKey, setApiKey, validateApiKey, clearApiKey } from '../services/geminiService';
import { PushButton } from './PushButton';

interface ApiKeyFormProps {
  onApiKeyValid: () => void;
  className?: string;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeyValid, className = '' }) => {
  const [apiKey, setApiKeyValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Controlla se c'è già una chiave valida
    setIsValid(hasApiKey());
    if (hasApiKey()) {
      onApiKeyValid();
    }
  }, [onApiKeyValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setError('');

    try {
      const isValidKey = await validateApiKey(apiKey.trim());
      if (isValidKey) {
        setApiKey(apiKey.trim());
        setIsValid(true);
        onApiKeyValid();
        setError('');
      } else {
        setError('Chiave API non valida. Controlla che sia corretta.');
      }
    } catch (err) {
      setError('Errore durante la validazione. Riprova.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearApiKey = () => {
    clearApiKey();
    setIsValid(false);
    setApiKeyValue('');
    setError('');
  };

  if (isValid) {
    return (
      <div className={`bg-base-200 border border-green-400 rounded-2xl p-4 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-base font-semibold text-text-primary mb-1">
              ✅ API Key Configurata
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              La tua chiave API Gemini è stata salvata correttamente. Ora puoi caricare le foto per iniziare le perizie!
            </p>
            <PushButton
              onClick={handleClearApiKey}
              variant="orange"
              className="text-sm font-medium px-3 py-1"
            >
              Cambia chiave API
            </PushButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-base-200 rounded-2xl p-4 flex flex-col ${className}`}>
      <div className="mb-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-1">
              1. Configura API Key
            </h3>
            <p className="text-text-secondary text-sm">
              Prima inserisci la tua chiave API di Google Gemini
            </p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-orange-800 text-sm font-medium mb-1">Come ottenere la chiave:</p>
              <ol className="text-orange-700 text-sm space-y-1 ml-3 list-decimal">
                <li>Vai su <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500 underline">Google AI Studio</a></li>
                <li>Clicca "Create API Key"</li>
                <li>Copia e incolla qui sotto</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col justify-end">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-text-primary mb-2">
            Chiave API Gemini
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 border border-base-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-base-100 text-text-primary pr-10"
              disabled={isValidating}
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
              disabled={isValidating}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showKey ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                )}
              </svg>
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          <p className="text-sm text-text-secondary mt-1">
            La chiave viene salvata solo nel tuo browser. Non condividiamo mai i tuoi dati.
          </p>
        </div>

        <div className="flex justify-center">
          <PushButton
            type="submit"
            variant="purple"
            className="font-medium px-4 py-3"
            disabled={isValidating || !apiKey.trim()}
          >
            {isValidating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifica in corso...
              </>
            ) : (
              'Salva e Continua'
            )}
          </PushButton>
        </div>
      </form>
    </div>
  );
};