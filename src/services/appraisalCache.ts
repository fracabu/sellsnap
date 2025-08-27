/**
 * Sistema di cache per le valutazioni AI basato su hash delle immagini
 */

import { UniversalAppraisal, AppraisalResult, Source } from '../types';

export interface CachedAppraisal {
  imageHash: string;
  appraisalData: UniversalAppraisal;
  sources: Source[];
  timestamp: number;
  expiresAt: number;
}

const CACHE_KEY_PREFIX = 'appraisal_cache_';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 ore

/**
 * Salva una valutazione nella cache locale
 */
export function cacheAppraisal(
  imageHash: string,
  appraisalData: UniversalAppraisal,
  sources: Source[]
): void {
  try {
    const cachedData: CachedAppraisal = {
      imageHash,
      appraisalData,
      sources,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION_MS
    };
    
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${imageHash}`,
      JSON.stringify(cachedData)
    );
  } catch (error) {
    console.warn('Impossibile salvare la valutazione nella cache:', error);
  }
}

/**
 * Recupera una valutazione dalla cache se valida
 */
export function getCachedAppraisal(imageHash: string): CachedAppraisal | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${imageHash}`);
    if (!cached) return null;
    
    const data: CachedAppraisal = JSON.parse(cached);
    
    // Controlla se la cache è scaduta
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${imageHash}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Errore nel recupero della cache:', error);
    return null;
  }
}

/**
 * Pulisce le cache scadute
 */
export function cleanExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
    
    cacheKeys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const data: CachedAppraisal = JSON.parse(cached);
          if (Date.now() > data.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        // Cache corrotta, rimuovi
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Errore nella pulizia della cache:', error);
  }
}

/**
 * Aggiorna solo il prezzo di una valutazione cached (per mantenere coerenza)
 */
export function updateCachedPrice(
  imageHash: string,
  newPrice: number,
  newPriceRange: { min: number; max: number },
  newReasoning: string
): boolean {
  try {
    const cached = getCachedAppraisal(imageHash);
    if (!cached) return false;
    
    // Aggiorna solo i dati di pricing mantenendo tutto il resto
    cached.appraisalData.pricing.list_price_suggested = newPrice;
    cached.appraisalData.pricing.range_min = newPriceRange.min;
    cached.appraisalData.pricing.range_max = newPriceRange.max;
    cached.appraisalData.pricing.reasoning = newReasoning;
    cached.timestamp = Date.now();
    
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${imageHash}`,
      JSON.stringify(cached)
    );
    
    return true;
  } catch (error) {
    console.warn('Errore nell\'aggiornamento del prezzo cached:', error);
    return false;
  }
}

/**
 * Ottieni statistiche della cache
 */
export function getCacheStats(): { totalItems: number; expiredItems: number; totalSize: number } {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
  let expiredItems = 0;
  let totalSize = 0;
  
  cacheKeys.forEach(key => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        totalSize += cached.length;
        const data: CachedAppraisal = JSON.parse(cached);
        if (Date.now() > data.expiresAt) {
          expiredItems++;
        }
      }
    } catch (e) {
      expiredItems++;
    }
  });
  
  return {
    totalItems: cacheKeys.length,
    expiredItems,
    totalSize
  };
}