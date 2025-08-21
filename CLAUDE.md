# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
- Set `GEMINI_API_KEY` in `.env.local` with your Gemini API key
- Run `npm install` to install dependencies

### Common Commands
- `npm run dev` - Start development server (Vite dev server on port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Application Architecture

SellSnap is a React/TypeScript application that provides AI-powered appraisals for second-hand items using Google's Gemini API.

### Core Structure
- **App.tsx** - Main application component with state management, image processing, and UI sections (hero, upload, results)
- **services/geminiService.ts** - Handles Gemini AI API calls for appraisals and follow-up questions
- **types.ts** - Comprehensive TypeScript interfaces for the entire appraisal system
- **components/** - UI components (ChatInterface, ResultCard, Loader, Header, Footer, ApiKeyModal, AnimatedSection, PushButton, icons)
- **hooks/** - Custom React hooks (useScrollAnimation.ts)

### Key Features
1. **Image Upload & Analysis** - Users upload photos (up to 5) of items for AI analysis with base64 conversion
2. **Universal Appraisal System** - Structured JSON output covering multiple item categories (antiques, electronics, fashion, art, etc.)
3. **Chat Interface** - Follow-up Q&A functionality for each appraisal with conversation history
4. **Platform Integration** - Pre-formatted data for Vinted, eBay, and Subito marketplaces
5. **Multi-language Interface** - Italian UI with comprehensive appraisal categories
6. **API Key Management** - localStorage-based API key storage with validation modal

### AI Integration Architecture
- Uses Google Gemini 2.5 Flash model (`@google/genai` package) with web search capabilities
- Implements anti-hallucination filtering for price comparisons (validates URLs against grounding metadata)
- Structured prompting with comprehensive Italian prompt for consistent JSON output format
- Grounding metadata extraction for source citations
- Two main functions: `getUniversalAppraisal()` and `getFollowUpAnswer()`

### Data Flow
1. Image file → base64 conversion → `dataUrlToGenerativePart()` transformation
2. Structured prompt + image → Gemini API with web search enabled
3. JSON response parsed and validated with error handling for malformed responses
4. Results stored in React state (`AppraisalResult[]`) with chat capability
5. Follow-up questions use conversation history + original appraisal data via chat interface

### State Management
- React hooks-based state management in App.tsx
- Main states: `results`, `currentImages` (array), `error`, `processState`, `showApiKeyModal`, `canUpload`
- Process states: `idle`, `processing`, `error`
- Chat state embedded in each `AppraisalResult` object with `history` and `isLoading`

### Configuration
- Vite build system with environment variable injection (`GEMINI_API_KEY`)
- Path aliases (`@/*` maps to root directory)
- TypeScript with JSX support and bundler module resolution
- No test framework currently configured

### Error Handling
- JSON parsing fallback for markdown-wrapped responses in geminiService.ts
- Network error handling with user-friendly Italian messages
- API key validation at service initialization with `validateApiKey()` function
- Image processing error handling with FileReader API
- Anti-hallucination filtering validates URLs against grounding metadata to prevent fake comparables

### UI Architecture
- Landing page with hero section, "Come Funziona" section, and upload interface
- Responsive design with grid layouts and animated sections
- API Key form in left column, upload interface in right column
- Results displayed as cards with chat interface for follow-up questions
- Custom button components (PushButton) and loading states