import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  ExternalLink,
  ShoppingCart
} from 'lucide-react';
import { Supplier, Product, TabType } from '../types';
import { SupplierModal } from './SupplierModal';

interface SuppliersViewProps {
  suppliers: Supplier[];
  products: Product[];
  onAddSupplier: (supplierData: Omit<Supplier, 'id'>) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  products,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onNavigateTab
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<Supplier, 'id'> & { id?: string }) => {
    if (data.id) {
      const existing = suppliers.find(s => s.id === data.id);
      if (existing) {
        onEditSupplier({ ...existing, ...data });
      }
    } else {
      onAddSupplier(data);
    }
  };

  // Helper to format clean WhatsApp link
  const getWhatsAppLink = (phone: string, supplierName: string, lowItems: Product[]) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    let text = `Aupa! Te escribimos desde La Única Rugby Taldea para gestionar el pedido del próximo tercer tiempo.`;
    if (lowItems.length > 0) {
      text += `\n\nArtículos que necesitamos reponer:\n` + lowItems.map(i => `- ${i.minStock - i.currentStock} ${i.unit} de ${i.name}`).join('\n');
    }
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101713] border border-emerald-900/50 p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="font-rugby text-2xl sm:text-3xl text-white font-bold tracking-wide">
            PROVEEDORES & DISTRIBUIDORES
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Red de proveedores habituales para cerveza, embutidos, pan, hielo y suministros de tercer tiempo.
          </p>
        </div>

        <button
          id="btn-add-supplier"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Añadir Proveedor</span>
        </button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {suppliers.map((supplier) => {
          // Find associated products
          const associatedProducts = products.filter(p => p.supplierId === supplier.id);
          const lowStockAssociated = associatedProducts.filter(p => p.currentStock < p.minStock);

          return (
            <div
              key={supplier.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                lowStockAssociated.length > 0
                  ? 'bg-gradient-to-br from-[#181513] to-[#111613] border-amber-800/60 shadow-lg'
                  : 'bg-[#101713] border-emerald-900/40 hover:border-emerald-700/50'
              }`}
            >
              <div>
                {/* Title & Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                      Distribuidor Autorizado
                    </span>
                    <h3 className="font-rugby text-xl font-bold text-white tracking-wide mt-1.5">
                      {supplier.name}
                    </h3>
                    <p className="text-xs text-zinc-300 font-medium">
                      Contacto: <span className="text-emerald-400">{supplier.contactPerson}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(supplier)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors"
                      title="Editar proveedor"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar al proveedor ${supplier.name}?`)) {
                          onDeleteSupplier(supplier.id);
                        }
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Eliminar proveedor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Direct Contact Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  <a
                    href={`tel:${supplier.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#0a0f0d] border border-emerald-950 hover:border-emerald-700 text-xs text-zinc-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{supplier.phone}</span>
                  </a>

                  {supplier.email && (
                    <a
                      href={`mailto:${supplier.email}?subject=Pedido%20Tercer%20Tiempo%20-%20La%20Única%20Rugby%20Taldea`}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[#0a0f0d] border border-emerald-950 hover:border-emerald-700 text-xs text-zinc-300 hover:text-white transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </a>
                  )}
                </div>

                {supplier.address && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}

                {/* Notes */}
                {supplier.notes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#0b100d] border border-emerald-950 text-xs text-zinc-400">
                    <strong className="text-zinc-300 block text-[11px] uppercase mb-0.5">Condiciones y Entrega:</strong>
                    {supplier.notes}
                  </div>
                )}

                {/* Associated Products Section */}
                <div className="mt-4 pt-3 border-t border-emerald-950">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-emerald-400" />
                      Productos Suministrados ({associatedProducts.length}):
                    </span>
                    {lowStockAssociated.length > 0 && (
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        {lowStockAssociated.length} en stock bajo
                      </span>
                    )}
                  </div>

                  {associatedProducts.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No hay productos vinculados aún.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {associatedProducts.map((p) => {
                        const isLow = p.currentStock < p.minStock;
                        return (
                          <div
                            key={p.id}
                            className={`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                              isLow
                                ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                                : 'bg-[#0a0f0d] text-zinc-300 border-emerald-950'
                            }`}
                          >
                            <span className="truncate max-w-[170px]">{p.name}</span>
                            <span className={`text-[10px] font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                              ({p.currentStock} {p.unit})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action bar */}
              <div className="mt-4 pt-3 border-t border-emerald-950/80 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={getWhatsAppLink(supplier.phone, supplier.name, lowStockAssociated)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Pedir por WhatsApp</span>
                </a>

                {lowStockAssociated.length > 0 && (
                  <button
                    onClick={() => onNavigateTab('shopping')}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium underline"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Ver en Lista de Compras</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
