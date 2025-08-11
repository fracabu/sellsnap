import { GoogleGenAI, GenerateContentResponse, Chat, Part } from "@google/genai";
import type { Source, GenerativePart, UniversalAppraisal, ChatMessage, Comparable } from '../types';

const model = "gemini-2.5-flash";

// Funzione per ottenere l'API key dal localStorage
const getApiKey = (): string => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        throw new Error("API Key non configurata. Configura la tua chiave API di Google Gemini.");
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

export async function getUniversalAppraisal(imageParts: GenerativePart | GenerativePart[]): Promise<{ appraisalData: UniversalAppraisal; sources: Source[] }> {
    const prompt = `Sei un perito multidisciplinare per il mercato dell’usato (inclusi antiquariato, modernariato, mobili, arte, elettronica, moda, strumenti musicali, libri/vinili, orologi/giollielli, utensili).
Dalla/e foto fornite e da eventuale titolo/testo utente, genera solo un JSON valido secondo lo schema fornito. Niente testo extra o markdown.

Obiettivi
- Identifica categoria e sotto-categoria.
- Estrai attributi tecnici rilevanti per quella categoria.
- Valuta la condizione con criteri specifici di categoria.
- Elenca difetti/segni e foto mancanti utili.
- Esegui controlli autenticità e rischi legali/sicurezza.
- Fornisci stima prezzo (range + prezzo consigliato) con ragionamento breve basato sui risultati della ricerca web.
- Prepara campi base per Vinted/eBay/Subito.
- Popola l'array 'pricing.comparables' SOLO con dati provenienti dalla ricerca web. Non inventare URL o dati.

Regole ferree
- Output solo JSON conforme allo schema.
- Se un’informazione non è certa: usa null e spiega in missing_information.
- Non inventare brand, modelli, materiali o datazioni: se non visibili, null.
- title ≤ 70 caratteri; max 8 bullet in description_bullets, ciascuna ≤ 140 caratteri.
- Se ricerca web non disponibile: pricing.mode="heuristic_no_web" e comparables=[].
- Se l’oggetto può essere vietato o a rischio (armi, farmaci, recall, materiali pericolosi, avorio, copie): flags.restricted=true e spiega in flags.notes.
- Tono neutro, descrizione onesta (niente superlativi o promesse).

Condizione (scegline una)
NEW, LIKE_NEW, VERY_GOOD, GOOD, FAIR, FOR_PARTS.

Criteri di condizione per categoria (riassunto)
- Antiquariato/modernariato & mobili: patina OK; valuta stabilità strutturale, originalità finitura/ferramenta, tarli, restauri, mancanze. Evita “come nuovo” se ante 1970; usa note su patina/verniciature non originali.
- Arte: tecnica (olio, tempera, stampa, litografia/serigrafia), supporto, firma, tiratura, certificazioni; segnala rischi contraffazione.
- Orologi/Gioielli: movimento (quarzo/meccanico), cassa, vetro, bracciale, marchi, referenza/seriale, metalli/pietre (non inventare).
- Elettronica/Hi-Fi/Elettrodomestici: accensione/test di base? cavi/alimentatore presenti? segni, ossidazioni; sicurezza elettrica; manuali.
- Strumenti musicali: action/manico, tasti/tastiera, crepe, intonazione approssimativa, custodia.
- Moda/Scarpe/Borse: taglia, misura suola, materiali, cuciture, hardware, odore/macchie, dustbag/scatola; contraffazione.
- Libri/Vinili: edizione/stampa, sovraccoperta, macchie/orecchie, graffi, warp, odore muffa.
- Utensili/Industrial: funzionalità, lame/denti usura, ruggine, sicurezza (protezioni).

Controlli autenticità (metti esito in authenticity_checks)
Marchi/incisioni/timbri/etichette, coerenza tipografica, hardware tipico del brand, proporzioni/loghi, numeri serie, firme/tirature; incongruenze = counterfeit_risk=true.

Sicurezza/legale (metti note in flags.notes se serve)
Elettrico senza certificazioni, seggiolini/infanzia con standard scaduti, caschi/DPIs, materiali vietati (avorio, pelli protette), oggetti soggetti a omologazioni o richiami (recall).

Foto suggerite (max 5)
Target utili: retro, targhette/etichette, numero di serie, firma/timbro, difetti, interno cassetti, smontaggio/attacchi, alimentatore/cavi.

Prezzo
range_min, range_max, list_price_suggested, reasoning breve (materiali, età stimata, condizione, completezza, stagione/domanda).
Se web attivo: 2–5 comparables con title/price/currency/url/match_quality (high/medium/low).

Piattaforme
Compila platform_fields (Vinted/eBay/Subito). Se un campo non è applicabile, derivane uno generico o lascia null.

Campi obbligatori
locale, category, title, description_bullets, attributes, condition, defects, photos_needed, missing_information, pricing, platform_fields, authenticity_checks, flags, confidence, category_specific.

Schema JSON da usare (non includere nel tuo output, solo per riferimento):
{ "locale": "it-IT", "category": "string", "subcategory": "string|null", "title": "string", "description_bullets": ["string"], "attributes": { "brand": "string|null", "model": "string|null", "maker_artist": "string|null", "era_period": "string|null", "color": ["string"], "materials": ["string"], "size": "string|null", "dimensions": "string|null", "weight": "string|null", "year": "string|null", "serial_ref": "string|null" }, "condition": "NEW|LIKE_NEW|VERY_GOOD|GOOD|FAIR|FOR_PARTS", "defects": ["string"], "photos_needed": ["string"], "missing_information": ["string"], "authenticity_checks": { "marks_labels": ["string"], "serials_signatures": ["string"], "notes": "string|null", "counterfeit_signals": ["string"] }, "pricing": { "currency": "EUR", "mode": "web_based|heuristic_no_web", "range_min": 0, "range_max": 0, "list_price_suggested": 0, "reasoning": "string", "comparables": [ { "title": "string", "price": 0, "currency": "EUR", "url": "string", "match_quality": "high|medium|low" } ] }, "platform_fields": { "vinted": { "title": "string", "description": "string", "category": "string", "brand": "string|null", "size": "string|null", "condition": "string", "price": 0 }, "ebay": { "title": "string", "subtitle": "string|null", "category_id": "string|null", "condition_id": "string|null", "item_specifics": { "Brand": "string|null", "Model": "string|null", "Color": "string|null", "Size": "string|null", "Material": "string|null" }, "price": 0 }, "subito": { "title": "string", "description": "string", "category": "string", "price": 0 } }, "category_specific": { "furniture_antique": { "wood_species": "string|null", "finish_original": "unknown|yes|no", "woodworm_signs": "unknown|yes|no", "structural_issues": ["string"], "restoration_history": "string|null" }, "art": { "technique": "string|null", "support": "string|null", "signature": "unknown|yes|no", "edition": "string|null", "provenance": "string|null", "certificate": "unknown|yes|no" }, "watches_jewelry": { "movement": "string|null", "case_material": "string|null", "gemstones": ["string"], "service_history": "string|null" }, "electronics_hifi": { "power_on_test": "unknown|yes|no", "accessories": ["string"], "safety_concerns": ["string"] }, "fashion": { "fit_notes": "string|null", "measurements": { "shoulder": "string|null", "chest": "string|null", "waist": "string|null", "length": "string|null" }, "original_packaging": "unknown|yes|no" }, "books_records": { "edition_details": "string|null", "jacket_condition": "string|null", "media_surface": "string|null" }, "tools": { "operational_test": "unknown|yes|no", "consumables_wear": ["string"] } }, "flags": { "restricted": false, "counterfeit_risk": false, "notes": "string|null" }, "confidence": 0.0 }`;

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


        return { appraisalData, sources };

    } catch (error) {
        console.error("Error generating universal appraisal:", error);
        if (error instanceof SyntaxError) {
             throw new Error("L'AI ha restituito una perizia in un formato JSON non valido. Riprova.");
        }
        throw new Error("Impossibile generare la perizia per l'oggetto. L'AI potrebbe essere sovraccarica o la richiesta non valida.");
    }
}

export async function getFollowUpAnswer(
    appraisal: UniversalAppraisal, 
    history: ChatMessage[]
): Promise<{ text: string; sources: Source[] }> {
  const systemInstruction = `Sei un assistente esperto e continui una conversazione su un oggetto che hai appena analizzato. La perizia originale è fornita sotto in formato JSON. Usa questa perizia, la cronologia della conversazione e, se necessario, la ricerca web per rispondere a domande di approfondimento in modo conciso e utile. Cita sempre le fonti se usi la ricerca web.

PERIZIA ORIGINALE:
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
    throw new Error("Impossibile ottenere una risposta dall'AI. Riprova.");
  }
}