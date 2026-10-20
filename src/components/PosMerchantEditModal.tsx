import React, { useState, useEffect } from 'react';
import { PosMerchant } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { Store, DollarSign, X, Check, CreditCard, Building, ShieldCheck } from 'lucide-react';

interface PosMerchantEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantToEdit: PosMerchant | null;
  onSaveMerchant: (merchant: PosMerchant, isNew: boolean) => void;
}

export function PosMerchantEditModal({
  isOpen,
  onClose,
  merchantToEdit,
  onSaveMerchant
}: PosMerchantEditModalProps) {
  const [formData, setFormData] = useState<PosMerchant>({
    id: '',
    merchantName: '',
    businessCategory: 'Supermercado & Abarrotería',
    city: 'San Pedro Sula',
    physicalPosCount: 3,
    virtualPosCount: 1,
    hasTapToPay: true,
    monthlySalesVolumeHNL: 1500000,
    bankAccountBalanceHNL: 350000,
    transactionFeePct: 2.2,
    creditEligible: true,
    hasCommercialLoan: false,
    commercialLoanAmount: 0,
    hasBusinessCard: true,
    accountNumber: 'CTA-PYM-0501-8841-01',
    division: 'pyme'
  });

  const isNew = !merchantToEdit;

  useEffect(() => {
    if (merchantToEdit) {
      setFormData({ ...merchantToEdit });
    } else {
      setFormData({
        id: `pos-${Date.now().toString().slice(-4)}`,
        merchantName: '',
        businessCategory: 'Supermercado & Abarrotería',
        city: 'San Pedro Sula',
        physicalPosCount: 4,
        virtualPosCount: 1,
        hasTapToPay: true,
        monthlySalesVolumeHNL: 2200000,
        bankAccountBalanceHNL: 480000,
        transactionFeePct: 2.2,
        creditEligible: true,
        hasCommercialLoan: false,
        commercialLoanAmount: 0,
        hasBusinessCard: true,
        accountNumber: `CTA-PYM-0501-${Math.floor(1000 + Math.random() * 9000)}-01`,
        division: 'pyme'
      });
    }
  }, [merchantToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.merchantName.trim()) {
      alert('Por favor ingresa el nombre comercial del negocio.');
      return;
    }
    sound.playApprovalStamp();
    onSaveMerchant(formData, isNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {isNew ? 'Afiliar Nuevo Comercio a la Red POS' : `Editar Comercio: ${merchantToEdit?.merchantName}`}
              </h2>
              <p className="text-xs text-slate-400">Configuración de facturación, terminales y saldo en cuenta bancaria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial de la Empresa / Negocio</label>
            <input
              type="text"
              required
              value={formData.merchantName}
              onChange={e => setFormData({ ...formData, merchantName: e.target.value })}
              placeholder="Ej: Abarrotería & Súper San José"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría de Comercio</label>
              <select
                value={formData.businessCategory}
                onChange={e => setFormData({ ...formData, businessCategory: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Supermercado & Abarrotería">Supermercado & Abarrotería</option>
                <option value="Restaurante & Café">Restaurante & Café</option>
                <option value="Ferretería & Construcción">Ferretería & Construcción</option>
                <option value="Farmacia & Salud">Farmacia & Salud</option>
                <option value="Tienda Retail & Moda">Tienda Retail & Moda</option>
                <option value="Taller & Repuestos">Taller & Repuestos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad Sede</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Saldo en Cuenta y Facturación Mensual */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" /> Parámetros Financieros en Áureo Bank
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Saldo en Cuenta de Ahorro / Cheques (HNL)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={formData.bankAccountBalanceHNL}
                  onChange={e => setFormData({ ...formData, bankAccountBalanceHNL: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Impacta de inmediato los depósitos de la banca PYME</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facturación / Ventas POS Mensuales (HNL)</label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  value={formData.monthlySalesVolumeHNL}
                  onChange={e => setFormData({ ...formData, monthlySalesVolumeHNL: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-slate-100 font-bold focus:outline-none focus:border-amber-500/50"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Base de cálculo para comisiones transaccionales</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Terminales POS Físicos</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.physicalPosCount}
                  onChange={e => setFormData({ ...formData, physicalPosCount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">POS Virtuales / Web</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.virtualPosCount}
                  onChange={e => setFormData({ ...formData, virtualPosCount: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Comisión POS (%)</label>
                <input
                  type="number"
                  min="1.0"
                  max="4.0"
                  step="0.1"
                  value={formData.transactionFeePct}
                  onChange={e => setFormData({ ...formData, transactionFeePct: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300"
                />
              </div>
            </div>
          </div>

          {/* Opciones y Cuenta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <label className="block text-[11px] text-slate-400 mb-1">Número de Cuenta Asociada</label>
              <input
                type="text"
                value={formData.accountNumber || 'CTA-PYM-0501-8841-01'}
                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-center space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasTapToPay}
                  onChange={e => setFormData({ ...formData, hasTapToPay: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">Habilitar Tap to Pay (Contactless)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasBusinessCard}
                  onChange={e => setFormData({ ...formData, hasBusinessCard: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300">Tarjeta Visa Empresarial Áureo</span>
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {isNew ? 'Registrar Empresa POS' : 'Guardar Modificaciones'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
