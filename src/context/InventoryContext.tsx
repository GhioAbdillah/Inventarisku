import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  InventoryItem,
  StockTransaction,
  User,
  UserRole,
  RolePermission,
  AuditLog,
  ReportConfig,
  TransactionType,
} from '../types/inventory';
import {
  INITIAL_ITEMS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_REPORT_CONFIG,
} from '../data/mockData';
import { ROLE_PERMISSIONS } from '../utils/permissions';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface InventoryContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  addUser: (userData: Omit<User, 'id' | 'avatarText'>) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  items: InventoryItem[];
  addItem: (itemData: Omit<InventoryItem, 'id' | 'updatedAt' | 'lastRestocked'>) => boolean;
  updateItem: (id: string, updates: Partial<InventoryItem>) => boolean;
  deleteItem: (id: string) => boolean;
  transactions: StockTransaction[];
  recordTransaction: (params: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    referenceNumber: string;
    notes: string;
    locationFrom?: string;
    locationTo?: string;
    recipientOrSupplier?: string;
  }) => boolean;
  auditLogs: AuditLog[];
  reportConfig: ReportConfig;
  updateReportConfig: (config: Partial<ReportConfig>) => void;
  hasPermission: (permission: keyof RolePermission) => boolean;
  resetData: () => void;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  lowStockItems: InventoryItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'inv_pro_users',
  ACTIVE_USER_ID: 'inv_pro_active_user_id',
  ITEMS: 'inv_pro_items',
  TRANSACTIONS: 'inv_pro_transactions',
  AUDIT_LOGS: 'inv_pro_audit_logs',
  CONFIG: 'inv_pro_report_config',
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || INITIAL_USERS[0].id;
  });

  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [reportConfig, setReportConfig] = useState<ReportConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : DEFAULT_REPORT_CONFIG;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auto-dismiss toasts
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(reportConfig));
  }, [reportConfig]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const hasPermission = (permission: keyof RolePermission): boolean => {
    const perms = ROLE_PERMISSIONS[currentUser.role];
    return !!perms?.[permission];
  };

  const addAudit = (action: string, details: string, category: AuditLog['category']) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(userId);
      showToast({
        type: 'info',
        title: 'Beralih Akun',
        message: `Sekarang masuk sebagai ${target.name} (${target.role})`,
      });
      addAudit(
        'LOGIN_SWITCH_PERAN',
        `Beralih ke profil ${target.name} dengan peran ${target.role}`,
        'user'
      );
    }
  };

  const addUser = (userData: Omit<User, 'id' | 'avatarText'>) => {
    if (!hasPermission('canManageUsers')) {
      showToast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Hanya Super Admin yang diizinkan menambah pengguna baru.',
      });
      return;
    }

    const initials = userData.name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newUser: User = {
      id: `usr-${Date.now()}`,
      avatarText: initials || 'US',
      ...userData,
    };

    setUsers((prev) => [...prev, newUser]);
    addAudit(
      'TAMBAH_PENGGUNA',
      `Menambahkan pengguna baru: ${newUser.name} (${newUser.role})`,
      'user'
    );
    showToast({
      type: 'success',
      title: 'Pengguna Ditambahkan',
      message: `${newUser.name} berhasil didaftarkan ke sistem.`,
    });
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (!hasPermission('canManageUsers')) {
      showToast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Hanya Super Admin yang diizinkan mengubah peran pengguna.',
      });
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          addAudit(
            'UBAH_PERAN_PENGGUNA',
            `Mengubah peran ${u.name} dari ${u.role} menjadi ${newRole}`,
            'user'
          );
          return { ...u, role: newRole };
        }
        return u;
      })
    );

    showToast({
      type: 'success',
      title: 'Peran Diperbarui',
      message: 'Hak akses pengguna telah disesuaikan.',
    });
  };

  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    showToast({
      type: 'success',
      title: 'Profil Diperbarui',
      message: 'Informasi profil berhasil disimpan.',
    });
  };

  const addItem = (itemData: Omit<InventoryItem, 'id' | 'updatedAt' | 'lastRestocked'>): boolean => {
    if (!hasPermission('canCreateItem')) {
      showToast({
        type: 'error',
        title: 'Akses Dibatasi',
        message: 'Peran Anda tidak memiliki izin untuk menambah master barang.',
      });
      return false;
    }

    // Check duplicate SKU
    if (items.some((item) => item.sku.toLowerCase() === itemData.sku.toLowerCase())) {
      showToast({
        type: 'error',
        title: 'SKU Duplikat',
        message: `SKU ${itemData.sku} sudah terdaftar di sistem. Gunakan SKU unik.`,
      });
      return false;
    }

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      id: `itm-${Date.now()}`,
      updatedAt: now,
      lastRestocked: now,
      ...itemData,
    };

    setItems((prev) => [newItem, ...prev]);
    addAudit(
      'TAMBAH_BARANG',
      `Menambahkan master barang baru: ${newItem.name} (SKU: ${newItem.sku})`,
      'item'
    );
    showToast({
      type: 'success',
      title: 'Barang Tersimpan',
      message: `${newItem.name} telah terdaftar di katalog inventaris.`,
    });
    return true;
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>): boolean => {
    if (!hasPermission('canEditItem')) {
      showToast({
        type: 'error',
        title: 'Akses Dibatasi',
        message: 'Peran Anda tidak memiliki izin untuk mengubah data barang.',
      });
      return false;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = {
            ...item,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          addAudit(
            'UBAH_DATA_BARANG',
            `Memperbarui data barang: ${updated.name} (SKU: ${updated.sku})`,
            'item'
          );
          return updated;
        }
        return item;
      })
    );

    showToast({
      type: 'success',
      title: 'Perubahan Tersimpan',
      message: 'Data barang berhasil diperbarui.',
    });
    return true;
  };

  const deleteItem = (id: string): boolean => {
    if (!hasPermission('canDeleteItem')) {
      showToast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Hanya Super Admin yang dapat menghapus item inventaris secara permanen.',
      });
      return false;
    }

    const target = items.find((i) => i.id === id);
    if (!target) return false;

    setItems((prev) => prev.filter((i) => i.id !== id));
    addAudit(
      'HAPUS_BARANG',
      `Menghapus permanen master barang: ${target.name} (SKU: ${target.sku})`,
      'item'
    );
    showToast({
      type: 'warning',
      title: 'Barang Dihapus',
      message: `${target.name} telah dihapus dari katalog inventaris.`,
    });
    return true;
  };

  const recordTransaction = ({
    itemId,
    type,
    quantity,
    referenceNumber,
    notes,
    locationFrom,
    locationTo,
    recipientOrSupplier,
  }: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    referenceNumber: string;
    notes: string;
    locationFrom?: string;
    locationTo?: string;
    recipientOrSupplier?: string;
  }): boolean => {
    // Check permission
    if (type === 'inbound' && !hasPermission('canManageStockIn')) {
      showToast({ type: 'error', title: 'Akses Ditolak', message: 'Tidak memiliki hak akses pencatatan barang masuk.' });
      return false;
    }
    if (type === 'outbound' && !hasPermission('canManageStockOut')) {
      showToast({ type: 'error', title: 'Akses Ditolak', message: 'Tidak memiliki hak akses pencatatan barang keluar.' });
      return false;
    }
    if (type === 'adjustment' && !hasPermission('canStockOpname')) {
      showToast({ type: 'error', title: 'Akses Ditolak', message: 'Hanya manajer atau auditor yang berwenang melakukan rekonsiliasi opname.' });
      return false;
    }
    if (type === 'transfer' && !hasPermission('canTransferStock')) {
      showToast({ type: 'error', title: 'Akses Ditolak', message: 'Tidak memiliki hak akses pemindahan/mutasi stok.' });
      return false;
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) {
      showToast({ type: 'error', title: 'Barang Tidak Ditemukan' });
      return false;
    }

    const currentStock = item.stock;
    let newStock = currentStock;

    if (type === 'inbound') {
      newStock = currentStock + Math.abs(quantity);
    } else if (type === 'outbound') {
      const needed = Math.abs(quantity);
      if (currentStock < needed) {
        showToast({
          type: 'error',
          title: 'Stok Tidak Mencukupi',
          message: `Stok saat ini hanya ${currentStock} ${item.unit}, tidak cukup untuk pengeluaran ${needed} ${item.unit}.`,
        });
        return false;
      }
      newStock = currentStock - needed;
    } else if (type === 'adjustment') {
      // quantity can be positive or negative delta
      newStock = Math.max(0, currentStock + quantity);
    } else if (type === 'transfer') {
      // transfer retains overall company stock quantity
      newStock = currentStock;
    }

    const now = new Date().toISOString();
    const newTrx: StockTransaction = {
      id: `trx-${Date.now()}`,
      itemId: item.id,
      itemSku: item.sku,
      itemName: item.name,
      type,
      quantity,
      previousStock: currentStock,
      newStock,
      referenceNumber: referenceNumber.trim() || `TRX-${Date.now().toString().slice(-6)}`,
      date: now,
      performedBy: currentUser.name,
      userRole: currentUser.role,
      locationFrom: locationFrom || item.location,
      locationTo: locationTo || (type === 'transfer' ? 'Gudang Baru' : item.location),
      recipientOrSupplier: recipientOrSupplier || '-',
      notes: notes.trim(),
    };

    // Update item stock & location if transfer
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            stock: newStock,
            location: type === 'transfer' && locationTo ? locationTo : i.location,
            lastRestocked: type === 'inbound' ? now : i.lastRestocked,
            updatedAt: now,
          };
        }
        return i;
      })
    );

    setTransactions((prev) => [newTrx, ...prev]);

    const actionNameMap: Record<TransactionType, string> = {
      inbound: 'PENERIMAAN_BARANG',
      outbound: 'PENGELUARAN_BARANG',
      adjustment: 'PENYESUAIAN_OPNAME',
      transfer: 'MUTASI_LOKASI',
    };

    addAudit(
      actionNameMap[type],
      `[${referenceNumber}] ${item.name} (${item.sku}) sejumlah ${quantity} ${item.unit}. Stok: ${currentStock} -> ${newStock}`,
      'stock'
    );

    showToast({
      type: 'success',
      title: 'Transaksi Berhasil',
      message: `Mutasi ${item.name} berhasil dicatat. Stok terkini: ${newStock} ${item.unit}`,
    });

    return true;
  };

  const updateReportConfig = (updates: Partial<ReportConfig>) => {
    if (!hasPermission('canChangeSettings')) {
      showToast({
        type: 'error',
        title: 'Akses Terbatas',
        message: 'Hanya Super Admin yang diizinkan mengubah konfigurasi laporan otomatis.',
      });
      return;
    }
    setReportConfig((prev) => ({ ...prev, ...updates }));
    addAudit('PENGATURAN_LAPORAN', 'Konfigurasi otomatisasi laporan diperbarui', 'system');
    showToast({
      type: 'success',
      title: 'Pengaturan Disimpan',
      message: 'Jadwal dan konfigurasi notifikasi otomatis berhasil diperbarui.',
    });
  };

  const resetData = () => {
    if (currentUser.role !== 'admin') {
      showToast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Hanya Super Admin yang berwenang mereset basis data sistem.',
      });
      return;
    }
    setUsers(INITIAL_USERS);
    setCurrentUserId(INITIAL_USERS[0].id);
    setItems(INITIAL_ITEMS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setReportConfig(DEFAULT_REPORT_CONFIG);
    localStorage.clear();
    showToast({
      type: 'info',
      title: 'Data Direset',
      message: 'Sistem dikembalikan ke basis data demonstrasi awal.',
    });
  };

  const lowStockItems = items.filter((item) => item.stock <= item.minStock);

  return (
    <InventoryContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        addUser,
        updateUserRole,
        updateUserProfile,
        items,
        addItem,
        updateItem,
        deleteItem,
        transactions,
        recordTransaction,
        auditLogs,
        reportConfig,
        updateReportConfig,
        hasPermission,
        resetData,
        toasts,
        dismissToast,
        showToast,
        lowStockItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
