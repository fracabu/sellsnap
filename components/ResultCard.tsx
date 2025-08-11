import React, { useState } from 'react';
import type { AppraisalResult, PlatformFields, EbayPlatform, SubitoPlatform, VintedPlatform } from '../types';
import { ShareIcon, WarningIcon } from './icons';
import { ChatInterface } from './ChatInterface';

interface ResultCardProps {
    result: AppraisalResult;
    onSendMessage: (resultId: string, message: string) => void;
}

const DetailItem: React.FC<{ label: string, value: React.ReactNode }> = ({ label, value }) => {
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === '') return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <div>
            <dt className="text-sm font-medium text-text-secondary uppercase tracking-wider">{label}</dt>
            <dd className="font-semibold text-text-primary text-base">{displayValue}</dd>
        </div>
    );
};

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
    <div className={`pt-4 mt-4 ${className}`}>
        <h4 className="font-bold text-text-primary mb-3 text-xl">{title}</h4>
        <div className="space-y-3 text-base text-text-secondary">{children}</div>
    </div>
);

const PlatformDetails: React.FC<{ data: VintedPlatform | EbayPlatform | SubitoPlatform | null | undefined }> = ({ data }) => {
    if (!data) return <p className="text-text-secondary">Dati non disponibili.</p>;
    
    return (
        <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => {
                if (value === null || value === undefined) return null;

                if (typeof value === 'object' && value !== null) {
                    return (
                        <div key={key}>
                            <p className="font-semibold capitalize text-text-primary">{key.replace(/_/g, ' ')}:</p>
                            <div className="pl-4 mt-2 space-y-2 border-l border-base-300">
                                {Object.entries(value).map(([subKey, subValue]) => (
                                    <DetailItem key={subKey} label={subKey.replace(/_/g, ' ')} value={subValue as string} />
                                ))}
                            </div>
                        </div>
                    );
                }
                return <DetailItem key={key} label={key.replace(/_/g, ' ')} value={value as string} />;
            })}
        </div>
    );
};


type TabType = 'overview' | 'details' | 'selling' | 'analysis';

