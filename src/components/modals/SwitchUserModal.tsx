import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ROLE_DEFINITIONS } from '../../utils/permissions';
import { X, CheckCircle, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchUserModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser } = useInventory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Beralih Akun & Peran Pengguna</h3>
            <p className="text-xs text-neutral-500">
              Pilih identitas staf untuk menguji otorisasi fitur dan proteksi data sensitif.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {users.map((user) => {
            const isSelected = user.id === currentUser.id;
            const roleInfo = ROLE_DEFINITIONS[user.role];

            return (
              <div
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isSelected ? 'bg-white text-neutral-900' : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    {user.avatarText}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm leading-none">{user.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                            : roleInfo.badgeClass
                        }`}
                      >
                        {roleInfo.label}
                      </span>
                    </div>
                    <div className={`text-xs ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                      {user.email} · {user.department}
                    </div>
                    <p className={`text-[11px] leading-relaxed pt-1 ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {roleInfo.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Perubahan peran langsung membatasi akses tombol & menu.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-neutral-700 hover:text-neutral-900"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
