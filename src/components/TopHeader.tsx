import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ROLE_DEFINITIONS } from '../utils/permissions';
import {
  Bell,
  ChevronRight,
  Shield,
  UserCheck,
  Plus,
  ArrowDownRight,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { RecordTransactionModal } from './modals/RecordTransactionModal';
import { OfficialReportModal } from './modals/OfficialReportModal';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSwitchUserModal: () => void;
}

const TAB_TITLES: Record<string, { category: string; title: string }> = {
  dashboard: { category: 'Pergudangan', title: 'Ringkasan Eksekutif' },
  catalog: { category: 'Master Data', title: 'Katalog & Parameter Stok' },
  transactions: { category: 'Logistik', title: 'Buku Mutasi Stok' },
  reports: { category: 'Analitik', title: 'Pelaporan Otomatis' },
  rbac: { category: 'Keamanan', title: 'Sistem Akses & Peran (RBAC)' },
  audit: { category: 'Kepatuhan', title: 'Log Audit Keamanan' },
};

export const TopHeader: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenSwitchUserModal,
}) => {
  const { currentUser, lowStockItems, hasPermission } = useInventory();
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const [trxModalOpen, setTrxModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const currentMeta = TAB_TITLES[activeTab] || { category: 'Inventaris', title: 'Dashboard' };
  const roleMeta = ROLE_DEFINITIONS[currentUser.role];

  return (
    <header className="h-16 px-6 bg-white border-b border-neutral-200 flex items-center justify-between gap-8 shrink-0 sticky top-0 z-30">
      {/* Zone 1: Contextual Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-neutral-500 whitespace-nowrap overflow-hidden">
        <span className="hover:text-neutral-900 transition-colors cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          {currentMeta.category}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-semibold text-neutral-900 truncate">
          {currentMeta.title}
        </span>
      </div>

      {/* Zone 2 & 3: Actions, Alerts, and Active Persona */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Critical Stock Alert Bell */}
        <div className="relative">
          <button
            onClick={() => setAlertDropdownOpen((prev) => !prev)}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors relative"
            title="Peringatan Stok Kritis"
          >
            <Bell className="w-4 h-4" />
            {lowStockItems.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Dropdown for low stock items */}
          {alertDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 mb-2">
                <span className="text-xs font-bold text-neutral-900">Pemberitahuan Sistem</span>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                  {lowStockItems.length} Stok Kritis
                </span>
              </div>

              {lowStockItems.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3 text-center">
                  Semua stok berada di atas batas safety stock.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {lowStockItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setAlertDropdownOpen(false);
                        onSelectTab('reports');
                      }}
                      className="p-2 rounded-lg hover:bg-neutral-50 cursor-pointer text-xs transition-colors"
                    >
                      <div className="font-semibold text-neutral-900 truncate">{item.name}</div>
                      <div className="text-[11px] text-amber-800 flex items-center justify-between mt-0.5">
                        <span className="font-mono">Sisa: {item.stock} {item.unit}</span>
                        <span>Min: {item.minStock} {item.unit}</span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setAlertDropdownOpen(false);
                      onSelectTab('reports');
                    }}
                    className="w-full pt-2 text-[11px] font-semibold text-neutral-700 hover:text-neutral-900 text-center block"
                  >
                    Buka Rekomendasi Restock Lengkap &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current User Pill / Switcher */}
        <button
          onClick={onOpenSwitchUserModal}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-xs"
        >
          <div className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center">
            {currentUser.avatarText}
          </div>
          <span className="font-semibold text-neutral-800 truncate max-w-[110px]">
            {currentUser.name}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${roleMeta.badgeClass}`}>
            {roleMeta.label}
          </span>
        </button>

        {/* 1 Primary Action button */}
        {hasPermission('canManageStockIn') ? (
          <button
            onClick={() => setTrxModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Catat Mutasi</span>
          </button>
        ) : (
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak Laporan</span>
          </button>
        )}
      </div>

      <RecordTransactionModal
        isOpen={trxModalOpen}
        onClose={() => setTrxModalOpen(false)}
        initialType="inbound"
      />
      <OfficialReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </header>
  );
};
