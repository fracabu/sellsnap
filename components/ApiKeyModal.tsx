import React, { useState } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  isLoading?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-200 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">Configura API Key</h3>
          <p className="text-text-secondary text-sm">
            Per utilizzare SellSnap, inserisci la tua chiave API di Google Gemini
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-orange-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-orange-800 text-sm font-medium mb-1">Come ottenere la chiave API:</p>
              <ol className="text-orange-700 text-sm space-y-1 ml-4 list-decimal">
                <li>Vai su <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-500 underline">Google AI Studio</a></li>
                <li>Accedi con il tuo account Google</li>
                <li>Clicca su "Create API Key"</li>
                <li>Copia la chiave e incollala qui sotto</li>
              </ol>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="apiKey" className="block text-sm font-medium text-text-primary mb-2">
              Chiave API Gemini
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-base-100 text-text-primary pr-12"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              La chiave viene salvata solo localmente nel tuo browser. Non viene mai inviata a server esterni.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-base-300 rounded-lg text-text-primary font-medium hover:bg-base-300 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? 'Verifica...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};