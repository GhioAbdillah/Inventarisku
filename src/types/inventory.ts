export type UserRole = 'admin' | 'warehouse_manager' | 'staff' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarText: string;
  phone?: string;
}

export interface RolePermission {
  canCreateItem: boolean;
  canEditItem: boolean;
  canDeleteItem: boolean;
  canManageStockIn: boolean;
  canManageStockOut: boolean;
  canStockOpname: boolean;
  canTransferStock: boolean;
  canViewValuation: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageUsers: boolean;
  canViewAuditLog: boolean;
  canChangeSettings: boolean;
}

export type StockStatus = 'normal' | 'low' | 'out_of_stock' | 'overstock';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  maxStock: number;
  costPrice: number; // HPP (Harga Pokok Pembelian) in IDR
  sellingPrice: number; // Nilai Estimasi / Jual in IDR
  location: string;
  supplier: string;
  lastRestocked: string;
  updatedAt: string;
  notes?: string;
  barcode?: string;
}

export type TransactionType = 'inbound' | 'outbound' | 'adjustment' | 'transfer';

export interface StockTransaction {
  id: string;
  itemId: string;
  itemSku: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNumber: string;
  date: string;
  performedBy: string;
  userRole: UserRole;
  locationFrom?: string;
  locationTo?: string;
  recipientOrSupplier?: string;
  notes: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'stock' | 'item' | 'user' | 'report' | 'system';
}

export interface ReportConfig {
  autoExportSchedule: 'daily' | 'weekly' | 'monthly' | 'disabled';
  alertEmail: string;
  notifyOnLowStock: boolean;
  lowStockThresholdPct: number;
}
