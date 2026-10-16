import React from 'react';
import { InventoryItem } from '../../types/inventory';
import { X, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const BarcodeLabelModal: React.FC<Props> = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Label Barcode & Tag Gudang</h3>
            <p className="text-[11px] text-neutral-500">Standar label rak & unit inventaris perusahaan</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Printable Label Card */}
          <div className="border-2 border-dashed border-neutral-300 p-5 rounded-lg bg-neutral-50 text-neutral-900 text-center font-sans shadow-xs">
            <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-1">
              KARTU INVENTARIS GUDANG
            </div>
            
            <h4 className="text-base font-bold text-neutral-900 leading-tight mb-1">
              {item.name}
            </h4>
            
            <div className="text-xs text-neutral-600 mb-3">
              Kategori: <span className="font-medium text-neutral-800">{item.category}</span>
            </div>

            {/* Barcode graphic visualization */}
            <div className="bg-white py-3 px-4 border border-neutral-200 rounded my-2 inline-block shadow-2xs">
              <div className="flex items-center justify-center gap-[3px] h-12">
                {[...Array(38)].map((_, idx) => {
                  const isFat = idx % 3 === 0 || idx % 7 === 0;
                  const isSkinny = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`h-full bg-neutral-900 ${isFat ? 'w-[3px]' : isSkinny ? 'w-[1.5px]' : 'w-[1px]'}`}
                    />
                  );
                })}
              </div>
              <div className="font-mono text-xs tracking-widest font-semibold mt-1 text-neutral-900">
                *{item.barcode || item.sku}*
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left mt-3 pt-3 border-t border-neutral-200 text-xs">
              <div>
                <span className="text-[11px] text-neutral-500 block">Kode SKU:</span>
                <span className="font-mono font-bold text-neutral-900">{item.sku}</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Lokasi Rak / Bin:</span>
                <span className="font-semibold text-neutral-900">{item.location}</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Satuan Barang:</span>
                <span className="font-medium text-neutral-800">{item.unit}</span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-500 block">Batas Minimum:</span>
                <span className="font-mono font-medium text-neutral-800">{item.minStock} {item.unit}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="text-xs text-neutral-600 hover:text-neutral-900 font-medium"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Label Thermal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
