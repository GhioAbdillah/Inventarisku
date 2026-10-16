import { StockStatus } from '../types/inventory';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function formatDateIndonesia(dateStr: string, includeTime = true): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    };
    return new Intl.DateTimeFormat('id-ID', options).format(date);
  } catch {
    return dateStr;
  }
}

export function getStockStatus(stock: number, minStock: number, maxStock: number): StockStatus {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= minStock) return 'low';
  if (stock >= maxStock * 1.2 && maxStock > 0) return 'overstock';
  return 'normal';
}

export function getStockStatusLabel(status: StockStatus): { text: string; colorClass: string } {
  switch (status) {
    case 'out_of_stock':
      return { text: 'Habis (0)', colorClass: 'text-red-700 bg-red-50 border border-red-200' };
    case 'low':
      return { text: 'Stok Menipis', colorClass: 'text-amber-800 bg-amber-50 border border-amber-200' };
    case 'overstock':
      return { text: 'Stok Berlebih', colorClass: 'text-indigo-800 bg-indigo-50 border border-indigo-200' };
    case 'normal':
    default:
      return { text: 'Stok Aman', colorClass: 'text-emerald-800 bg-emerald-50 border border-emerald-200' };
  }
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
