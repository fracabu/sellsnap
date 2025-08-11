# 📸 SellSnap

**Perizie intelligenti per il mercato dell'usato**

SellSnap è un'applicazione web che utilizza l'intelligenza artificiale per fornire perizie istantanee di oggetti di seconda mano. Scatta una foto, ottieni una valutazione professionale completa di descrizione, prezzo e campi pronti per le piattaforme di vendita.

## ✨ Caratteristiche

- **Analisi AI Multidisciplinare**: Perizie per antiquariato, modernariato, mobili, arte, elettronica, moda, strumenti musicali, libri, vinili, orologi, gioielli e utensili
- **Valutazione Prezzo**: Stima di mercato con ricerca web e comparazioni
- **Controlli Autenticità**: Rilevamento di potenziali contraffazioni e rischi legali
- **Piattaforme Multiple**: Campi pre-compilati per Vinted, eBay e Subito
- **Chat Interattiva**: Domande di approfondimento su ogni perizia
- **Interface Responsive**: Ottimizzata per desktop e mobile

## 🚀 Avvio Rapido

### Prerequisiti
- Node.js (versione 18+)
- Chiave API di Google Gemini

### Installazione

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd sellsnap
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura l'API Key**
   
   Crea un file `.env.local` nella root del progetto:
   ```bash
   GEMINI_API_KEY=la_tua_chiave_api_gemini
   ```

4. **Avvia l'applicazione**
   ```bash
   npm run dev
   ```

L'app sarà disponibile su `http://localhost:5173`

## 🛠️ Comandi Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Build per produzione
- `npm run preview` - Anteprima del build di produzione

## 📁 Struttura del Progetto

```
sellsnap/
├── components/          # Componenti React riutilizzabili
│   ├── ChatInterface.tsx
│   ├── ResultCard.tsx
│   ├── Loader.tsx
│   └── icons.tsx
├── services/           # Servizi e API
│   └── geminiService.ts
├── App.tsx            # Componente principale
├── types.ts           # Definizioni TypeScript
├── index.tsx          # Entry point
└── vite.config.ts     # Configurazione Vite
```

## 🎯 Come Funziona

1. **Upload Immagine**: L'utente carica una foto dell'oggetto da valutare
2. **Analisi AI**: Gemini 2.5 Flash analizza l'immagine con prompt strutturato
3. **Perizia Completa**: Generazione di valutazione JSON con categoria, condizione, prezzo e dettagli
4. **Interazione**: Chat per domande di approfondimento sulla perizia

## 🔧 Tecnologie

- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini 2.5 Flash API
- **Styling**: CSS personalizzato con design system
- **Build**: Vite con supporto TypeScript

## 🎨 Categorie Supportate

- **Antiquariato & Modernariato**
- **Mobili & Arredamento** 
- **Arte & Collezionabili**
- **Elettronica & Hi-Fi**
- **Moda & Accessori**
- **Strumenti Musicali**
- **Libri & Vinili**
- **Orologi & Gioielli**
- **Utensili & Attrezzature**

## 📱 Piattaforme di Vendita

SellSnap prepara automaticamente i campi per:
- **Vinted** - Moda e accessori
- **eBay** - Marketplace generale
- **Subito.it** - Mercato locale italiano

## 🔒 Sicurezza

- Controlli anti-contraffazione
- Rilevamento oggetti vietati/pericolosi  
- Validazione dati AI per prevenire allucinazioni
- Gestione sicura delle API keys

## 🤝 Contribuire

Contributi benvenuti! Apri una issue per segnalare bug o proporre nuove funzionalità.

## 📄 Licenza

Questo progetto è sotto licenza MIT.
