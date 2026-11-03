import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Truck, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  Copy, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  PackageCheck,
  Printer,
  Sparkles,
  Utensils,
  Flame,
  Droplets,
  Calendar,
  Send,
  Loader2,
  Key,
  ExternalLink,
  X,
  Settings
} from 'lucide-react';
import { Product, Supplier, RugbyEvent, TabType } from '../types';
import { getCurrentWeekendDates } from '../utils/dateUtils';

interface ShoppingListViewProps {
  products: Product[];
  suppliers: Supplier[];
  events: RugbyEvent[];
  onBatchRestock: (restockItems: { productId: string; quantity: number }[]) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  products,
  suppliers,
  events,
  onBatchRestock,
  onNavigateTab
}) => {
  const [copiedSupplierId, setCopiedSupplierId] = useState<string | null>(null);
  const [copiedThirdHalf, setCopiedThirdHalf] = useState<boolean>(false);
  const [orderSentSupplierId, setOrderSentSupplierId] = useState<string | null>(null);
  const [isSendingSupplierId, setIsSendingSupplierId] = useState<string | null>(null);
  const [orderFeedbackMessage, setOrderFeedbackMessage] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [web3FormsKey, setWeb3FormsKey] = useState<string>(() => {
    return localStorage.getItem('lurt_web3forms_key') || (import.meta as any).env?.VITE_WEB3FORMS_KEY || '';
  });
  const [inputKey, setInputKey] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [pendingOrder, setPendingOrder] = useState<{
    supplier: Supplier;
    items: Product[];
    totalCost: number;
  } | null>(null);

  // Find all items below minimum stock
  const lowStockProducts = products.filter(p => p.currentStock < p.minStock);

  // Group by supplier
  const supplierGroups = suppliers.map((sup) => {
    const items = lowStockProducts.filter(p => p.supplierId === sup.id);
    const totalCost = items.reduce((sum, p) => {
      const deficit = p.minStock - p.currentStock;
      return sum + (p.costPerUnit ? p.costPerUnit * deficit : 0);
    }, 0);

    return {
      supplier: sup,
      items,
      totalCost,
    };
  }).filter(group => group.items.length > 0);

  // Unassigned low stock products
  const unassignedItems = lowStockProducts.filter(p => !p.supplierId || !suppliers.some(s => s.id === p.supplierId));

  // Weekend calculation for third half supplies
  const weekendInfo = useMemo(() => getCurrentWeekendDates(), []);

  // Filter matches for current weekend
  const weekendMatches = useMemo(() => {
    return (events || []).filter(e => weekendInfo.isDateInWeekend(e.date));
  }, [events, weekendInfo]);

  // Sum up supplies across all matches of the current weekend
  const thirdHalfSummary = useMemo(() => {
    let sumBread = 0;
    let sumSausages = 0;
    let sumWater = 0;
    let totalPlayersAll = 0;
    let totalPeopleAll = 0;

    weekendMatches.forEach((evt) => {
      const localPlayers = evt.localPlayers ?? 23;
      const visitorPlayers = evt.visitorPlayers ?? 23;
      const localStaff = evt.localStaff ?? 3;
      const visitorStaff = evt.visitorStaff ?? 3;

      const totalPlayers = localPlayers + visitorPlayers;
      const totalStaff = localStaff + visitorStaff;
      const totalPeople = totalPlayers + totalStaff;

      totalPlayersAll += totalPlayers;
      totalPeopleAll += totalPeople;

      // 1. Barras de pan: ((total jugadores + total staff) / 3) + 8
      if (totalPeople > 0) {
        sumBread += (totalPeople / 3) + 8;
      }
      // 2. Salchichas: total jugadores / 12
      if (totalPlayers > 0) {
        sumSausages += totalPlayers / 12;
      }
      // 3. Botellas de agua: total jugadores / 24
      if (totalPlayers > 0) {
        sumWater += totalPlayers / 24;
      }
    });

    const breadCeil = Math.ceil(sumBread);
    const sausagesCeil = Math.ceil(sumSausages);
    const waterCeil = Math.ceil(sumWater);

    // Standard costs for third half purchases
    const breadUnitCost = 0.90; // ~0.90€ por barra de pan artesana
    const sausagePackCost = 6.00; // ~6.00€ por paquete / docena de 12 salchichas
    const waterPackCost = 7.20; // ~7.20€ por pack de 24 botellas de agua

    const breadTotalCost = breadCeil * breadUnitCost;
    const sausagesTotalCost = sausagesCeil * sausagePackCost;
    const waterTotalCost = waterCeil * waterPackCost;

    const totalEstimatedCost = breadTotalCost + sausagesTotalCost + waterTotalCost;

    return {
      sumBread,
      breadCeil,
      sumSausages,
      sausagesCeil,
      sumWater,
      waterCeil,
      totalPlayersAll,
      totalPeopleAll,
      breadUnitCost,
      sausagePackCost,
      waterPackCost,
      breadTotalCost,
      sausagesTotalCost,
      waterTotalCost,
      totalEstimatedCost
    };
  }, [weekendMatches]);

  const handleCopyThirdHalf = () => {
    const lines = [
      `🏉 *LA ÚNICA RUGBY TALDEA*`,
      `🥖 *COMPRAS PARA TERCER TIEMPO* (${weekendInfo.label})`,
      `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
      `Partidos del fin de semana (${weekendMatches.length}):`,
      ...weekendMatches.map(m => ` • ${m.title} (${(m.localPlayers ?? 23) + (m.visitorPlayers ?? 23)} jugadores, ${(m.localStaff ?? 3) + (m.visitorStaff ?? 3)} staff)`),
      `---------------------------------------`,
      `• ${thirdHalfSummary.breadCeil} barras de pan (Coste est.: ${thirdHalfSummary.breadTotalCost.toFixed(2)}€)`,
      `• ${thirdHalfSummary.sausagesCeil} docenas/paq. de salchichas (${thirdHalfSummary.sausagesCeil * 12} ud, Coste est.: ${thirdHalfSummary.sausagesTotalCost.toFixed(2)}€)`,
      `• ${thirdHalfSummary.waterCeil} packs de 24 botellas de agua (${thirdHalfSummary.waterCeil * 24} botellas, Coste est.: ${thirdHalfSummary.waterTotalCost.toFixed(2)}€)`,
      `---------------------------------------`,
      `Total estimado tercer tiempo: ${thirdHalfSummary.totalEstimatedCost.toFixed(2)}€`,
      `¡Aupa La Única! 🟢⚫`
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedThirdHalf(true);
    setTimeout(() => setCopiedThirdHalf(false), 3000);
  };

  // Helper to detect if a supplier is "Suministros Hostelería y Menaje Norte"
  const isMenajeNorteSupplier = (supplier: Supplier) => {
    const n = supplier.name.toLowerCase();
    return n.includes('menaje') || n.includes('norte') || supplier.id === 'sup-5';
  };

  // Render the requested "Compras para tercer tiempo" block
  const renderThirdHalfBlock = () => (
    <div
      key="compras-tercer-tiempo-card"
      className="bg-[#101713] border-2 border-emerald-600/80 rounded-2xl p-6 shadow-2xl shadow-emerald-950/40 space-y-4 relative overflow-hidden"
    >
      {/* Decorative accent banner */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-bl from-emerald-500/10 via-emerald-700/5 to-transparent pointer-events-none rounded-tr-2xl" />

      {/* Block Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-950 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-black shadow-md shadow-emerald-500/20 shrink-0">
            <Utensils className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-rugby text-xl font-bold text-white tracking-wide">
                Compras para tercer tiempo
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 shadow-sm">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>Fin de semana: {weekendInfo.label}</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sumatorio automático de pan, salchichas y agua calculado a partir de los partidos del fin de semana que corresponde a la fecha actual ({weekendInfo.fullLabel}).
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={handleCopyThirdHalf}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              copiedThirdHalf
                ? 'bg-emerald-500 text-black font-bold'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60'
            }`}
            title="Copiar lista de compras para el tercer tiempo al portapapeles"
          >
            {copiedThirdHalf ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedThirdHalf ? '¡Copiado!' : 'Copiar Tercer Tiempo'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('events')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ir al calendario de partidos para ajustar número de jugadores o cuerpo técnico"
          >
            <span>Ver Partidos ({weekendMatches.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekend matches context badge */}
      <div className="bg-[#090e0c] p-3 rounded-xl border border-emerald-950/80 text-xs text-zinc-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
              Partidos computados ({weekendMatches.length}):
            </span>
            {weekendMatches.length === 0 ? (
              <span className="text-zinc-500 italic">No hay partidos programados para este fin de semana en el calendario.</span>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {weekendMatches.map((m) => (
                  <span key={m.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#111a14] border border-emerald-900/60 text-zinc-200 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <strong className="text-white">{m.rival ? `${m.teamCategory} vs ${m.rival}` : m.title}</strong>
                    <span className="text-zinc-500">({m.date})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="text-[11px] text-zinc-400 shrink-0">
            Fórmulas: <span className="text-zinc-300 font-mono">Pan: (Total÷3)+8 | Salchichas: Jug.÷12 | Agua: Jug.÷24</span>
          </div>
        </div>
      </div>

      {/* Items Table: Exactly only the 2 requested columns: "Cantidad a pedir" and "Coste estimado" */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pr-4">Item</th>
              <th className="py-2.5 px-4 text-center font-bold text-amber-300">Cantidad a pedir</th>
              <th className="py-2.5 pl-4 text-right font-bold text-emerald-400">Coste estimado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/60">
            {/* 1. Barras de pan */}
            <tr className="hover:bg-emerald-950/20 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm">barras de pan</span>
                    <span className="text-[10px] text-zinc-400">
                      Sumatorio de los partidos de este fin de semana: ((Total Jugadores + Staff de ambos equipos) ÷ 3) + 8
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="px-3 py-1 rounded-lg font-rugby text-sm font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-block shadow-sm">
                  {thirdHalfSummary.breadCeil} barras
                </span>
                {thirdHalfSummary.sumBread > 0 && !Number.isInteger(thirdHalfSummary.sumBread) && (
                  <span className="block text-[10px] text-zinc-500 mt-0.5">
                    ({thirdHalfSummary.sumBread.toFixed(2)} cálculo exacto)
                  </span>
                )}
              </td>
              <td className="py-3 pl-4 text-right">
                <span className="font-bold text-zinc-200 text-sm block">
                  {thirdHalfSummary.breadTotalCost.toFixed(2)}€
                </span>
                <span className="text-[10px] text-zinc-500">
                  (~{thirdHalfSummary.breadUnitCost.toFixed(2)}€ / barra)
                </span>
              </td>
            </tr>

            {/* 2. Salchichas */}
            <tr className="hover:bg-emerald-950/20 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-950/70 border border-orange-800/60 flex items-center justify-center text-orange-400 shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm">salchichas</span>
                    <span className="text-[10px] text-zinc-400">
                      Sumatorio de los partidos de este fin de semana: Total Jugadores de ambos equipos ÷ 12
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="px-3 py-1 rounded-lg font-rugby text-sm font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40 inline-block shadow-sm">
                  {thirdHalfSummary.sausagesCeil} docenas / paq.
                </span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  ({thirdHalfSummary.sausagesCeil * 12} salchichas | {thirdHalfSummary.sumSausages.toFixed(2)} exacto)
                </span>
              </td>
              <td className="py-3 pl-4 text-right">
                <span className="font-bold text-zinc-200 text-sm block">
                  {thirdHalfSummary.sausagesTotalCost.toFixed(2)}€
                </span>
                <span className="text-[10px] text-zinc-500">
                  (~{thirdHalfSummary.sausagePackCost.toFixed(2)}€ / paq.)
                </span>
              </td>
            </tr>

            {/* 3. Agua tercer tiempo */}
            <tr className="hover:bg-emerald-950/20 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block text-sm">agua tercer tiempo</span>
                    <span className="text-[10px] text-zinc-400">
                      Sumatorio de los partidos de este fin de semana: Total Jugadores de ambos equipos ÷ 24
                    </span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="px-3 py-1 rounded-lg font-rugby text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 inline-block shadow-sm">
                  {thirdHalfSummary.waterCeil} packs de 24
                </span>
                <span className="block text-[10px] text-zinc-500 mt-0.5">
                  ({thirdHalfSummary.waterCeil * 24} botellas | {thirdHalfSummary.sumWater.toFixed(2)} exacto)
                </span>
              </td>
              <td className="py-3 pl-4 text-right">
                <span className="font-bold text-zinc-200 text-sm block">
                  {thirdHalfSummary.waterTotalCost.toFixed(2)}€
                </span>
                <span className="text-[10px] text-zinc-500">
                  (~{thirdHalfSummary.waterPackCost.toFixed(2)}€ / pack)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Subtotal Footer */}
      <div className="pt-3 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
        <span className="text-[11px]">
          {weekendMatches.length > 0 
            ? `Cálculo sumado para ${weekendMatches.length} partido(s) del fin de semana (${weekendInfo.label}) con un total de ${thirdHalfSummary.totalPeopleAll} personas convocadas.` 
            : 'Las cantidades se actualizarán automáticamente cuando programes los partidos en calendario.'}
        </span>
        <div className="flex items-center gap-2">
          <span>Coste estimado total tercer tiempo:</span>
          <strong className="text-emerald-400 font-rugby text-base tracking-wide">
            {thirdHalfSummary.totalEstimatedCost.toFixed(2)}€
          </strong>
        </div>
      </div>
    </div>
  );

  // Generate clean message text for WhatsApp or Email
  const generateOrderMessage = (supplier: Supplier, items: Product[]) => {
    const lines = [
      `🏉 *LA ÚNICA RUGBY TALDEA*`,
      `Pedido para el próximo Tercer Tiempo`,
      `Proveedor: ${supplier.name} (Atn. ${supplier.contactPerson})`,
      `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
      `---------------------------------------`,
      ...items.map(item => {
        const needed = item.minStock - item.currentStock;
        return `• ${needed} ${item.unit} - ${item.name}`;
      }),
      `---------------------------------------`,
      `Por favor, confirmar disponibilidad y día de entrega en el club (UPNA).`,
      `¡Muchas gracias y aupa La Única! 🟢⚫`
    ];
    return lines.join('\n');
  };

  const handleCopyOrder = (supplier: Supplier, items: Product[]) => {
    const text = generateOrderMessage(supplier, items);
    navigator.clipboard.writeText(text);
    setCopiedSupplierId(supplier.id);
    setTimeout(() => setCopiedSupplierId(null), 3000);
  };

  const handleOpenWhatsApp = (supplier: Supplier, items: Product[]) => {
    const text = generateOrderMessage(supplier, items);
    const cleanPhone = supplier.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Dirección de correo temporal para fase de pruebas según instrucción:
  // "Me gustaría que temporalmente hasta que hayamos hecho las pruebas necesarias, todos estos botones nuevos manden un correo a borja.lara.lopez@gmail.com. Cuando todo funcione correctamente ya cambiaremos esto a los correos del proveedor de cada bloque."
  const TEST_ORDER_EMAIL = 'borja.lara.lopez@gmail.com';

  const executeDirectOrderSend = async (
    supplier: Supplier,
    items: Product[],
    totalCost: number,
    accessKeyToUse: string
  ) => {
    const subject = `🏉 Pedido Oficial La Única RT: ${supplier.name}`;

    // Items del bloque con las cantidades correspondientes a la columna "Cantidad a pedir"
    const itemsLines = items.map(p => {
      const needed = p.minStock - p.currentStock;
      const lineCost = p.costPerUnit ? `(~${(p.costPerUnit * needed).toFixed(2)}€)` : '';
      return `• ${p.name}: ${needed} ${p.unit} ${lineCost}`;
    }).join('\n');

    const emailBody = [
      `Estimado/a ${supplier.contactPerson || supplier.name},`,
      ``,
      `Adjuntamos el pedido oficial de reposición para el almacén y tercer tiempo de La Única Rugby Taldea:`,
      ``,
      `=========================================`,
      `PROVEEDOR: ${supplier.name}`,
      `CONTACTO: ${supplier.contactPerson || 'Atención a pedidos'}`,
      `TELÉFONO: ${supplier.phone}`,
      `EMAIL PROVEEDOR REGISTRADO: ${supplier.email || 'No especificado'}`,
      `FECHA: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      `=========================================`,
      ``,
      `ARTÍCULOS Y CANTIDADES A PEDIR:`,
      itemsLines,
      ``,
      `=========================================`,
      totalCost > 0 ? `COSTE ESTIMADO TOTAL: ${totalCost.toFixed(2)}€` : null,
      `=========================================`,
      ``,
      `Por favor, confirmen la recepción del pedido y la fecha prevista de entrega en las instalaciones de la UPNA.`,
      ``,
      `Muchas gracias y aupa La Única! 🟢⚫`,
      ``,
      `La Única Rugby Taldea (UPNA, Pamplona)`,
      `Responsable de Compras y Almacén`
    ].filter(Boolean).join('\n');

    // Copiar el texto completo al portapapeles por seguridad
    navigator.clipboard.writeText(emailBody);

    setIsSendingSupplierId(supplier.id);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKeyToUse,
          subject: subject,
          from_name: 'La Única Rugby Taldea (Almacén)',
          replyto: 'borja.lara.lopez@gmail.com',
          proveedor: supplier.name,
          contacto_proveedor: supplier.contactPerson || 'No indicado',
          telefono_proveedor: supplier.phone,
          email_proveedor_original: supplier.email || 'No indicado',
          fecha_pedido: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          articulos_y_cantidades: itemsLines,
          coste_total_estimado: totalCost > 0 ? `${totalCost.toFixed(2)}€` : 'A consultar',
          message: emailBody,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderSentSupplierId(supplier.id);
        setOrderFeedbackMessage(`✅ ¡Pedido de "${supplier.name}" enviado con éxito en segundo plano a ${TEST_ORDER_EMAIL}! (Sin abrir ningún cliente de correo)`);
        setTimeout(() => {
          setOrderSentSupplierId(null);
        }, 5000);
      } else {
        throw new Error(result.message || 'Error al conectar con Web3Forms');
      }
    } catch (err: any) {
      console.error('Error enviando con Web3Forms:', err);
      setOrderFeedbackMessage(`❌ No se pudo enviar automáticamente (${err.message || 'Error de conexión'}). Se ha copiado el texto del pedido al portapapeles.`);
      if (err.message && (err.message.toLowerCase().includes('key') || err.message.toLowerCase().includes('invalid'))) {
        setShowKeyModal(true);
      }
    } finally {
      setIsSendingSupplierId(null);
    }
  };

  const handleMakeOrderEmail = (supplier: Supplier, items: Product[], totalCost: number) => {
    const key = web3FormsKey || localStorage.getItem('lurt_web3forms_key') || '';
    if (!key) {
      setPendingOrder({ supplier, items, totalCost });
      setInputKey('');
      setShowKeyModal(true);
      return;
    }
    executeDirectOrderSend(supplier, items, totalCost, key);
  };

  const handleSendEmail = (supplier: Supplier, items: Product[]) => {
    const text = generateOrderMessage(supplier, items);
    const subject = `Pedido Tercer Tiempo - La Única Rugby Taldea`;
    window.location.href = `mailto:${supplier.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  };

  const handleRestockGroup = (items: Product[]) => {
    if (confirm(`¿Marcar como recibidos los ${items.length} productos de este proveedor y actualizar inventario?`)) {
      const restockPayload = items.map(p => ({
        productId: p.id,
        quantity: p.minStock - p.currentStock
      }));
      onBatchRestock(restockPayload);
    }
  };

  const handleRestockAll = () => {
    if (confirm(`¿Marcar como recibido TODO el pedido pendiente (${lowStockProducts.length} productos) y restaurar stock seguro?`)) {
      const restockPayload = lowStockProducts.map(p => ({
        productId: p.id,
        quantity: p.minStock - p.currentStock
      }));
      onBatchRestock(restockPayload);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101713] border border-emerald-900/50 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-rugby text-2xl sm:text-3xl text-white font-bold tracking-wide">
              LISTA DE COMPRA AUTOMÁTICA
            </h1>
            {lowStockProducts.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {lowStockProducts.length} artículos a reponer
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Calcula automáticamente el déficit respecto al stock mínimo y agrupa los pedidos por proveedor para enviar por WhatsApp o email.
          </p>
        </div>

        {lowStockProducts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestockAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/60 transition-all active:scale-95"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Marcar Todo como Recibido</span>
            </button>
          </div>
        )}
      </div>

      {/* Banner de Modo de Pruebas de Correo (Web3Forms en segundo plano) */}
      <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${web3FormsKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white">Envío en segundo plano (sin abrir app de correo):</span>
              {web3FormsKey ? (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Web3Forms Conectado
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                  ⚠️ Requiere clave gratuita (10 seg)
                </span>
              )}
            </div>
            <p className="mt-0.5 text-zinc-400">
              Los botones <strong className="text-emerald-300">"Hacer Pedido"</strong> enviarán el correo directamente a{' '}
              <code className="bg-black/50 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-emerald-800/40">
                borja.lara.lopez@gmail.com
              </code>{' '}
              con los artículos y la columna "Cantidad a pedir".
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              setInputKey(web3FormsKey);
              setShowKeyModal(true);
            }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Configurar clave de acceso gratuita de Web3Forms"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{web3FormsKey ? 'Gestionar Clave' : 'Configurar Clave'}</span>
          </button>
        </div>
      </div>

      {/* Toast / Alerta de feedback cuando se pulsa Hacer Pedido */}
      {orderFeedbackMessage && (
        <div className="bg-[#0e2118] border border-emerald-500/60 rounded-xl p-3.5 flex items-center justify-between gap-3 text-emerald-200 text-xs shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">{orderFeedbackMessage}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Destinatario configurado: <strong className="text-emerald-300 font-mono">borja.lara.lopez@gmail.com</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => setOrderFeedbackMessage(null)}
            className="px-2.5 py-1 bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
      {lowStockProducts.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-[#101713] border border-emerald-900/40 rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-rugby text-2xl font-bold text-white tracking-wide">
                ¡STOCK AL 100% PARA EL TERCER TIEMPO!
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1">
                Todos los artículos del almacén de La Única Rugby Taldea superan su nivel mínimo de seguridad. No hay compras pendientes en este momento.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <span>Ver Inventario Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bloque Compras para tercer tiempo */}
          {renderThirdHalfBlock()}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Supplier Groups & Compras para tercer tiempo immediately after "Suministros Hostelería y Menaje Norte" */}
          {(() => {
            let renderedThirdHalf = false;
            return (
              <>
                {supplierGroups.map(({ supplier, items, totalCost }) => {
                  const isCopied = copiedSupplierId === supplier.id;
                  const isMenaje = isMenajeNorteSupplier(supplier);
                  if (isMenaje) {
                    renderedThirdHalf = true;
                  }

                  return (
                    <React.Fragment key={supplier.id}>
                      <div className="bg-[#101713] border border-emerald-900/50 rounded-2xl p-6 shadow-xl space-y-4">
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-950">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-rugby text-xl font-bold text-white tracking-wide">
                        {supplier.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-0.5">
                        <span>Contacto: <strong className="text-zinc-200">{supplier.contactPerson}</strong></span>
                        <span>•</span>
                        <span>Tel: <strong className="text-zinc-200">{supplier.phone}</strong></span>
                        {supplier.email && (
                          <>
                            <span>•</span>
                            <span>{supplier.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this supplier */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCopyOrder(supplier, items)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                      title="Copiar texto formateado para pegar en WhatsApp o notas"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenWhatsApp(supplier, items)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Botón "Hacer Pedido": Envía correo en segundo plano a borja.lara.lopez@gmail.com */}
                    {supplier.email && (
                      <button
                        onClick={() => handleMakeOrderEmail(supplier, items, totalCost)}
                        disabled={isSendingSupplierId === supplier.id}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-75 disabled:cursor-wait ${
                          isSendingSupplierId === supplier.id
                            ? 'bg-amber-600 text-white'
                            : orderSentSupplierId === supplier.id
                            ? 'bg-emerald-400 text-black shadow-emerald-400/40 font-extrabold'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                        }`}
                        title="Enviar correo de pedido en segundo plano a borja.lara.lopez@gmail.com (sin abrir cliente de correo)"
                      >
                        {isSendingSupplierId === supplier.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : orderSentSupplierId === supplier.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>¡Pedido Enviado!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Hacer Pedido</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleRestockGroup(items)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center gap-1.5 transition-colors"
                      title="Actualizar stock sumando estas unidades como recibidas"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Recibido</span>
                    </button>
                  </div>
                </div>

                {/* Items Table for this supplier */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px]">
                        <th className="py-2 pr-3">Producto</th>
                        <th className="py-2 px-3 text-center">Stock Actual</th>
                        <th className="py-2 px-3 text-center">Mínimo Seguro</th>
                        <th className="py-2 px-3 text-center font-bold text-rose-300">Cantidad a Pedir</th>
                        <th className="py-2 pl-3 text-right">Coste Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {items.map((prod) => {
                        const needed = prod.minStock - prod.currentStock;
                        const lineCost = prod.costPerUnit ? prod.costPerUnit * needed : 0;

                        return (
                          <tr key={prod.id} className="hover:bg-emerald-950/20 transition-colors">
                            <td className="py-2.5 pr-3">
                              <span className="font-semibold text-white block">{prod.name}</span>
                              {prod.notes && <span className="text-[10px] text-zinc-500 italic">{prod.notes}</span>}
                            </td>
                            <td className="py-2.5 px-3 text-center text-rose-400 font-bold">
                              {prod.currentStock} {prod.unit}
                            </td>
                            <td className="py-2.5 px-3 text-center text-zinc-400">
                              {prod.minStock} {prod.unit}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-md font-rugby text-sm font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                                +{needed} {prod.unit}
                              </span>
                            </td>
                            <td className="py-2.5 pl-3 text-right font-medium text-zinc-300">
                              {lineCost > 0 ? `${lineCost.toFixed(2)}€` : 'Consultar'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal */}
                {totalCost > 0 && (
                  <div className="pt-2 flex justify-end text-xs text-zinc-400">
                    <span>Total estimado para este pedido: <strong className="text-emerald-400 font-rugby text-sm">{totalCost.toFixed(2)}€</strong></span>
                  </div>
                )}
              </div>

              {/* Render immediately after "Suministros Hostelería y Menaje Norte" */}
              {isMenaje && renderThirdHalfBlock()}
            </React.Fragment>
          );
        })}

        {/* Fallback if Menaje Norte was not among low-stock supplierGroups */}
        {!renderedThirdHalf && renderThirdHalfBlock()}
      </>
    );
  })()}

          {/* Unassigned products under min stock */}
          {unassignedItems.length > 0 && (
            <div className="bg-[#101713] border border-amber-900/50 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-950">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-rugby text-lg font-bold uppercase tracking-wider text-white">
                    Artículos Sin Proveedor Asignado ({unassignedItems.length})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="text-xs text-emerald-400 hover:underline font-semibold"
                >
                  Asignar proveedor en inventario
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unassignedItems.map((prod) => {
                  const needed = prod.minStock - prod.currentStock;
                  return (
                    <div key={prod.id} className="p-3 bg-[#0a0f0d] rounded-xl border border-zinc-900 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{prod.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Actual: {prod.currentStock} / Mín: {prod.minStock} {prod.unit}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                        Pedir +{needed}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Modal de Configuración de Clave de Web3Forms */}
          {showKeyModal && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#101713] border-2 border-emerald-600/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-black space-y-5 text-left relative">
                <button
                  onClick={() => {
                    setShowKeyModal(false);
                    setPendingOrder(null);
                    setModalError(null);
                  }}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
                    <Key className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-rugby text-xl font-bold text-white tracking-wide">
                      ENVÍO DIRECTO EN SEGUNDO PLANO
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Web3Forms permite enviar los correos a <strong className="text-emerald-300">borja.lara.lopez@gmail.com</strong> automáticamente sin abrir ninguna app de correo externa.
                    </p>
                  </div>
                </div>

                <div className="bg-[#090e0c] p-4 rounded-xl border border-emerald-950/80 space-y-2 text-xs text-zinc-300">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>¿Cómo conseguir la clave gratuita en 10 segundos?</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-zinc-300 mt-1">
                    <li>
                      Entra en{' '}
                      <a
                        href="https://web3forms.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-1"
                      >
                        web3forms.com <ExternalLink className="w-3 h-3 inline" />
                      </a>{' '}
                      (gratuito, 250 envíos/mes, sin tarjeta).
                    </li>
                    <li>
                      Introduce tu correo:{' '}
                      <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-emerald-300 border border-zinc-800 text-[11px]">
                        borja.lara.lopez@gmail.com
                      </span>{' '}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('borja.lara.lopez@gmail.com');
                          setCopiedEmail(true);
                          setTimeout(() => setCopiedEmail(false), 2000);
                        }}
                        className="ml-1 text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                      >
                        {copiedEmail ? '¡Copiado!' : 'Copiar email'}
                      </button>
                      {' '}y pulsa <em>"Create Access Key"</em>.
                    </li>
                    <li>
                      Recibirás al instante un correo de Web3Forms con tu clave (un código de 36 caracteres).
                    </li>
                    <li>
                      Pega esa clave en el campo de abajo y pulsa Guardar.
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-200 block">
                    Access Key de Web3Forms:
                  </label>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(e.target.value.trim());
                      if (modalError) setModalError(null);
                    }}
                    placeholder="Ejemplo: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                    className="w-full px-3.5 py-2.5 bg-[#090e0c] border border-emerald-900/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  {modalError ? (
                    <p className="text-xs text-rose-400 font-medium">{modalError}</p>
                  ) : (
                    <p className="text-[11px] text-zinc-500">
                      La clave se guardará en tu navegador para que los envíos funcionen directamente con 1 solo clic.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setShowKeyModal(false);
                      setPendingOrder(null);
                      setModalError(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const cleanedKey = inputKey.trim();
                      if (!cleanedKey) {
                        setModalError('Por favor introduce o pega tu clave de Web3Forms');
                        return;
                      }
                      localStorage.setItem('lurt_web3forms_key', cleanedKey);
                      setWeb3FormsKey(cleanedKey);
                      setShowKeyModal(false);
                      setModalError(null);

                      if (pendingOrder) {
                        executeDirectOrderSend(
                          pendingOrder.supplier,
                          pendingOrder.items,
                          pendingOrder.totalCost,
                          cleanedKey
                        );
                        setPendingOrder(null);
                      } else {
                        setOrderFeedbackMessage('✅ Clave de Web3Forms guardada correctamente. Ya puedes enviar pedidos en segundo plano.');
                      }
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
                  >
                    {pendingOrder ? 'Guardar y Enviar Pedido Ahora' : 'Guardar Clave'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
