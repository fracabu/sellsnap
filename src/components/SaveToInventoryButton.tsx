import React, { useState } from 'react';
import { AppraisalResult } from '../types';
import { saveAppraisalToInventory } from '../services/inventoryService';

interface SaveToInventoryButtonProps {
  appraisal: AppraisalResult;
  userId: string;
  onSaved?: () => void;
}

export const SaveToInventoryButton: React.FC<SaveToInventoryButtonProps> = ({ 
  appraisal, 
  userId, 
  onSaved 
}) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAppraisalToInventory(userId, appraisal, notes);
      setSaved(true);
      setShowNotes(false);
      setNotes('');
      onSaved?.();
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Errore nel salvare la perizia:', error);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex items-center text-green-600 text-sm">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Salvato nell'inventario
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!showNotes ? (
        <button
          onClick={() => setShowNotes(true)}
          disabled={saving}
          className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>Salva in inventario</span>
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aggiungi note (opzionale)..."
            className="w-full px-2 py-1 text-sm border rounded resize-none text-black bg-white border-gray-300"
            rows={2}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salva'}
            </button>
            <button
              onClick={() => setShowNotes(false)}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Annulla
            </button>
          </div>
        </div>
      )}
    </div>
  );
};