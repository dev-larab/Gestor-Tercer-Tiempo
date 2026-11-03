import React, { useState, useEffect } from 'react';
import { X, Save, Truck } from 'lucide-react';
import { Supplier } from '../types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplierData: Omit<Supplier, 'id'> & { id?: string }) => void;
  initialSupplier?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSupplier
}) => {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialSupplier) {
      setName(initialSupplier.name);
      setContactPerson(initialSupplier.contactPerson);
      setPhone(initialSupplier.phone);
      setEmail(initialSupplier.email);
      setAddress(initialSupplier.address || '');
      setNotes(initialSupplier.notes || '');
    } else {
      setName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
    }
  }, [initialSupplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...(initialSupplier ? { id: initialSupplier.id } : {}),
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || undefined,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121915] border border-emerald-900/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/40 bg-[#0d1310]">
          <div>
            <h2 className="font-rugby text-xl font-bold text-white tracking-wide">
              {initialSupplier ? 'EDITAR PROVEEDOR' : 'NUEVO PROVEEDOR'}
            </h2>
            <p className="text-xs text-emerald-400/80">
              La Única Rugby Taldea • Red de Suministros
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Nombre de la Empresa o Distribuidor *
            </label>
            <input
              type="text"
              required
              placeholder="ej: Bebidas Iruña Distribución S.L."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Persona de Contacto
              </label>
              <input
                type="text"
                placeholder="ej: Mikel Goñi"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                Teléfono de Pedidos *
              </label>
              <input
                type="tel"
                required
                placeholder="ej: +34 948 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Email para Pedidos
            </label>
            <input
              type="email"
              placeholder="ej: pedidos@distribuidora.es"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Dirección o Polígono
            </label>
            <input
              type="text"
              placeholder="ej: Polígono Agustinos, Pamplona"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Notas de Pedidos Habituales y Reparto
            </label>
            <textarea
              rows={3}
              placeholder="ej: Repartos los viernes antes de las 13h. Avisar con 24h para barriles adicionales."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0a0f0d] border border-emerald-900/60 focus:border-emerald-500 text-white text-sm rounded-xl px-3.5 py-2.5 outline-none resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-emerald-900/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Proveedor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
