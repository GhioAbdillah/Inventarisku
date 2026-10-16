import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatIDR, formatDateIndonesia, getStockStatus } from '../utils/formatters';
import {
  Package,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  FileText,
  Lock,
  ChevronRight,
  TrendingUp,
  Layers,
  Clock,
  ShoppingCart,
} from 'lucide-react';
import { RecordTransactionModal } from './modals/RecordTransactionModal';
import { ItemFormModal } from './modals/ItemFormModal';
import { OfficialReportModal } from './modals/OfficialReportModal';
import { ReorderModal } from './modals/ReorderModal';
import { InventoryItem, TransactionType } from '../types/inventory';

export const DashboardView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { items, transactions, currentUser, hasPermission, lowStockItems } = useInventory();

  // Modals state
  const [trxModalOpen, setTrxModalOpen] = useState(false);
  const [trxInitialType, setTrxInitialType] = useState<TransactionType>('inbound');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reorderItem, setReorderItem] = useState<InventoryItem | null>(null);

  // Calculations
  const totalUnits = items.reduce((sum, item) => sum + item.stock, 0);
  const totalCostValuation = items.reduce((sum, item) => sum + item.stock * item.costPrice, 0);
  const totalSellingValuation = items.reduce((sum, item) => sum + item.stock * item.sellingPrice, 0);

  // Recent month transactions
  const totalInboundMonth = transactions
    .filter((t) => t.type === 'inbound')
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  const totalOutboundMonth = transactions
    .filter((t) => t.type === 'outbound')
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

  // Category breakdown
  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.stock;
    return acc;
  }, {});

  const handleOpenTrx = (type: TransactionType) => {
    setTrxInitialType(type);
    setTrxModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Role Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Sistem Manajemen Inventaris Gudang
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">
              Otorisasi: <strong className="text-neutral-900">{currentUser.name}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Ringkasan Eksekutif & Posisi Stok Terkini
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitoring arus barang masuk/keluar, evaluasi valuasi aset pergudangan, dan kontrol keselamatan stok.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {hasPermission('canManageStockIn') && (
            <button
              onClick={() => handleOpenTrx('inbound')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-700" />
              <span>Barang Masuk</span>
            </button>
          )}

          {hasPermission('canManageStockOut') && (
            <button
              onClick={() => handleOpenTrx('outbound')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-700" />
              <span>Barang Keluar</span>
            </button>
          )}

          {hasPermission('canCreateItem') && (
            <button
              onClick={() => setItemModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-neutral-700" />
              <span>Item Baru</span>
            </button>
          )}

          {hasPermission('canViewReports') && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak Berita Acara</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Column KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Valuation */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-500">Total Valuasi Aset Gudang</span>
              {hasPermission('canViewValuation') ? (
                <div className="font-mono text-xl font-bold tracking-tight text-neutral-900 mt-1 tabular-nums">
                  {formatIDR(totalCostValuation)}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-neutral-400 mt-1.5">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <span className="font-mono tracking-wider">Rp •••••••••</span>
                </div>
              )}
            </div>
            <div className="p-2 bg-neutral-100 text-neutral-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
            {hasPermission('canViewValuation') ? (
              <span>Estimasi Nilai Pasar: <strong className="font-mono font-medium text-neutral-800">{formatIDR(totalSellingValuation)}</strong></span>
            ) : (
              <span className="text-amber-700">Dibatasi untuk peran {currentUser.role}</span>
            )}
          </div>
        </div>

        {/* Metric 2: Total Items & Quantity */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-500">Katalog Barang Aktif</span>
              <div className="font-mono text-xl font-bold tracking-tight text-neutral-900 mt-1 tabular-nums">
                {items.length} <span className="text-sm font-normal text-neutral-500 font-sans">SKU</span>
              </div>
            </div>
            <div className="p-2 bg-neutral-100 text-neutral-700 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500">
            Total Unit Fisik: <strong className="font-mono font-medium text-neutral-800">{totalUnits} Unit</strong>
          </div>
        </div>

        {/* Metric 3: Critical / Low Stock Alert */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between transition-colors ${
          lowStockItems.length > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-xs font-medium ${lowStockItems.length > 0 ? 'text-amber-900' : 'text-neutral-500'}`}>
                Peringatan Stok Kritis
              </span>
              <div className={`font-mono text-xl font-bold tracking-tight mt-1 tabular-nums ${
                lowStockItems.length > 0 ? 'text-amber-950' : 'text-neutral-900'
              }`}>
                {lowStockItems.length} <span className="text-sm font-normal text-neutral-500 font-sans">Barang</span>
              </div>
            </div>
            <div className={`p-2 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-200/60 text-amber-900' : 'bg-neutral-100 text-neutral-700'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs">
            {lowStockItems.length > 0 ? (
              <span className="text-amber-900 font-medium">Di bawah batas safety stock minimum</span>
            ) : (
              <span className="text-emerald-700">Semua persediaan di atas batas aman</span>
            )}
          </div>
        </div>

        {/* Metric 4: Monthly Stock Velocity */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-neutral-500">Arus Mutasi Bulan Ini</span>
              <div className="font-mono text-xl font-bold tracking-tight text-neutral-900 mt-1 tabular-nums">
                +{totalInboundMonth} / -{totalOutboundMonth}
              </div>
            </div>
            <div className="p-2 bg-neutral-100 text-neutral-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex items-center justify-between">
            <span>Masuk: <strong className="font-mono text-emerald-700">+{totalInboundMonth}</strong></span>
            <span>Keluar: <strong className="font-mono text-rose-700">-{totalOutboundMonth}</strong></span>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner with Instant Reorder Button */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-300 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Daftar Barang Membutuhkan Pengadaan Segera ({lowStockItems.length} Item)
                </h3>
                <p className="text-xs text-neutral-600">
                  Kuantitas berada pada atau di bawah batas safety stock. Sistem merekomendasikan penerbitan repeat order ke vendor.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-neutral-700 hover:text-neutral-900 font-semibold flex items-center gap-1"
            >
              Lihat Analisis Restock <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
            {lowStockItems.map((item) => {
              const deficit = item.maxStock - item.stock;
              const status = getStockStatus(item.stock, item.minStock, item.maxStock);
              return (
                <div key={item.id} className="p-3 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-neutral-50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900">{item.sku}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="font-medium text-neutral-900">{item.name}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-neutral-500">{item.location}</span>
                    </div>
                    <div className="text-neutral-500">
                      Pemasok: <span className="text-neutral-800">{item.supplier}</span> · Batas Minimum: <strong className="font-mono text-neutral-800">{item.minStock} {item.unit}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-900">
                        Sisa: {item.stock} {item.unit}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        Defisit Restock: +{deficit} {item.unit}
                      </div>
                    </div>

                    {hasPermission('canManageStockIn') && (
                      <button
                        onClick={() => setReorderItem(item)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-800" />
                        <span>Buat Pesanan Restock</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Section: Category Distribution & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Stock Distribution */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900">Distribusi Kategori Barang</h3>
              <Layers className="w-4 h-4 text-neutral-400" />
            </div>

            <div className="space-y-3">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const pct = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-700 font-medium">{cat}</span>
                      <span className="font-mono text-neutral-500 tabular-nums">
                        {count} Unit ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-neutral-800 h-1.5 rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-neutral-100">
            <button
              onClick={() => onNavigate('catalog')}
              className="w-full py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg border border-neutral-200 transition-colors"
            >
              Buka Katalog Lengkap ({items.length} SKU)
            </button>
          </div>
        </div>

        {/* Right Column: Recent Transactions Table */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Mutasi & Transaksi Terkini</h3>
              <p className="text-xs text-neutral-500">Pencatatan real-time arus fisik barang di gudang</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-neutral-700 hover:text-neutral-900 font-semibold flex items-center gap-1"
            >
              Lihat Semua Transaksi <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-medium">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Jenis</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3 text-right">Jumlah</th>
                  <th className="py-2.5 px-3">Saldo</th>
                  <th className="py-2.5 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                {transactions.slice(0, 5).map((trx) => (
                  <tr key={trx.id} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-3 text-neutral-500 font-sans whitespace-nowrap">
                      {formatDateIndonesia(trx.date, false)}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      {trx.type === 'inbound' && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" /> Masuk
                        </span>
                      )}
                      {trx.type === 'outbound' && (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Keluar
                        </span>
                      )}
                      {trx.type === 'adjustment' && (
                        <span className="text-amber-800 font-semibold">Opname</span>
                      )}
                      {trx.type === 'transfer' && (
                        <span className="text-blue-700 font-semibold">Mutasi Rak</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-neutral-900">
                      <span className="font-mono text-neutral-500 font-medium">[{trx.itemSku}]</span>{' '}
                      <span className="font-medium">{trx.itemName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                      {trx.type === 'inbound' ? `+${trx.quantity}` : trx.type === 'outbound' ? `-${trx.quantity}` : `${trx.quantity > 0 ? '+' : ''}${trx.quantity}`}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600">
                      {trx.previousStock} &rarr; <strong className="text-neutral-900">{trx.newStock}</strong>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-neutral-600 whitespace-nowrap">
                      {trx.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RecordTransactionModal
        isOpen={trxModalOpen}
        onClose={() => setTrxModalOpen(false)}
        initialType={trxInitialType}
      />
      <ItemFormModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
      />
      <OfficialReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
      <ReorderModal
        isOpen={!!reorderItem}
        onClose={() => setReorderItem(null)}
        item={reorderItem}
      />
    </div>
  );
};
