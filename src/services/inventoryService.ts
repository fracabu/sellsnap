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
}

export const saveAppraisalToInventory = async (
  userId: string, 
  appraisalData: AppraisalResult,
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
      savedAt: serverTimestamp(),
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