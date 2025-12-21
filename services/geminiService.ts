import { GoogleGenAI, GenerateContentResponse, Chat, Part } from "@google/genai";
import i18n from '../src/i18n';
import type { Source, GenerativePart, UniversalAppraisal, ChatMessage, Comparable } from '../types';
import {
  cacheAppraisal,
  getCachedAppraisal,
  cleanExpiredCache,
  updateCachedPrice
} from './appraisalCache';

const model = "gemini-2.5-flash";

// Funzione per ottenere l'API key dal localStorage
const getApiKey = (): string => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        throw new Error(i18n.t('errors.apiKeyNotConfigured'));
    }
    return apiKey;
};

// Funzione per creare l'istanza GoogleGenAI
const getAI = () => {
    const apiKey = getApiKey();
    return new GoogleGenAI({ apiKey });
};

// Funzioni di utilità per la gestione dell'API key
export const setApiKey = (apiKey: string) => {
    localStorage.setItem('gemini_api_key', apiKey);
};

export const hasApiKey = (): boolean => {
    return !!localStorage.getItem('gemini_api_key');
};

export const clearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
};

// Funzione per testare se l'API key è valida
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const testAI = new GoogleGenAI({ apiKey });
        // Prova una chiamata semplice per testare l'API key
        await testAI.models.generateContent({
            model: model,
            contents: { parts: [{ text: "Test" }] }
        });
        return true;
    } catch (error) {
        return false;
    }
};

