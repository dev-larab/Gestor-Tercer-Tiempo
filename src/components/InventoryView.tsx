import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Filter, 
  Edit3, 
  Trash2, 
  Truck, 
  CheckCircle, 
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  X
} from 'lucide-react';
import { Product, ProductCategory, Supplier } from '../types';
import { ProductModal } from './ProductModal';

interface InventoryViewProps {
  products: Product[];
  suppliers: Supplier[];
  onAddProduct: (productData: Omit<Product, 'id' | 'updatedAt'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onQuickUpdateStock: (productId: string, delta: number, reason: string) => void;
  onRestockToSafeLevel: (productId: string) => void;
}

const CATEGORY_NAMES: Record<ProductCategory, string> = {
  bebidas: 'Bebidas',
  comida: 'Comida',
  hielo: 'Hielo',
  snacks: 'Snacks',
  menaje: 'Menaje & Club',
  limpieza: 'Limpieza',
  otros: 'Otros'
};

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  suppliers,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onQuickUpdateStock,
  onRestockToSafeLevel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'stockAsc' | 'category'>('stockAsc');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Supplier Map
  const supplierMap = useMemo(() => {
    return new Map(suppliers.map(s => [s.id, s]));
  }, [suppliers]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesLowStock = !onlyLowStock || p.currentStock < p.minStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      if (sortBy === 'stockAsc') {
        // Show low stock alerts first, then lowest stock ratio
        const ratioA = a.currentStock / (a.minStock || 1);
        const ratioB = b.currentStock / (b.minStock || 1);
        return ratioA - ratioB;
      }
      return 0;
    });
  }, [products, searchTerm, selectedCategory, onlyLowStock, sortBy]);

  const lowStockCount = products.filter(p => p.currentStock < p.minStock).length;

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<Product, 'id' | 'updatedAt'> & { id?: string }) => {
    if (data.id) {
      const existing = products.find(p => p.id === data.id);
      if (existing) {
        onEditProduct({
          ...existing,
          ...data,
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      onAddProduct(data);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101713] border border-emerald-900/50 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-rugby text-2xl sm:text-3xl text-white font-bold tracking-wide">
              INVENTARIO & STOCK DE TERCEROS TIEMPOS
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Control de existencias, bebidas, alimentos y alertas automáticas de reposición para el bar del club.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-product"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Añadir Producto</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#101713] border border-emerald-900/40 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar producto por nombre, unidad o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/50 focus:border-emerald-500 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none placeholder:text-zinc-500"
            />
          </div>

          {/* Quick toggle: Solo bajo stock */}
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shrink-0 ${
              onlyLowStock
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-md shadow-rose-950/40'
                : 'bg-[#0a0f0d] border-emerald-900/40 text-zinc-400 hover:text-white'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${onlyLowStock ? 'text-rose-400' : 'text-zinc-500'}`} />
            <span>Solo en Alerta de Stock ({lowStockCount})</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-[#0a0f0d] border border-emerald-900/40 px-3 py-2 rounded-xl text-xs text-zinc-300 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-500">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-emerald-300 font-semibold outline-none cursor-pointer"
            >
              <option value="stockAsc" className="bg-[#121915]">Menor Stock / Urgencia</option>
              <option value="name" className="bg-[#121915]">Nombre (A-Z)</option>
              <option value="category" className="bg-[#121915]">Categoría</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-[#0b100d] text-zinc-400 hover:text-zinc-200 border border-emerald-950'
            }`}
          >
            Todos ({products.length})
          </button>
          {Object.entries(CATEGORY_NAMES).map(([key, label]) => {
            const count = products.filter(p => p.category === key).length;
            const hasLow = products.some(p => p.category === key && p.currentStock < p.minStock);
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === key
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#0b100d] text-zinc-400 hover:text-zinc-200 border border-emerald-950'
                }`}
              >
                <span>{label} ({count})</span>
                {hasLow && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products List / Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#101713] border border-emerald-900/40 rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-rugby text-lg text-zinc-300 font-bold">No se encontraron productos</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Prueba a cambiar el filtro de búsqueda o desmarca la opción de solo bajo mínimos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isLowStock = product.currentStock < product.minStock;
            const supplier = product.supplierId ? supplierMap.get(product.supplierId) : undefined;
            const deficit = product.minStock - product.currentStock;

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isLowStock
                    ? 'bg-gradient-to-br from-[#1c1111] via-[#161010] to-[#120d0d] border-rose-700/80 shadow-lg shadow-rose-950/30'
                    : 'bg-[#101713] border-emerald-900/40 hover:border-emerald-700/60'
                }`}
              >
                {/* Visual Alert Strip for Low Stock */}
                {isLowStock && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
                )}

                <div>
                  {/* Top tags row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                      {CATEGORY_NAMES[product.category] || product.category}
                    </span>

                    {/* Stock Alert Badge */}
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/60 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>Bajo Stock (Faltan {deficit})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400/90 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-900/40">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Óptimo</span>
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <h3 className="font-rugby text-lg font-bold text-white tracking-wide leading-snug">
                    {product.name}
                  </h3>

                  {/* Supplier info */}
                  {supplier && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{supplier.name}</span>
                    </div>
                  )}

                  {/* Notes / details */}
                  {product.notes && (
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 italic bg-[#0a0f0d]/60 p-2 rounded-lg border border-zinc-900">
                      "{product.notes}"
                    </p>
                  )}
                </div>

                {/* Stock Level Display & Fast Steppers */}
                <div className="mt-4 pt-3 border-t border-emerald-950/80">
                  {/* Stock Level Counter */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
                        Stock Actual
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`font-rugby text-3xl font-bold ${
                          isLowStock ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {product.currentStock}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {product.unit}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                        Mínimo Seguro
                      </span>
                      <span className="text-xs font-bold text-zinc-300">
                        {product.minStock} {product.unit}
                      </span>
                    </div>
                  </div>

                  {/* Quick Tactile +/- Buttons */}
                  <div className="flex items-center justify-between gap-1 bg-[#0b100d] p-1.5 rounded-xl border border-emerald-950">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase pl-1 hidden sm:inline">
                      Ajuste rápido:
                    </span>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      {/* -1 button */}
                      <button
                        onClick={() => onQuickUpdateStock(product.id, -1, 'Consumo en barra tercer tiempo')}
                        disabled={product.currentStock <= 0}
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-rose-950 hover:text-rose-300 text-zinc-200 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5"
                        title="Restar 1 unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                        <span>1</span>
                      </button>

                      {/* +1 button */}
                      <button
                        onClick={() => onQuickUpdateStock(product.id, 1, 'Reposición rápida de stock')}
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 text-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-0.5"
                        title="Sumar 1 unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>1</span>
                      </button>

                      {/* +5 batch button */}
                      <button
                        onClick={() => onQuickUpdateStock(product.id, 5, 'Entrada de lote (+5)')}
                        className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-800 text-emerald-300 rounded-lg text-xs font-bold transition-all border border-emerald-800/40"
                        title="Añadir lote de 5 unidades"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  {/* Action row (Edit / Delete / One-click Restock) */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-900/60 text-xs">
                    {isLowStock ? (
                      <button
                        onClick={() => onRestockToSafeLevel(product.id)}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                        title="Reponer al nivel mínimo recomendado"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reponer (+{deficit + 2})</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-500">
                        {product.costPerUnit ? `${product.costPerUnit.toFixed(2)}€ / ud` : 'Sin coste'}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Editar detalles del producto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setProductToDelete(product)}
                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveModal}
        initialProduct={editingProduct}
        suppliers={suppliers}
      />

      {/* Confirmation Modal to Delete Product */}
      {productToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-md bg-[#0e1612] border border-rose-900/60 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-rose-950/60 bg-[#160f11]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-800/60 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    ¿Eliminar este artículo?
                  </h3>
                  <p className="text-xs text-rose-300/80">
                    Confirmación de inventario
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#131b16] border border-emerald-950/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                    {CATEGORY_NAMES[productToDelete.category] || productToDelete.category}
                  </span>
                  <span className="text-xs text-zinc-400">
                    Stock actual: <strong className="text-white">{productToDelete.currentStock} {productToDelete.unit}</strong>
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">
                  {productToDelete.name}
                </h4>
                {productToDelete.notes && (
                  <p className="text-xs text-zinc-400 italic">
                    "{productToDelete.notes}"
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  ¿Estás seguro de que deseas eliminar este artículo del stock de La Única? Esta acción retirará el producto del inventario activo y del registro de existencias.
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-rose-950/60 bg-[#121915] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (productToDelete) {
                    onDeleteProduct(productToDelete.id);
                    setProductToDelete(null);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-950/50 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
