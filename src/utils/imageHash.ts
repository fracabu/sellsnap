/**
 * Utility per calcolare hash delle immagini per identificazione duplicati
 */

export async function calculateImageHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    reader.readAsArrayBuffer(file);
  });
}

export async function calculateMultipleImagesHash(files: File[]): Promise<string> {
  if (files.length === 0) {
    throw new Error('Nessuna immagine fornita per il calcolo dell\'hash');
  }
  
  // Per immagini multiple, concateniamo gli hash individuali
  const hashes = await Promise.all(files.map(file => calculateImageHash(file)));
  const combinedHash = hashes.sort().join(''); // sort per garantire ordine deterministico
  
  // Hash dell'hash combinato per ottenere una lunghezza fissa
  const encoder = new TextEncoder();
  const data = encoder.encode(combinedHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Converte File a base64 per mantenere compatibilità con il sistema esistente
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}