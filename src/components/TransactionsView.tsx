import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { TransactionType } from '../types/inventory';
import { formatDateIndonesia, downloadCSV } from '../utils/formatters';
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  MoveRight,
  Search,
  Plus,
  Download,
  Calendar,
} from 'lucide-react';
import { RecordTransactionModal } from './modals/RecordTransactionModal';

export const TransactionsView: React.FC = () => {
  const { transactions, hasPermission } = useInventory();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [initialModalType, setInitialModalType] = useState<TransactionType>('inbound');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.itemName.toLowerCase().includes(search.toLowerCase()) ||
        t.itemSku.toLowerCase().includes(search.toLowerCase()) ||
        t.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.performedBy.toLowerCase().includes(search.toLowerCase()) ||
        t.notes.toLowerCase().includes(search.toLowerCase());

      const matchType = filterType === 'all' || t.type === filterType;

      return matchSearch && matchType;
    });
  }, [transactions, search, filterType]);

  // Volume calculations
  const totalIn = transactions
    .filter((t) => t.type === 'inbound')
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  const totalOut = transactions
    .filter((t) => t.type === 'outbound')
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  const totalOpname = transactions
    .filter((t) => t.type === 'adjustment')
    .reduce((sum, t) => sum + t.quantity, 0);

  const handleExportCSV = () => {
    const headers = [
      'No Referensi',
      'Waktu Transaksi',
      'SKU',
      'Nama Barang',
      'Jenis Mutasi',
      'Kuantitas',
      'Stok Sebelum',
      'Stok Sesudah',
      'Petugas',
      'Peran Petugas',
      'Pemasok / Penerima',
      'Catatan',
    ];

    const rows = filteredTransactions.map((t) => [
      t.referenceNumber,
      t.date,
      t.itemSku,
      t.itemName,
      t.type,
      t.quantity,
      t.previousStock,
      t.newStock,
      t.performedBy,
      t.userRole,
      t.recipientOrSupplier || '-',
      t.notes,
    ]);

    downloadCSV(`riwayat_mutasi_gudang_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  const openNewTrx = (type: TransactionType) => {
    setInitialModalType(type);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Buku Mutasi & Logistik
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">
              {transactions.length} mutasi tercatat
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Riwayat Mutasi & Transaksi Stok
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pencatatan legalitas barang masuk, pengeluaran, transfer rak, dan rekonsiliasi opname fisik.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasPermission('canExportData') && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-neutral-500" />
              <span>Ekspor Log Mutasi</span>
            </button>
          )}

          <button
            onClick={() => openNewTrx('inbound')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Mutasi Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 block">Total Volume Masuk (Inbound)</span>
            <span className="font-mono text-xl font-bold text-emerald-800 mt-0.5 block tabular-nums">
              +{totalIn} Unit
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 block">Total Volume Keluar (Outbound)</span>
            <span className="font-mono text-xl font-bold text-rose-800 mt-0.5 block tabular-nums">
              -{totalOut} Unit
            </span>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-500 block">Net Selisih Rekonsiliasi (Opname)</span>
            <span className="font-mono text-xl font-bold text-neutral-900 mt-0.5 block tabular-nums">
              {totalOpname > 0 ? `+${totalOpname}` : totalOpname} Unit
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari no. referensi, SKU, nama barang, atau petugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterType === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('inbound')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterType === 'inbound' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setFilterType('outbound')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterType === 'outbound' ? 'bg-white text-rose-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Keluar
          </button>
          <button
            onClick={() => setFilterType('adjustment')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterType === 'adjustment' ? 'bg-white text-amber-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Opname
          </button>
          <button
            onClick={() => setFilterType('transfer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterType === 'transfer' ? 'bg-white text-blue-800 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Mutasi Rak
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold select-none">
                <th className="py-3 px-3 whitespace-nowrap">No Referensi / Dokumen</th>
                <th className="py-3 px-3 whitespace-nowrap">Waktu</th>
                <th className="py-3 px-3 whitespace-nowrap">Jenis Mutasi</th>
                <th className="py-3 px-3 min-w-[200px]">Barang Inventaris</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Kuantitas</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Perubahan Saldo</th>
                <th className="py-3 px-3 whitespace-nowrap">Pemasok / Penerima</th>
                <th className="py-3 px-3 whitespace-nowrap">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500 font-sans">
                    <p className="text-sm font-medium text-neutral-700">Tidak ada data transaksi</p>
                    <p className="text-xs text-neutral-400 mt-1">Gunakan tombol "Catat Mutasi Baru" untuk mencatat pergerakan barang.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Reference */}
                    <td className="py-3 px-3 font-semibold text-neutral-900 whitespace-nowrap">
                      <div>{trx.referenceNumber}</div>
                      <div className="text-[10px] text-neutral-400 font-sans truncate max-w-[150px]">{trx.notes}</div>
                    </td>

                    {/* Time */}
                    <td className="py-3 px-3 font-sans text-neutral-600 whitespace-nowrap">
                      {formatDateIndonesia(trx.date, true)}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 font-sans whitespace-nowrap">
                      {trx.type === 'inbound' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <ArrowDownRight className="w-3.5 h-3.5" /> Penerimaan Masuk
                        </span>
                      )}
                      {trx.type === 'outbound' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Pengeluaran
                        </span>
                      )}
                      {trx.type === 'adjustment' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                          <RefreshCw className="w-3.5 h-3.5" /> Opname Fisik
                        </span>
                      )}
                      {trx.type === 'transfer' && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                          <MoveRight className="w-3.5 h-3.5" /> Mutasi Lokasi
                        </span>
                      )}
                    </td>

                    {/* Item */}
                    <td className="py-3 px-3 font-sans text-neutral-900">
                      <span className="font-mono text-neutral-500 font-medium">[{trx.itemSku}]</span>{' '}
                      <span className="font-semibold">{trx.itemName}</span>
                      {trx.type === 'transfer' && (
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {trx.locationFrom} &rarr; <span className="font-semibold text-neutral-800">{trx.locationTo}</span>
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className={`text-xs font-bold ${
                        trx.type === 'inbound'
                          ? 'text-emerald-700'
                          : trx.type === 'outbound'
                          ? 'text-rose-700'
                          : trx.quantity > 0
                          ? 'text-emerald-700'
                          : 'text-amber-800'
                      }`}>
                        {trx.type === 'inbound'
                          ? `+${trx.quantity}`
                          : trx.type === 'outbound'
                          ? `-${trx.quantity}`
                          : `${trx.quantity > 0 ? '+' : ''}${trx.quantity}`}
                      </span>
                    </td>

                    {/* Stock balance progression */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className="text-neutral-500">{trx.previousStock}</span>{' '}
                      <span className="text-neutral-400">&rarr;</span>{' '}
                      <strong className="text-neutral-900">{trx.newStock}</strong>
                    </td>

                    {/* Recipient/Supplier */}
                    <td className="py-3 px-3 font-sans text-neutral-700 whitespace-nowrap">
                      {trx.recipientOrSupplier || '-'}
                    </td>

                    {/* Performed by */}
                    <td className="py-3 px-3 font-sans whitespace-nowrap">
                      <div className="font-medium text-neutral-900">{trx.performedBy}</div>
                      <div className="text-[10px] text-neutral-400 capitalize">{trx.userRole}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={initialModalType}
      />
    </div>
  );
};
