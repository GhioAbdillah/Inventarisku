import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { InventoryItem } from '../../types/inventory';
import { X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editItem?: InventoryItem | null;
}

const CATEGORIES = [
  'Elektronik & IT',
  'Perkakas & Teknik',
  'Suku Cadang Mesin',
  'Perlengkapan Logistik',
  'Alat Tulis Kantor',
  'Perlengkapan K3',
  'Bahan Baku & Kimia',
  'Lain-lain',
];

const UNITS = ['Unit', 'Pcs', 'Box', 'Roll', 'Set', 'Drum', 'Pasang', 'Meter', 'Kg'];

export const ItemFormModal: React.FC<Props> = ({ isOpen, onClose, editItem }) => {
  const { addItem, updateItem } = useInventory();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [unit, setUnit] = useState(UNITS[0]);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [maxStock, setMaxStock] = useState<number>(50);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    if (editItem) {
      setSku(editItem.sku);
      setName(editItem.name);
      setCategory(editItem.category);
      setUnit(editItem.unit);
      setStock(editItem.stock);
      setMinStock(editItem.minStock);
      setMaxStock(editItem.maxStock);
      setCostPrice(editItem.costPrice);
      setSellingPrice(editItem.sellingPrice);
      setLocation(editItem.location);
      setSupplier(editItem.supplier);
      setNotes(editItem.notes || '');
      setBarcode(editItem.barcode || '');
    } else {
      // New item defaults
      generateNewSku();
      setName('');
      setCategory(CATEGORIES[0]);
      setUnit(UNITS[0]);
      setStock(10);
      setMinStock(5);
      setMaxStock(50);
      setCostPrice(100000);
      setSellingPrice(130000);
      setLocation('Gudang Utama - Rak A-01');
      setSupplier('PT Distribusi Utama');
      setNotes('');
      setBarcode('');
    }
  }, [editItem, isOpen]);

  const generateNewSku = () => {
    const prefix = 'INV';
    const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const num = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-${randCode}-${num}`);
    setBarcode(`899${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editItem) {
      const ok = updateItem(editItem.id, {
        sku: sku.trim(),
        name: name.trim(),
        category,
        unit,
        stock: Number(stock),
        minStock: Number(minStock),
        maxStock: Number(maxStock),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        location: location.trim(),
        supplier: supplier.trim(),
        notes: notes.trim(),
        barcode: barcode.trim() || undefined,
      });
      if (ok) onClose();
    } else {
      const ok = addItem({
        sku: sku.trim(),
        name: name.trim(),
        category,
        unit,
        stock: Number(stock),
        minStock: Number(minStock),
        maxStock: Number(maxStock),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        location: location.trim(),
        supplier: supplier.trim(),
        notes: notes.trim(),
        barcode: barcode.trim() || undefined,
      });
      if (ok) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              {editItem ? 'Edit Master Data Barang' : 'Tambah Master Barang Baru'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kelola atribut inventaris, batas aman stok, lokasi penyimpanan, dan harga valuasi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* SKU & Barcode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-700">Kode SKU Barang *</label>
                {!editItem && (
                  <button
                    type="button"
                    onClick={generateNewSku}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="INV-XXX-001"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Barcode / EAN (Opsional)</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="8993214560012"
                className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Nama Barang Lengkap *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Monitor LED Dell UltraSharp 24 Inch"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Kategori Barang</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Satuan Pengukuran</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Levels: Current, Min (Safety), Max */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <h4 className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">
              Parameter Manajemen Stok
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Stok Awal Fisik</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">Batas Minimum (Safety)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
                <span className="text-[10px] text-amber-700 mt-0.5 block">Memicu alarm restock</span>
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">Kapasitas Maksimum</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">Target pengadaan</span>
              </div>
            </div>
          </div>

          {/* Pricing & Valuation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Harga Pokok Pembelian (HPP - IDR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-medium">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Estimasi Nilai Jual / Valuasi Pasar (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-neutral-500 font-medium">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Warehouse Location & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Lokasi Rak / Bin Gudang *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Gudang Utama - Rak B-02"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Pemasok / Vendor Utama</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Nama Perusahaan Pemasok"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Catatan Khusus / Spesifikasi</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruksi penanganan, nomor seri spesifik, atau ketentuan masa kedaluwarsa..."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Buttons */}
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
              {editItem ? 'Simpan Perubahan' : 'Daftarkan Barang Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
