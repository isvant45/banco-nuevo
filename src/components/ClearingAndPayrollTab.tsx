import React, { useState } from 'react';
import { GameState, CorporatePayrollAgreement } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  ArrowLeftRight, 
  Receipt, 
  Users2, 
  ShieldCheck, 
  CheckCircle2, 
  PlusCircle, 
  BadgeCheck, 
  Percent, 
  Edit3, 
  Sparkles, 
  Clock 
} from 'lucide-react';

import { PayrollEditModal } from './PayrollEditModal';

interface ClearingAndPayrollTabProps {
  state: GameState;
  onUpdateAchFee: (newFee: number) => void;
  onSignPayrollAgreement: (agreementId: string) => void;
  onUpdatePayrollAgreement: (agreementId: string, employeeCount: number, monthlyPayrollVolume: number) => void;
  onSavePayrollAgreement?: (agreement: CorporatePayrollAgreement, isNew: boolean) => void;
}

export const ClearingAndPayrollTab: React.FC<ClearingAndPayrollTabProps> = ({
  state,
  onUpdateAchFee,
  onSignPayrollAgreement,
  onUpdatePayrollAgreement,
  onSavePayrollAgreement
}) => {
  const [achFee, setAchFee] = useState<number>(state.clearingHouse.achFeePerTransfer);
  const clearing = state.clearingHouse;

  // Modal para editar / afiliar convenio completo con cuenta bancaria
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState<boolean>(false);
  const [selectedAgreementForModal, setSelectedAgreementForModal] = useState<CorporatePayrollAgreement | null>(null);

  const handleSaveAchFee = () => {
    sound.playApprovalStamp();
    onUpdateAchFee(achFee);
  };

  const handleSignAgreement = (id: string) => {
    sound.playCashChime();
    onSignPayrollAgreement(id);
  };

  const handleOpenEditModal = (agreement: CorporatePayrollAgreement) => {
    sound.playClick();
    setSelectedAgreementForModal(agreement);
    setIsPayrollModalOpen(true);
  };

  const handleOpenNewAgreement = () => {
    sound.playClick();
    setSelectedAgreementForModal(null);
    setIsPayrollModalOpen(true);
  };

  const handleSaveModalAgreement = (agreement: CorporatePayrollAgreement, isNew: boolean) => {
    sound.playApprovalStamp();
    if (onSavePayrollAgreement) {
      onSavePayrollAgreement(agreement, isNew);
    } else {
      onUpdatePayrollAgreement(agreement.id, agreement.employeeCount, agreement.monthlyPayrollVolume);
    }
    setIsPayrollModalOpen(false);
  };

  const totalEmployees = state.payrollAgreements
    .filter(a => a.status === 'Activo')
    .reduce((acc, a) => acc + a.employeeCount, 0);

  const totalPayrollVolume = state.payrollAgreements
    .filter(a => a.status === 'Activo')
    .reduce((acc, a) => acc + a.monthlyPayrollVolume, 0);

  const totalPayrollLoans = state.payrollAgreements
    .filter(a => a.status === 'Activo')
    .reduce((acc, a) => acc + a.eligiblePayrollLoansCount, 0);

  return (
    <div className="space-y-6">
      {/* 1. Encabezado de Cámara de Compensación (CCE / ACH Pronto) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Cámara de Compensación Electrónica (CCE / ACH Pronto)
              </h2>
              <p className="text-xs text-slate-400">
                Liquidación interbancaria de cheques y transferencias ACH con Banco Atlántida, Ficohsa, BAC y Banco Central de Honduras.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Posición Neta ante BCH:</span>
              <span className={`text-xs font-mono font-bold ${clearing.achNetClearingPosition >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {clearing.achNetClearingPosition >= 0 ? '+' : ''}{formatHNL(clearing.achNetClearingPosition)}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas de CCE / ACH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Transferencias ACH Salientes:</span>
            <span className="font-mono font-bold text-base text-white">{clearing.achOutgoingTransfers.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Enviadas a otros bancos</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Transferencias ACH Entrantes:</span>
            <span className="font-mono font-bold text-base text-emerald-400">{clearing.achIncomingTransfers.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Fondos recibidos en Áureo</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Cheques Interbancarios:</span>
            <span className="font-mono font-bold text-base text-blue-400">{clearing.interbankChecksProcessed.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Rechazo: {clearing.checkRejectionRate}%</span>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-1">Ingresos por Comisiones CCE:</span>
            <span className="font-mono font-bold text-base text-amber-400">{formatHNL(clearing.clearingFeeIncome)}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Tarifa: L. {clearing.achFeePerTransfer} / transf.</span>
          </div>
        </div>

        {/* Ajuste de Tarifa ACH */}
        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Tarifa por Transferencia ACH Saliente</span>
            <span className="text-[11px] text-slate-400">
              Comisión que abona el cliente por cada pago ACH Pronto. Promedio de mercado hondureño: L. 15 a L. 30.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-slate-400">L.</span>
              <input
                type="number"
                min="5"
                max="50"
                step="1"
                value={achFee}
                onChange={e => setAchFee(parseInt(e.target.value) || 20)}
                className="w-16 bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 text-center font-bold"
              />
            </div>
            <button
              onClick={handleSaveAchFee}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
            >
              Guardar Tarifa
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sección de Servicios de Pago de Planilla / Nómina Empresarial */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Servicios y Convenios de Pago de Planilla Empresarial
              </h2>
              <p className="text-xs text-slate-400">
                Dispersión masiva de nómina con renovación semestral automática a los 6 meses de permanencia. Captación cautiva y créditos por deducción de nómina.
              </p>
            </div>
          </div>

          {/* Estadísticas de Nómina */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Colaboradores Bancarizados:</span>
              <span className="text-white font-bold">{totalEmployees.toLocaleString()} empleados</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Volumen Mensual Dispersado:</span>
              <span className="text-emerald-400 font-bold">{formatHNL(totalPayrollVolume)}</span>
            </div>
          </div>
        </div>

        {/* Lista de Convenios Corporativos */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Convenios de Nómina Registrados ({state.payrollAgreements.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Cada empresa afiliada debe mantener aperturada su cuenta corriente o empresarial con fondos de reserva en la banca correspondiente de Áureo Bank.
              </p>
            </div>

            <button
              onClick={handleOpenNewAgreement}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Afiliar Nueva Empresa de Planilla</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Empresa / Razón Social</th>
                  <th className="py-2.5 px-3">Banca y Cuenta Obligatoria</th>
                  <th className="py-2.5 px-3 text-right">Empleados</th>
                  <th className="py-2.5 px-3 text-right">Monto Nómina (L.)</th>
                  <th className="py-2.5 px-3 text-right">Saldo en Cuenta (L.)</th>
                  <th className="py-2.5 px-3 text-center">Antigüedad</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {state.payrollAgreements.map(agreement => {
                  const isActive = agreement.status === 'Activo';
                  const isRenewed = agreement.isAutoRenewed;
                  const divName = (agreement.linkedDivision || 'corporativa').toUpperCase();

                  return (
                    <tr key={agreement.id} className="hover:bg-slate-800/40 text-slate-300">
                      <td className="py-3 px-3 font-sans font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{agreement.companyName}</span>
                          {isRenewed && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                              RENOVADO 6M
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">{agreement.industry}</span>
                      </td>

                      <td className="py-3 px-3 font-sans">
                        <span className="text-amber-400 font-bold text-[11px] block">
                          BANCA {divName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {agreement.accountNumber || `CTA-${divName.slice(0, 4)}-0501-11`}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right text-slate-200">
                        {agreement.employeeCount.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                        {formatHNL(agreement.monthlyPayrollVolume)}
                      </td>

                      <td className="py-3 px-3 text-right text-blue-300 font-bold">
                        {formatHNL(agreement.bankAccountBalanceHNL || 0)}
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <span className="text-slate-300 flex items-center justify-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{agreement.monthsWithBank} meses</span>
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isActive 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isActive ? (isRenewed ? 'Renovación Auto' : 'Activo') : 'Prospecto'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(agreement)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                            title="Modificar colaboradores, nómina, saldo y cuenta bancaria"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modificar</span>
                          </button>

                          {!isActive && (
                            <button
                              onClick={() => handleSignAgreement(agreement.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Firmar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Interactivo de Creación y Edición de Convenios de Planilla */}
      {isPayrollModalOpen && (
        <PayrollEditModal
          isOpen={true}
          agreementToEdit={selectedAgreementForModal}
          onClose={() => setIsPayrollModalOpen(false)}
          onSaveAgreement={handleSaveModalAgreement}
        />
      )}
    </div>
  );
};
