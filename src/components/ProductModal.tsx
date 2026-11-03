import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { Product, ProductCategory, Supplier } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'updatedAt'> & { id?: string }) => void;
  initialProduct?: Product | null;
  suppliers: Supplier[];
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'bebidas', label: 'Bebidas (Cerveza, Refrescos, Agua)' },
  { id: 'comida', label: 'Comida (Txistorra, Pan, Carne, Salsas)' },
  { id: 'hielo', label: 'Hielo' },
  { id: 'snacks', label: 'Snacks y Aperitivos' },
  { id: 'menaje', label: 'Menaje y Vasos Club' },
  { id: 'limpieza', label: 'Limpieza y Mantenimiento' },
  { id: 'otros', label: 'Otros Suministros' },
];

const UNIT_PRESETS = [
  'barriles (50L)',
  'barriles (30L)',
  'cajas (24 ud)',
  'packs (6 ud)',
  'unidades',
  'kg',
  'paquetes',
  'sacos (10kg)',
  'bolsas (500g)',
  'litros'
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  suppliers
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('bebidas');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [unit, setUnit] = useState('unidades');
  const [supplierId, setSupplierId] = useState('');
  const [costPerUnit, setCostPerUnit] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setCategory(initialProduct.category);
      setCurrentStock(initialProduct.currentStock);
      setMinStock(initialProduct.minStock);
      setUnit(initialProduct.unit);
      setSupplierId(initialProduct.supplierId || '');
      setCostPerUnit(initialProduct.costPerUnit);
      setNotes(initialProduct.notes || '');
    } else {
      setName('');
      setCategory('bebidas');
      setCurrentStock(5);
      setMinStock(5);
      setUnit('unidades');
      setSupplierId(suppliers[0]?.id || '');
      setCostPerUnit(undefined);
      setNotes('');
    }
  }, [initialProduct, suppliers, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(initialProduct ? { id: initialProduct.id } : {}),
      name: name.trim(),
      category,
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      unit: unit.trim() || 'unidades',
      supplierId: supplierId || undefined,
      costPerUnit: costPerUnit !== undefined && !isNaN(Number(costPerUnit)) ? Number(costPerUnit) : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const isLowStockWarning = Number(currentStock) < Number(minStock);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121915] border border-emerald-900/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/40 bg-[#0d1310]">
          <div>
            <h2 className="font-rugby text-xl font-bold text-white tracking-wide">
              {initialProduct ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO DE TERCER TIEMPO'}
            </h2>
            <p className="text-xs text-emerald-400/80">
              La Única Rugby Taldea • Control de Existencias
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              placeholder="ej. Barril Cerveza Rubia Keler 50L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Categoría *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#121915]">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock & Min Stock Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Cantidad Actual *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Stock Mínimo (Alerta) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Low Stock Live Notice */}
          {isLowStockWarning && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                Alerta: La cantidad actual ({currentStock}) está por debajo del mínimo ({minStock}). Se marcará para reponer.
              </span>
            </div>
          )}

          {/* Unit selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Unidad de Medida *
            </label>
            <input
              type="text"
              placeholder="ej: barriles (50L), cajas, kg, paquetes..."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none mb-1.5"
            />
            {/* Quick unit chips */}
            <div className="flex flex-wrap gap-1.5">
              {UNIT_PRESETS.slice(0, 5).map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setUnit(preset)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    unit === preset
                      ? 'bg-emerald-600/40 text-emerald-300 border-emerald-500'
                      : 'bg-zinc-800/60 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier dropdown & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Proveedor Habitual
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none"
              >
                <option value="">-- Sin asignar --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#121915]">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Coste Estimado (€ / ud)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="ej: 95.00"
                value={costPerUnit !== undefined ? costPerUnit : ''}
                onChange={(e) => setCostPerUnit(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notas / Ubicación en Almacén
            </label>
            <textarea
              rows={2}
              placeholder="ej: Conector tipo S. Guardar en cámara frigorífica 1."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2 outline-none resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-emerald-900/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Producto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
