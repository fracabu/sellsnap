import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { AppraisalResult } from '../types';

export interface InventoryItem {
  id?: string;
  userId: string;
  title: string;
  category: string;
  condition: string;
  priceSuggested: number;
  brand?: string;
  savedAt: Timestamp;
  notes?: string;
  isForSale?: boolean;
  vintedDescription?: string;
  subitoDescription?: string;
  vintedCategory?: string;
  subitoCategory?: string;
  size?: string;
  imageHash: string;
  lastAppraisalAt: Timestamp;
  priceHistory?: Array<{
    price: number;
    date: Timestamp;
  }>;
}

export const checkDuplicateByImageHash = async (
  userId: string,
  imageHash: string
): Promise<InventoryItem | null> => {
  try {
    const inventoryRef = collection(db, 'inventory');
    const q = query(
      inventoryRef,
      where('userId', '==', userId),
      where('imageHash', '==', imageHash)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as InventoryItem;
  } catch (error) {
    console.error('Errore nel controllo duplicati:', error);
    return null;
  }
};

export const updateExistingAppraisal = async (
  itemId: string,
  newPrice: number,
  appraisalData: AppraisalResult,
  notes?: string
): Promise<void> => {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    const currentItem = await getDocs(query(collection(db, 'inventory'), where('__name__', '==', itemId)));
    
    if (!currentItem.empty) {
      const currentData = currentItem.docs[0].data() as InventoryItem;
      const priceHistory = currentData.priceHistory || [];
      
      // Aggiungi il prezzo precedente alla cronologia se diverso
      if (currentData.priceSuggested !== newPrice) {
        priceHistory.push({
          price: currentData.priceSuggested,
          date: currentData.lastAppraisalAt
        });
      }
      
      await updateDoc(itemRef, {
        priceSuggested: newPrice,
        lastAppraisalAt: serverTimestamp(),
        priceHistory,
        title: appraisalData.appraisalData?.title || currentData.title,
        condition: appraisalData.appraisalData?.condition || currentData.condition,
        vintedDescription: appraisalData.appraisalData?.platform_fields?.vinted?.description || currentData.vintedDescription,
        subitoDescription: appraisalData.appraisalData?.platform_fields?.subito?.description || currentData.subitoDescription,
        notes: notes || currentData.notes
      });
    }
  } catch (error) {
    console.error('Errore nell\'aggiornare la valutazione esistente:', error);
    throw new Error('Impossibile aggiornare la valutazione esistente');
  }
};

export const saveAppraisalToInventory = async (
  userId: string, 
  appraisalData: AppraisalResult,
  imageHash: string,
  notes?: string
): Promise<string> => {
  try {
    const inventoryRef = collection(db, 'inventory');
    
    // Non salviamo l'immagine per evitare il limite di dimensione di Firestore
    // L'utente potrà sempre rifare l'analisi se serve l'immagine
    const docRef = await addDoc(inventoryRef, {
      userId,
      title: appraisalData.appraisalData?.title || 'Oggetto senza titolo',
      category: appraisalData.appraisalData?.category || 'Non categorizzato',
      condition: appraisalData.appraisalData?.condition || 'Non specificato',
      priceSuggested: appraisalData.appraisalData?.pricing?.list_price_suggested || 0,
      brand: appraisalData.appraisalData?.attributes?.brand || null,
      size: appraisalData.appraisalData?.attributes?.size || null,
      isForSale: false,
      vintedDescription: appraisalData.appraisalData?.platform_fields?.vinted?.description || '',
      subitoDescription: appraisalData.appraisalData?.platform_fields?.subito?.description || '',
      vintedCategory: appraisalData.appraisalData?.platform_fields?.vinted?.category || '',
      subitoCategory: appraisalData.appraisalData?.platform_fields?.subito?.category || '',
      imageHash,
      savedAt: serverTimestamp(),
      lastAppraisalAt: serverTimestamp(),
      priceHistory: [],
      notes: notes || null
    });
    return docRef.id;
  } catch (error) {
    console.error('Errore nel salvare la perizia nell\'inventario:', error);
    throw new Error('Impossibile salvare la perizia nell\'inventario');
  }
};

export const getUserInventory = async (userId: string): Promise<InventoryItem[]> => {
  try {
    const inventoryRef = collection(db, 'inventory');
    const q = query(
      inventoryRef, 
      where('userId', '==', userId),
      orderBy('savedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const inventory: InventoryItem[] = [];
    
    querySnapshot.forEach((doc) => {
      inventory.push({
        id: doc.id,
        ...doc.data()
      } as InventoryItem);
    });
    
    return inventory;
  } catch (error) {
    console.error('Errore nel recuperare l\'inventario:', error);
    throw new Error('Impossibile recuperare l\'inventario');
  }
};

export const updateInventoryItem = async (
  itemId: string, 
  updates: Partial<Omit<InventoryItem, 'id' | 'userId' | 'savedAt'>>
): Promise<void> => {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    await updateDoc(itemRef, updates);
  } catch (error) {
    console.error('Errore nell\'aggiornare l\'item dell\'inventario:', error);
    throw new Error('Impossibile aggiornare l\'item dell\'inventario');
  }
};

export const toggleForSaleStatus = async (itemId: string, isForSale: boolean): Promise<void> => {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    await updateDoc(itemRef, { isForSale });
  } catch (error) {
    console.error('Errore nell\'aggiornare lo stato di vendita:', error);
    throw new Error('Impossibile aggiornare lo stato di vendita');
  }
};

export const deleteInventoryItem = async (itemId: string): Promise<void> => {
  try {
    const itemRef = doc(db, 'inventory', itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error('Errore nell\'eliminare l\'item dall\'inventario:', error);
    throw new Error('Impossibile eliminare l\'item dall\'inventario');
  }
};