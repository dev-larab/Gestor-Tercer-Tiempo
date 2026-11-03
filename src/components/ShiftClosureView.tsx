import React, { useState } from 'react';
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
  Euro, 
  ClipboardCheck, 
  ShieldCheck, 
  X
} from 'lucide-react';
import { ShiftClosure, User } from '../types';

interface ShiftClosureViewProps {
  closures: ShiftClosure[];
  currentUser: User | null;
  onAddClosure: (closureData: Omit<ShiftClosure, 'id' | 'timestamp'>) => void;
  onDeleteClosure: (closureId: string) => void;
}

export const ShiftClosureView: React.FC<ShiftClosureViewProps> = ({
  closures,
  currentUser,
  onAddClosure,
  onDeleteClosure
}) => {
  // Form state
  const [revenue, setRevenue] = useState<string>('');
  const [cleaningCompleted, setCleaningCompleted] = useState<boolean>(false);
  const [keysReturned, setKeysReturned] = useState<boolean>(false);
  const [responsibleName, setResponsibleName] = useState<string>(currentUser?.name || '');
  const [comments, setComments] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [closureToDelete, setClosureToDelete] = useState<ShiftClosure | null>(null);

  // Quick revenue presets in euros
  const quickPresets = [50, 100, 200, 300, 500];

  const handleAddPreset = (amount: number) => {
    const currentVal = parseFloat(revenue) || 0;
    setRevenue((currentVal + amount).toFixed(2));
  };

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

    onAddClosure({
      date: todayDate,
      time: timeStr,
      revenue: parsedRevenue,
      cleaningCompleted,
      keysReturned,
      responsibleName: responsibleName.trim(),
      comments: comments.trim() || undefined,
      userId: currentUser?.id
    });

    // Reset form for next closure
    setRevenue('');
    setCleaningCompleted(false);
    setKeysReturned(false);
    setComments('');
    setError(null);
  };

  // Metrics
  const totalRevenueAll = closures.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const latestClosure = closures[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101713] border border-emerald-900/50 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Protocolo de Fin de Turno
            </span>
            <span className="text-xs text-zinc-400">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="font-rugby text-2xl sm:text-3xl text-white font-bold tracking-wide">
            CIERRE DE JORNADA & CAJA DE BARRA
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Registro oficial de recaudación de barra, devolución de llaves en recepción y control de limpieza de instalaciones para La Única Rugby Taldea.
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2.5 bg-[#0b100d] px-3.5 py-2 rounded-xl border border-emerald-950 self-start sm:self-auto">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
              currentUser.role === 'admin' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {currentUser.role === 'admin' ? '👑' : '🏉'}
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
              <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5">{currentUser.roleLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Recaudado */}
        <div className="bg-[#101713] border border-emerald-900/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Recaudación Histórica
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-rugby text-3xl sm:text-4xl font-bold text-white">
              {totalRevenueAll.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Total acumulado en {closures.length} {closures.length === 1 ? 'jornada registrada' : 'jornadas registradas'}
          </p>
        </div>

        {/* Card 2: Último Cierre */}
        <div className="bg-[#101713] border border-emerald-900/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Último Cierre Registrado
            </span>
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-rugby text-3xl sm:text-4xl font-bold text-emerald-400">
              {latestClosure ? `${latestClosure.revenue.toFixed(2)}€` : '0.00€'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-2 truncate">
            {latestClosure ? `Por ${latestClosure.responsibleName} (${latestClosure.date})` : 'Sin registros previos'}
          </p>
        </div>

        {/* Card 3: Total Registros */}
        <div className="bg-[#101713] border border-emerald-900/40 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Cierres Verificados
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-rugby text-3xl sm:text-4xl font-bold text-white">
              {closures.length}
            </span>
            <span className="text-xs text-zinc-400">actas de cierre</span>
          </div>
          <p className="text-xs text-emerald-400/80 mt-2">
            Control de llaves y caja en recepción UPNA
          </p>
        </div>
      </div>

      {/* Main Closure Form */}
      <div className="bg-[#101713] border border-emerald-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-emerald-950/80">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ClipboardCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="font-rugby text-xl sm:text-2xl text-white font-bold tracking-wide">
              NUEVO REGISTRO DE CIERRE DE JORNADA
            </h2>
            <p className="text-xs text-zinc-400">
              Completa los datos de la caja del día y las confirmaciones obligatorias de entrega de llaves y limpieza.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Field 1: Recaudación de la Jornada (6 cols) */}
            <div className="lg:col-span-6 bg-[#0a0f0d] p-5 rounded-2xl border border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="revenue-input" className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Recaudación de la Jornada (€) *</span>
                </label>
                <span className="text-[11px] text-zinc-400">Caja final en barra</span>
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
                  className="w-full bg-[#121c17] border-2 border-emerald-900/60 focus:border-emerald-500 rounded-xl px-4 py-3 text-2xl font-rugby font-bold text-white placeholder-zinc-600 outline-none transition-all pl-12"
                />
                <span className="absolute left-4 top-3.5 text-xl font-bold text-emerald-400 font-mono">
                  €
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-zinc-500 uppercase font-bold mr-1">Sumar rápido:</span>
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
                    className="px-2 py-1 text-xs font-medium rounded-lg text-zinc-400 hover:text-rose-400 ml-auto"
                    title="Borrar importe"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>

            {/* Field 2 & 3: Interactive Confirmation Buttons (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Botón 1: Confirmar Limpieza Realizada */}
              <div className="bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Control de Limpieza *</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cleaningCompleted ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {cleaningCompleted ? 'CONFIRMADO' : 'PENDIENTE'}
                  </span>
                </div>

                <button
                  type="button"
                  id="btn-confirm-cleaning"
                  onClick={() => setCleaningCompleted(!cleaningCompleted)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer select-none active:scale-[0.99] ${
                    cleaningCompleted
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-lg shadow-emerald-900/40'
                      : 'bg-[#121c17] text-zinc-300 border-zinc-800 hover:border-emerald-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      cleaningCompleted ? 'bg-black text-emerald-400 font-extrabold' : 'border border-zinc-600 bg-zinc-900'
                    }`}>
                      {cleaningCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="text-left">
                      <span className="block font-bold">
                        {cleaningCompleted ? '✓ Limpieza Realizada y Verificada' : 'Pulsar para confirmar Limpieza'}
                      </span>
                      <span className="block text-[11px] font-normal opacity-80">
                        Barra recogida, vajilla fregada, basura tirada
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Botón 2: Confirmar Devolución de Llaves en Recepción */}
              <div className="bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    <span>Control de Llaves en Recepción *</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    keysReturned ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {keysReturned ? 'DEVUELTAS' : 'PENDIENTE'}
                  </span>
                </div>

                <button
                  type="button"
                  id="btn-confirm-keys"
                  onClick={() => setKeysReturned(!keysReturned)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border font-bold text-xs sm:text-sm transition-all cursor-pointer select-none active:scale-[0.99] ${
                    keysReturned
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-lg shadow-emerald-900/40'
                      : 'bg-[#121c17] text-zinc-300 border-zinc-800 hover:border-emerald-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      keysReturned ? 'bg-black text-emerald-400 font-extrabold' : 'border border-zinc-600 bg-zinc-900'
                    }`}>
                      {keysReturned && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div className="text-left">
                      <span className="block font-bold">
                        {keysReturned ? '✓ Llaves Devueltas en Recepción' : 'Pulsar para confirmar Devolución de Llaves'}
                      </span>
                      <span className="block text-[11px] font-normal opacity-80">
                        Manilla y llaves de vestuario y barra depositadas en UPNA
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Field 4 & 5: Nombre del Responsable y Comentarios */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Nombre del Responsable de Turno (5 cols) */}
            <div className="lg:col-span-5 bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40 space-y-2">
              <label htmlFor="responsible-name-input" className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <span>Nombre del Responsable de Turno *</span>
              </label>
              <div className="relative">
                <input
                  id="responsible-name-input"
                  type="text"
                  required
                  placeholder="Ej: Borja Lara, Iñigo, ..."
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full bg-[#121c17] border border-emerald-900/60 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all pl-10"
                />
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              </div>
              <p className="text-[11px] text-zinc-500">
                Persona física responsable de la caja y del cierre durante esta jornada.
              </p>
            </div>

            {/* Comentarios de la Jornada (7 cols) */}
            <div className="lg:col-span-7 bg-[#0a0f0d] p-4 rounded-2xl border border-emerald-900/40 space-y-2">
              <label htmlFor="comments-input" className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Comentarios u Observaciones de la Jornada</span>
              </label>
              <textarea
                id="comments-input"
                rows={2}
                placeholder="Incidencias con barriles, tercer tiempo con el rival, roturas, cambios de dinero u observaciones para la directiva..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full bg-[#121c17] border border-emerald-900/60 focus:border-emerald-500 rounded-xl p-3 text-sm text-white placeholder-zinc-500 outline-none resize-none transition-all"
              />
            </div>
          </div>

          {/* BOTÓN DESTACADO PARA GUARDAR */}
          <div className="pt-4 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Los datos quedarán registrados permanentemente en el club con la fecha y hora de hoy.</span>
            </div>

            <button
              id="btn-save-shift-closure"
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-black font-rugby font-bold text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer active:scale-95 hover:scale-[1.02]"
            >
              <Save className="w-5 h-5 stroke-[2.5]" />
              <span>GUARDAR CIERRE DE JORNADA</span>
            </button>
          </div>
        </form>
      </div>

      {/* LISTADO DE CIERRES ANTERIORES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-950/80">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="font-rugby text-xl text-white font-bold tracking-wide">
              HISTORIAL DE CIERRES DE JORNADA REGISTRADOS
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
            <h4 className="font-rugby text-lg text-zinc-300 font-bold">No hay cierres de jornada registrados aún</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Utiliza el formulario superior para registrar la recaudación, confirmación de llaves y limpieza de hoy.
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
                          <span>Responsable: <strong className="text-zinc-200">{closure.responsibleName}</strong></span>
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
                          {closure.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
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

                  {/* Badges de Confirmación y Comentarios */}
                  <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Status badges */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Limpieza Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs border ${
                        closure.cleaningCompleted
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                      }`}>
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

                      {/* Devolución de Llaves Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs border ${
                        closure.keysReturned
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                      }`}>
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

                    {/* Fecha relativa/timestamp */}
                    {closure.timestamp && (
                      <span className="text-[11px] text-zinc-500">
                        Registrado el {new Date(closure.timestamp).toLocaleDateString('es-ES')} a las {new Date(closure.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Comentarios / Observaciones */}
                  {closure.comments && (
                    <div className="mt-3 bg-[#0a0f0d] p-3 rounded-xl border border-emerald-950 text-xs">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Observaciones del Responsable:
                      </span>
                      <p className="text-zinc-200 italic">
                        "{closure.comments}"
                      </p>
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
                  <p className="text-xs text-rose-300/80">
                    Confirmación de borrado
                  </p>
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
                  Esta acción eliminará el registro de caja y cierre de forma permanente de la base de datos local.
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
