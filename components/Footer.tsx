import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-base-200 border-t border-base-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrizione */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">
                SellSnap
              </h3>
            </div>
            <p className="text-text-secondary max-w-md leading-relaxed">
              Trasforma i tuoi oggetti in annunci perfetti con l'intelligenza artificiale di Gemini. 
              Valutazione accurata e descrizioni ottimizzate per tutti i marketplace.
            </p>
          </div>

          {/* Links utili */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Navigazione</h4>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="text-text-secondary hover:text-orange-500 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#come-funziona" className="text-text-secondary hover:text-orange-500 transition-colors">
                  Come Funziona
                </a>
              </li>
              <li>
                <a href="#carica-foto" className="text-text-secondary hover:text-orange-500 transition-colors">
                  Carica Foto
                </a>
              </li>
            </ul>
          </div>

          {/* Marketplace supportati */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Marketplace</h4>
            <ul className="space-y-2">
              <li>
                <a href="https://www.vinted.it" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-orange-500 transition-colors">
                  Vinted
                </a>
              </li>
              <li>
                <a href="https://www.ebay.it" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-orange-500 transition-colors">
                  eBay
                </a>
              </li>
              <li>
                <a href="https://www.subito.it" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-orange-500 transition-colors">
                  Subito.it
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/marketplace" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-orange-500 transition-colors">
                  Facebook Marketplace
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright e crediti */}
        <div className="mt-8 pt-8 border-t border-base-300">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-text-secondary text-sm">
              © 2025 SellSnap. Tutti i diritti riservati.
            </p>
            <p className="text-text-secondary text-sm mt-2 md:mt-0">
              Powered by <span className="text-orange-500 font-medium">Gemini di Google</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};