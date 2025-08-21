import React, { useState, useCallback, useEffect } from 'react';
import { getUniversalAppraisal, getFollowUpAnswer, hasApiKey, setApiKey, validateApiKey } from './services/geminiService';
import type { AppraisalResult, ChatMessage } from './types';
import { Loader } from './components/Loader';
import { UploadIcon, ResetIcon } from './components/icons';
import { ResultCard } from './components/ResultCard';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AnimatedSection } from './components/AnimatedSection';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ApiKeyForm } from './components/ApiKeyForm';
import { PushButton } from './components/PushButton';

type ProcessState = 'idle' | 'processing' | 'error';

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const dataUrlToGenerativePart = (dataUrl: string) => {
    return {
        inlineData: {
            data: dataUrl.split(',')[1],
            mimeType: dataUrl.match(/:(.*?);/)![1],
        },
    };
};

const App: React.FC = () => {
  const [results, setResults] = useState<AppraisalResult[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [canUpload, setCanUpload] = useState(false);

  useEffect(() => {
    // Controlla se l'API key è configurata all'avvio
    setCanUpload(hasApiKey());
  }, []);

  const handleApiKeySubmit = async (apiKey: string) => {
    setIsValidatingKey(true);
    try {
      const isValid = await validateApiKey(apiKey);
      if (isValid) {
        setApiKey(apiKey);
        setShowApiKeyModal(false);
        setError('');
      } else {
        setError('Chiave API non valida. Controlla che sia corretta e riprova.');
      }
    } catch (error) {
      setError('Errore durante la validazione della chiave API. Riprova.');
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleApiKeyModalClose = () => {
    if (hasApiKey()) {
      setShowApiKeyModal(false);
    }
  };

  const handleApiKeyValid = () => {
    setCanUpload(true);
  };

  const handleReset = useCallback(() => {
    setResults([]);
    setCurrentImages([]);
    setError('');
    setProcessState('idle');
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setError('');
      setProcessState('idle');

      const imageUrls: string[] = [];
      for (let i = 0; i < Math.min(files.length, 5); i++) { // Massimo 5 foto
        const dataUrl = await fileToDataUrl(files[i]);
        imageUrls.push(dataUrl);
      }
      setCurrentImages(imageUrls);
    }
  };

  const handleStartAnalysis = async () => {
    if (currentImages.length > 0) {
      await processImages(currentImages);
    }
  };

  const processImages = async (imageUrls: string[]) => {
    try {
      setProcessState('processing');
      
      // Controlla se l'API key è configurata
      if (!hasApiKey()) {
        setError('Configura prima la tua chiave API di Google Gemini nella colonna di sinistra.');
        setProcessState('error');
        return;
      }

      const imageParts = imageUrls.map(url => dataUrlToGenerativePart(url));

      const { appraisalData, sources } = await getUniversalAppraisal(imageParts);

      const newResult: AppraisalResult = {
        id: new Date().toISOString() + Math.random(),
        imageUrl: imageUrls[0], // Usa la prima immagine come principale
        images: imageUrls, // Aggiungi tutte le immagini
        appraisalData,
        sources,
        chat: { history: [], isLoading: false },
      };
      setResults(prev => [newResult, ...prev]);
      
      setProcessState('idle');
      setCurrentImages([]);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Si è verificato un errore imprevisto. Riprova.';
      setError(errorMessage);
      setProcessState('error');
    }
  };
  
  const handleSendMessage = async (resultId: string, message: string) => {
    const currentResult = results.find(res => res.id === resultId);
    if (!currentResult || !currentResult.chat) return;

    const newHistory: ChatMessage[] = [
        ...currentResult.chat.history,
        { role: 'user', content: message }
    ];

    setResults(prev => prev.map(res => 
      res.id === resultId ? { ...res, chat: { ...res.chat!, history: newHistory, isLoading: true } } : res
    ));

    try {
        const { text, sources } = await getFollowUpAnswer(currentResult.appraisalData, newHistory);

        setResults(prev => prev.map(res => {
            if (res.id === resultId) {
                const finalHistory: ChatMessage[] = [
                    ...(res.chat?.history ?? []),
                    { role: 'model', content: text, sources: sources }
                ];
                return { ...res, chat: { history: finalHistory, isLoading: false } };
            }
            return res;
        }));

    } catch (err) {
        console.error(err);
        setResults(prev => prev.map(res => {
             if (res.id === resultId) {
                const errorHistory: ChatMessage[] = [
                    ...(res.chat?.history ?? []),
                    { role: 'model', content: "Spiacente, si è verificato un errore. Non sono riuscito a rispondere." }
                ];
                return { ...res, chat: { history: errorHistory, isLoading: false } };
            }
            return res;
        }));
    }
};

  return (
    <div className="h-full text-text-primary font-sans flex flex-col overflow-hidden relative pt-20">
      
      <Header />
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: `url("/bg.png")`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{paddingTop: '100px'}}>
          <AnimatedSection animation="fadeUp" delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300 mb-6 leading-tight">
              Scatta, Valuta, Vendi.<br className="sm:hidden" /> In un attimo.
            </h1>
          </AnimatedSection>
          
          <AnimatedSection animation="fadeUp" delay={400}>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              Una foto, una valutazione AI istantanea. <span className="text-orange-400 font-semibold">Gemini</span> crea annunci ottimizzati per tutti i marketplace.
            </p>
          </AnimatedSection>
          
          <AnimatedSection animation="fadeUp" delay={600}>
            <div className="flex justify-center px-4">
              <PushButton 
                onClick={() => document.getElementById('come-funziona')?.scrollIntoView({ behavior: 'smooth' })}
                variant="purple"
                className="text-lg font-semibold px-8 py-4"
              >
                Scopri Come Funziona
              </PushButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Come Funziona Section */}
      <section id="come-funziona" className="h-screen bg-base-200/50 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{paddingTop: '100px'}}>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto justify-items-center">
            <AnimatedSection animation="fadeUp" delay={200}>
              <div className="text-center p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">1. Scatta</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">Fotografa il tuo oggetto con lo smartphone o carica un'immagine esistente</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={400}>
              <div className="text-center p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">2. Analizza</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">L'AI analizza categoria, condizione e stima il prezzo di mercato</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeUp" delay={600}>
              <div className="text-center p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">3. Vendi</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">Ricevi campi pre-compilati per Vinted, eBay e Subito pronti all'uso</p>
              </div>
            </AnimatedSection>
          </div>
          
          <AnimatedSection animation="fadeUp" delay={800}>
            <div className="text-center mt-12">
              <PushButton 
                onClick={() => document.getElementById('carica-foto')?.scrollIntoView({ behavior: 'smooth' })}
                variant="purple"
                className="text-lg font-semibold px-8 py-4"
              >
                Prova Gratis
              </PushButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Upload Section */}
      <section id="carica-foto" className="min-h-screen flex items-center justify-center py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{paddingTop: '60px'}}>
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
              {/* Colonna sinistra - API Key Form */}
              <AnimatedSection animation="slideLeft" delay={200} className="h-full">
                <ApiKeyForm onApiKeyValid={handleApiKeyValid} className="h-full" />
              </AnimatedSection>
              
              {/* Colonna destra - Upload Form */}
              <AnimatedSection animation="slideRight" delay={400} className="h-full">
                <div className={`bg-base-200 rounded-2xl p-4 flex flex-col h-full ${!canUpload ? 'opacity-50' : ''}`}>
                  <div className="mb-4">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${canUpload ? 'bg-gradient-to-br from-purple-600 to-purple-500' : 'bg-gray-400'}`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">
                          2. Carica Foto
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {canUpload ? 'Ora puoi caricare la foto del tuo oggetto' : 'Prima configura la tua API key'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {currentImages.length > 0 ? (
                    <div className="w-full h-48 max-h-48 border-2 border-dashed rounded-lg bg-base-100 overflow-hidden mb-4 border-base-300 p-2">
                      <div className="w-full h-full flex gap-2">
                        {currentImages.slice(0, 3).map((imageUrl, index) => (
                          <div key={index} className="flex-1 h-full relative">
                            <img src={imageUrl} alt={`Oggetto ${index + 1}`} className="w-full h-full object-contain rounded" />
                            {currentImages.length > 3 && index === 2 && (
                              <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                                <span className="text-white font-semibold">+{currentImages.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center mb-4">
                      <UploadIcon className={`w-12 h-12 mx-auto mb-4 ${canUpload ? 'text-purple-500' : 'text-gray-400'}`} />
                      <h4 className="text-base font-semibold mb-2">
                        {canUpload ? 'Carica le foto del tuo oggetto' : 'Configura prima l\'API key'}
                      </h4>
                      <p className="text-sm mb-4 text-text-secondary">
                        {canUpload ? 'Scegli come vuoi aggiungere le immagini' : 'Inserisci la tua chiave API nella colonna di sinistra'}
                      </p>
                      {canUpload && (
                        <>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                            <PushButton
                              onClick={() => document.getElementById('camera-input')?.click()}
                              variant="purple"
                              className="flex items-center gap-2 px-4 py-3 text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Scatta Foto
                            </PushButton>
                            <PushButton
                              onClick={() => document.getElementById('gallery-input')?.click()}
                              variant="orange"
                              className="flex items-center gap-2 px-4 py-3 text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Dalla Galleria
                            </PushButton>
                          </div>
                          <p className="text-xs text-text-secondary/70">Massimo 5 foto • JPG, PNG, WebP</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Input nascosti per camera e galleria */}
                  <input
                    id="camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={processState === 'processing' || !canUpload}
                  />
                  <input
                    id="gallery-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={processState === 'processing' || !canUpload}
                  />
                  
                  {/* Progress Bar - Inside the panel */}
                  {processState === 'processing' && (
                    <div className="bg-base-300 p-3 rounded-lg shadow-sm border border-base-300 mb-4">
                      <div className="text-center mb-2">
                        <p className="text-xs font-medium text-text-primary mb-1">Analisi AI in corso...</p>
                      </div>
                      <div className="w-full bg-base-100 rounded-full h-1.5 mb-2">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full animate-pulse" 
                             style={{ width: '60%' }}>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <Loader className="w-3 h-3 text-purple-500" />
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {processState === 'error' && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg text-center mb-4">
                      <p className="text-xs font-medium mb-1">Errore: {error}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    {currentImages.length > 0 && processState === 'idle' && (
                      <PushButton
                        onClick={handleStartAnalysis}
                        variant="purple"
                        className="flex items-center gap-2 px-4 py-2 font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Analizza {currentImages.length} foto
                      </PushButton>
                    )}
                    <PushButton
                      onClick={handleReset}
                      disabled={results.length === 0 && processState === 'idle' && currentImages.length === 0}
                      variant="red"
                      className="flex items-center gap-2 px-4 py-2 font-medium text-sm"
                    >
                      <ResetIcon className="w-4 h-4" />
                      Reset
                    </PushButton>
                  </div>

                  {/* Freccia animata quando analisi completata */}
                  {results.length > 0 && (
                    <div className="flex flex-col items-center mt-6">
                      <p className="text-text-secondary text-sm mb-2">La tua perizia è pronta!</p>
                      <div className="animate-bounce">
                        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

        {/* Results Section */}
        {results.length > 0 && (
          <section className="py-20 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6 max-w-7xl mx-auto overflow-hidden">
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} onSendMessage={handleSendMessage} />
                ))}
              </div>
            </div>
          </section>
        )}

        <Footer />
    </div>
  );
};


interface StatusDisplayProps {
  processState: ProcessState;
  error: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ processState, error }) => {
  if (processState === 'error') {
    return (
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg w-full text-center">
            <h3 className="font-bold text-lg">Errore di Perizia</h3>
            <p className="mt-1">{error}</p>
        </div>
    );
  }

  if (processState === 'processing') {
    return (
        <div className="text-center">
            <Loader className="mx-auto h-10 w-10" />
            <p className="text-text-secondary mt-4 italic text-lg">
                Eseguo la perizia multidisciplinare... <br/> Potrebbe richiedere qualche secondo.
            </p>
        </div>
    );
  }
  
  return (
    <p className="text-text-secondary italic text-center px-6 text-lg">
      I dettagli della perizia appariranno qui una volta completata l'analisi.
    </p>
  );
};

export default App;