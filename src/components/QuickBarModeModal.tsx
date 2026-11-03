import React, { useState, useMemo } from 'react';
import { X, Zap, Plus, Minus, Search } from 'lucide-react';
import { Product, ProductCategory } from '../types';

interface QuickBarModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onQuickUpdateStock: (productId: string, delta: number, reason: string) => void;
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'Todos los Artículos' },
  { id: 'bebidas', label: '🍺 Bebidas & Barriles' },
  { id: 'comida', label: '🌭 Comida & Carne' },
  { id: 'hielo', label: '🧊 Sacos de Hielo' },
  { id: 'snacks', label: '🥜 Snacks & Aperitivos' },
  { id: 'menaje', label: '🥤 Menaje & Club' },
  { id: 'limpieza', label: '🧼 Limpieza' },
  { id: 'otros', label: '📦 Otros' },
];

export const QuickBarModeModal: React.FC<QuickBarModeModalProps> = ({
  isOpen,
  onClose,
  products,
  onQuickUpdateStock
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesFilter = filter === 'all' || p.category === filter;
      const matchesSearch = 
        !searchTerm.trim() || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.unit.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [products, filter, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0b100d] border-2 border-emerald-500/80 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top Bar with Big Close and Rugby Energy */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/60 bg-[#070b09]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-400/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-rugby text-xl sm:text-2xl font-bold text-white tracking-wider">
                  MODO BAR TERCER TIEMPO
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Táctil Rápido • {products.length} Artículos
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Pulsadores gigantes para registrar consumos o reposiciones con sincronización en tiempo real con Inventario & Stock
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
            title="Cerrar Modo Bar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter Pills & Fast Search Bar */}
        <div className="px-6 py-3 border-b border-emerald-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e1410]">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {CATEGORY_TABS.map((tab) => {
              const count = tab.id === 'all' 
                ? products.length 
                : products.filter(p => p.category === tab.id).length;

              // Hide empty category tabs if no products belong to them
              if (tab.id !== 'all' && count === 0) return null;

              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    filter === tab.id
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filter === tab.id ? 'bg-black/25 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box in Quick Bar */}
          <div className="relative min-w-[200px] sm:w-64 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar artículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#080d0a] border border-zinc-800 rounded-xl pl-9 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Big Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-500" />
              <p className="font-rugby text-lg text-zinc-300">No hay artículos para este filtro</p>
              <p className="text-xs text-zinc-500 mt-1">
                Prueba seleccionando "Todos los Artículos" o borrando el término de búsqueda.
              </p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isLow = p.currentStock < p.minStock;

              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                    isLow
                      ? 'bg-rose-950/40 border-rose-600/80 shadow-lg shadow-rose-950/40'
                      : 'bg-[#121a15] border-emerald-900/60 hover:border-emerald-500/80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                        {p.category}
                      </span>
                      {isLow && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                          Bajo Mínimo ({p.currentStock}/{p.minStock})
                        </span>
                      )}
                    </div>

                    <h3 className="font-rugby text-lg font-bold text-white tracking-wide mt-1 leading-snug">
                      {p.name}
                    </h3>
                  </div>

                  {/* Big Center Stock Display */}
                  <div className="my-4 py-3 bg-[#080d0a] rounded-xl border border-zinc-900 text-center">
                    <div className={`font-rugby text-4xl sm:text-5xl font-extrabold transition-colors ${
                      isLow ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {p.currentStock}
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 uppercase font-semibold">
                      {p.unit} en almacén/barra
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Mínimo seguro: {p.minStock} {p.unit}
                    </div>
                  </div>

                  {/* Giant Tactile Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onQuickUpdateStock(p.id, -1, 'Consumo en Modo Bar')}
                      disabled={p.currentStock <= 0}
                      className="py-3 px-2 rounded-xl bg-zinc-800 hover:bg-rose-900 hover:text-white text-zinc-200 font-rugby text-lg font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                    >
                      <Minus className="w-5 h-5 stroke-[3]" />
                      <span>Gastar 1</span>
                    </button>

                    <button
                      onClick={() => onQuickUpdateStock(p.id, 1, 'Reposición en Modo Bar')}
                      className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-rugby text-lg font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-emerald-950/50"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                      <span>Reponer 1</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-950 bg-[#070b09] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sincronizado con Inventario & Stock: cualquier cambio suma o descuenta existencias inmediatamente.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 text-black font-bold uppercase rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            Listo / Volver
          </button>
        </div>
      </div>
    </div>
  );
};
