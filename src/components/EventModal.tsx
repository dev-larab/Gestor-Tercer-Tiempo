import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Users, Plus, Trash2, Info, Lock, Calculator, Flame, Droplets, Utensils } from 'lucide-react';
import { RugbyEvent, EventType, Product } from '../types';

export const DEFAULT_ORGANIZATION_NOTES = 'añadir aquí el tipo de tercer tiempo a elaborar y cualquier otro dato a tener en cuenta (alérgicos, celiacos y demás información)';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Omit<RugbyEvent, 'id'> & { id?: string }) => void;
  initialEvent?: RugbyEvent | null;
  products: Product[];
  isDutyManagerOnly?: boolean;
}

const EVENT_TYPES: { id: EventType; label: string }[] = [
  { id: 'partido_local', label: 'Partido Oficial Como Local (UPNA)' },
  { id: 'partido_visitante', label: 'Partido Visitante (Solo apoyo/tercer tiempo fuera)' },
  { id: 'torneo_seven', label: 'Torneo Seven / Torneo Especial' },
  { id: 'celebracion', label: 'Fiesta de Club / Cena de Tercer Tiempo' },
  { id: 'amistoso', label: 'Partido Amistoso de Pretemporada' },
  { id: 'escuela', label: 'Jornada Escuela Rugby Infantil' },
];

