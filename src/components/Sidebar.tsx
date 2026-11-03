import React from 'react';
import { 
  Package, 
  Truck, 
  Calendar, 
  ShoppingCart, 
  LayoutDashboard, 
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Users,
  Shield,
  Crown,
  X
} from 'lucide-react';
import { User, TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  lowStockCount: number;
  currentUser: User;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenQuickBar: () => void;
  onOpenUserModal: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string | number;
  adminOnly?: boolean;
  description: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount,
  currentUser,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenQuickBar,
  onOpenUserModal,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const navItems: NavItem[] = [
    { 
      id: 'dashboard', 
      label: 'Panel Principal', 
      shortLabel: 'Panel',
      icon: LayoutDashboard,
      description: 'Resumen general, stock crítico y próximos eventos'
    },
    { 
      id: 'inventory', 
      label: 'Inventario & Stock', 
      shortLabel: 'Inventario',
      icon: Package, 
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      description: 'Control de barriles, bebidas, comida y consumibles'
    },
    { 
      id: 'closure', 
      label: 'Cierre de Jornada', 
      shortLabel: 'Cierre',
      icon: ClipboardCheck,
      description: 'Arqueo de caja, limpieza y entrega de llaves'
    },
    { 
      id: 'events', 
      label: 'Partidos & Eventos', 
      shortLabel: 'Eventos',
      icon: Calendar,
      description: 'Calendario de partidos, rivales y tercer tiempo'
    },
    { 
      id: 'suppliers', 
      label: 'Proveedores', 
      shortLabel: 'Proveedores',
      icon: Truck, 
      adminOnly: true,
      description: 'Contactos y pedidos de distribuidores de bebidas'
    },
    { 
      id: 'shopping', 
      label: 'Lista de Compras', 
      shortLabel: 'Compras',
      icon: ShoppingCart, 
      badge: lowStockCount > 0 ? 'Reponer' : undefined,
      adminOnly: true,
      description: 'Productos bajo mínimo para reposición urgente'
    },
  ];

  const handleSelectTab = (tabId: TabType) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const renderNavButtons = (inMobileDrawer = false) => {
    const collapsedMode = isCollapsed && !inMobileDrawer;

    return (
      <nav className="flex flex-col gap-1.5 px-3 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isDisabled = Boolean(item.adminOnly && !isAdmin);

          if (isDisabled) {
            return (
              <div key={item.id} className="relative group">
                <button
                  id={`sidebar-nav-${item.id}`}
                  disabled={true}
                  aria-disabled="true"
                  title="Pestaña restringida: solo perfil Administrador"
                  className={`w-full flex items-center rounded-xl text-zinc-500 bg-zinc-900/30 border border-zinc-800/30 opacity-50 cursor-not-allowed select-none transition-all ${
                    collapsedMode 
                      ? 'justify-center p-3' 
                      : 'justify-between px-3.5 py-2.5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-5 h-5 text-zinc-500 shrink-0" />
                    {!collapsedMode && (
                      <div className="text-left truncate">
                        <span className="text-sm font-medium text-zinc-500 block truncate">
                          {item.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {!collapsedMode && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700/50 shrink-0">
                      Solo Admin
                    </span>
                  )}
                </button>

                {/* Tooltip on collapsed state */}
                {collapsedMode && (
                  <div className="fixed left-20 hidden group-hover:flex items-center z-50 pointer-events-none">
                    <div className="bg-[#141d18] text-zinc-300 text-xs px-3 py-2 rounded-lg shadow-xl border border-zinc-700/60 whitespace-nowrap">
                      <div className="font-semibold text-zinc-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        <span>{item.label}</span>
                        <span className="text-[10px] text-amber-400 font-normal">(Solo Administrador)</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.id} className="relative group">
              <button
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                title={collapsedMode ? `${item.label} - ${item.description}` : undefined}
                className={`w-full flex items-center rounded-xl transition-all duration-150 ${
                  collapsedMode 
                    ? 'justify-center p-3' 
                    : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/60 border border-emerald-500/50'
                    : 'text-zinc-300 hover:text-white hover:bg-emerald-950/40 border border-transparent hover:border-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-emerald-400'
                    }`} />
                    
                    {/* Collapsed notification dot / small badge */}
                    {collapsedMode && item.badge && (
                      <span className="absolute -top-1.5 -right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0d1310] animate-pulse" />
                    )}
                  </div>

                  {!collapsedMode && (
                    <div className="text-left truncate">
                      <span className={`text-sm block truncate ${isActive ? 'font-semibold text-white' : 'font-medium text-zinc-200'}`}>
                        {item.label}
                      </span>
                    </div>
                  )}
                </div>

                {!collapsedMode && item.badge && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                    isActive 
                      ? 'bg-black/30 text-emerald-200 border border-emerald-400/30' 
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Collapsed hover tooltip */}
              {collapsedMode && (
                <div className="fixed left-20 hidden group-hover:flex items-center z-50 pointer-events-none">
                  <div className="bg-[#121c16] text-white text-xs px-3 py-2 rounded-lg shadow-2xl border border-emerald-800/80 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-150">
                    <div className="font-semibold text-emerald-300 flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-500/30 text-rose-300 border border-rose-500/50">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 max-w-xs">{item.description}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP VERTICAL SIDEBAR (collapsible / expandable) */}
      {/* ============================================================== */}
      <aside 
        className={`hidden lg:flex flex-col shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] backdrop-blur-md bg-[#0c120f]/85 border-r border-emerald-950/70 transition-all duration-300 ease-in-out select-none z-30 ${
          isCollapsed ? 'w-20' : 'w-64 xl:w-72'
        }`}
      >
        {/* Sidebar Header with Collapse/Expand Action */}
        <div className={`flex items-center px-3.5 py-3.5 border-b border-emerald-950/60 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90">
                Navegación del Club
              </span>
            </div>
          )}

          <button
            id="btn-toggle-sidebar-collapse"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
            className="p-1.5 text-zinc-400 hover:text-emerald-300 hover:bg-emerald-950/50 rounded-lg transition-colors border border-transparent hover:border-emerald-800/50 group"
            aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-emerald-300">
                <PanelLeftClose className="w-4 h-4 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-[11px] font-medium hidden xl:inline">Contraer</span>
              </div>
            )}
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto py-1">
          {renderNavButtons(false)}

          {/* Quick bar shortcut inside expanded sidebar */}
          {!isCollapsed && (
            <div className="px-3 pt-3 mt-2 border-t border-emerald-950/60">
              <button
                onClick={onOpenQuickBar}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-emerald-900/50 hover:from-emerald-900/80 hover:to-emerald-800/50 border border-emerald-600/30 text-emerald-300 hover:text-white transition-all group shadow-sm text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-400/30 group-hover:bg-emerald-400 group-hover:text-emerald-950 transition-colors">
                  <Zap className="w-4 h-4 text-emerald-400 group-hover:text-emerald-950 group-hover:fill-emerald-950 transition-colors" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block text-white group-hover:text-emerald-200">
                    Modo Bar Rápido
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate">
                    Para días de partido
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Sidebar Footer / User Info */}
        <div className="p-3 border-t border-emerald-950/70 bg-[#090d0b]/80">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#111a14] border border-emerald-900/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                  isAdmin ? 'bg-amber-600 shadow-amber-900/50' : 'bg-emerald-600 shadow-emerald-900/50'
                } shadow`}>
                  {isAdmin ? <Crown className="w-4 h-4" /> : currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">
                    {isAdmin ? '👑 Directiva / Admin' : '🏉 Responsable Turno'}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={onOpenUserModal}
                  title="Gestionar usuarios del club"
                  className="p-1.5 text-zinc-400 hover:text-emerald-300 hover:bg-emerald-950/60 rounded-lg transition-colors shrink-0"
                >
                  <Users className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onToggleCollapse}
                title="Expandir menú lateral"
                className="w-10 h-10 flex items-center justify-center text-emerald-400 hover:bg-emerald-950/60 rounded-xl transition-colors border border-emerald-900/50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE DRAWER SIDEBAR (Responsive on mobile & tablet) */}
      {/* ============================================================== */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[85vw] bg-[#0d1310] border-r border-emerald-900/60 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-emerald-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-black p-0.5 border border-emerald-500/40 flex items-center justify-center">
                  <span className="font-rugby font-bold text-sm text-white">LU</span>
                </div>
                <div>
                  <h3 className="font-rugby font-bold text-sm uppercase text-white tracking-wider">
                    La Única <span className="text-emerald-400">RT</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400 block">Menú de Navegación</span>
                </div>
              </div>

              <button
                onClick={onCloseMobile}
                className="p-2 text-zinc-400 hover:text-white hover:bg-emerald-950/60 rounded-lg transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile User Profile info */}
            <div className="px-4 py-3 bg-[#111a14] border-b border-emerald-950/70">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                  isAdmin ? 'bg-amber-600' : 'bg-emerald-600'
                }`}>
                  {isAdmin ? <Crown className="w-4 h-4" /> : currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-zinc-400 font-mono">@{currentUser.username}</p>
                </div>
              </div>
            </div>

            {/* Quick Bar Button in Drawer */}
            <div className="p-3">
              <button
                onClick={() => {
                  onCloseMobile();
                  onOpenQuickBar();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors shadow-md shadow-emerald-500/20"
              >
                <Zap className="w-4 h-4 fill-emerald-950" />
                <span>Modo Bar Rápido</span>
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto">
              {renderNavButtons(true)}
            </div>

            {/* Admin actions & footer */}
            {isAdmin && (
              <div className="p-3 border-t border-emerald-950/80">
                <button
                  onClick={() => {
                    onCloseMobile();
                    onOpenUserModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-emerald-950/40 rounded-lg transition-colors"
                >
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Gestionar Usuarios y Accesos</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
