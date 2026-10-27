import React, { useState, useEffect } from 'react';
import { CorporatePayrollAgreement, BankingDivisionId } from '../game/types';
import { formatHNL } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { Briefcase, Users, DollarSign, X, Check, Building2, ShieldCheck } from 'lucide-react';

interface PayrollEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  agreementToEdit: CorporatePayrollAgreement | null;
  onSaveAgreement: (agreement: CorporatePayrollAgreement, isNew: boolean) => void;
}

export function PayrollEditModal({
  isOpen,
  onClose,
  agreementToEdit,
  onSaveAgreement
}: PayrollEditModalProps) {
  const [formData, setFormData] = useState<CorporatePayrollAgreement>({
    id: '',
    companyName: '',
    industry: 'Sector Textil Maquila (Choloma)',
    employeeCount: 500,
    monthlyPayrollVolume: 9250000,
    feePerEmployee: 18,
    averageSalary: 18500,
    eligiblePayrollLoansCount: 150,
    status: 'Activo',
    monthsWithBank: 6,
    isAutoRenewed: true,
    loyaltyBonusPct: 5,
    linkedDivision: 'corporativa',
    bankAccountBalanceHNL: 6500000,
    accountNumber: 'CTA-CORP-0501-8841-01'
  });

  const isNew = !agreementToEdit;

  useEffect(() => {
    if (agreementToEdit) {
      setFormData({ ...agreementToEdit });
    } else {
      setFormData({
        id: `pay-${Date.now().toString().slice(-4)}`,
        companyName: '',
        industry: 'Sector Agroindustrial y Logística',
        employeeCount: 450,
        monthlyPayrollVolume: 8325000,
        feePerEmployee: 20,
        averageSalary: 18500,
        eligiblePayrollLoansCount: 120,
        status: 'Activo',
        monthsWithBank: 1,
        isAutoRenewed: false,
        loyaltyBonusPct: 0,
        linkedDivision: 'corporativa',
        bankAccountBalanceHNL: 5200000,
        accountNumber: `CTA-CORP-0501-${Math.floor(1000 + Math.random() * 9000)}-01`
      });
    }
  }, [agreementToEdit, isOpen]);

  if (!isOpen) return null;

  const handleEmployeesChange = (count: number) => {
    const avg = formData.averageSalary || 18500;
    const vol = count * avg;
    setFormData({
      ...formData,
      employeeCount: count,
      monthlyPayrollVolume: vol,
      eligiblePayrollLoansCount: Math.round(count * 0.28)
    });
  };

  const handleVolumeChange = (volume: number) => {
    const emp = formData.employeeCount || 1;
    const avg = Math.round(volume / emp);
    setFormData({
      ...formData,
      monthlyPayrollVolume: volume,
      averageSalary: avg
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert('Por favor ingresa el nombre de la empresa.');
      return;
    }
    sound.playApprovalStamp();
    onSaveAgreement(formData, isNew);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {isNew ? 'Afiliar Nueva Empresa con Convenio de Planilla' : `Modificar Nómina: ${agreementToEdit?.companyName}`}
              </h2>
              <p className="text-xs text-slate-400">Cámara de Compensación y Dispersión Salarial CEE</p>
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
        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Razón Social de la Empresa</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={e => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="Ej: Agropecuaria del Valle S.A."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sector Industrial / Rubro</label>
              <input
                type="text"
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Banca de Radicación de Cuenta</label>
              <select
                value={formData.linkedDivision}
                onChange={e => setFormData({ ...formData, linkedDivision: e.target.value as BankingDivisionId })}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-500/50"
              >
                <option value="corporativa">Banca Corporativa (Grandes Empresas)</option>
                <option value="pyme">Banca Comercial PYME</option>
                <option value="premier">Banca Premier</option>
              </select>
            </div>
          </div>

          {/* Empleados y Monto de Nómina */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Parámetros de Dispersión Salarial
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cantidad de Empleados en Planilla</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.employeeCount}
                  onChange={e => handleEmployeesChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-slate-100 font-bold focus:outline-none focus:border-indigo-500/50"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Potenciales clientes para préstamos de deducción</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Monto Mensual de Nómina (HNL)</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.monthlyPayrollVolume}
                  onChange={e => handleVolumeChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Salario promedio: {formatHNL(formData.averageSalary || 0)}</p>
              </div>
            </div>

            {/* Saldo de Cuenta Corporativa Obligatoria */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Saldo Retenido en Cuenta Empresarial en Áureo Bank (HNL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.bankAccountBalanceHNL}
                  onChange={e => setFormData({ ...formData, bankAccountBalanceHNL: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-500/50"
                />
                <span className="text-xs text-slate-400 shrink-0 font-mono">
                  {formatHNL(formData.bankAccountBalanceHNL)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Cuenta obligatoria en el banco que fondea directamente los depósitos de la banca seleccionada.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <label className="block text-[11px] text-slate-400 mb-1">Número de Cuenta Institucional</label>
              <input
                type="text"
                value={formData.accountNumber || 'CTA-CORP-0501-8841-01'}
                onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <label className="block text-[11px] text-slate-400 mb-1">Comisión por Empleado Dispersado (HNL)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.feePerEmployee}
                onChange={e => setFormData({ ...formData, feePerEmployee: Number(e.target.value) })}
                className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200"
              />
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
              {isNew ? 'Registrar Empresa de Nómina' : 'Guardar Cambios de Planilla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
