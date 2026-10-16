import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { UserRole, RolePermission } from '../types/inventory';
import { ROLE_DEFINITIONS, ROLE_PERMISSIONS, PERMISSION_LABELS } from '../utils/permissions';
import {
  ShieldCheck,
  UserCheck,
  Check,
  X,
  UserPlus,
  Users,
  Lock,
  Eye,
  Edit,
  Shield,
  KeyRound,
} from 'lucide-react';

export const RbacView: React.FC = () => {
  const {
    users,
    currentUser,
    switchUser,
    addUser,
    updateUserRole,
    hasPermission,
    showToast,
  } = useInventory();

  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');

  const permissionsList = Object.keys(PERMISSION_LABELS) as (keyof RolePermission)[];

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('canManageUsers')) {
      showToast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Hanya Super Admin yang diizinkan mendaftarkan akun baru.',
      });
      return;
    }

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      department: newUserDepartment.trim() || 'Operasional Pergudangan',
      role: newUserRole,
    });

    setNewUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserDepartment('');
    setNewUserRole('staff');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Keamanan & Tata Kelola
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">RBAC (Role-Based Access Control)</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Sistem Kontrol Akses Berbasis Peran
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manajemen hierarki otorisasi, pembatasan data finansial sensitif, dan delegasi tugas operasional.
          </p>
        </div>

        {hasPermission('canManageUsers') && (
          <button
            onClick={() => setNewUserModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Active Persona Simulation Switcher */}
      <div className="p-5 bg-white rounded-xl border border-neutral-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Simulasi Profil Pengguna Aktif (Role Switcher)
            </h3>
            <p className="text-xs text-neutral-500">
              Pilih salah satu akun di bawah untuk menguji bagaimana antarmuka menyesuaikan hak akses secara dinamis.
            </p>
          </div>
          <span className="text-xs font-semibold text-neutral-500">
            Aktif: <strong className="text-neutral-900">{currentUser.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {users.map((u) => {
            const isCurrent = u.id === currentUser.id;
            const roleDef = ROLE_DEFINITIONS[u.role];
            return (
              <div
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900/20'
                    : 'bg-neutral-50 hover:bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isCurrent ? 'bg-white text-neutral-900' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {u.avatarText}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isCurrent
                        ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                        : roleDef.badgeClass
                    }`}
                  >
                    {roleDef.label}
                  </span>
                </div>

                <div className="font-bold text-xs truncate">{u.name}</div>
                <div className={`text-[11px] truncate mt-0.5 ${isCurrent ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  {u.department}
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-200/20 flex items-center justify-between text-[10px]">
                  <span className={isCurrent ? 'text-neutral-300' : 'text-neutral-400'}>
                    {isCurrent ? '✓ Sesi Berjalan' : 'Klik untuk Beralih'}
                  </span>
                  <KeyRound className="w-3 h-3 opacity-60" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Capabilities Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(ROLE_DEFINITIONS) as [UserRole, typeof ROLE_DEFINITIONS[UserRole]][]).map(
          ([roleKey, info]) => {
            const isCurrentRole = currentUser.role === roleKey;
            return (
              <div
                key={roleKey}
                className={`p-4 rounded-xl border bg-white ${
                  isCurrentRole ? 'border-neutral-900 shadow-xs' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${info.badgeClass}`}>
                    {info.label}
                  </span>
                  {isCurrentRole && (
                    <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider">
                      Peran Anda
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                  {info.description}
                </p>
              </div>
            );
          }
        )}
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Matriks Hak Akses & Kewenangan Fitur (Permission Matrix)
            </h3>
            <p className="text-xs text-neutral-500">
              Tinjauan lengkap pemetaan hak eksekusi transaksi dan proteksi informasi per peran pengguna.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-neutral-500">
            {permissionsList.length} Kebijakan Otorisasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-700 font-semibold">
                <th className="py-3 px-4 min-w-[240px]">Fitur & Otoritas Sistem</th>
                <th className="py-3 px-3 text-center w-36">Super Admin</th>
                <th className="py-3 px-3 text-center w-36">Manajer Gudang</th>
                <th className="py-3 px-3 text-center w-36">Staff Gudang</th>
                <th className="py-3 px-3 text-center w-36">Auditor Keuangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans text-xs">
              {permissionsList.map((permKey) => {
                const meta = PERMISSION_LABELS[permKey];
                return (
                  <tr key={permKey} className="hover:bg-neutral-50/70">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-neutral-900">{meta.label}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">{meta.desc}</div>
                    </td>

                    {/* Admin */}
                    <td className="py-2.5 px-3 text-center">
                      {ROLE_PERMISSIONS.admin[permKey] ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-400 rounded-full">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    {/* Warehouse Manager */}
                    <td className="py-2.5 px-3 text-center">
                      {ROLE_PERMISSIONS.warehouse_manager[permKey] ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-400 rounded-full">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    {/* Staff */}
                    <td className="py-2.5 px-3 text-center">
                      {ROLE_PERMISSIONS.staff[permKey] ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-400 rounded-full">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>

                    {/* Auditor */}
                    <td className="py-2.5 px-3 text-center">
                      {ROLE_PERMISSIONS.auditor[permKey] ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-100 text-emerald-800 rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-neutral-100 text-neutral-400 rounded-full">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Accounts Management Section */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Daftar Akun Pengguna Terdaftar ({users.length})</h3>
            <p className="text-xs text-neutral-500">Penugasan peran dan departemen operasional masing-masing staf</p>
          </div>
          {!hasPermission('canManageUsers') && (
            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Hanya Super Admin yang dapat mengubah penugasan peran
            </span>
          )}
        </div>

        <div className="divide-y divide-neutral-100">
          {users.map((u) => {
            const roleMeta = ROLE_DEFINITIONS[u.role];
            return (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-xs">
                    {u.avatarText}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-sm">{u.name}</div>
                    <div className="text-neutral-500 mt-0.5">
                      {u.email} · {u.department}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {hasPermission('canManageUsers') ? (
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                      className="px-2.5 py-1.5 text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden"
                    >
                      <option value="admin">Super Admin</option>
                      <option value="warehouse_manager">Manajer Gudang</option>
                      <option value="staff">Staff Gudang</option>
                      <option value="auditor">Auditor Keuangan</option>
                    </select>
                  ) : (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${roleMeta.badgeClass}`}>
                      {roleMeta.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New User Modal */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
              <h3 className="text-base font-semibold text-neutral-900">Tambah Akun Staf Baru</h3>
              <button
                onClick={() => setNewUserModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hendra Wijaya"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Alamat Email Perusahaan *</label>
                <input
                  type="email"
                  required
                  placeholder="hendra@perusahaan.co.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Departemen / Divisi</label>
                <input
                  type="text"
                  placeholder="Contoh: Penerimaan & Pergudangan"
                  value={newUserDepartment}
                  onChange={(e) => setNewUserDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Peran & Hak Akses (Role)</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <option value="staff">Staff Gudang (Pencatatan Fisik)</option>
                  <option value="warehouse_manager">Manajer Gudang (Katalog & Mutasi)</option>
                  <option value="auditor">Auditor & Keuangan (Analisis & Valuasi)</option>
                  <option value="admin">Super Admin (Akses Penuh)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-xs"
                >
                  Daftarkan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
