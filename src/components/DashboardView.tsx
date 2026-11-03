import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Package, 
  Calendar, 
  Truck, 
  TrendingDown, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Calculator,
  Beer,
  UtensilsCrossed,
  ClipboardCheck
} from 'lucide-react';
import { Product, Supplier, RugbyEvent, StockLog, User, TabType } from '../types';

interface DashboardViewProps {
  products: Product[];
  suppliers: Supplier[];
  events: RugbyEvent[];
  logs: StockLog[];
  currentUser?: User;
  onQuickUpdateStock: (productId: string, delta: number, reason: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onSelectEvent?: (eventId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  suppliers,
  events,
  logs,
  currentUser,
  onQuickUpdateStock,
  onNavigateTab
}) => {
  // Low stock products
  const lowStockProducts = products.filter(p => p.currentStock < p.minStock);
  
  // Next upcoming event
  const upcomingEvents = [...events]
    .filter(e => !e.isCompleted)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextEvent = upcomingEvents[0];

  // Third half estimator state
  const [guestCount, setGuestCount] = useState<number>(nextEvent?.expectedAttendees || 65);

  // Estimations based on rugby third half traditions:
  // ~ 1.2L of beer/beverages per person (1 barrel 50L ≈ 40-50 pints)
  const estBarrels = Math.ceil((guestCount * 1.0) / 50);
  const estBread = Math.ceil(guestCount * 1.1);
  const estTxistorraKg = Math.ceil(guestCount * 0.12);
  const estIceBags = Math.max(2, Math.ceil(guestCount / 25));
  const estSoftDrinks = Math.ceil(guestCount * 0.5);

  // Compare with current stock of these key products
  const beerProduct = products.find(p => p.id === 'prod-1');
  const breadProduct = products.find(p => p.id === 'prod-11');
  const txistorraProduct = products.find(p => p.id === 'prod-8');
  const iceProduct = products.find(p => p.id === 'prod-14');

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Quick Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#121c17] to-[#0c120f] border border-emerald-900/50 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Sede UPNA • Iruña
            </span>
            <span className="text-xs text-zinc-400">Temporada 2026/27</span>
            {currentUser && (
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
                Conectado: {currentUser.name} ({currentUser.role === 'admin' ? '👑 Admin' : '🏉 Responsable de Turno'})
              </span>
            )}
          </div>
          <h1 className="font-rugby text-2xl sm:text-3xl text-white font-bold tracking-wide mt-1">
            CONTROL DE TERCEROS TIEMPOS
          </h1>
          <p className="text-sm text-zinc-300 max-w-2xl">
            Plataforma oficial para la gestión de suministros, compras y catering post-partido de La Única Rugby Taldea.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigateTab('closure')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#14231b] hover:bg-[#1a2e23] border border-emerald-800/80 text-emerald-300 hover:text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
            title="Acceso directo a Cierre de Jornada y Caja"
          >
            <ClipboardCheck className="w-4 h-4 text-emerald-400" />
            <span>Cierre de Jornada</span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => onNavigateTab('shopping')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/60 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Lista de Compras</span>
              {lowStockProducts.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-black/40 text-xs rounded-full font-bold">
                  {lowStockProducts.length}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('inventory')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/60 transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Inventario & Stock</span>
              {lowStockProducts.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full font-bold">
                  {lowStockProducts.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Low Stock Alert */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
            lowStockProducts.length > 0
              ? 'bg-[#1e1111] border-rose-900/70 shadow-rose-950/30 shadow-lg'
              : 'bg-[#101914] border-emerald-900/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Stock Bajo Mínimos
            </span>
            <div className={`p-2 rounded-xl ${
              lowStockProducts.length > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`font-rugby text-4xl font-bold ${
              lowStockProducts.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {lowStockProducts.length}
            </span>
            <span className="text-xs text-zinc-400">
              {lowStockProducts.length === 1 ? 'artículo en alerta' : 'artículos en alerta'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
            {lowStockProducts.length > 0 ? (
              <span className="text-rose-300 font-medium">Requieren reposición urgente</span>
            ) : (
              <span className="text-emerald-400 font-medium">Todo el inventario cubierto</span>
            )}
          </p>
        </div>

        {/* Card 2: Total Inventory Items */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="cursor-pointer rounded-2xl p-5 bg-[#101914] border border-emerald-900/40 hover:border-emerald-600/60 transition-all hover:scale-[1.02]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Referencias
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-rugby text-4xl font-bold text-white">
              {products.length}
            </span>
            <span className="text-xs text-zinc-400">productos</span>
          </div>
          <p className="text-xs text-emerald-400/80 mt-2">
            Bebidas, comida, hielo, snacks y menaje
          </p>
        </div>

        {/* Card 3: Next Match / Event */}
        <div 
          onClick={() => onNavigateTab('events')}
          className="cursor-pointer hover:border-emerald-600/60 hover:scale-[1.02] rounded-2xl p-5 bg-[#101914] border border-emerald-900/40 transition-all"
          title="Ver calendario de partidos & eventos"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Próximo Tercer Tiempo
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          {nextEvent ? (
            <div className="mt-2">
              <div className="text-sm font-bold text-emerald-300 truncate">
                vs {nextEvent.rival || nextEvent.title}
              </div>
              <div className="text-xs text-zinc-300 mt-1 flex items-center gap-1.5">
                <span>{new Date(nextEvent.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span>•</span>
                <span>{nextEvent.time} h</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                👥 Previsión: <strong className="text-white">{nextEvent.expectedAttendees}</strong> personas
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <span className="text-sm text-zinc-400">Sin eventos próximos</span>
            </div>
          )}
        </div>

        {/* Card 4: Suppliers */}
        <div 
          onClick={isAdmin ? () => onNavigateTab('suppliers') : undefined}
          className={`rounded-2xl p-5 bg-[#101914] border border-emerald-900/40 transition-all ${
            isAdmin ? 'cursor-pointer hover:border-emerald-600/60 hover:scale-[1.02]' : ''
          }`}
          title={isAdmin ? 'Ver agenda de proveedores' : 'Proveedores Clave'}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Proveedores Clave
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-rugby text-4xl font-bold text-white">
              {suppliers.length}
            </span>
            <span className="text-xs text-zinc-400">distribuidores</span>
          </div>
          <p className="text-xs text-emerald-400/80 mt-2">
            Bebidas, embutidos, pan, hielo y menaje
          </p>
        </div>
      </div>

      {/* Critical Stock Alerts Banner (if any) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-[#1f1212] border-2 border-rose-900/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-rugby text-lg font-bold text-rose-300 uppercase tracking-wide">
                  ¡Atención! {lowStockProducts.length} {lowStockProducts.length === 1 ? 'artículo está' : 'artículos están'} por debajo del stock mínimo
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Es necesario cursar pedido antes del próximo tercer tiempo para evitar desabastecimiento.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  onClick={() => onNavigateTab('shopping')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ver Pedido Agrupado</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Package className="w-4 h-4" />
                  <span>Ver en Inventario</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick list of top 3 low items */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 3).map((prod) => {
              const deficit = prod.minStock - prod.currentStock;
              return (
                <div 
                  key={prod.id}
                  className="bg-[#2a1616] border border-rose-800/60 rounded-xl p-3 flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-bold text-white truncate">{prod.name}</div>
                    <div className="text-[11px] text-rose-300 mt-0.5">
                      Actual: <strong className="text-rose-200">{prod.currentStock}</strong> / Mínimo: {prod.minStock} {prod.unit}
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-1 text-[11px] font-extrabold text-rose-300 bg-rose-950/90 rounded border border-rose-700/50">
                    Faltan {deficit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Column Layout: Matchday Stock Calculator + Quick Consumption Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Tercer Tiempo Matchday Estimator */}
        <div className="lg:col-span-7 bg-[#101713] border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-emerald-900/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-rugby text-xl font-bold text-white uppercase tracking-wider">
                  Estimador de Tercer Tiempo
                </h2>
                <p className="text-xs text-zinc-400">
                  Calcula la previsión de consumos según la asistencia estimada
                </p>
              </div>
            </div>

            {/* Match selector badge */}
            {nextEvent && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                Próximo: {nextEvent.rival}
              </span>
            )}
          </div>

          {/* Slider / Counter for Attendees */}
          <div className="bg-[#0b100d] border border-emerald-950 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                Comensales Estimados (Jugadores + Staff + Afición):
              </span>
              <span className="font-rugby text-2xl font-bold text-emerald-400">
                {guestCount} personas
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setGuestCount(Math.max(10, guestCount - 5))}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-sm"
              >
                -5
              </button>
              <input
                type="range"
                min={20}
                max={180}
                step={5}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="flex-1 accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => setGuestCount(Math.min(250, guestCount + 5))}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center font-bold text-sm"
              >
                +5
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[40, 60, 80, 100, 120].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setGuestCount(preset)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                    guestCount === preset
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                  }`}
                >
                  {preset} pax
                </button>
              ))}
            </div>
          </div>

          {/* Estimation vs Stock Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Beer */}
            <div className="bg-[#141d18] border border-emerald-900/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                    <Beer className="w-4 h-4 text-emerald-400" />
                    Cerveza Rubia
                  </span>
                  <span className="text-[11px]">~1L / persona</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-rugby text-xl font-bold text-white">
                    {estBarrels} {estBarrels === 1 ? 'barril' : 'barriles'} (50L)
                  </span>
                  <span className="text-xs text-zinc-400">
                    (aprox. {guestCount * 3} cañas)
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-950 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Stock en club:</span>
                <span className={`font-bold ${
                  (beerProduct?.currentStock || 0) < estBarrels ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {beerProduct?.currentStock || 0} barriles {(beerProduct?.currentStock || 0) < estBarrels ? '⚠️ (Insuficiente)' : '✅ (Cubierto)'}
                </span>
              </div>
            </div>

            {/* Txistorra */}
            <div className="bg-[#141d18] border border-emerald-900/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                    Txistorra Navarra
                  </span>
                  <span className="text-[11px]">~120g / persona</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-rugby text-xl font-bold text-white">
                    {estTxistorraKg} kg
                  </span>
                  <span className="text-xs text-zinc-400">
                    artesana fresca
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-950 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Stock en club:</span>
                <span className={`font-bold ${
                  (txistorraProduct?.currentStock || 0) < estTxistorraKg ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {txistorraProduct?.currentStock || 0} kg {(txistorraProduct?.currentStock || 0) < estTxistorraKg ? '⚠️ (Faltan ' + (estTxistorraKg - (txistorraProduct?.currentStock || 0)) + 'kg)' : '✅ (Cubierto)'}
                </span>
              </div>
            </div>

            {/* Bread */}
            <div className="bg-[#141d18] border border-emerald-900/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium text-emerald-300">Pan de Bocadillo</span>
                  <span className="text-[11px]">1.1 / persona</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-rugby text-xl font-bold text-white">
                    {estBread} bollos / barras
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-950 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Stock en club:</span>
                <span className={`font-bold ${
                  (breadProduct?.currentStock || 0) < estBread ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {breadProduct?.currentStock || 0} ud {(breadProduct?.currentStock || 0) < estBread ? '⚠️ (Faltan ' + (estBread - (breadProduct?.currentStock || 0)) + ')' : '✅ (Cubierto)'}
                </span>
              </div>
            </div>

            {/* Ice */}
            <div className="bg-[#141d18] border border-emerald-900/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium text-emerald-300">Hielo en Cubitos</span>
                  <span className="text-[11px]">Bebidas y neveras</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-rugby text-xl font-bold text-white">
                    {estIceBags} sacos (10kg)
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-950 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Stock en club:</span>
                <span className={`font-bold ${
                  (iceProduct?.currentStock || 0) < estIceBags ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {iceProduct?.currentStock || 0} sacos {(iceProduct?.currentStock || 0) < estIceBags ? '⚠️ (Insuficiente)' : '✅ (Cubierto)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Quick Stock Actions on Most Frequent Items */}
        <div className="lg:col-span-5 bg-[#101713] border border-emerald-900/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
              <div>
                <h2 className="font-rugby text-lg font-bold text-white uppercase tracking-wider">
                  Consumos Rápidos de Bar
                </h2>
                <p className="text-xs text-zinc-400">
                  Suma o resta existencias en 1 clic durante el tercer tiempo
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick action cards for top 4 items */}
            <div className="divide-y divide-emerald-950/80 mt-2">
              {products.slice(0, 4).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{p.name}</div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                      <span>Stock actual: <strong className={p.currentStock < p.minStock ? 'text-rose-400' : 'text-emerald-400'}>{p.currentStock}</strong> {p.unit}</span>
                      {p.currentStock < p.minStock && (
                        <span className="text-[10px] text-rose-300 font-bold bg-rose-950/70 px-1.5 py-0.2 rounded border border-rose-800/40">
                          Bajo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onQuickUpdateStock(p.id, -1, 'Consumo en barra tercer tiempo')}
                      disabled={p.currentStock <= 0}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-rose-900/60 hover:text-rose-200 text-zinc-300 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Restar 1 unidad consumida"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onQuickUpdateStock(p.id, 1, 'Reposición o ajuste manual')}
                      className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-emerald-800/60 hover:text-emerald-200 text-zinc-300 flex items-center justify-center transition-colors"
                      title="Sumar 1 unidad"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent movements history */}
          <div className="bg-[#0b100d] border border-emerald-950/80 rounded-xl p-3">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Últimos Movimientos Registrados
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
              {logs.slice(0, 3).map((log, index) => (
                <div key={`${log.id}-${index}`} className="flex items-center justify-between text-[11px] py-1 border-b border-zinc-900/50">
                  <div className="truncate pr-2">
                    <span className="text-zinc-200 font-medium">{log.productName}</span>
                    <span className="text-zinc-500 block text-[10px] truncate">{log.reason}</span>
                  </div>
                  <span className={`font-bold shrink-0 ${log.change < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
