import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { ROLE_DEFINITIONS } from '../utils/permissions';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  BarChart3,
  ShieldCheck,
  ClipboardList,
  AlertTriangle,
  RotateCcw,
  Warehouse,
  UserCheck,
} from 'lucide-react';

interface Props {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSwitchUserModal: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenSwitchUserModal,
}) => {
  const { items, transactions, lowStockItems, currentUser, resetData } = useInventory();
  const roleMeta = ROLE_DEFINITIONS[currentUser.role];

  const navItems = [
    {
      id: 'dashboard',
      label: 'Ringkasan Eksekutif',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'catalog',
      label: 'Katalog & Master Stok',
      icon: Package,
      badge: items.length.toString(),
    },
    {
      id: 'transactions',
      label: 'Buku Mutasi Stok',
      icon: ArrowLeftRight,
      badge: transactions.length > 0 ? transactions.length.toString() : null,
    },
    {
      id: 'reports',
      label: 'Pelaporan Otomatis',
      icon: BarChart3,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length} Restock` : null,
      badgeColor: 'text-amber-800 bg-amber-100',
    },
    {
      id: 'rbac',
      label: 'Sistem Akses & Peran',
      icon: ShieldCheck,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Log Audit Keamanan',
      icon: ClipboardList,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand & Warehouse Identity */}
      <div>
        <div className="p-5 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs shrink-0">
            <Warehouse className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-neutral-900 truncate tracking-tight">
              Inventaris Pro
            </h1>
            <p className="text-[11px] text-neutral-500 truncate">
              Manajemen Logistik & Stok
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Navigasi Sistem
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-neutral-800 text-neutral-300'
                        : item.badgeColor || 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Low Stock Quick Warning Callout */}
        {lowStockItems.length > 0 && (
          <div className="mx-3 mt-2 p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>{lowStockItems.length} Stok Kritis</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-snug">
              Segera periksa modul pelaporan otomatis untuk rekomendasi pesanan pembelian (PO).
            </p>
            <button
              onClick={() => onSelectTab('reports')}
              className="mt-2 text-[11px] font-semibold text-amber-900 hover:underline block"
            >
              Buka Analisis Restock &rarr;
            </button>
          </div>
        )}
      </div>

      {/* User Persona & Role Footer */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50/60 space-y-2">
        <div
          onClick={onOpenSwitchUserModal}
          className="p-2.5 rounded-lg bg-white border border-neutral-200/90 hover:border-neutral-300 cursor-pointer transition-all flex items-center justify-between"
          title="Klik untuk beralih peran pengguna"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              {currentUser.avatarText}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-neutral-900 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-neutral-500 truncate">
                {roleMeta.label}
              </div>
            </div>
          </div>
          <UserCheck className="w-4 h-4 text-neutral-400 shrink-0" />
        </div>

        {/* Reset Demo Database (Admin only) */}
        {currentUser.role === 'admin' && (
          <button
            onClick={() => {
              if (confirm('Kembalikan seluruh basis data inventaris ke data bawaan demonstrasi?')) {
                resetData();
              }
            }}
            className="w-full py-1 text-[11px] text-neutral-400 hover:text-neutral-700 flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Data Demo</span>
          </button>
        )}
      </div>
    </aside>
  );
};
