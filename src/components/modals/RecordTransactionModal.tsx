import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { TransactionType, InventoryItem } from '../../types/inventory';
import { X, ArrowDownRight, ArrowUpRight, RefreshCw, MoveRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: InventoryItem;
  initialType?: TransactionType;
}

export const RecordTransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialItem,
  initialType = 'inbound',
}) => {
  const { items, recordTransaction, currentUser } = useInventory();

  const [selectedItemId, setSelectedItemId] = useState<string>(initialItem?.id || items[0]?.id || '');
  const [type, setType] = useState<TransactionType>(initialType);
  const [quantity, setQuantity] = useState<number>(1);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [recipientOrSupplier, setRecipientOrSupplier] = useState<string>('');
  const [locationTo, setLocationTo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Update selection if initial item changes
  React.useEffect(() => {
    if (initialItem) {
      setSelectedItemId(initialItem.id);
    }
  }, [initialItem]);

  React.useEffect(() => {
    if (initialType) {
      setType(initialType);
    }
  }, [initialType]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);

  const calculateProjectedStock = () => {
    if (!currentItem) return 0;
    const qty = Number(quantity) || 0;
    if (type === 'inbound') return currentItem.stock + qty;
    if (type === 'outbound') return Math.max(0, currentItem.stock - qty);
    if (type === 'adjustment') return Math.max(0, currentItem.stock + qty);
    return currentItem.stock;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;

    const autoRef =
      referenceNumber.trim() ||
      `${type.toUpperCase()}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const success = recordTransaction({
      itemId: selectedItemId,
      type,
      quantity: Number(quantity),
      referenceNumber: autoRef,
      notes: notes.trim() || `Transaksi ${type} dicatat oleh ${currentUser.name}`,
      locationFrom: currentItem?.location,
      locationTo: type === 'transfer' ? locationTo : undefined,
      recipientOrSupplier: recipientOrSupplier.trim() || (type === 'inbound' ? currentItem?.supplier : 'Divisi Operasional'),
    });

    if (success) {
      onClose();
      // Reset fields
      setQuantity(1);
      setReferenceNumber('');
      setNotes('');
      setRecipientOrSupplier('');
      setLocationTo('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Catat Mutasi & Transaksi Stok</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Pencatatan real-time memperbarui saldo inventaris dan tersimpan di log audit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Jenis Mutasi Stok
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('inbound')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                  type === 'inbound'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Barang Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => setType('outbound')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                  type === 'outbound'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Barang Keluar</span>
              </button>

              <button
                type="button"
                onClick={() => setType('adjustment')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                  type === 'adjustment'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Opname / Selisih</span>
              </button>

              <button
                type="button"
                onClick={() => setType('transfer')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                  type === 'transfer'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <MoveRight className="w-4 h-4" />
                <span>Mutasi Lokasi</span>
              </button>
            </div>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Pilih Barang Inventaris</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
              required
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.sku}] {item.name} — Stok: {item.stock} {item.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Item Stock Status Indicator Card */}
          {currentItem && (
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-500">Stok Saat Ini:</span>
                <span className="ml-1.5 font-mono font-semibold text-neutral-900">
                  {currentItem.stock} {currentItem.unit}
                </span>
                <span className="mx-2 text-neutral-300">·</span>
                <span className="text-neutral-500">Lokasi:</span>
                <span className="ml-1 text-neutral-800">{currentItem.location}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500">Proyeksi Setelah Mutasi:</span>
                <span className="ml-1.5 font-mono font-bold text-neutral-900">
                  {calculateProjectedStock()} {currentItem.unit}
                </span>
              </div>
            </div>
          )}

          {/* Quantity & Reference Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                {type === 'adjustment' ? 'Selisih Jumlah (+ atau -)' : 'Jumlah Mutasi'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={type === 'adjustment' ? -currentItem?.stock! : 1}
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-medium">
                  {currentItem?.unit || 'Unit'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Nomor Referensi Dokumen
              </label>
              <input
                type="text"
                placeholder={type === 'inbound' ? 'PO-2026-XXXX' : 'DO-OUT-XXXX'}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Recipient / Supplier or Target Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                {type === 'inbound' ? 'Pemasok / Vendor' : 'Penerima / Divisi / Keterangan'}
              </label>
              <input
                type="text"
                placeholder={type === 'inbound' ? currentItem?.supplier || 'Nama Pemasok' : 'Contoh: Divisi Maintenance'}
                value={recipientOrSupplier}
                onChange={(e) => setRecipientOrSupplier(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Pindahkan ke Lokasi / Rak Baru
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Gudang B - Rak 04"
                  value={locationTo}
                  onChange={(e) => setLocationTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Petugas Otorisasi
                </label>
                <input
                  type="text"
                  value={`${currentUser.name} (${currentUser.role})`}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-neutral-100 text-neutral-600 border border-neutral-200 rounded-lg cursor-not-allowed"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Catatan / Keterangan</label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan kondisi barang, alasan pengeluaran, atau inspeksi fisik..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
            >
              Simpan Mutasi Stok
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
