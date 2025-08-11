import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon } from './icons';
import { Loader } from './Loader';

interface ChatInterfaceProps {
    history: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, isLoading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="h-48 max-h-48 overflow-y-auto pr-2 space-y-3 mb-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm lg:max-w-lg p-3 rounded-lg text-sm ${
                            msg.role === 'user' 
                                ? 'bg-brand-secondary text-white' 
                                : 'bg-base-300 text-text-primary'
                        }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 border-t border-base-100/50 pt-2">
                                    <h5 className="text-xs font-bold text-text-secondary mb-1">Fonti:</h5>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        {msg.sources.map((source, i) => (
                                            <li key={i}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-light hover:text-brand-secondary underline break-all">
                                                    {source.web.title || source.web.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-sm lg:max-w-lg p-3 rounded-lg bg-base-300 text-text-primary">
                            <Loader className="w-4 h-4" />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-2xl mx-auto">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Fai una domanda..."
                    disabled={isLoading}
                    className="flex-grow bg-base-300 border border-base-300/50 text-text-primary text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block w-full p-2.5"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 text-white bg-brand-secondary hover:bg-brand-primary rounded-lg disabled:bg-base-300 disabled:cursor-not-allowed transition-colors"
                    aria-label="Invia messaggio"
                >
                    <SendIcon className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};