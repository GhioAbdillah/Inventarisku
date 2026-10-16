import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { InventoryItem } from '../types/inventory';
import { formatIDR, getStockStatus, getStockStatusLabel, downloadCSV } from '../utils/formatters';
import {
  Search,
  Plus,
  Download,
  Barcode,
  Edit2,
  Trash2,
  Lock,
  ArrowUpDown,
  ShoppingCart,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { ItemFormModal } from './modals/ItemFormModal';
import { BarcodeLabelModal } from './modals/BarcodeLabelModal';
import { RecordTransactionModal } from './modals/RecordTransactionModal';
import { ReorderModal } from './modals/ReorderModal';

export const CatalogView: React.FC = () => {
  const { items, deleteItem, hasPermission, currentUser } = useInventory();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'normal' | 'low' | 'out_of_stock' | 'overstock'>('all');
  const [sortField, setSortField] = useState<'name' | 'stock' | 'costPrice' | 'sku'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [barcodeItem, setBarcodeItem] = useState<InventoryItem | null>(null);
  const [quickTrxItem, setQuickTrxItem] = useState<InventoryItem | null>(null);
  const [quickTrxType, setQuickTrxType] = useState<'inbound' | 'outbound'>('inbound');
  const [reorderItem, setReorderItem] = useState<InventoryItem | null>(null);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['all', ...Array.from(set)];
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.sku.toLowerCase().includes(search.toLowerCase()) ||
          item.location.toLowerCase().includes(search.toLowerCase()) ||
          item.supplier.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

        const status = getStockStatus(item.stock, item.minStock, item.maxStock);
        const matchesStatus = selectedStatus === 'all' || status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [items, search, selectedCategory, selectedStatus, sortField, sortOrder]);

  const toggleSort = (field: 'name' | 'stock' | 'costPrice' | 'sku') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Nama Barang',
      'Kategori',
      'Stok Fisik',
      'Satuan',
      'Safety Stock (Min)',
      'Kapasitas Max',
      'Harga Pokok (HPP)',
      'Nilai Jual/Pasar',
      'Total Nilai Aset',
      'Lokasi Rak',
      'Pemasok',
      'Status Stok',
    ];

    const rows = filteredItems.map((item) => {
      const status = getStockStatus(item.stock, item.minStock, item.maxStock);
      return [
        item.sku,
        item.name,
        item.category,
        item.stock,
        item.unit,
        item.minStock,
        item.maxStock,
        hasPermission('canViewValuation') ? item.costPrice : 'TERKUNCI',
        hasPermission('canViewValuation') ? item.sellingPrice : 'TERKUNCI',
        hasPermission('canViewValuation') ? item.stock * item.costPrice : 'TERKUNCI',
        item.location,
        item.supplier,
        status,
      ];
    });

    downloadCSV(`katalog_inventaris_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditItem(item);
    setItemModalOpen(true);
  };

  const handleOpenQuickTrx = (item: InventoryItem, type: 'inbound' | 'outbound') => {
    setQuickTrxItem(item);
    setQuickTrxType(type);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Master Data Barang
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">
              {filteredItems.length} dari {items.length} SKU terdaftar
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Katalog Inventaris & Parameter Stok
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pusat master data inventaris, alokasi rak gudang, batas safety stock, dan pelabelan barcode.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasPermission('canExportData') && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-neutral-500" />
              <span>Ekspor CSV</span>
            </button>
          )}

          {hasPermission('canCreateItem') ? (
            <button
              onClick={() => {
                setEditItem(null);
                setItemModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Barang</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-neutral-500 bg-neutral-100 border border-neutral-200 rounded-lg cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              <span>Tambah Barang (Admin/Manajer)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari berdasarkan SKU, nama barang, lokasi rak, atau vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            >
              <option value="all">Semua Kategori</option>
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            >
              <option value="all">Semua Status Stok</option>
              <option value="normal">Stok Aman</option>
              <option value="low">Stok Menipis (Di Bawah Min)</option>
              <option value="out_of_stock">Habis (0 Unit)</option>
              <option value="overstock">Stok Berlebih</option>
            </select>
          </div>
        </div>

        {/* Active Filters count */}
        {(search || selectedCategory !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-500">
            <span>
              Menampilkan {filteredItems.length} hasil penyaringan
            </span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-neutral-700 hover:text-neutral-900 font-medium underline"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold select-none">
                <th
                  onClick={() => toggleSort('sku')}
                  className="py-3 px-3 cursor-pointer hover:text-neutral-900 whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Kode SKU</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:text-neutral-900 min-w-[200px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Nama Barang & Kategori</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Lokasi Rak</th>
                <th
                  onClick={() => toggleSort('stock')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-neutral-900 whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Stok Fisik</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Safety / Max</th>
                <th className="py-3 px-3 whitespace-nowrap">Status</th>
                <th
                  onClick={() => toggleSort('costPrice')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-neutral-900 whitespace-nowrap"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Harga (HPP)</span>
                    <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500 font-sans">
                    <p className="text-sm font-medium text-neutral-700">Tidak ada barang yang cocok</p>
                    <p className="text-xs text-neutral-400 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const status = getStockStatus(item.stock, item.minStock, item.maxStock);
                  const statusMeta = getStockStatusLabel(status);

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* SKU */}
                      <td className="py-3 px-3 font-semibold text-neutral-900 whitespace-nowrap">
                        {item.sku}
                      </td>

                      {/* Name & Category */}
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-neutral-900 leading-snug">{item.name}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1.5">
                          <span>{item.category}</span>
                          <span className="text-neutral-300">·</span>
                          <span className="truncate max-w-[160px] text-neutral-600">{item.supplier}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 font-sans text-neutral-700 whitespace-nowrap">
                        {item.location}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className={`text-xs font-bold ${
                          status === 'out_of_stock' ? 'text-red-700' : status === 'low' ? 'text-amber-800' : 'text-neutral-900'
                        }`}>
                          {item.stock}
                        </span>{' '}
                        <span className="font-sans text-neutral-500 text-[10px]">{item.unit}</span>
                      </td>

                      {/* Safety & Max Stock */}
                      <td className="py-3 px-3 text-right text-neutral-600 whitespace-nowrap">
                        <span className="text-amber-800 font-medium">{item.minStock}</span> / <span>{item.maxStock}</span>
                      </td>

                      {/* Status indicator */}
                      <td className="py-3 px-3 font-sans whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md ${statusMeta.colorClass}`}>
                          {statusMeta.text}
                        </span>
                      </td>

                      {/* Price / Valuation */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {hasPermission('canViewValuation') ? (
                          <div>
                            <div className="text-neutral-900 font-semibold">{formatIDR(item.costPrice)}</div>
                            <div className="text-[10px] text-neutral-500">Total: {formatIDR(item.stock * item.costPrice)}</div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-neutral-400">
                            <Lock className="w-3 h-3" />
                            <span className="font-sans text-[10px]">Terkunci</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right font-sans whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Print Barcode Label */}
                          <button
                            title="Cetak Label Barcode"
                            onClick={() => setBarcodeItem(item)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Barcode className="w-4 h-4" />
                          </button>

                          {/* Quick Inbound */}
                          {hasPermission('canManageStockIn') && (
                            <button
                              title="Catat Barang Masuk (+)"
                              onClick={() => handleOpenQuickTrx(item, 'inbound')}
                              className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <ArrowDownRight className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick Outbound */}
                          {hasPermission('canManageStockOut') && (
                            <button
                              title="Catat Barang Keluar (-)"
                              onClick={() => handleOpenQuickTrx(item, 'outbound')}
                              className="p-1.5 text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reorder if low stock */}
                          {status === 'low' || status === 'out_of_stock' ? (
                            hasPermission('canManageStockIn') && (
                              <button
                                title="Buat Pesanan Restock"
                                onClick={() => setReorderItem(item)}
                                className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            )
                          ) : null}

                          {/* Edit Item */}
                          {hasPermission('canEditItem') && (
                            <button
                              title="Edit Data Barang"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Item (Admin only) */}
                          {hasPermission('canDeleteItem') && (
                            <button
                              title="Hapus Master Barang (Admin)"
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus master barang "${item.name}" (${item.sku}) secara permanen?`)) {
                                  deleteItem(item.id);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ItemFormModal
        isOpen={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
      />
      <BarcodeLabelModal
        isOpen={!!barcodeItem}
        onClose={() => setBarcodeItem(null)}
        item={barcodeItem}
      />
      <RecordTransactionModal
        isOpen={!!quickTrxItem}
        onClose={() => setQuickTrxItem(null)}
        initialItem={quickTrxItem || undefined}
        initialType={quickTrxType}
      />
      <ReorderModal
        isOpen={!!reorderItem}
        onClose={() => setReorderItem(null)}
        item={reorderItem}
      />
    </div>
  );
};
