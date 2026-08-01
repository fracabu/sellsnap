import { InventoryItem } from '../services/inventoryService';

// Excel in italiano si aspetta il punto e virgola come separatore di colonna
const SEPARATOR = ';';

const COLUMNS = [
  'Titolo',
  'Categoria',
  'Marca',
  'Taglia',
  'Condizione',
  'Prezzo stimato (EUR)',
  'In vendita',
  'Note',
  'Salvato il',
  'Ultima perizia',
  'Categoria Vinted',
  'Categoria Subito',
  'ID'
];

const formatDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price: number | undefined): string => {
  if (typeof price !== 'number' || isNaN(price)) return '';
  // Decimali con la virgola, così Excel IT lo legge come numero
  return price.toFixed(2).replace('.', ',');
};

const escapeCsvValue = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '';

  let text = String(value);

  // Un campo che inizia con = + - @ verrebbe interpretato come formula dal foglio di calcolo
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  if (text.includes(SEPARATOR) || text.includes('"') || text.includes('\n') || text.includes('\r')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

export const buildInventoryCsv = (inventory: InventoryItem[]): string => {
  const rows = inventory.map((item) => [
    item.title,
    item.category,
    item.brand,
    item.size,
    item.condition,
    formatPrice(item.priceSuggested),
    item.isForSale ? 'Sì' : 'No',
    item.notes,
    formatDate(item.savedAt),
    formatDate(item.lastAppraisalAt),
    item.vintedCategory,
    item.subitoCategory,
    item.id
  ]);

  return [COLUMNS, ...rows]
    .map((row) => row.map(escapeCsvValue).join(SEPARATOR))
    .join('\r\n');
};

export const buildCsvFileName = (date: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `sellsnap-inventario-${stamp}.csv`;
};

export const downloadInventoryCsv = (inventory: InventoryItem[]): void => {
  const csv = buildInventoryCsv(inventory);

  // Il BOM serve a Excel per riconoscere l'UTF-8 e non rompere gli accenti
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = buildCsvFileName();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
