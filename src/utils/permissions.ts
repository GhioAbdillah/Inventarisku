import { UserRole, RolePermission } from '../types/inventory';

export const ROLE_DEFINITIONS: Record<
  UserRole,
  {
    label: string;
    description: string;
    badgeClass: string;
    color: string;
  }
> = {
  admin: {
    label: 'Super Admin',
    description: 'Akses penuh ke seluruh sistem, otorisasi pengguna, master data, dan audit keamanan.',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
    color: '#7E22CE',
  },
  warehouse_manager: {
    label: 'Manajer Gudang',
    description: 'Pengelolaan katalog barang, persetujuan mutasi/penyesuaian stok, serta pemantauan laporan operasional.',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    color: '#1D4ED8',
  },
  staff: {
    label: 'Staff Gudang',
    description: 'Pencatatan harian barang masuk/keluar, stock opname fisik, dan pelabelan barang di gudang.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    color: '#047857',
  },
  auditor: {
    label: 'Auditor & Keuangan',
    description: 'Akses peninjauan (read-only) untuk verifikasi stok, audit log, analisis valuasi finansial, dan ekspor laporan.',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    color: '#B45309',
  },
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  admin: {
    canCreateItem: true,
    canEditItem: true,
    canDeleteItem: true,
    canManageStockIn: true,
    canManageStockOut: true,
    canStockOpname: true,
    canTransferStock: true,
    canViewValuation: true,
    canViewReports: true,
    canExportData: true,
    canManageUsers: true,
    canViewAuditLog: true,
    canChangeSettings: true,
  },
  warehouse_manager: {
    canCreateItem: true,
    canEditItem: true,
    canDeleteItem: false, // Hanya admin yang dapat menghapus data permanen
    canManageStockIn: true,
    canManageStockOut: true,
    canStockOpname: true,
    canTransferStock: true,
    canViewValuation: true,
    canViewReports: true,
    canExportData: true,
    canManageUsers: false,
    canViewAuditLog: true,
    canChangeSettings: false,
  },
  staff: {
    canCreateItem: false,
    canEditItem: false,
    canDeleteItem: false,
    canManageStockIn: true,
    canManageStockOut: true,
    canStockOpname: true,
    canTransferStock: true,
    canViewValuation: false, // Rahasia nilai beli/finansial disembunyikan untuk staf operasional
    canViewReports: false,
    canExportData: false,
    canManageUsers: false,
    canViewAuditLog: false,
    canChangeSettings: false,
  },
  auditor: {
    canCreateItem: false,
    canEditItem: false,
    canDeleteItem: false,
    canManageStockIn: false,
    canManageStockOut: false,
    canStockOpname: false,
    canTransferStock: false,
    canViewValuation: true,
    canViewReports: true,
    canExportData: true,
    canManageUsers: false,
    canViewAuditLog: true,
    canChangeSettings: false,
  },
};

export const PERMISSION_LABELS: Record<keyof RolePermission, { label: string; desc: string }> = {
  canCreateItem: {
    label: 'Tambah Master Barang',
    desc: 'Membuat entri item barang baru di katalog.',
  },
  canEditItem: {
    label: 'Ubah Data Barang',
    desc: 'Memperbarui nama, lokasi rak, safety stock, dan harga.',
  },
  canDeleteItem: {
    label: 'Hapus Barang',
    desc: 'Menghapus permanen master barang dari katalog.',
  },
  canManageStockIn: {
    label: 'Barang Masuk (Inbound)',
    desc: 'Mencatat penerimaan stok dari vendor/pemasok.',
  },
  canManageStockOut: {
    label: 'Barang Keluar (Outbound)',
    desc: 'Mencatat pengiriman atau pengeluaran stok barang.',
  },
  canStockOpname: {
    label: 'Penyesuaian Stok (Opname)',
    desc: 'Melakukan rekonsiliasi selisih fisik vs sistem.',
  },
  canTransferStock: {
    label: 'Mutasi Antar Lokasi',
    desc: 'Memindahkan stok antar rak atau antar gudang.',
  },
  canViewValuation: {
    label: 'Lihat Nilai Valuasi & HPP',
    desc: 'Melihat harga modal, potensi margin, dan total nilai aset.',
  },
  canViewReports: {
    label: 'Akses Pelaporan Otomatis',
    desc: 'Membuka modul laporan analitik dan prediksi restock.',
  },
  canExportData: {
    label: 'Ekspor Data & Cetak Resmi',
    desc: 'Mengunduh format CSV dan mencetak Berita Acara resmi.',
  },
  canManageUsers: {
    label: 'Kelola Hak Akses Pengguna',
    desc: 'Menambah user baru dan mengubah peran/jabatan.',
  },
  canViewAuditLog: {
    label: 'Log Audit Keamanan',
    desc: 'Memeriksa riwayat jejak aktivitas pengguna.',
  },
  canChangeSettings: {
    label: 'Pengaturan Sistem',
    desc: 'Mengubah konfigurasi jadwal otomatis & parameter sistem.',
  },
};
