import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCcw, 
  Info,
  Menu,
  LogOut,
  Users,
  Shield,
  Crown,
  ChevronDown,
  ClipboardCheck,
  Cloud,
  Zap,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onToggleSidebarCollapse: () => void;
  isSidebarCollapsed: boolean;
  onOpenMobileSidebar: () => void;
  onOpenQuickBar: () => void;
  onResetData: () => void;
  currentUser: User;
  onLogout: () => void;
  onOpenUserModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebarCollapse,
  isSidebarCollapsed,
  onOpenMobileSidebar,
  onOpenQuickBar,
  onResetData,
  currentUser,
  onLogout,
  onOpenUserModal
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === 'admin';

  // Close user dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0a0d0c]/95 backdrop-blur-md border-b border-emerald-950/70 shadow-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left section: Mobile menu toggle + Desktop sidebar collapse toggle + Club Logo & Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile hamburger menu toggle */}
            <button
              id="btn-header-mobile-menu"
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 text-zinc-300 hover:text-white hover:bg-emerald-950/50 rounded-xl transition-colors border border-emerald-900/40"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5 text-emerald-400" />
            </button>

            {/* Desktop sidebar toggle button */}
            <button
              id="btn-header-toggle-sidebar"
              onClick={onToggleSidebarCollapse}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111915] hover:bg-[#16231c] border border-emerald-900/50 hover:border-emerald-700/60 text-zinc-300 hover:text-emerald-300 transition-all text-xs font-semibold shadow-sm"
              title={isSidebarCollapsed ? 'Expandir menú lateral vertical' : 'Contraer menú lateral vertical'}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xl:inline">Expandir Menú</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xl:inline">Contraer Menú</span>
                </>
              )}
            </button>

            {/* Rugby Shield Emblem & Club Title */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-black p-0.5 shadow-lg shadow-emerald-950/50 transition-transform">
                <div className="w-full h-full bg-[#0d1310] rounded-[10px] flex items-center justify-center relative overflow-hidden border border-emerald-500/30">
                  {/* Rugby Ball Visual in Green & Black */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-black" />
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 transform -rotate-45"
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <ellipse cx="12" cy="12" rx="10" ry="6" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                    <line x1="8" y1="7" x2="8" y2="17" />
                    <line x1="16" y1="7" x2="16" y2="17" />
                  </svg>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-rugby text-lg sm:text-2xl font-bold uppercase tracking-wider text-white">
                    La Única <span className="text-emerald-400">Rugby Taldea</span>
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800/60">
                    1983 • Iruña
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-300/80 font-medium tracking-wide flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Gestión del Tercer Tiempo (Hirugarren Denbora)</span>
                  <span className="hidden sm:inline text-zinc-500">•</span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-[10px] text-emerald-300 font-sans font-semibold">
                    <Cloud className="w-2.5 h-2.5 text-emerald-400" /> Nube Firebase activa
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Action buttons & User profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Bar Mode Button (Special for club matchdays) */}
            <button
              id="btn-quick-bar-mode"
              onClick={onOpenQuickBar}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all rounded-xl shadow-lg shadow-emerald-500/20"
              title="Modo Rápido de Bar: botones gigantes +/- para registrar consumos durante el partido"
            >
              <Zap className="w-4 h-4 fill-emerald-950" />
              <span className="hidden sm:inline">Modo Bar Rápido</span>
              <span className="sm:hidden">Bar</span>
            </button>

            {/* Reset / Backup Dropdown button (Admin only action) */}
            <div className="relative">
              <button
                id="btn-header-reset"
                onClick={() => setShowConfirmReset(!showConfirmReset)}
                className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors border border-transparent hover:border-emerald-800/40"
                title="Reiniciar datos de muestra"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {showConfirmReset && (
                <div className="absolute right-0 mt-2 w-72 bg-[#141c18] border border-emerald-900/60 rounded-xl p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {isAdmin ? (
                    <>
                      <div className="flex items-start gap-2 text-xs text-zinc-300 mb-3">
                        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>¿Restablecer el inventario y calendario a los datos originales del club?</span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowConfirmReset(false)}
                          className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white rounded bg-zinc-800"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            onResetData();
                            setShowConfirmReset(false);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded"
                        >
                          Restablecer
                        </button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="flex items-start gap-2 text-xs text-zinc-300 mb-2">
                        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-300">Función restringida</p>
                          <p className="text-zinc-400 text-[11px] mt-0.5">
                            Solo el usuario Administrador (<span className="text-white font-mono">admin</span>) puede reiniciar los datos del club.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => setShowConfirmReset(false)}
                          className="px-2.5 py-1 text-xs text-zinc-300 hover:text-white rounded bg-zinc-800"
                        >
                          Entendido
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Session Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                id="btn-user-menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#121a15] hover:bg-[#18241d] border border-emerald-900/50 hover:border-emerald-700/60 transition-all text-left"
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                  isAdmin ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {isAdmin ? <Crown className="w-4 h-4" /> : currentUser.name.charAt(0).toUpperCase()}
                </div>

                <div className="hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-tight">
                      {currentUser.name}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      isAdmin 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {isAdmin ? 'Admin' : 'Responsable'}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-mono">
                    @{currentUser.username}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#121c16] border border-emerald-900/70 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User info card */}
                  <div className="p-2.5 mb-2 rounded-lg bg-[#18261e] border border-emerald-950/80">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                        isAdmin ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}>
                        {isAdmin ? <Crown className="w-4 h-4" /> : currentUser.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-emerald-400 font-mono">@{currentUser.username}</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-emerald-900/40 text-[11px] text-zinc-400 flex items-center justify-between">
                      <span>Nivel de acceso:</span>
                      <span className="font-semibold text-emerald-300">
                        {isAdmin ? '👑 Total (Directiva)' : '🏉 Responsable de Turno'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenUserModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-emerald-950/60 rounded-lg transition-colors text-left"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Gestionar usuarios y accesos</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/50 rounded-lg transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