export async function getUniversalAppraisal(
  imageParts: GenerativePart | GenerativePart[], 
  imageHash?: string
): Promise<{ appraisalData: UniversalAppraisal; sources: Source[]; fromCache: boolean }> {
  
  // Pulizia cache scadute all'avvio
  cleanExpiredCache();
  
  // Controlla se abbiamo una valutazione in cache
  if (imageHash) {
    const cached = getCachedAppraisal(imageHash);
    if (cached) {
      console.log('Valutazione recuperata dalla cache per hash:', imageHash);
      return {
        appraisalData: cached.appraisalData,
        sources: cached.sources,
        fromCache: true
      };
    }
  }

  // JSON schema constant (language-agnostic)
  const jsonSchema = `
Schema JSON da usare (non includere nel tuo output, solo per riferimento):
{ "locale": "${i18n.language === 'it' ? 'it-IT' : 'en-US'}", "category": "string", "subcategory": "string|null", "title": "string", "description_bullets": ["string"], "attributes": { "brand": "string|null", "model": "string|null", "maker_artist": "string|null", "era_period": "string|null", "color": ["string"], "materials": ["string"], "size": "string|null", "dimensions": "string|null", "weight": "string|null", "year": "string|null", "serial_ref": "string|null" }, "condition": "NEW|LIKE_NEW|VERY_GOOD|GOOD|FAIR|FOR_PARTS", "defects": ["string"], "photos_needed": ["string"], "missing_information": ["string"], "authenticity_checks": { "marks_labels": ["string"], "serials_signatures": ["string"], "notes": "string|null", "counterfeit_signals": ["string"] }, "pricing": { "currency": "EUR", "mode": "web_based|heuristic_no_web", "range_min": 0, "range_max": 0, "list_price_suggested": 0, "reasoning": "string", "comparables": [ { "title": "string", "price": 0, "currency": "EUR", "url": "string", "match_quality": "high|medium|low" } ] }, "platform_fields": { "vinted": { "title": "string", "description": "string", "category": "string", "brand": "string|null", "size": "string|null", "condition": "string", "price": 0 }, "ebay": { "title": "string", "subtitle": "string|null", "category_id": "string|null", "condition_id": "string|null", "item_specifics": { "Brand": "string|null", "Model": "string|null", "Color": "string|null", "Size": "string|null", "Material": "string|null" }, "price": 0 }, "subito": { "title": "string", "description": "string", "category": "string", "price": 0 } }, "category_specific": { "furniture_antique": { "wood_species": "string|null", "finish_original": "unknown|yes|no", "woodworm_signs": "unknown|yes|no", "structural_issues": ["string"], "restoration_history": "string|null" }, "art": { "technique": "string|null", "support": "string|null", "signature": "unknown|yes|no", "edition": "string|null", "provenance": "string|null", "certificate": "unknown|yes|no" }, "watches_jewelry": { "movement": "string|null", "case_material": "string|null", "gemstones": ["string"], "service_history": "string|null" }, "electronics_hifi": { "power_on_test": "unknown|yes|no", "accessories": ["string"], "safety_concerns": ["string"] }, "fashion": { "fit_notes": "string|null", "measurements": { "shoulder": "string|null", "chest": "string|null", "waist": "string|null", "length": "string|null" }, "original_packaging": "unknown|yes|no" }, "books_records": { "edition_details": "string|null", "jacket_condition": "string|null", "media_surface": "string|null" }, "tools": { "operational_test": "unknown|yes|no", "consumables_wear": ["string"] } }, "flags": { "restricted": false, "counterfeit_risk": false, "notes": "string|null" }, "confidence": 0.0 }`;

  // Get the translated prompt based on current language
  const prompt = i18n.t('prompts.appraisalSystem') + '\n' + jsonSchema;

    try {
        const ai = getAI();
        const parts = Array.isArray(imageParts) ? [...imageParts, { text: prompt }] : [imageParts, { text: prompt }];
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts },
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const jsonText = response.text.trim();
        let appraisalData: UniversalAppraisal;

        try {
            appraisalData = JSON.parse(jsonText);
        } catch (e) {
            const jsonMatch = jsonText.match(/```(json)?\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[2]) {
                appraisalData = JSON.parse(jsonMatch[2]);
            } else {
                throw e;
            }
        }
        
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources: Source[] = groundingMetadata?.groundingChunks?.filter(
            (chunk): chunk is Source => !!(chunk as Source)?.web?.uri && (chunk as Source).web.uri !== ''
        ) ?? [];

        // Anti-hallucination filter for comparables
        if (appraisalData.pricing && appraisalData.pricing.comparables) {
            const validUrls = new Set(sources.map(s => s.web.uri));
            appraisalData.pricing.comparables = appraisalData.pricing.comparables.filter(comp => validUrls.has(comp.url));
        }

        // Salva nella cache se abbiamo l'hash
        if (imageHash) {
            cacheAppraisal(imageHash, appraisalData, sources);
            console.log('Valutazione salvata nella cache per hash:', imageHash);
        }

        return { appraisalData, sources, fromCache: false };

    } catch (error) {
        console.error("Error generating universal appraisal:", error);
        if (error instanceof SyntaxError) {
             throw new Error(i18n.t('errors.invalidJson'));
        }
        throw new Error(i18n.t('errors.appraisalError'));
    }
}

export async function getFollowUpAnswer(
    appraisal: UniversalAppraisal,
    history: ChatMessage[]
): Promise<{ text: string; sources: Source[] }> {
  const systemInstruction = `${i18n.t('prompts.followUpSystem')}
${JSON.stringify(appraisal, null, 2)}`;

  const userMessage = history[history.length - 1].content;
  
  const modelHistory = history.slice(0, -1).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }] as Part[],
  }));

  const ai = getAI();
  const chat: Chat = ai.chats.create({
    model: model,
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: systemInstruction,
    },
    history: modelHistory,
  });

  try {
    const response = await chat.sendMessage({ message: userMessage });
    
    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: Source[] = groundingMetadata?.groundingChunks?.filter(
        (chunk): chunk is Source => !!(chunk as Source)?.web?.uri && (chunk as Source).web.uri !== ''
    ) ?? [];
        
    return { text, sources };
  } catch (error) {
    console.error("Error getting follow-up answer:", error);
    throw new Error(i18n.t('errors.followUpError'));
  }
}