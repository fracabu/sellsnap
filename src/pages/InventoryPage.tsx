import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InventoryItem, getUserInventory, deleteInventoryItem, toggleForSaleStatus } from '../services/inventoryService';
import { onAuthChange, logOut, type AuthUser } from '../services/authService';

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      if (!user) {
        navigate('/login');
      } else {
        loadInventory(user.uid);
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const loadInventory = async (userId: string) => {
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

  const handleToggleForSale = async (itemId: string, currentStatus: boolean) => {
    try {
      await toggleForSaleStatus(itemId, !currentStatus);
      setInventory(inventory.map(item => 
        item.id === itemId ? { ...item, isForSale: !currentStatus } : item
      ));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-gray-600">Caricamento inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-base-200/90 backdrop-blur-md border-b border-base-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo con icona */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">
                  SellSnap
                </h1>
              </Link>
              <span className="text-text-secondary">/ Inventario</span>
            </div>
            
            {/* Navigation Menu */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-text-secondary">Ciao, {user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto pt-24 pb-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Il Mio Inventario</h1>
            <p className="mt-2 text-gray-600">Gestisci tutte le tue perizie salvate</p>
          </div>

          {/* Card delle statistiche */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Totale Oggetti</dt>
                      <dd className="text-2xl font-bold text-gray-900">{inventory.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Valore Stimato</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        €{inventory.reduce((sum, item) => sum + (item.priceSuggested || 0), 0).toLocaleString('it-IT')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">In Vendita</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {inventory.length > 0 
                          ? `${Math.round((inventory.filter(item => item.isForSale).length / inventory.length) * 100)}%`
                          : '0%'
                        }
                      </dd>
                      <dd className="text-xs text-gray-400 mt-1">
                        {inventory.filter(item => item.isForSale).length} di {inventory.length} oggetti
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8-4-8 4m16 0v18l-8 4-8-4V7m16 18l-8 4-8-4M28 21V3l8 4v18l-8 4-8-4V7l8-4z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Il tuo inventario è vuoto</h3>
              <p className="mt-2 text-gray-500">
                Inizia a salvare le tue perizie per vederle qui
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                  Crea la tua prima perizia
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {inventory.map((item) => (
                <div key={item.id} className="bg-white overflow-hidden shadow-lg rounded-lg border">
                  <div className="px-6 py-6">
                    {/* Header della card */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {item.category}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            {item.condition}
                          </span>
                          {item.brand && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              {item.brand}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Toggle stato in vendita */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleToggleForSale(item.id!, item.isForSale || false)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.isForSale ? 'bg-green-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.isForSale ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className="text-xs text-gray-500">
                          {item.isForSale ? 'In vendita' : 'Non in vendita'}
                        </span>
                        
                        <button
                          onClick={() => handleDelete(item.id!)}
                          className="text-red-400 hover:text-red-600 p-1"
                          title="Elimina"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Prezzo */}
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Prezzo stimato:</span>
                        <span className="text-2xl font-bold text-green-600">€{item.priceSuggested.toLocaleString('it-IT')}</span>
                      </div>
                      {item.size && (
                        <div className="mt-2 text-sm text-gray-600">
                          Taglia: <span className="font-medium">{item.size}</span>
                        </div>
                      )}
                    </div>

                    {/* Sezioni piattaforme */}
                    <div className="space-y-4">
                      {/* Vinted */}
                      <div className="border rounded-lg p-4 bg-pink-50">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-pink-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 9.2 9 10 5.16-.8 9-4.45 9-10V7l-10-5z"/>
                          </svg>
                          <h4 className="font-semibold text-pink-800">Vinted</h4>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Categoria:</span> {item.vintedCategory || 'Non specificata'}</p>
                          <p><span className="font-medium">Descrizione:</span></p>
                          <p className="text-gray-700 bg-white p-2 rounded text-xs leading-relaxed">
                            {item.vintedDescription || 'Descrizione non disponibile'}
                          </p>
                        </div>
                      </div>

                      {/* Subito */}
                      <div className="border rounded-lg p-4 bg-orange-50">
                        <div className="flex items-center mb-2">
                          <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                          </svg>
                          <h4 className="font-semibold text-orange-800">Subito.it</h4>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Categoria:</span> {item.subitoCategory || 'Non specificata'}</p>
                          <p><span className="font-medium">Descrizione:</span></p>
                          <p className="text-gray-700 bg-white p-2 rounded text-xs leading-relaxed">
                            {item.subitoDescription || 'Descrizione non disponibile'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer con info aggiuntive */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Salvato il {formatDate(item.savedAt)}</span>
                        {item.notes && (
                          <span className="truncate ml-4">Note: {item.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};