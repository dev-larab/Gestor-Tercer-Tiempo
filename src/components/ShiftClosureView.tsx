import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Banknote,
  CheckCircle2,
  XCircle,
  KeyRound,
  Sparkles,
  User as UserIcon,
  MessageSquare,
  Save,
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  Check,
  ClipboardCheck,
  ShieldCheck,
  X,
  Lock,
  AlertTriangle,
  ChevronDown,
  Search,
  Package
} from 'lucide-react';
import { Product, ProductCategory, ShiftClosure, User } from '../types';

interface ShiftClosureViewProps {
  closures: ShiftClosure[];
  products: Product[];
  currentUser: User | null;
  onAddClosure: (closureData: Omit<ShiftClosure, 'id' | 'timestamp'>) => void;
  onDeleteClosure: (closureId: string) => void;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bebidas: 'Bebidas',
  comida: 'Comida',
  hielo: 'Hielo',
  snacks: 'Snacks',
  menaje: 'Menaje',
  limpieza: 'Limpieza',
  otros: 'Otros',
};

export const ShiftClosureView: React.FC<ShiftClosureViewProps> = ({
  closures,
  products,
  currentUser,
  onAddClosure,
  onDeleteClosure
}) => {
  // Form state
  const [revenue, setRevenue] = useState<string>('');
  const [cleaningCompleted, setCleaningCompleted] = useState<boolean>(false);
  const [barClosed, setBarClosed] = useState<boolean>(false);
  const [keysReturned, setKeysReturned] = useState<boolean>(false);
  const [selectedLowStockIds, setSelectedLowStockIds] = useState<string[]>([]);
  const [responsibleName, setResponsibleName] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [closureToDelete, setClosureToDelete] = useState<ShiftClosure | null>(null);

  // Low-stock multi-select dropdown state
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState<boolean>(false);
  const [stockSearchQuery, setStockSearchQuery] = useState<string>('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState<'all' | ProductCategory>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStockDropdownOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStockDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Sort inventory products cleanly by category and name
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'es');
      }
      return a.name.localeCompare(b.name, 'es');
    });
  }, [products]);

  const availableCategories = useMemo(() => {
    const cats = new Set<ProductCategory>();
    products.forEach((p) => cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = stockSearchQuery.trim().toLowerCase();
    return sortedProducts.filter((product) => {
      const matchesCategory =
        stockCategoryFilter === 'all' || product.category === stockCategoryFilter;
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.unit.toLowerCase().includes(q) ||
        CATEGORY_LABELS[product.category].toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [sortedProducts, stockSearchQuery, stockCategoryFilter]);

  const selectedProductsList = useMemo(() => {
    const idSet = new Set(selectedLowStockIds);
    return sortedProducts.filter((p) => idSet.has(p.id));
  }, [sortedProducts, selectedLowStockIds]);

  const toggleLowStockProduct = (productId: string) => {
    setSelectedLowStockIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Quick revenue presets in euros
  const quickPresets = [50, 100, 200, 300, 500];

  const handleAddPreset = (amount: number) => {
    const currentVal = parseFloat(revenue) || 0;
    setRevenue((currentVal + amount).toFixed(2));
  };

  const completedChecksCount =
    (cleaningCompleted ? 1 : 0) + (barClosed ? 1 : 0) + (keysReturned ? 1 : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedRevenue = parseFloat(revenue);
    if (isNaN(parsedRevenue) || parsedRevenue < 0) {
      setError('Por favor, introduce un importe de recaudación válido en euros (ej: 450.50).');
      return;
    }

    if (!responsibleName.trim()) {
      setError('Por favor, indica el nombre del Responsable de turno que efectúa el cierre.');
      return;
    }

    const todayDate = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const lowStockNames = selectedProductsList.map((p) => p.name);

    onAddClosure({
      date: todayDate,
      time: timeStr,
      revenue: parsedRevenue,
      cleaningCompleted,
      barClosed,
      keysReturned,
      lowStockItems: lowStockNames,
      responsibleName: responsibleName.trim(),
      comments: comments.trim() || undefined,
      userId: currentUser?.id
    });

    // Reset form for next closure
    setRevenue('');
    setCleaningCompleted(false);
    setBarClosed(false);
    setKeysReturned(false);
    setSelectedLowStockIds([]);
    setStockSearchQuery('');
    setStockCategoryFilter('all');
    setIsStockDropdownOpen(false);
    setResponsibleName('');
    setComments('');
    setError(null);
  };

  // Metrics
  const totalRevenueAll = closures.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const latestClosure = closures[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Compact Header & Summary Strip */}
      <div className="bg-[#101713] border border-emerald-900/50 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Fin de Turno • Barra UPNA
              </span>
              <span className="text-xs text-zinc-400 capitalize">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <h1 className="font-rugby text-2xl sm:text-3xl text-white font-bold tracking-wide">
              CIERRE DE JORNADA
            </h1>
          </div>

          {currentUser && (
            <div className="flex items-center gap-2.5 bg-[#0b100d] px-3.5 py-2 rounded-xl border border-emerald-950 self-start sm:self-auto">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                  currentUser.role === 'admin' ? 'bg-amber-600' : 'bg-emerald-600'
                }`}
              >
                {currentUser.role === 'admin' ? '👑' : '🏉'}
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
                <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                  {currentUser.roleLabel}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sleek 3-Metric Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-emerald-950/70">
          <div className="flex items-center justify-between bg-[#0a0f0d] px-3.5 py-2.5 rounded-xl border border-emerald-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Banknote className="w-4 h-4" />
              </div>
              <span className="text-xs text-zinc-400 font-medium">Total acumulado</span>
            </div>
            <span className="font-rugby text-lg sm:text-xl font-bold text-white">
              {totalRevenueAll.toLocaleString('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              €
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#0a0f0d] px-3.5 py-2.5 rounded-xl border border-emerald-900/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs text-zinc-400 font-medium truncate">
                {latestClosure ? `Último (${latestClosure.date})` : 'Último cierre'}
              </span>
            </div>
            <span className="font-rugby text-lg sm:text-xl font-bold text-emerald-400 shrink-0 ml-2">
              {latestClosure ? `${latestClosure.revenue.toFixed(2)}€` : '0.00€'}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#0a0f0d] px-3.5 py-2.5 rounded-xl border border-emerald-900/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ClipboardCheck className="w-4 h-4" />
              </div>
              <span className="text-xs text-zinc-400 font-medium">Actas guardadas</span>
            </div>
            <span className="font-rugby text-lg sm:text-xl font-bold text-white">
              {closures.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Simplified Closure Form */}
      <div className="bg-[#101713] border border-emerald-900/60 rounded-3xl p-5 sm:p-7 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-emerald-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ClipboardCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-rugby text-xl text-white font-bold tracking-wide">
                REGISTRAR CIERRE DE HOY
              </h2>
              <p className="text-xs text-zinc-400">
                Indica la caja, confirma los 3 pasos de cierre y avisa si falta algún producto.
              </p>
            </div>
          </div>

          <span
            className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full border ${
              completedChecksCount === 3
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                : 'bg-[#0a0f0d] text-zinc-400 border-emerald-900/50'
            }`}
          >
            Checklist: {completedChecksCount}/3 listos
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Recaudación + Responsable */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Recaudación de la Jornada (7 cols) */}
            <div className="lg:col-span-7 bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="revenue-input"
                  className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2"
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Recaudación de la Jornada (€) *</span>
                </label>
                <span className="text-[11px] text-zinc-400">Total en caja</span>
              </div>

              <div className="relative">
                <input
                  id="revenue-input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full bg-[#121c17] border-2 border-emerald-900/60 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-2xl font-rugby font-bold text-white placeholder-zinc-600 outline-none transition-all pl-11"
                />
                <span className="absolute left-4 top-3 text-xl font-bold text-emerald-400 font-mono">
                  €
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-zinc-500 uppercase font-bold mr-1">
                  Sumar:
                </span>
                {quickPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900 hover:text-white transition-all cursor-pointer"
                  >
                    +{preset}€
                  </button>
                ))}
                {revenue && (
                  <button
                    type="button"
                    onClick={() => setRevenue('')}
                    className="px-2 py-1 text-xs font-medium rounded-lg text-zinc-400 hover:text-rose-400 ml-auto cursor-pointer"
                    title="Borrar importe"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>

            {/* Nombre del Responsable de Turno (5 cols) */}
            <div className="lg:col-span-5 bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40 flex flex-col justify-between space-y-2.5">
              <div>
                <label
                  htmlFor="responsible-name-input"
                  className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 mb-2"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  <span>Responsable de Turno *</span>
                </label>
                <div className="relative">
                  <input
                    id="responsible-name-input"
                    type="text"
                    required
                    placeholder="Responsable de Turno"
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    className="w-full bg-[#121c17] border border-emerald-900/60 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:placeholder-transparent outline-none transition-all pl-10"
                  />
                  <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Persona encargada de la caja y verificación del cierre de hoy.
              </p>
            </div>
          </div>

          {/* Row 2: 3-Checkbox Control Grid (Limpieza, Cierre del Bar, Llaves) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Verificaciones de Cierre
              </span>
              <span className="text-[11px] text-zinc-400">
                Marca las casillas completadas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Checkbox 1: Limpieza */}
              <button
                type="button"
                id="btn-confirm-cleaning"
                role="checkbox"
                aria-checked={cleaningCompleted}
                onClick={() => setCleaningCompleted((prev) => !prev)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-[0.99] ${
                  cleaningCompleted
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/40'
                    : 'bg-[#0a0f0d] text-zinc-300 border-emerald-900/40 hover:border-emerald-700/70'
                }`}
              >
                <div
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    cleaningCompleted
                      ? 'bg-black text-emerald-400'
                      : 'border-2 border-zinc-600 bg-[#121c17]'
                  }`}
                >
                  {cleaningCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <Sparkles
                        className={`w-4 h-4 shrink-0 ${
                          cleaningCompleted ? 'text-white' : 'text-emerald-400'
                        }`}
                      />
                      <span>Limpieza</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cleaningCompleted
                          ? 'bg-black/25 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {cleaningCompleted ? 'LISTO' : 'PENDIENTE'}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-snug ${
                      cleaningCompleted ? 'text-emerald-100' : 'text-zinc-400'
                    }`}
                  >
                    Barra recogida, vajilla fregada y basura tirada
                  </p>
                </div>
              </button>

              {/* Checkbox 2: Cierre del Bar (NEW) */}
              <button
                type="button"
                id="btn-confirm-bar-closed"
                role="checkbox"
                aria-checked={barClosed}
                onClick={() => setBarClosed((prev) => !prev)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-[0.99] ${
                  barClosed
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/40'
                    : 'bg-[#0a0f0d] text-zinc-300 border-emerald-900/40 hover:border-emerald-700/70'
                }`}
              >
                <div
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    barClosed
                      ? 'bg-black text-emerald-400'
                      : 'border-2 border-zinc-600 bg-[#121c17]'
                  }`}
                >
                  {barClosed && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <Lock
                        className={`w-4 h-4 shrink-0 ${
                          barClosed ? 'text-white' : 'text-emerald-400'
                        }`}
                      />
                      <span>Cierre del Bar</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        barClosed
                          ? 'bg-black/25 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {barClosed ? 'CERRADO' : 'PENDIENTE'}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-snug ${
                      barClosed ? 'text-emerald-100' : 'text-zinc-400'
                    }`}
                  >
                    Grifos cerrados, cámaras, luces y persiana bajada
                  </p>
                </div>
              </button>

              {/* Checkbox 3: Llaves en Recepción */}
              <button
                type="button"
                id="btn-confirm-keys"
                role="checkbox"
                aria-checked={keysReturned}
                onClick={() => setKeysReturned((prev) => !prev)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer select-none active:scale-[0.99] ${
                  keysReturned
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/40'
                    : 'bg-[#0a0f0d] text-zinc-300 border-emerald-900/40 hover:border-emerald-700/70'
                }`}
              >
                <div
                  className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    keysReturned
                      ? 'bg-black text-emerald-400'
                      : 'border-2 border-zinc-600 bg-[#121c17]'
                  }`}
                >
                  {keysReturned && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <KeyRound
                        className={`w-4 h-4 shrink-0 ${
                          keysReturned ? 'text-white' : 'text-emerald-400'
                        }`}
                      />
                      <span>Llaves UPNA</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        keysReturned
                          ? 'bg-black/25 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {keysReturned ? 'DEVUELTAS' : 'PENDIENTE'}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-1 leading-snug ${
                      keysReturned ? 'text-emerald-100' : 'text-zinc-400'
                    }`}
                  >
                    Llaves de vestuario y barra en recepción
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Row 3: Aviso de Stock Bajo (Desplegable Multi-Selección Inteligente) */}
          <div
            ref={dropdownRef}
            className="bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40 space-y-3 relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Aviso de Reposición: ¿Queda poco de algún artículo?</span>
                </label>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Abre el desplegable y marca los artículos del inventario que están bajo mínimos para avisar al administrador.
                </p>
              </div>

              <span
                className={`self-start sm:self-auto text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                  selectedLowStockIds.length > 0
                    ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                    : 'bg-[#121c17] text-zinc-400 border-emerald-900/50'
                }`}
              >
                {selectedLowStockIds.length === 0
                  ? 'Sin avisos'
                  : `${selectedLowStockIds.length} ${
                      selectedLowStockIds.length === 1 ? 'artículo marcado' : 'artículos marcados'
                    }`}
              </span>
            </div>

            {/* Dropdown Trigger Button */}
            <button
              id="btn-low-stock-dropdown"
              type="button"
              onClick={() => setIsStockDropdownOpen((prev) => !prev)}
              aria-expanded={isStockDropdownOpen}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                isStockDropdownOpen
                  ? 'bg-[#141f19] border-amber-500/70 ring-1 ring-amber-500/30'
                  : 'bg-[#121c17] border-emerald-900/60 hover:border-amber-600/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Package className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
                  {selectedLowStockIds.length === 0
                    ? `Desplegar lista del inventario (${products.length} artículos disponibles)...`
                    : `${selectedLowStockIds.length} ${
                        selectedLowStockIds.length === 1
                          ? 'artículo marcado como queda poco'
                          : 'artículos marcados como queda poco'
                      } — pulsar para añadir o quitar`}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                  isStockDropdownOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Expandable Multi-Select Checklist Panel */}
            {isStockDropdownOpen && (
              <div className="rounded-2xl bg-[#0e1612] border border-amber-800/50 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-30">
                {/* Search + Category Filters */}
                <div className="p-3 border-b border-emerald-950/80 space-y-2.5 bg-[#121b16]">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={stockSearchQuery}
                      onChange={(e) => setStockSearchQuery(e.target.value)}
                      placeholder="Buscar artículo (ej: cerveza, hielo, vasos, tortilla...)"
                      className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-amber-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-all"
                    />
                    {stockSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStockSearchQuery('')}
                        className="absolute right-2.5 top-2 text-zinc-400 hover:text-white cursor-pointer"
                        title="Limpiar búsqueda"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Category filter pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setStockCategoryFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        stockCategoryFilter === 'all'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#0a0f0d] text-zinc-400 hover:text-white border border-emerald-900/40'
                      }`}
                    >
                      Todos ({products.length})
                    </button>
                    {availableCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setStockCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                          stockCategoryFilter === cat
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#0a0f0d] text-zinc-400 hover:text-white border border-emerald-900/40'
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable Inventory Checklist */}
                <div className="max-h-64 overflow-y-auto divide-y divide-emerald-950/60">
                  {filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400">
                      No se encontraron artículos con "{stockSearchQuery}".
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const isChecked = selectedLowStockIds.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          role="checkbox"
                          aria-checked={isChecked}
                          onClick={() => toggleLowStockProduct(product.id)}
                          className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-amber-950/60 hover:bg-amber-950/70'
                              : 'hover:bg-emerald-950/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-amber-600 text-white shadow-sm'
                                  : 'border border-zinc-600 bg-[#0a0f0d]'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <span
                                className={`text-xs sm:text-sm font-semibold block truncate ${
                                  isChecked ? 'text-amber-200' : 'text-zinc-200'
                                }`}
                              >
                                {product.name}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {CATEGORY_LABELS[product.category]} • Formato: {product.unit}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              isChecked
                                ? 'bg-amber-600 text-white'
                                : 'bg-[#121c17] text-zinc-400 border border-emerald-900/40'
                            }`}
                          >
                            {isChecked ? 'Queda poco' : 'Marcar'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Sticky Dropdown Footer */}
                <div className="p-3 border-t border-emerald-950/80 bg-[#121b16] flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-400">
                    <strong className="text-amber-300">{selectedLowStockIds.length}</strong>{' '}
                    {selectedLowStockIds.length === 1 ? 'marcado' : 'marcados'}
                  </span>

                  <div className="flex items-center gap-2">
                    {selectedLowStockIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedLowStockIds([])}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsStockDropdownOpen(false)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Listo</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Low-Stock Chips Preview (Always visible when items are selected) */}
            {selectedProductsList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-semibold text-amber-300 mr-1">
                  Marcados ({selectedProductsList.length}):
                </span>
                {selectedProductsList.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-950/60 text-amber-200 border border-amber-800/60"
                  >
                    <span>{item.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleLowStockProduct(item.id)}
                      className="p-0.5 rounded hover:bg-black/25 text-amber-300 hover:text-white transition-colors cursor-pointer"
                      title={`Quitar ${item.name}`}
                      aria-label={`Quitar ${item.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedLowStockIds([])}
                  className="text-[11px] text-zinc-400 hover:text-rose-400 ml-1 underline cursor-pointer"
                >
                  Quitar todos
                </button>
              </div>
            )}
          </div>

          {/* Row 4: Comentarios */}
          <div className="bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40 space-y-2">
            <label
              htmlFor="comments-input"
              className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Observaciones de la Jornada (opcional)</span>
            </label>
            <textarea
              id="comments-input"
              rows={2}
              placeholder="Incidencias con barriles, tercer tiempo con el rival, cambios de dinero o notas para la directiva..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full bg-[#121c17] border border-emerald-900/60 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-zinc-500 outline-none resize-none transition-all"
            />
          </div>

          {/* Save Footer */}
          <div className="pt-3 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                El cierre, los 3 checks y los avisos de stock quedarán guardados en el historial del club.
              </span>
            </div>

            <button
              id="btn-save-shift-closure"
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-black font-rugby font-bold text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 hover:scale-[1.01]"
            >
              <Save className="w-5 h-5 stroke-[2.5]" />
              <span>GUARDAR CIERRE DE JORNADA</span>
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIAL DE CIERRES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-950/80">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="font-rugby text-xl text-white font-bold tracking-wide">
              HISTORIAL DE CIERRES
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              {closures.length} registros
            </span>
          </div>
          <span className="text-xs text-zinc-500">
            Orden cronológico (más recientes primero)
          </span>
        </div>

        {closures.length === 0 ? (
          <div className="bg-[#101713] border border-emerald-900/40 rounded-2xl p-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="font-rugby text-lg text-zinc-300 font-bold">
              No hay cierres de jornada registrados aún
            </h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Utiliza el formulario superior para registrar la recaudación, verificaciones y avisos de stock de hoy.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {closures.map((closure) => {
              const formattedDate = new Date(closure.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              const hasLowStock = Array.isArray(closure.lowStockItems) && closure.lowStockItems.length > 0;

              return (
                <div
                  key={closure.id}
                  className="bg-[#101713] border border-emerald-900/40 hover:border-emerald-700/60 rounded-2xl p-5 transition-all shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-emerald-950/70">
                    {/* Left: Fecha de ese día y hora */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#090e0b] border border-emerald-900/60 flex flex-col items-center justify-center text-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 leading-none">
                          {new Date(closure.date).toLocaleDateString('es-ES', { month: 'short' })}
                        </span>
                        <span className="font-rugby text-xl font-bold text-white leading-tight">
                          {new Date(closure.date).getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-rugby text-lg text-white font-bold capitalize">
                            {formattedDate}
                          </h4>
                          <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            {closure.time || 'Cierre fin de jornada'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <UserIcon className="w-3 h-3 text-emerald-400" />
                          <span>
                            Responsable: <strong className="text-zinc-200">{closure.responsibleName}</strong>
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Recaudación Destacada y botón de borrar */}
                    <div className="flex items-center gap-4 self-end md:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                          Recaudación Declarada
                        </span>
                        <span className="font-rugby text-2xl sm:text-3xl font-bold text-emerald-400">
                          {closure.revenue.toLocaleString('es-ES', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                          €
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setClosureToDelete(closure)}
                        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar este cierre de jornada"
                        aria-label="Eliminar cierre"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Badges de Confirmación (Limpieza, Cierre del Bar, Llaves) */}
                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Limpieza Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs border ${
                          closure.cleaningCompleted
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                        }`}
                      >
                        {closure.cleaningCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                            <span>Limpieza Realizada</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Limpieza No Confirmada</span>
                          </>
                        )}
                      </span>

                      {/* Cierre del Bar Badge */}
                      {closure.barClosed === undefined ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs border bg-zinc-800/80 text-zinc-400 border-zinc-700/60">
                          <Lock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Cierre de Bar: Registro anterior</span>
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs border ${
                            closure.barClosed
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                              : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                          }`}
                        >
                          {closure.barClosed ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                              <span>Bar Cerrado</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Cierre de Bar Pendiente</span>
                            </>
                          )}
                        </span>
                      )}

                      {/* Devolución de Llaves Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs border ${
                          closure.keysReturned
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                            : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                        }`}
                      >
                        {closure.keysReturned ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                            <span>Llaves en Recepción UPNA</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Llaves Pendientes de Devolución</span>
                          </>
                        )}
                      </span>
                    </div>

                    {closure.timestamp && (
                      <span className="text-[11px] text-zinc-500">
                        Registrado el {new Date(closure.timestamp).toLocaleDateString('es-ES')} a las{' '}
                        {new Date(closure.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>

                  {/* Aviso de artículos con poco stock marcados en este cierre */}
                  {hasLowStock && (
                    <div className="mt-3 bg-amber-950/60 p-3 rounded-xl border border-amber-800/50 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          Aviso de Reposición — Queda poco ({closure.lowStockItems!.length}{' '}
                          {closure.lowStockItems!.length === 1 ? 'artículo' : 'artículos'})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {closure.lowStockItems!.map((itemName, idx) => (
                          <span
                            key={`${closure.id}-low-${idx}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0a0f0d] text-amber-200 border border-amber-800/60"
                          >
                            <Package className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{itemName}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(closure.lowStockItems) && closure.lowStockItems.length === 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-400/80">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Sin artículos marcados con falta de stock en esta jornada</span>
                    </div>
                  )}

                  {/* Comentarios / Observaciones */}
                  {closure.comments && (
                    <div className="mt-3 bg-[#0a0f0d] p-3 rounded-xl border border-emerald-950 text-xs">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Observaciones del Responsable:
                      </span>
                      <p className="text-zinc-200 italic">"{closure.comments}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal to Delete Closure */}
      {closureToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-[#0e1612] border border-rose-900/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-rose-950/60 bg-[#160f11]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-800/60 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    ¿Eliminar cierre de jornada?
                  </h3>
                  <p className="text-xs text-rose-300/80">Confirmación de borrado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClosureToDelete(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#131b16] border border-emerald-950/80 space-y-1.5">
                <p className="text-zinc-400">
                  Fecha: <strong className="text-white">{closureToDelete.date}</strong> ({closureToDelete.time})
                </p>
                <p className="text-zinc-400">
                  Responsable: <strong className="text-white">{closureToDelete.responsibleName}</strong>
                </p>
                <p className="text-emerald-400 font-bold text-sm">
                  Recaudación: {closureToDelete.revenue.toFixed(2)}€
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  Esta acción eliminará el registro de caja y cierre de forma permanente de la base de datos.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-rose-950/60 bg-[#121915] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setClosureToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteClosure(closureToDelete.id);
                  setClosureToDelete(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-950/50 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
