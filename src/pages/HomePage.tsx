import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUniversalAppraisal, getFollowUpAnswer, hasApiKey, setApiKey, validateApiKey } from '../../services/geminiService';
import type { AppraisalResult, ChatMessage } from '../../types';
import { calculateMultipleImagesHash } from '../utils/imageHash';
import { checkDuplicateByImageHash, saveAppraisalToInventory, updateExistingAppraisal } from '../services/inventoryService';
import { Loader } from '../../components/Loader';
import { UploadIcon, ResetIcon } from '../../components/icons';
import { ResultCard } from '../../components/ResultCard';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { AnimatedSection } from '../../components/AnimatedSection';
import { ApiKeyModal } from '../../components/ApiKeyModal';
import { ApiKeyForm } from '../../components/ApiKeyForm';
import { PushButton } from '../../components/PushButton';
import { SaveToInventoryButton } from '../components/SaveToInventoryButton';
import { onAuthChange, logOut, type AuthUser } from '../services/authService';

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

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [results, setResults] = useState<AppraisalResult[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [canUpload, setCanUpload] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    isDuplicate: boolean;
    existingItem?: any;
    imageHash?: string;
  }>({ isDuplicate: false });
  const navigate = useNavigate();

  useEffect(() => {
    setCanUpload(hasApiKey());
    
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

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
    setCurrentFiles([]);
    setError('');
    setProcessState('idle');
    setDuplicateInfo({ isDuplicate: false });
    
    // Pulisci tutti gli input file
    const fileInputs = [
      document.getElementById('file-upload'),
      document.getElementById('camera-input'),
      document.getElementById('gallery-input')
    ] as HTMLInputElement[];
    
    fileInputs.forEach(input => {
      if (input) {
        input.value = '';
      }
    });
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setError('');
      setProcessState('idle');
      setDuplicateInfo({ isDuplicate: false });

      const selectedFiles = Array.from(files).slice(0, 5);
      setCurrentFiles(selectedFiles);

      const imageUrls: string[] = [];
      for (const file of selectedFiles) {
        const dataUrl = await fileToDataUrl(file);
        imageUrls.push(dataUrl);
      }
      setCurrentImages(imageUrls);

      // Controlla per duplicati se l'utente è loggato
      if (user) {
        try {
          const imageHash = await calculateMultipleImagesHash(selectedFiles);
          const existingItem = await checkDuplicateByImageHash(user.uid, imageHash);
          
          if (existingItem) {
            setDuplicateInfo({
              isDuplicate: true,
              existingItem,
              imageHash
            });
          }
        } catch (error) {
          console.warn('Errore nel controllo duplicati:', error);
        }
      }
    }
  };

  const handleStartAnalysis = async () => {
    if (currentImages.length > 0) {
      await processImages(currentImages, currentFiles);
    }
  };

  const processImages = async (imageUrls: string[], files: File[]) => {
    try {
      setProcessState('processing');
      
      if (!hasApiKey()) {
        setError('Configura prima la tua chiave API di Google Gemini nella colonna di sinistra.');
        setProcessState('error');
        return;
      }

      // Calcola hash delle immagini
      const imageHash = await calculateMultipleImagesHash(files);
      
      // Se è un duplicato e l'utente è loggato, mostra opzioni all'utente
      if (duplicateInfo.isDuplicate && duplicateInfo.existingItem && user) {
        // Per i duplicati, forza sempre una nuova valutazione per aggiornare i prezzi
        const imageParts = imageUrls.map(url => dataUrlToGenerativePart(url));
        const { appraisalData, sources, fromCache } = await getUniversalAppraisal(imageParts); // Rimuovi imageHash per forzare nuova chiamata

        // Aggiorna prezzo nell'inventario se diverso
        if (appraisalData.pricing?.list_price_suggested !== duplicateInfo.existingItem.priceSuggested) {
          await updateExistingAppraisal(
            duplicateInfo.existingItem.id!,
            appraisalData.pricing?.list_price_suggested || 0,
            { appraisalData, sources } as AppraisalResult
          );
        }

        const result: AppraisalResult = {
          id: new Date().toISOString() + Math.random(),
          imageUrl: imageUrls[0],
          images: imageUrls,
          imageFiles: files,
          appraisalData,
          sources,
          chat: { history: [], isLoading: false },
          isDuplicateUpdate: true, // Flag per indicare che è un aggiornamento
        };

        setResults(prev => [result, ...prev]);
        setProcessState('idle');
        setCurrentImages([]);
        setCurrentFiles([]);
        setDuplicateInfo({ isDuplicate: false });
        
        return;
      }

      // Processo normale per nuove immagini
      const imageParts = imageUrls.map(url => dataUrlToGenerativePart(url));
      const { appraisalData, sources, fromCache } = await getUniversalAppraisal(imageParts, imageHash);

      const newResult: AppraisalResult = {
        id: new Date().toISOString() + Math.random(),
        imageUrl: imageUrls[0],
        images: imageUrls,
        imageFiles: files,
        appraisalData,
        sources,
        chat: { history: [], isLoading: false },
      };
      setResults(prev => [newResult, ...prev]);
      
      setProcessState('idle');
      setCurrentImages([]);
      setCurrentFiles([]);

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
    <div className="h-full bg-base-100 text-text-primary font-sans flex flex-col overflow-hidden relative pt-20">
      
      <Header />
      
      {/* Hero Section */}
      <section id="hero" className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: 'calc(100vh - 5rem)', scrollMarginTop: '5rem' }}>
        <div className="absolute inset-0 opacity-30"
             style={{
               backgroundImage: `url("/bg.png")`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeUp" delay={200}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300 mb-6 leading-tight">
              {t('hero.title')}
            </h1>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={400}>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              {t('hero.subtitle').split('<highlight>')[0]}
              <span className="text-orange-400 font-semibold">Gemini</span>
              {t('hero.subtitle').split('</highlight>')[1]}
            </p>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={600} options={{ rootMargin: '200px 0px 0px 0px', threshold: 0 }}>
            <div className="flex justify-center px-4">
              <PushButton
                onClick={() => scrollToSection('come-funziona')}
                variant="purple"
                className="text-lg font-semibold px-8 py-4"
              >
                {t('hero.cta')}
              </PushButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Come Funziona Section */}
      <section id="come-funziona" className="bg-base-200/50 flex items-center justify-center py-8" style={{ minHeight: 'calc(100vh - 5rem)', scrollMarginTop: '5rem' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto justify-items-center">
            <AnimatedSection animation="fadeUp" delay={200}>
              <div className="text-center p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">{t('howItWorks.step1Title')}</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{t('howItWorks.step1Desc')}</p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={400}>
              <div className="text-center p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">{t('howItWorks.step2Title')}</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{t('howItWorks.step2Desc')}</p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeUp" delay={600}>
              <div className="text-center p-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-transform duration-300 hover:scale-110">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">{t('howItWorks.step3Title')}</h3>
                <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{t('howItWorks.step3Desc')}</p>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection animation="fadeUp" delay={800}>
            <div className="text-center mt-12">
              <PushButton
                onClick={() => scrollToSection('carica-foto')}
                variant="purple"
                className="text-lg font-semibold px-8 py-4"
              >
                {t('howItWorks.cta')}
              </PushButton>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Upload Section */}
      <section id="carica-foto" className="flex items-center justify-center py-8" style={{ minHeight: 'calc(100vh - 5rem)', scrollMarginTop: '5rem' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* User Auth Section */}
          {user ? (
            <div className="flex justify-center mb-8">
              <div className="bg-base-200 rounded-lg px-6 py-4 flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium">{t('upload.welcome')}, {user.email}</p>
                </div>
                <button
                  onClick={() => navigate('/inventory')}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  {t('common.inventory')}
                </button>
                <button
                  onClick={() => logOut()}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                >
                  {t('common.logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-8">
              <button
                onClick={() => navigate('/login')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
              >
                {t('upload.loginToSave')}
              </button>
            </div>
          )}
          
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
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${canUpload ? 'bg-gradient-to-br from-purple-600 to-purple-500' : 'bg-text-tertiary'}`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">
                          {t('upload.stepTitle')}
                        </h3>
                        <p className="text-text-secondary text-sm">
                          {canUpload ? t('upload.stepDescEnabled') : t('upload.stepDescDisabled')}
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
                      <UploadIcon className={`w-12 h-12 mx-auto mb-4 ${canUpload ? 'text-purple-500' : 'text-text-tertiary'}`} />
                      <h4 className="text-base font-semibold mb-2">
                        {canUpload ? t('upload.uploadTitle') : t('upload.uploadTitleDisabled')}
                      </h4>
                      <p className="text-sm mb-4 text-text-secondary">
                        {canUpload ? t('upload.uploadDesc') : t('upload.uploadDescDisabled')}
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
                              {t('upload.takePhoto')}
                            </PushButton>
                            <PushButton
                              onClick={() => document.getElementById('gallery-input')?.click()}
                              variant="orange"
                              className="flex items-center gap-2 px-4 py-3 text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {t('upload.fromGallery')}
                            </PushButton>
                          </div>
                          <p className="text-xs text-text-secondary/70">{t('upload.maxPhotos')}</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Avviso Duplicato */}
                  {duplicateInfo.isDuplicate && duplicateInfo.existingItem && (
                    <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-600 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-orange-900 dark:text-orange-200 font-bold mb-1">{t('upload.duplicateTitle')}</h4>
                          <p className="text-orange-800 dark:text-orange-300 text-sm mb-2">
                            {t('upload.duplicateDesc')}
                          </p>
                          <div className="bg-base-100 border border-orange-200 dark:border-orange-600 rounded p-3 text-sm">
                            <p className="text-text-primary"><strong>{t('upload.duplicateTitle2')}</strong> {duplicateInfo.existingItem.title}</p>
                            <p className="text-text-primary"><strong>{t('upload.duplicatePrice')}</strong> €{duplicateInfo.existingItem.priceSuggested}</p>
                            <p className="text-text-primary"><strong>{t('upload.duplicateSavedAt')}</strong> {duplicateInfo.existingItem.savedAt?.toDate?.()?.toLocaleDateString(i18n.language) || t('common.dateNotAvailable')}</p>
                          </div>
                          <p className="text-orange-800 dark:text-orange-300 text-sm mt-2">
                            {t('upload.duplicateUpdateNote')}
                          </p>
                        </div>
                      </div>
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
                        <p className="text-xs font-medium text-text-primary mb-1">{t('upload.analyzing')}</p>
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
                        {t('upload.analyzePhotos', { count: currentImages.length })}
                      </PushButton>
                    )}
                    <PushButton
                      onClick={handleReset}
                      disabled={results.length === 0 && processState === 'idle' && currentImages.length === 0}
                      variant="red"
                      className="flex items-center gap-2 px-4 py-2 font-medium text-sm"
                    >
                      <ResetIcon className="w-4 h-4" />
                      {t('upload.reset')}
                    </PushButton>
                  </div>

                  {/* Freccia animata quando analisi completata */}
                  {results.length > 0 && (
                    <div className="flex flex-col items-center mt-6">
                      <p className="text-text-secondary text-sm mb-2">{t('upload.ready')}</p>
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
                <ResultCard key={result.id} result={result} onSendMessage={handleSendMessage} user={user} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};