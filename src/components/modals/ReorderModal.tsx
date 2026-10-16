import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { InventoryItem } from '../../types/inventory';
import { formatIDR } from '../../utils/formatters';
import { X, ShoppingCart, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const ReorderModal: React.FC<Props> = ({ isOpen, onClose, item }) => {
  const { recordTransaction } = useInventory();

  if (!isOpen || !item) return null;

  const suggestedQty = Math.max(1, item.maxStock - item.stock);
  const [orderQty, setOrderQty] = useState<number>(suggestedQty);
  const [poNumber, setPoNumber] = useState<string>(
    `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [isDone, setIsDone] = useState(false);

  const totalCost = (Number(orderQty) || 0) * item.costPrice;

  const handleCreateRestock = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = recordTransaction({
      itemId: item.id,
      type: 'inbound',
      quantity: Number(orderQty),
      referenceNumber: poNumber,
      notes: `Restock otomatis dari sistem peringatan stok kritis untuk pemasok ${item.supplier}.`,
      locationTo: item.location,
      recipientOrSupplier: item.supplier,
    });

    if (ok) {
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Rencana Pengadaan / Restock Barang</h3>
              <p className="text-xs text-neutral-500">Kalkulasi kuantitas pemenuhan menuju stok maksimum</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="p-10 text-center space-y-3">
            <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-neutral-900">Pesanan Restock Berhasil Dibuat!</h4>
            <p className="text-xs text-neutral-600">
              Penerimaan stok dari vendor tercatat dengan nomor PO: {poNumber}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateRestock} className="p-6 space-y-4">
            <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Nama Barang:</span>
                <span className="font-semibold text-neutral-900">{item.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Kode SKU:</span>
                <span className="font-mono font-medium text-neutral-800">{item.sku}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Status Stok Saat Ini:</span>
                <span className="font-mono font-semibold text-amber-800">
                  {item.stock} {item.unit} (Safety: {item.minStock} {item.unit})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Target Kapasitas Gudang:</span>
                <span className="font-mono text-neutral-700">{item.maxStock} {item.unit}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200">
                <span className="text-neutral-500">Vendor / Pemasok:</span>
                <span className="font-medium text-neutral-900">{item.supplier}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Jumlah Pemesanan Restock
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={orderQty}
                    onChange={(e) => setOrderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-neutral-400 font-medium">
                    {item.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nomor Referensi PO
                </label>
                <input
                  type="text"
                  required
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div className="p-3 bg-neutral-100/70 rounded-lg border border-neutral-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-500 block">Harga Satuan (HPP):</span>
                <span className="font-mono font-medium text-neutral-800">{formatIDR(item.costPrice)}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block">Total Estimasi Pembelian:</span>
                <span className="font-mono font-bold text-neutral-900 text-sm">{formatIDR(totalCost)}</span>
              </div>
            </div>

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
                Konfirmasi Restock Barang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
