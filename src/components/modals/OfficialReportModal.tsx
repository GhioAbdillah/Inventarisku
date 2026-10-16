import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { formatIDR, formatDateIndonesia } from '../../utils/formatters';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportType?: 'valuation' | 'stock_status' | 'movements';
}

export const OfficialReportModal: React.FC<Props> = ({ isOpen, onClose, reportType = 'valuation' }) => {
  const { items, transactions, currentUser } = useInventory();

  if (!isOpen) return null;

  const totalCostValuation = items.reduce((acc, curr) => acc + curr.stock * curr.costPrice, 0);
  const totalSellingValuation = items.reduce((acc, curr) => acc + curr.stock * curr.sellingPrice, 0);
  const totalUnits = items.reduce((acc, curr) => acc + curr.stock, 0);
  const lowStockCount = items.filter((i) => i.stock <= i.minStock).length;

  const docNumber = `BA-INV/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/0482`;
  const reportDate = formatDateIndonesia(new Date().toISOString(), true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-300 w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar - Not in print */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-neutral-200 bg-neutral-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-800" />
            <span className="text-sm font-semibold text-neutral-800">
              Pratinjau Berita Acara & Laporan Inventaris Resmi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Resmi / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-8 sm:p-12 text-neutral-900 bg-white max-h-[82vh] overflow-y-auto print:max-h-none print:p-0">
          {/* Formal Letterhead */}
          <div className="border-b-2 border-neutral-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight uppercase text-neutral-950">
                  PT NUSANTARA LOGISTIK INTEGRASI
                </h1>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Departemen Manajemen Logistik, Pergudangan & Rantai Pasok Terpadu
                </p>
                <p className="text-[11px] text-neutral-500">
                  Kawasan Industri Terpadu Blok D-14, Jakarta 13920 · Telp: (021) 8899-2300 · inventaris@nusantaralogistik.co.id
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-500 block">
                  KLASIFIKASI: INTERNAL RESMI
                </span>
                <span className="font-mono text-xs font-bold text-neutral-900 block mt-1">
                  NO: {docNumber}
                </span>
                <span className="text-[11px] text-neutral-500 font-mono block mt-0.5">
                  Waktu Cetak: {reportDate}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-6">
            <h2 className="text-base font-bold uppercase tracking-wide text-neutral-900 underline decoration-1 underline-offset-4">
              BERITA ACARA & LAPORAN AUDIT VALUASI INVENTARIS GUDANG
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Periode Pemeriksaan Fisik & Rekonsiliasi Neraca Barang Kuartal Berjalan
            </p>
          </div>

          {/* Statement Paragraph */}
          <p className="text-xs leading-relaxed text-neutral-700 mb-5">
            Pada hari ini telah diselesaikan audit komprehensif terhadap seluruh posisi fisik stok barang,
            mutasi pergudangan, dan evaluasi harga pokok pembelian (HPP) yang tercatat dalam sistem manajemen inventaris.
            Berikut adalah ringkasan kuantitatif dan rincian per kategori barang:
          </p>

          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-4 gap-3 mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
            <div>
              <span className="text-neutral-500 block text-[11px]">Total Item SKU:</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">{items.length} Barang</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Total Kuantitas Fisik:</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">{totalUnits} Unit</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Total Valuasi Aset (HPP):</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">{formatIDR(totalCostValuation)}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Item Stok Kritis:</span>
              <span className={`font-mono font-bold text-sm ${lowStockCount > 0 ? 'text-amber-800' : 'text-neutral-900'}`}>
                {lowStockCount} Item
              </span>
            </div>
          </div>

          {/* Inventory Breakdown Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y border-neutral-300 bg-neutral-100 font-semibold text-neutral-800">
                  <th className="py-2 px-2 w-8">No</th>
                  <th className="py-2 px-2">Kode SKU</th>
                  <th className="py-2 px-2">Nama Barang & Spesifikasi</th>
                  <th className="py-2 px-2">Kategori</th>
                  <th className="py-2 px-2 text-right">Stok Fisik</th>
                  <th className="py-2 px-2 text-right">HPP Satuan</th>
                  <th className="py-2 px-2 text-right">Subtotal Nilai</th>
                  <th className="py-2 px-2">Lokasi Rak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                {items.map((item, idx) => {
                  const subtotal = item.stock * item.costPrice;
                  return (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="py-2 px-2 text-neutral-500 font-sans">{idx + 1}</td>
                      <td className="py-2 px-2 font-semibold text-neutral-900">{item.sku}</td>
                      <td className="py-2 px-2 font-sans font-medium text-neutral-900">{item.name}</td>
                      <td className="py-2 px-2 font-sans text-neutral-600">{item.category}</td>
                      <td className="py-2 px-2 text-right font-bold text-neutral-900">
                        {item.stock} <span className="font-normal text-neutral-500 font-sans">{item.unit}</span>
                      </td>
                      <td className="py-2 px-2 text-right text-neutral-700">{formatIDR(item.costPrice)}</td>
                      <td className="py-2 px-2 text-right font-semibold text-neutral-900">{formatIDR(subtotal)}</td>
                      <td className="py-2 px-2 font-sans text-neutral-600">{item.location}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 font-bold bg-neutral-50 text-xs">
                  <td colSpan={4} className="py-2.5 px-2 text-right font-sans">
                    TOTAL KESELURUHAN VALUASI GUDANG:
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">{totalUnits} Unit</td>
                  <td className="py-2.5 px-2 text-right font-sans text-neutral-500">-</td>
                  <td className="py-2.5 px-2 text-right font-mono text-neutral-950">
                    {formatIDR(totalCostValuation)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Indonesian Signatures Block */}
          <div className="pt-6 border-t border-neutral-200 print-break-inside-avoid">
            <p className="text-xs text-neutral-600 mb-6 text-center">
              Demikian Berita Acara dan Laporan Inventaris ini dibuat dengan sebenarnya sesuai kondisi fisik gudang yang sah dan tertib.
            </p>

            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Dibuat & Dihitung Oleh:</span>
                <span className="font-semibold text-neutral-800">Staff Gudang Operasional</span>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-mono text-xs italic text-neutral-400">ttd digital</span>
                </div>
                <div className="border-t border-neutral-400 pt-1 mx-4">
                  <span className="font-semibold text-neutral-900 block">Ahmad Fauzi</span>
                  <span className="text-[10px] text-neutral-500 block">NIP: LG-2022-094</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block mb-1">Disetujui & Diperiksa Oleh:</span>
                <span className="font-semibold text-neutral-800">Manajer Pergudangan</span>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-mono text-xs italic text-neutral-400">ttd digital</span>
                </div>
                <div className="border-t border-neutral-400 pt-1 mx-4">
                  <span className="font-semibold text-neutral-900 block">Siti Rahmawati</span>
                  <span className="text-[10px] text-neutral-500 block">NIP: LG-2018-021</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-500 block mb-1">Diverifikasi Oleh:</span>
                <span className="font-semibold text-neutral-800">Auditor Internal Keuangan</span>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-mono text-xs italic text-neutral-400">ttd digital</span>
                </div>
                <div className="border-t border-neutral-400 pt-1 mx-4">
                  <span className="font-semibold text-neutral-900 block">Dewi Lestari, S.Ak</span>
                  <span className="text-[10px] text-neutral-500 block">NIP: AUD-2020-008</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
