import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { generateId } from '../utils/storage';
import { 
  Users, 
  X, 
  ShieldCheck, 
  UserPlus, 
  Crown, 
  Trash2, 
  Check, 
  KeyRound, 
  AlertCircle 
} from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onAddUser,
  onDeleteUser,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = newUsername.trim().toLowerCase();
    const cleanPassword = newPassword.trim();
    const cleanName = newName.trim();

    if (!cleanUsername || !cleanPassword || !cleanName) {
      setError('Por favor, completa todos los campos del usuario.');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      setError(`El nombre de usuario "${cleanUsername}" ya existe.`);
      return;
    }

    const newUser: User = {
      id: generateId('user'),
      username: cleanUsername,
      password: cleanPassword,
      name: cleanName,
      role: newRole,
      roleLabel: newRole === 'admin' ? 'Administrador' : 'Responsable de Turno',
      badge: newRole === 'admin' ? 'Directiva / Admin' : 'Responsable de Turno',
      avatarColor: newRole === 'admin' ? 'bg-emerald-600' : 'bg-teal-600',
    };

    onAddUser(newUser);
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0e1612] border border-emerald-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-950/80 bg-[#121b16]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/40 text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Usuarios y Accesos del Club
              </h2>
              <p className="text-xs text-zinc-400">
                Gestión de cuentas para los terceros tiempos de La Única RT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Current Session Info */}
          <div className="p-4 rounded-xl bg-[#14201a] border border-emerald-900/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{currentUser.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentUser.role === 'admin' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {currentUser.role === 'admin' ? '👑 Admin' : '🏉 Responsable'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Usuario actual: <span className="font-mono text-emerald-400 font-medium">@{currentUser.username}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Permisos activos:</span>
              <span className="text-xs font-semibold text-emerald-300">
                {currentUser.role === 'admin' ? 'Acceso Total (Admin)' : 'Responsable de Turno'}
              </span>
            </div>
          </div>

          {/* User List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Cuentas Registradas ({users.length})
              </h3>
              {isAdmin && !showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Nuevo Usuario
                </button>
              )}
            </div>

            {/* Create User Form (Admin only) */}
            {showAddForm && isAdmin && (
              <form onSubmit={handleCreateUser} className="mb-4 p-4 rounded-xl bg-[#131d17] border border-emerald-800/60 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-900/40">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    Alta de Nuevo Usuario
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="ej: Jon Ander (Barra)"
                      required
                      className="w-full bg-[#18251e] border border-emerald-900/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                      Nombre de Usuario (login)
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="ej: jon_lurt"
                      required
                      className="w-full bg-[#18251e] border border-emerald-900/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Contraseña"
                      required
                      className="w-full bg-[#18251e] border border-emerald-900/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                      Rol / Permisos
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full bg-[#18251e] border border-emerald-900/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="staff">Perfil Responsable de Turno (Operativa de Barra)</option>
                      <option value="admin">Perfil Administrador (Directiva / Acceso Total)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded shadow-md"
                  >
                    Guardar Usuario
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="space-y-2">
              {users.map((u) => {
                const isItemAdmin = u.username === 'admin';
                const isCurrent = u.id === currentUser.id;

                return (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-[#111914] border border-emerald-950/80 flex items-center justify-between hover:border-emerald-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                        u.role === 'admin' ? 'bg-amber-600' : 'bg-emerald-700'
                      }`}>
                        {u.role === 'admin' ? <Crown className="w-4 h-4" /> : u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700/50">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">
                          @{u.username} • <span className="text-zinc-500">{u.role === 'admin' ? 'Administrador' : 'Responsable de Turno'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        u.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'Responsable'}
                      </span>

                      {isAdmin && !isItemAdmin && !isCurrent && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info note about roles */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-xs text-zinc-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">Perfiles y Restricciones del Club:</p>
              <p className="text-zinc-400 mt-0.5 leading-relaxed">
                El <span className="text-white font-medium">Perfil Administrador</span> (<span className="text-white font-mono font-medium">admin</span>) tiene control total para altas, bajas, configuración de stock, proveedores y restablecimiento de datos. El <span className="text-white font-medium">Perfil Responsable de Turno</span> (<span className="text-white font-mono font-medium">responsable</span>) accede para registrar consumos de barra, consultar listas y actualizar existencias durante las jornadas de partido.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-emerald-950/80 bg-[#121b16] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
