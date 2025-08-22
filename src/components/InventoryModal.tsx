import React, { useState, useEffect } from 'react';
import { InventoryItem, getUserInventory, deleteInventoryItem } from '../services/inventoryService';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, userId }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && userId) {
      loadInventory();
    }
  }, [isOpen, userId]);

  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await getUserInventory(userId);
      setInventory(items);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa perizia dall\'inventario?')) {
      try {
        await deleteInventoryItem(itemId);
        setInventory(inventory.filter(item => item.id !== itemId));
      } catch (error: any) {
        setError(error.message);
      }
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Data non disponibile';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-gray-900 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Il Mio Inventario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Caricamento inventario...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && inventory.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Il tuo inventario è vuoto</p>
            <p className="text-sm text-gray-400 mt-2">
              Salva le tue perizie per vederle qui
            </p>
          </div>
        )}

        <div className="grid gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Salvato il {formatDate(item.savedAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id!)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                >
                  Elimina
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Categoria:</p>
                  <p className="text-sm text-gray-700 mb-2">
                    {item.category}
                  </p>
                  
                  <p className="text-sm font-medium">Condizione:</p>
                  <p className="text-sm text-gray-700 mb-2">
                    {item.condition}
                  </p>
                  
                  {item.brand && (
                    <>
                      <p className="text-sm font-medium">Marca:</p>
                      <p className="text-sm text-gray-700 mb-2">
                        {item.brand}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">Prezzo Suggerito:</p>
                  <p className="text-lg font-bold text-green-600 mb-2">
                    €{item.priceSuggested}
                  </p>

                  {item.notes && (
                    <>
                      <p className="text-sm font-medium">Note:</p>
                      <p className="text-sm text-gray-700">
                        {item.notes}
                      </p>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};