export const ResultCard: React.FC<ResultCardProps> = ({ result, onSendMessage }) => {
    const { appraisalData, imageUrl } = result;
    const [activeTab, setActiveTab] = useState<keyof PlatformFields>('vinted');
    const [activeMainTab, setActiveMainTab] = useState<TabType>('overview');
    const [isChatOpen, setChatOpen] = useState(false);

    const handleShare = async () => {
        const shareText = `Perizia per: ${appraisalData.title}\nPrezzo suggerito: ${appraisalData.pricing.list_price_suggested}€.\nCondizione: ${appraisalData.condition}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: `Perizia: ${appraisalData.title}`, text: shareText });
            } else {
                await navigator.clipboard.writeText(shareText);
                alert('Perizia copiata negli appunti!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
            alert('Impossibile condividere o copiare i risultati.');
        }
    };

    if (!appraisalData) return null;

    const { attributes, pricing, flags, description_bullets, category_specific, platform_fields, defects, photos_needed, missing_information } = appraisalData;

    const renderTabContent = () => {
        switch (activeMainTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {description_bullets && (
                            <div>
                                <h4 className="font-bold text-text-primary mb-3 text-xl">Descrizione Rapida</h4>
                                <ul className="list-disc list-inside space-y-1.5 text-base text-text-secondary">
                                    {description_bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                                </ul>
                            </div>
                        )}
                        
                        {attributes && (
                            <div>
                                <h4 className="font-bold text-text-primary mb-3 text-xl">Attributi Chiave</h4>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                    <DetailItem label="Marca" value={attributes.brand} />
                                    <DetailItem label="Epoca/Periodo" value={attributes.era_period} />
                                    <DetailItem label="Materiali" value={attributes.materials} />
                                    <DetailItem label="Colori" value={attributes.color} />
                                    <DetailItem label="Condizione" value={appraisalData.condition} />
                                    <DetailItem label="Dimensioni" value={attributes.dimensions} />
                                </dl>
                            </div>
                        )}

                        {defects && defects.length > 0 && (
                            <div>
                                <h4 className="font-bold text-text-primary mb-3 text-xl">Difetti Notati</h4>
                                <ul className="list-disc list-inside space-y-1.5 text-base text-text-secondary">
                                    {defects.map((defect, i) => <li key={i}>{defect}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                );

            case 'details':
                return (
                    <div className="space-y-6">
                        {category_specific && Object.values(category_specific).some(v => v !== undefined) && (
                            <div>
                                <h4 className="font-bold text-text-primary mb-3 text-xl">Dettagli Specifici</h4>
                                {Object.entries(category_specific).map(([cat, details]) => 
                                    details && (
                                    <div key={cat} className="mb-6">
                                        <h5 className="font-semibold text-text-primary capitalize text-base mb-2">{cat.replace(/_/g, ' ')}</h5>
                                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pl-2 border-l-2 border-base-300">
                                            {Object.entries(details).map(([key, value]) => (
                                                <DetailItem key={`${cat}-${key}`} label={key.replace(/_/g, ' ')} value={value as string} />
                                            ))}
                                        </dl>
                                    </div>
                                    )
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {photos_needed && photos_needed.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-text-primary mb-3 text-xl">Foto Consigliate</h4>
                                    <ul className="list-disc list-inside space-y-1.5 text-base text-text-secondary">
                                        {photos_needed.map((photo, i) => <li key={i}>{photo}</li>)}
                                    </ul>
                                </div>
                            )}
                            
                            {missing_information && missing_information.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-text-primary mb-3 text-xl">Info Mancanti</h4>
                                    <ul className="list-disc list-inside space-y-1.5 text-base text-text-secondary">
                                        {missing_information.map((info, i) => <li key={i}>{info}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'selling':
                return (
                    <div className="space-y-6">
                        {platform_fields && (
                            <div>
                                <h4 className="font-bold text-text-primary mb-3 text-xl">Pronto per la Vendita</h4>
                                <div className="w-full bg-base-300/40 p-4 rounded-lg">
                                    <div className="flex border-b border-base-300 mb-4">
                                        {Object.keys(platform_fields).map((pf) => (
                                            <button
                                                key={pf}
                                                onClick={() => setActiveTab(pf as keyof PlatformFields)}
                                                className={`capitalize px-4 py-2 text-base font-semibold transition-colors duration-200 -mb-px ${activeTab === pf ? 'border-b-2 border-brand-secondary text-brand-secondary' : 'text-text-secondary hover:text-text-primary'}`}
                                            >
                                                {pf}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="text-sm">
                                        <PlatformDetails data={platform_fields[activeTab]} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'analysis':
                return (
                    <div className="space-y-6">
                        {pricing && (
                            <div>
                                <h4 className="font-bold text-text-primary mb-3 text-xl">Analisi del Prezzo</h4>
                                <div className="space-y-4 text-text-secondary">
                                    <p>{pricing.reasoning}</p>
                                    {pricing.comparables && pricing.comparables.length > 0 && (
                                        <div>
                                            <h5 className="font-semibold text-text-primary text-base mb-2">Annunci Simili Verificati:</h5>
                                            <ul className="list-disc list-inside space-y-1.5 text-sm">
                                                {pricing.comparables.map((comp, index) => (
                                                    <li key={index}>
                                                        <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-brand-light hover:text-brand-secondary underline">
                                                            {comp.title} ({comp.price} {comp.currency})
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    const mainTabs = [
        { id: 'overview', label: 'Panoramica', icon: '📋' },
        { id: 'details', label: 'Dettagli', icon: '🔍' },
        { id: 'selling', label: 'Vendita', icon: '💰' },
        { id: 'analysis', label: 'Analisi', icon: '📊' }
    ] as const;

    return (
        <div className="bg-base-200 rounded-2xl shadow-lg border border-base-300 overflow-hidden flex flex-col">
            <div className="p-6 lg:p-8">
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column - Image and Key Info */}
                    <div className="lg:col-span-2">
                        <img src={imageUrl} alt={appraisalData.title} className="w-full rounded-lg shadow-md aspect-square object-cover mb-6" />
                        {pricing && (
                            <p className="text-4xl font-bold text-brand-secondary mb-2">
                                {pricing.list_price_suggested} €
                                <span className="text-lg font-normal text-text-secondary ml-3">
                                    ({pricing.range_min} - {pricing.range_max} €)
                                </span>
                            </p>
                        )}
                        <h3 className="text-2xl font-bold text-text-primary">{appraisalData.title}</h3>
                        <p className="text-lg text-text-secondary capitalize">{appraisalData.category} - {appraisalData.subcategory}</p>

                        {flags && (flags.restricted || flags.counterfeit_risk) && (
                            <div className="mt-4 p-3 rounded-lg bg-yellow-900/50 border border-yellow-700 text-yellow-200">
                                <div className="flex items-start gap-3">
                                    <WarningIcon className="w-6 h-6 mt-0.5 text-yellow-400 flex-shrink-0"/>
                                    <div>
                                        <h4 className="font-bold text-base">Attenzione</h4>
                                        <p className="text-sm">{flags.notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Right Column - Tabbed Content */}
                    <div className="lg:col-span-3">
                        {/* Tab Navigation */}
                        <div className="flex border-b border-base-300 mb-6 overflow-x-auto">
                            {mainTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveMainTab(tab.id as TabType)}
                                    className={`flex items-center gap-2 px-4 py-3 text-base font-semibold transition-colors duration-200 -mb-px whitespace-nowrap ${
                                        activeMainTab === tab.id 
                                            ? 'border-b-2 border-brand-secondary text-brand-secondary' 
                                            : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[400px]">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>

                 <div className="mt-8 pt-6 border-t border-base-300">
                    <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                        <button
                            onClick={() => setChatOpen(!isChatOpen)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-base-300 hover:bg-base-100 text-text-primary font-semibold rounded-lg transition-colors duration-300 text-sm"
                        >
                            {isChatOpen ? 'Chiudi Chat' : 'Approfondisci con AI'}
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-secondary hover:bg-brand-primary text-white font-semibold rounded-lg transition-colors duration-300 text-sm"
                        >
                            <ShareIcon className="w-4 h-4" />
                            Condividi
                        </button>
                    </div>
                </div>
            </div>
            {isChatOpen && result.chat && (
                <div className="border-t border-base-300 bg-base-100/50">
                    <ChatInterface 
                        history={result.chat.history}
                        isLoading={result.chat.isLoading}
                        onSendMessage={(message) => onSendMessage(result.id, message)}
                    />
                </div>
            )}
        </div>
    );
};