export const TEAM_CATEGORIES = [
  'Senior Masculino A (Div. Honor B)',
  'Senior Femenino',
  'Senior Masculino B',
  'Veteranos',
  'Sub-18',
  'Sub-16',
  'Sub-14',
  'Sub-12',
  'Sub-10',
  'Sub-8'
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  products,
  isDutyManagerOnly = false
}) => {
  const [title, setTitle] = useState('');
  const [rival, setRival] = useState('');
  const [teamCategory, setTeamCategory] = useState(TEAM_CATEGORIES[0]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('16:00');
  const [location, setLocation] = useState('Instalaciones Deportivas UPNA (Pamplona)');
  const [type, setType] = useState<EventType>('partido_local');
  const [expectedAttendees, setExpectedAttendees] = useState(60);
  const [localPlayers, setLocalPlayers] = useState<string>('23');
  const [visitorPlayers, setVisitorPlayers] = useState<string>('23');
  const [localStaff, setLocalStaff] = useState<string>('3');
  const [visitorStaff, setVisitorStaff] = useState<string>('3');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState<{ productId: string; quantityNeeded: number; checked: boolean }[]>([]);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setRival(initialEvent.rival || '');
      setTeamCategory(initialEvent.teamCategory);
      setDate(initialEvent.date);
      setTime(initialEvent.time);
      setLocation(initialEvent.location);
      setType(initialEvent.type);
      setExpectedAttendees(initialEvent.expectedAttendees);
      setLocalPlayers(String(initialEvent.localPlayers ?? 23));
      setVisitorPlayers(String(initialEvent.visitorPlayers ?? 23));
      setLocalStaff(String(initialEvent.localStaff ?? 3));
      setVisitorStaff(String(initialEvent.visitorStaff ?? 3));
      // If event has no notes or empty, prefill default organization guide text
      setNotes(initialEvent.notes && initialEvent.notes.trim() ? initialEvent.notes : DEFAULT_ORGANIZATION_NOTES);
      setChecklist(initialEvent.checklist || []);
    } else {
      setTitle('');
      setRival('');
      setTeamCategory(TEAM_CATEGORIES[0]);
      // default next Saturday
      const d = new Date();
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
      setDate(d.toISOString().split('T')[0]);
      setTime('16:30');
      setLocation('Instalaciones Deportivas UPNA (Pamplona)');
      setType('partido_local');
      setExpectedAttendees(65);
      setLocalPlayers('23');
      setVisitorPlayers('23');
      setLocalStaff('3');
      setVisitorStaff('3');
      setNotes(DEFAULT_ORGANIZATION_NOTES);
      // Default recommended checklist items
      setChecklist([
        { productId: 'prod-1', quantityNeeded: 3, checked: false }, // Barriles cerveza
        { productId: 'prod-8', quantityNeeded: 8, checked: false }, // Txistorra kg
        { productId: 'prod-11', quantityNeeded: 70, checked: false }, // Pan
        { productId: 'prod-14', quantityNeeded: 3, checked: false }, // Hielo
      ]);
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (products.length === 0) return;
    setChecklist([
      ...checklist,
      { productId: products[0].id, quantityNeeded: 1, checked: false }
    ]);
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleChecklistChange = (index: number, field: 'productId' | 'quantityNeeded', value: any) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], [field]: value };
    setChecklist(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || `${teamCategory} vs ${rival.trim() || 'Rival'}`;

    onSave({
      ...(initialEvent ? { id: initialEvent.id } : {}),
      title: finalTitle,
      rival: rival.trim() || undefined,
      teamCategory,
      date,
      time,
      location: location.trim(),
      type,
      expectedAttendees: Number(expectedAttendees),
      notes: notes.trim() || undefined,
      checklist,
      isCompleted: initialEvent?.isCompleted || false,
      localPlayers: Number(localPlayers) >= 0 ? Number(localPlayers) : 0,
      visitorPlayers: Number(visitorPlayers) >= 0 ? Number(visitorPlayers) : 0,
      localStaff: Number(localStaff) >= 0 ? Number(localStaff) : 0,
      visitorStaff: Number(visitorStaff) >= 0 ? Number(visitorStaff) : 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121915] border border-emerald-900/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/40 bg-[#0d1310]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-rugby text-xl font-bold text-white tracking-wide">
                {initialEvent ? 'EDITAR PARTIDO / EVENTO' : 'PROGRAMAR PARTIDO O TERCER TIEMPO'}
              </h2>
              {isDutyManagerOnly && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Modo Responsable de Turno</span>
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-400/80">
              {isDutyManagerOnly 
                ? 'Solo edición autorizada en el campo "Detalles & Organización" (tercer tiempo y logística).'
                : 'La Única Rugby Taldea • Calendario de Competición'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {isDutyManagerOnly && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Como <strong>Responsable de Turno</strong> tienes acceso a consultar los datos de la jornada y rellenar únicamente la sección <strong>&quot;Detalles &amp; Organización&quot;</strong> para la preparación del tercer tiempo y necesidades del club.
              </span>
            </div>
          )}

          {/* Rival & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Equipo de La Única *</span>
                {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(solo lectura)</span>}
              </label>
              <select
                disabled={isDutyManagerOnly}
                value={teamCategory}
                onChange={(e) => setTeamCategory(e.target.value)}
                className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none ${
                  isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                }`}
              >
                {TEAM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#121915]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Equipo Rival</span>
                {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(solo lectura)</span>}
              </label>
              <input
                type="text"
                disabled={isDutyManagerOnly}
                placeholder="ej: Getxo Rugby, Hernani CRE..."
                value={rival}
                onChange={(e) => setRival(e.target.value)}
                className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-zinc-600 ${
                  isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Event Title (Optional override) */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Título del Evento</span>
              {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(solo lectura)</span>}
            </label>
            <input
              type="text"
              disabled={isDutyManagerOnly}
              placeholder={`ej: ${teamCategory} vs ${rival || 'Rival'}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-zinc-600 ${
                isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Date, Time & Attendees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Fecha *</span>
                {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(fija)</span>}
              </label>
              <input
                type="date"
                required
                disabled={isDutyManagerOnly}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3 py-2.5 outline-none ${
                  isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Hora *</span>
                {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(fija)</span>}
              </label>
              <input
                type="time"
                required
                disabled={isDutyManagerOnly}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3 py-2.5 outline-none ${
                  isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Comensales *</span>
                {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(fijo)</span>}
              </label>
              <input
                type="number"
                min="5"
                max="500"
                required
                disabled={isDutyManagerOnly}
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(Number(e.target.value))}
                className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3 py-2.5 outline-none ${
                  isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Event Type & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Tipo de Evento *</span>
                {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(fijo)</span>}
              </label>
              <select
                disabled={isDutyManagerOnly}
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none ${
                  isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                }`}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#121915]">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Lugar / Campo *</span>
                {isDutyManagerOnly && <span className="text-[10px] text-zinc-500 font-normal lowercase">(fijo)</span>}
              </label>
              <input
                type="text"
                required
                disabled={isDutyManagerOnly}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full bg-[#0a0f0d] border border-emerald-900/60 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none ${
                  isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* Cálculo de Tercer Tiempo: Jugadores y Staff Técnico */}
          <div className="bg-[#0b100d] border border-emerald-900/60 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Participantes & Staff Técnico
                </span>
              </div>
              {isDutyManagerOnly ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-zinc-400" />
                  <span>Solo Administrador</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Cálculo automático de compras
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-400">
              {isDutyManagerOnly
                ? 'Datos introducidos por el Administrador para el aprovisionamiento del tercer tiempo.'
                : 'Indica los jugadores y el cuerpo técnico para calcular automáticamente el pan, las salchichas y el agua necesarios.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-emerald-300 mb-1 truncate" title="Jugadores Equipo Local">
                  Jugadores Local
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isDutyManagerOnly}
                  value={localPlayers}
                  onChange={(e) => setLocalPlayers(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={() => setLocalPlayers(String(parseInt(localPlayers, 10) || 0))}
                  placeholder="0"
                  className={`w-full bg-[#121a16] border border-emerald-900/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-center outline-none ${
                    isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-300 mb-1 truncate" title="Jugadores Equipo Visitante">
                  Jugadores Visitante
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isDutyManagerOnly}
                  value={visitorPlayers}
                  onChange={(e) => setVisitorPlayers(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={() => setVisitorPlayers(String(parseInt(visitorPlayers, 10) || 0))}
                  placeholder="0"
                  className={`w-full bg-[#121a16] border border-emerald-900/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-center outline-none ${
                    isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-emerald-400 mb-1 truncate" title="Staff Técnico Local">
                  Staff Local
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isDutyManagerOnly}
                  value={localStaff}
                  onChange={(e) => setLocalStaff(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={() => setLocalStaff(String(parseInt(localStaff, 10) || 0))}
                  placeholder="0"
                  className={`w-full bg-[#121a16] border border-emerald-900/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-center outline-none ${
                    isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-400 mb-1 truncate" title="Staff Técnico Visitante">
                  Staff Visitante
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isDutyManagerOnly}
                  value={visitorStaff}
                  onChange={(e) => setVisitorStaff(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={() => setVisitorStaff(String(parseInt(visitorStaff, 10) || 0))}
                  placeholder="0"
                  className={`w-full bg-[#121a16] border border-emerald-900/50 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-center outline-none ${
                    isDutyManagerOnly ? 'opacity-60 cursor-not-allowed bg-zinc-950' : 'focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Live calculation badges */}
            {(() => {
              const totalPlayersCalc = (Number(localPlayers) || 0) + (Number(visitorPlayers) || 0);
              const totalStaffCalc = (Number(localStaff) || 0) + (Number(visitorStaff) || 0);
              const totalPeopleCalc = totalPlayersCalc + totalStaffCalc;
              const breadCalc = totalPeopleCalc > 0 ? (totalPeopleCalc / 3) + 8 : 0;
              const sausagesCalc = totalPlayersCalc > 0 ? totalPlayersCalc / 12 : 0;
              const waterCalc = totalPlayersCalc > 0 ? totalPlayersCalc / 24 : 0;

              return (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-950/70 text-center">
                  <div className="bg-[#121c17] p-2 rounded-lg border border-amber-900/40">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-300">
                      <Utensils className="w-3 h-3 text-amber-400" />
                      <span>Barras Pan</span>
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {breadCalc > 0 ? Math.ceil(breadCalc) : 0}
                    </div>
                    <div className="text-[9px] text-zinc-400">
                      ({breadCalc.toFixed(1)} exacto)
                    </div>
                  </div>

                  <div className="bg-[#121c17] p-2 rounded-lg border border-orange-900/40">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-orange-300">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>Salchichas</span>
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {sausagesCalc > 0 ? sausagesCalc.toFixed(2) : 0}
                    </div>
                    <div className="text-[9px] text-zinc-400">
                      (o {Math.ceil(sausagesCalc)} paq./docenas)
                    </div>
                  </div>

                  <div className="bg-[#121c17] p-2 rounded-lg border border-cyan-900/40">
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-cyan-300">
                      <Droplets className="w-3 h-3 text-cyan-400" />
                      <span>Botellas Agua</span>
                    </div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {waterCalc > 0 ? waterCalc.toFixed(2) : 0}
                    </div>
                    <div className="text-[9px] text-zinc-400">
                      (o {Math.ceil(waterCalc)} packs de 24)
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Checklist / Previsión de stock para este partido */}
          <div className="bg-[#0b100d] border border-emerald-950 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Previsión de Suministros para el Tercer Tiempo</span>
                {isDutyManagerOnly && (
                  <span className="text-[10px] text-zinc-500 font-normal lowercase">(solo lectura)</span>
                )}
              </span>
              {!isDutyManagerOnly && (
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Producto</span>
                </button>
              )}
            </div>

            {checklist.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No hay productos añadidos a la lista de este partido.</p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {checklist.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-center gap-2 bg-[#121a16] p-2 rounded-lg border border-emerald-950">
                      <select
                        disabled={isDutyManagerOnly}
                        value={item.productId}
                        onChange={(e) => handleChecklistChange(index, 'productId', e.target.value)}
                        className={`flex-1 bg-[#0a0f0d] border border-emerald-900/40 text-xs text-zinc-200 rounded-lg px-2 py-1.5 outline-none ${
                          isDutyManagerOnly ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.currentStock} {p.unit})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          disabled={isDutyManagerOnly}
                          value={item.quantityNeeded}
                          onChange={(e) => handleChecklistChange(index, 'quantityNeeded', Number(e.target.value))}
                          className={`w-16 bg-[#0a0f0d] border border-emerald-900/40 text-xs text-zinc-200 rounded-lg px-2 py-1.5 outline-none text-center ${
                            isDutyManagerOnly ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="text-[10px] text-zinc-400 max-w-[60px] truncate">
                          {product?.unit || 'ud'}
                        </span>
                      </div>

                      {!isDutyManagerOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChecklistItem(index)}
                          className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details & Organization Notes - ALWAYS WRITABLE by Duty Manager and Admin */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Detalles & Organización</span>
                {isDutyManagerOnly && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    Campo habilitado para edición
                  </span>
                )}
              </label>

              {notes !== DEFAULT_ORGANIZATION_NOTES && (
                <button
                  type="button"
                  onClick={() => setNotes(DEFAULT_ORGANIZATION_NOTES)}
                  className="text-[11px] text-zinc-400 hover:text-emerald-300 underline cursor-pointer"
                  title="Restablecer guía por defecto"
                >
                  Restablecer texto sugerido
                </button>
              )}
            </div>

            <textarea
              rows={4}
              placeholder={DEFAULT_ORGANIZATION_NOTES}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full bg-[#0a0f0d] border rounded-xl px-3.5 py-2.5 outline-none transition-all resize-y ${
                notes === DEFAULT_ORGANIZATION_NOTES
                  ? 'italic text-zinc-400/90 font-light border-emerald-900/60 focus:border-emerald-400'
                  : 'text-zinc-100 border-emerald-800/80 focus:border-emerald-400 shadow-inner'
              }`}
            />

            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <span className="italic text-zinc-500">
                Por defecto sugerido: &quot;{DEFAULT_ORGANIZATION_NOTES}&quot;
              </span>
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-emerald-900/40 flex items-center justify-between gap-3">
            <div className="text-xs text-zinc-400">
              {isDutyManagerOnly && (
                <span className="text-emerald-300/90">
                  Guardarás los cambios de &quot;Detalles &amp; Organización&quot;.
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
