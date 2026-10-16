import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatDateIndonesia, downloadCSV } from '../utils/formatters';
import { ROLE_DEFINITIONS } from '../utils/permissions';
import { Shield, Search, Download, Filter, CheckCircle2 } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentUser } = useInventory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchSearch =
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.userRole.toLowerCase().includes(search.toLowerCase());

      const matchCat = categoryFilter === 'all' || log.category === categoryFilter;

      return matchSearch && matchCat;
    });
  }, [auditLogs, search, categoryFilter]);

  const handleExportCSV = () => {
    const headers = ['Waktu', 'Nama Petugas', 'Peran', 'Kategori', 'Aksi', 'Rincian Aktivitas'];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.userName,
      log.userRole,
      log.category,
      log.action,
      log.details,
    ]);
    downloadCSV(`audit_log_inventaris_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Audit & Kepatuhan SOP
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">{auditLogs.length} Entri Jejak Terekam</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Log Audit & Jejak Aktivitas Sistem
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pencatatan kronologis yang tidak dapat diubah (immutable trail) dari setiap transaksi, perubahan master data, dan otorisasi.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-neutral-500" />
          <span>Unduh Log Audit (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama petugas, aksi, atau rincian audit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              categoryFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Semua ({auditLogs.length})
          </button>
          <button
            onClick={() => setCategoryFilter('stock')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              categoryFilter === 'stock' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Mutasi Stok
          </button>
          <button
            onClick={() => setCategoryFilter('item')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              categoryFilter === 'item' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Master Barang
          </button>
          <button
            onClick={() => setCategoryFilter('user')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              categoryFilter === 'user' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Pengguna & Peran
          </button>
          <button
            onClick={() => setCategoryFilter('report')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              categoryFilter === 'report' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Laporan & Opname
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold select-none">
                <th className="py-3 px-3 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-3 whitespace-nowrap">Petugas</th>
                <th className="py-3 px-3 whitespace-nowrap">Peran</th>
                <th className="py-3 px-3 whitespace-nowrap">Kategori</th>
                <th className="py-3 px-3 whitespace-nowrap">Jenis Aksi</th>
                <th className="py-3 px-3">Rincian Perubahan & Objek</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-sans">
                    <p className="text-sm font-medium text-neutral-700">Tidak ada log yang cocok</p>
                    <p className="text-xs text-neutral-400 mt-1">Coba sesuaikan kata kunci pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const roleMeta = ROLE_DEFINITIONS[log.userRole];
                  return (
                    <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 px-3 text-neutral-500 whitespace-nowrap">
                        {formatDateIndonesia(log.timestamp, true)}
                      </td>
                      <td className="py-3 px-3 font-sans font-semibold text-neutral-900 whitespace-nowrap">
                        {log.userName}
                      </td>
                      <td className="py-3 px-3 font-sans whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md ${roleMeta?.badgeClass || 'bg-neutral-100 text-neutral-700'}`}>
                          {roleMeta?.label || log.userRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-neutral-600 uppercase text-[10px] tracking-wider whitespace-nowrap">
                        {log.category}
                      </td>
                      <td className="py-3 px-3 text-neutral-900 font-bold whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-3 px-3 font-sans text-neutral-700 leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
