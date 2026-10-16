import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatIDR, formatDateIndonesia, getStockStatus, downloadCSV } from '../utils/formatters';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Send,
  Sliders,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Archive,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { OfficialReportModal } from './modals/OfficialReportModal';

type ReportTab = 'valuation' | 'reorder' | 'velocity' | 'slow_moving';

export const ReportsView: React.FC = () => {
  const { items, transactions, reportConfig, updateReportConfig, currentUser, showToast, hasPermission } = useInventory();

  const [activeTab, setActiveTab] = useState<ReportTab>('valuation');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isSimulatingSend, setIsSimulatingSend] = useState(false);

  // Valuations
  const totalCostValuation = items.reduce((acc, curr) => acc + curr.stock * curr.costPrice, 0);
  const totalSellingValuation = items.reduce((acc, curr) => acc + curr.stock * curr.sellingPrice, 0);
  const potentialMargin = totalSellingValuation - totalCostValuation;
  const marginPct = totalCostValuation > 0 ? Math.round((potentialMargin / totalCostValuation) * 100) : 0;

  // Reorder items
  const reorderList = items
    .filter((item) => item.stock <= item.minStock)
    .map((item) => {
      const deficit = Math.max(1, item.maxStock - item.stock);
      const estimatedCost = deficit * item.costPrice;
      return {
        ...item,
        deficit,
        estimatedCost,
      };
    });

  const totalReorderBudget = reorderList.reduce((acc, curr) => acc + curr.estimatedCost, 0);

  // Velocity calculations
  const itemVelocity = items.map((item) => {
    const inboundQty = transactions
      .filter((t) => t.itemId === item.id && t.type === 'inbound')
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
    const outboundQty = transactions
      .filter((t) => t.itemId === item.id && t.type === 'outbound')
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
    const turnoverRate = item.stock > 0 ? (outboundQty / (item.stock + outboundQty)).toFixed(2) : '1.00';
    return {
      ...item,
      inboundQty,
      outboundQty,
      turnoverRate,
    };
  });

  // Slow moving (no outbound transactions or low turnover)
  const slowMovingItems = itemVelocity.filter((item) => item.outboundQty === 0 || Number(item.turnoverRate) < 0.15);

  // Export handlers
  const handleExportCSV = () => {
    let filename = `laporan_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeTab === 'valuation') {
      headers = ['SKU', 'Nama Barang', 'Kategori', 'Stok', 'Satuan', 'HPP (IDR)', 'Total Valuasi Modal (IDR)', 'Estimasi Nilai Jual (IDR)', 'Potensi Margin (IDR)'];
      rows = items.map((i) => [
        i.sku,
        i.name,
        i.category,
        i.stock,
        i.unit,
        i.costPrice,
        i.stock * i.costPrice,
        i.stock * i.sellingPrice,
        i.stock * (i.sellingPrice - i.costPrice),
      ]);
    } else if (activeTab === 'reorder') {
      headers = ['SKU', 'Nama Barang', 'Stok Saat Ini', 'Safety Stock', 'Kapasitas Max', 'Defisit Restock', 'Satuan', 'Pemasok', 'HPP Satuan', 'Estimasi Biaya Restock'];
      rows = reorderList.map((i) => [
        i.sku,
        i.name,
        i.stock,
        i.minStock,
        i.maxStock,
        i.deficit,
        i.unit,
        i.supplier,
        i.costPrice,
        i.estimatedCost,
      ]);
    } else if (activeTab === 'velocity') {
      headers = ['SKU', 'Nama Barang', 'Kategori', 'Stok Saat Ini', 'Total Masuk', 'Total Keluar', 'Rasio Perputaran'];
      rows = itemVelocity.map((i) => [
        i.sku,
        i.name,
        i.category,
        i.stock,
        i.inboundQty,
        i.outboundQty,
        i.turnoverRate,
      ]);
    } else {
      headers = ['SKU', 'Nama Barang', 'Kategori', 'Stok Mengendap', 'Satuan', 'Nilai Modal Mengendap', 'Lokasi Rak', 'Pemasok'];
      rows = slowMovingItems.map((i) => [
        i.sku,
        i.name,
        i.category,
        i.stock,
        i.unit,
        i.stock * i.costPrice,
        i.location,
        i.supplier,
      ]);
    }

    downloadCSV(filename, headers, rows);
    showToast({
      type: 'success',
      title: 'Laporan Diunduh',
      message: `File ${filename} berhasil dibuat dan disimpan ke perangkat Anda.`,
    });
  };

  const handleSimulateAutoDispatch = () => {
    setIsSimulatingSend(true);
    setTimeout(() => {
      setIsSimulatingSend(false);
      showToast({
        type: 'success',
        title: 'Laporan Otomatis Terkirim',
        message: `Digest laporan otomatis berhasil digenerasi dan dikirim ke ${reportConfig.alertEmail}`,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Modul Analitik & Otomatisasi
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">Jadwal: {reportConfig.autoExportSchedule.toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Pelaporan Otomatis & Analisis Gudang
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Komputasi otomatis valuasi aset, estimasi anggaran restock barang kritis, dan analisis perputaran stok.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-neutral-500" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => setPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>

      {/* Automated Digest Scheduler Card */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-100 text-neutral-700 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900">Pengiriman Laporan Otomatis (Auto-Digest)</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Aktif ({reportConfig.autoExportSchedule})
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Sistem secara berkala merekapitulasi neraca stok & barang kritis ke: <strong className="text-neutral-700">{reportConfig.alertEmail}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasPermission('canChangeSettings') && (
            <select
              value={reportConfig.autoExportSchedule}
              onChange={(e) => updateReportConfig({ autoExportSchedule: e.target.value as any })}
              className="text-xs bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1.5 font-medium text-neutral-800 focus:outline-hidden"
            >
              <option value="daily">Harian (Pukul 07:00 WIB)</option>
              <option value="weekly">Mingguan (Tiap Senin)</option>
              <option value="monthly">Bulanan (Akhir Bulan)</option>
              <option value="disabled">Nonaktifkan</option>
            </select>
          )}

          <button
            onClick={handleSimulateAutoDispatch}
            disabled={isSimulatingSend}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSimulatingSend ? 'Mengirim...' : 'Kirim Digest Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-neutral-200/60 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('valuation')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'valuation'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Valuasi & Nilai Aset</span>
        </button>

        <button
          onClick={() => setActiveTab('reorder')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'reorder'
              ? 'bg-white text-amber-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <span>Stok Kritis & Rencana Restock ({reorderList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('velocity')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'velocity'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Kecepatan Arus (Turnover)</span>
        </button>

        <button
          onClick={() => setActiveTab('slow_moving')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'slow_moving'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Barang Mengendap (Slow-Moving)</span>
        </button>
      </div>

      {/* Tab 1: Valuation */}
      {activeTab === 'valuation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-neutral-200">
              <span className="text-xs text-neutral-500 block">Total Modal Terikat (HPP)</span>
              <div className="font-mono text-xl font-bold text-neutral-900 mt-1 tabular-nums">
                {formatIDR(totalCostValuation)}
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">Berdasarkan harga pokok perolehan</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-200">
              <span className="text-xs text-neutral-500 block">Estimasi Nilai Pasar Terkini</span>
              <div className="font-mono text-xl font-bold text-neutral-900 mt-1 tabular-nums">
                {formatIDR(totalSellingValuation)}
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">Valuasi harga jual berlaku</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-200">
              <span className="text-xs text-neutral-500 block">Potensi Gross Margin</span>
              <div className="font-mono text-xl font-bold text-emerald-800 mt-1 tabular-nums">
                +{formatIDR(potentialMargin)} <span className="text-xs font-normal font-sans">({marginPct}%)</span>
              </div>
              <span className="text-[11px] text-neutral-500 mt-1 block">Selisih laba kotor potensial</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Rincian Valuasi per Item Barang</h3>
                <p className="text-xs text-neutral-500">Kalkulasi otomatis neraca modal terikat per SKU</p>
              </div>
              <span className="font-mono text-xs font-bold text-neutral-800">
                {items.length} Baris Data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                    <th className="py-2.5 px-3">Kode SKU</th>
                    <th className="py-2.5 px-3">Nama Barang</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                    <th className="py-2.5 px-3 text-right">HPP Satuan</th>
                    <th className="py-2.5 px-3 text-right">Total Modal HPP</th>
                    <th className="py-2.5 px-3 text-right">Total Nilai Pasar</th>
                    <th className="py-2.5 px-3 text-right">Potensi Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                  {items.map((item) => {
                    const subtotalCost = item.stock * item.costPrice;
                    const subtotalRetail = item.stock * item.sellingPrice;
                    const margin = subtotalRetail - subtotalCost;
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50/70">
                        <td className="py-2.5 px-3 font-semibold text-neutral-900">{item.sku}</td>
                        <td className="py-2.5 px-3 font-sans text-neutral-900 font-medium">{item.name}</td>
                        <td className="py-2.5 px-3 font-sans text-neutral-600">{item.category}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                          {item.stock} <span className="font-sans text-neutral-500 font-normal">{item.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-700">{formatIDR(item.costPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-neutral-900">{formatIDR(subtotalCost)}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-700">{formatIDR(subtotalRetail)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-800 font-medium">+{formatIDR(margin)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Reorder Forecast */}
      {activeTab === 'reorder' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Rencana Anggaran Pengadaan Restock Otomatis
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Estimasi biaya untuk mengisi kembali seluruh item kritis hingga batas kapasitas maksimum gudang.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-amber-900 block font-medium">Total Anggaran Restock Diperlukan:</span>
              <span className="font-mono text-xl font-bold text-amber-950 tabular-nums">
                {formatIDR(totalReorderBudget)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                    <th className="py-2.5 px-3">Kode SKU</th>
                    <th className="py-2.5 px-3">Nama Barang</th>
                    <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                    <th className="py-2.5 px-3 text-right">Safety Stock</th>
                    <th className="py-2.5 px-3 text-right">Kapasitas Max</th>
                    <th className="py-2.5 px-3 text-right">Kebutuhan Order (Q)</th>
                    <th className="py-2.5 px-3">Pemasok / Vendor</th>
                    <th className="py-2.5 px-3 text-right">Estimasi Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                  {reorderList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-neutral-500 font-sans">
                        <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-800">Semua Persediaan dalam Kondisi Aman</p>
                        <p className="text-xs text-neutral-400 mt-0.5">Tidak ada barang yang berada di bawah batas safety stock.</p>
                      </td>
                    </tr>
                  ) : (
                    reorderList.map((item) => (
                      <tr key={item.id} className="hover:bg-amber-50/50">
                        <td className="py-2.5 px-3 font-semibold text-neutral-900">{item.sku}</td>
                        <td className="py-2.5 px-3 font-sans text-neutral-900 font-medium">{item.name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-900">
                          {item.stock} <span className="font-sans font-normal text-neutral-500">{item.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-neutral-600">{item.minStock}</td>
                        <td className="py-2.5 px-3 text-right text-neutral-600">{item.maxStock}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                          +{item.deficit} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-neutral-700">{item.supplier}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                          {formatIDR(item.estimatedCost)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Turnover Velocity */}
      {activeTab === 'velocity' && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Analisis Kecepatan Perputaran Stok (Velocity)</h3>
            <p className="text-xs text-neutral-500">Mengukur perbandingan arus keluar (distribusi) terhadap total persediaan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-2.5 px-3">Kode SKU</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                  <th className="py-2.5 px-3 text-right">Total Masuk (Inbound)</th>
                  <th className="py-2.5 px-3 text-right">Total Keluar (Outbound)</th>
                  <th className="py-2.5 px-3 text-center">Tingkat Perputaran</th>
                  <th className="py-2.5 px-3">Klasifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                {itemVelocity.map((item) => {
                  const rate = Number(item.turnoverRate);
                  let label = 'Reguler';
                  let colorClass = 'text-neutral-700';
                  if (rate >= 0.4) {
                    label = 'Fast Moving';
                    colorClass = 'text-emerald-800 font-bold';
                  } else if (rate === 0) {
                    label = 'Zero Movement';
                    colorClass = 'text-rose-700';
                  }

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/70">
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">{item.sku}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-900 font-medium">{item.name}</td>
                      <td className="py-2.5 px-3 text-right text-neutral-800">{item.stock} {item.unit}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700">+{item.inboundQty}</td>
                      <td className="py-2.5 px-3 text-right text-rose-700">-{item.outboundQty}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-neutral-900">{item.turnoverRate}</td>
                      <td className={`py-2.5 px-3 font-sans ${colorClass}`}>{label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Slow Moving */}
      {activeTab === 'slow_moving' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900">Deteksi Barang Mengendap (Dead / Slow Stock)</h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Barang yang belum mengalami mutasi pengeluaran dalam kurun waktu audit. Berpotensi menimbulkan biaya penyimpanan dan keusangan.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                    <th className="py-2.5 px-3">Kode SKU</th>
                    <th className="py-2.5 px-3">Nama Barang</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3 text-right">Stok Mengendap</th>
                    <th className="py-2.5 px-3 text-right">Nilai Modal Terikat</th>
                    <th className="py-2.5 px-3">Lokasi Rak</th>
                    <th className="py-2.5 px-3">Rekomendasi Manajerial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono text-[11px]">
                  {slowMovingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70">
                      <td className="py-2.5 px-3 font-semibold text-neutral-900">{item.sku}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-900 font-medium">{item.name}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-600">{item.category}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                        {item.stock} <span className="font-sans font-normal text-neutral-500">{item.unit}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-neutral-900">
                        {formatIDR(item.stock * item.costPrice)}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-neutral-600">{item.location}</td>
                      <td className="py-2.5 px-3 font-sans text-neutral-500 text-[10px]">
                        Review rotasi stok / evaluasi retur ke vendor
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Modal */}
      <OfficialReportModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
      />
    </div>
  );
};
