import React, { useState } from 'react';
import { DailySimulationState, NpcBankId, TransactionVoucher } from '../../game/retroSimTypes';
import {
  NPC_BANK_PROFILES,
  evaluateNpcCreditAuction,
  disburseNpcLoan,
  payNpcLoanQuota
} from '../../game/npcBankingEngine';
import { sound } from '../../game/audioFx';

interface NpcFinancingWindowProps {
  simState: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onShowVoucher?: (voucher: TransactionVoucher) => void;
  onTriggerToast?: (toast: { title: string; message: string; type: 'success' | 'warning' | 'danger' | 'money'; amount?: number }) => void;
}

export const NpcFinancingWindow: React.FC<NpcFinancingWindowProps> = ({
  simState,
  onUpdateState,
  onShowVoucher,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'auction' | 'active_loans'>('auction');
  const [requestedAmount, setRequestedAmount] = useState<number>(350000);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [selectedDestination, setSelectedDestination] = useState<'bank' | 'cash'>('bank');
  const [selectedCollateralIds, setSelectedCollateralIds] = useState<string[]>([]);

  const activeLoans = simState.npcLoans || [];
  const collaterals = simState.realEstateCollaterals || [];
  const availableCollaterals = collaterals.filter(c => !c.isPledged && !c.isLockedForSale);

  const auctionEvaluations = evaluateNpcCreditAuction(
    simState,
    requestedAmount,
    termMonths,
    selectedCollateralIds
  );

  const handleDisburse = (bankId: NpcBankId) => {
    const res = disburseNpcLoan(
      simState,
      bankId,
      requestedAmount,
      termMonths,
      selectedDestination,
      selectedCollateralIds
    );

    if (res.success) {
      sound.playCaChing();
      onUpdateState(res.updatedState);
      if (res.voucher && onShowVoucher) {
        onShowVoucher(res.voucher);
      }
      if (onTriggerToast) {
        onTriggerToast({
          title: 'Préstamo Desembolsado',
          message: res.message,
          type: 'money',
          amount: requestedAmount
        });
      }
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const handlePayLoan = (loanId: string, fullPayoff: boolean = false) => {
    const res = payNpcLoanQuota(simState, loanId, fullPayoff, selectedDestination);
    if (res.success) {
      sound.playApprovalStamp();
      onUpdateState(res.updatedState);
      if (res.voucher && onShowVoucher) {
        onShowVoucher(res.voucher);
      }
      if (onTriggerToast) {
        onTriggerToast({
          title: fullPayoff ? 'Cancelación Total de Préstamo' : 'Pago de Cuota NPC',
          message: res.message,
          type: 'success'
        });
      }
    } else {
      sound.playRejectBuzzer();
      alert(res.message);
    }
  };

  const toggleCollateral = (colId: string) => {
    setSelectedCollateralIds(prev =>
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans select-none text-xs">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-3 border-b-2 border-white shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏦</span>
          <div>
            <h1 className="text-base font-black tracking-wide font-mono uppercase">
              Subasta de Crédito & Banca Rival NPC
            </h1>
            <p className="text-[11px] text-blue-200">
              Competencia Bancaria Simulada • 3 Entidades Virtuales • Amortización Francesa
            </p>
          </div>
        </div>
        <div className="text-right font-mono bg-black/40 px-3 py-1.5 border border-white/20">
          <div className="text-[10px] text-gray-300 uppercase">Score Crediticio Vigente</div>
          <div className="text-base font-black text-emerald-400">
            {simState.companyCreditProfile?.score ?? 680} pts
            {simState.cSuiteStaff?.includes('CFO') && <span className="text-xs text-blue-300 ml-1">(+50 CFO)</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-400 bg-gray-200 px-2 pt-1 gap-1">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('auction');
          }}
          className={`px-4 py-1.5 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
            activeTab === 'auction'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] text-blue-900'
              : 'bg-gray-300 border-gray-100 text-gray-700 hover:bg-gray-250'
          }`}
        >
          ⚡ Subasta Instantánea en Vivo
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('active_loans');
          }}
          className={`px-4 py-1.5 font-bold text-xs border-t-2 border-l-2 border-r-2 ${
            activeTab === 'active_loans'
              ? 'bg-[#c0c0c0] border-white border-b-0 -mb-[1px] text-blue-900'
              : 'bg-gray-300 border-gray-100 text-gray-700 hover:bg-gray-250'
          }`}
        >
          📑 Deudas Activas NPC ({activeLoans.length})
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#d4d0c8]">
        {/* TAB 1: AUCTION */}
        {activeTab === 'auction' && (
          <div className="space-y-3">
            {/* Request Controls */}
            <div className="bg-white p-3 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000] space-y-3">
              <div className="font-bold text-xs uppercase border-b border-gray-300 pb-1 flex justify-between items-center">
                <span>Configurar Solicitud de Crédito</span>
                <span className="font-mono text-emerald-800">
                  L {requestedAmount.toLocaleString('es-HN')} a {termMonths} meses
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Monto Slider */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Monto Requerido (Lempiras):
                  </label>
                  <input
                    type="range"
                    min={50000}
                    max={3000000}
                    step={25000}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-0.5">
                    <span>L 50,000</span>
                    <span className="font-bold text-blue-900">L {requestedAmount.toLocaleString()}</span>
                    <span>L 3,000,000</span>
                  </div>
                </div>

                {/* Plazo Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Plazo de Amortización:
                  </label>
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full p-1.5 border border-gray-400 bg-white font-mono text-xs"
                  >
                    <option value={12}>12 Meses (1 Año)</option>
                    <option value={24}>24 Meses (2 Años)</option>
                    <option value={36}>36 Meses (3 Años)</option>
                    <option value={48}>48 Meses (4 Años)</option>
                    <option value={60}>60 Meses (5 Años)</option>
                  </select>
                </div>

                {/* Destino de Acreditación */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Acreditar Desembolso en:
                  </label>
                  <div className="flex gap-2 pt-1 font-mono text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="destNpc"
                        checked={selectedDestination === 'bank'}
                        onChange={() => setSelectedDestination('bank')}
                      />
                      <span>🏦 Cuenta Bancaria</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="destNpc"
                        checked={selectedDestination === 'cash'}
                        onChange={() => setSelectedDestination('cash')}
                      />
                      <span>💵 Caja Chica</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Collateral Selection */}
              {availableCollaterals.length > 0 && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="text-[11px] font-bold text-gray-700 mb-1">
                    Garantías Patrimoniales a Aportar (Requerido por Banco Nacional):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableCollaterals.map(col => {
                      const isSelected = selectedCollateralIds.includes(col.id);
                      return (
                        <button
                          key={col.id}
                          onClick={() => toggleCollateral(col.id)}
                          className={`px-2 py-1 border text-[11px] font-mono flex items-center gap-1 ${
                            isSelected
                              ? 'bg-blue-800 text-white border-blue-950 font-bold'
                              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          <span>{isSelected ? '☑' : '☐'}</span>
                          <span>{col.propertyName || col.title}</span>
                          <span className="text-[10px] opacity-80">
                            (L {(col.marketValueHNL || col.appraisalValueHNL || 0).toLocaleString()})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3-Column Side-by-Side Auction Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {auctionEvaluations.map((evalData) => {
                const profile = NPC_BANK_PROFILES[evalData.bankId];
                return (
                  <div
                    key={evalData.bankId}
                    className="bg-white p-3 border-2 border-gray-500 shadow-[2px_2px_0px_#888] flex flex-col justify-between"
                  >
                    <div>
                      {/* Bank Top Bar */}
                      <div className="flex items-center justify-between border-b border-gray-300 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{evalData.icon}</span>
                          <div>
                            <span className="font-bold text-xs text-blue-900">{evalData.bankName}</span>
                            <div className="text-[9px] text-gray-500 font-mono capitalize">
                              Perfil: {evalData.personality}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 font-bold uppercase ${
                            evalData.isApproved ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'
                          }`}
                        >
                          {evalData.isApproved ? 'Aprobado' : 'Rechazado'}
                        </span>
                      </div>

                      <p className="text-gray-600 text-[10px] leading-tight mb-2">{profile.tagline}</p>

                      {/* Loan Math Card */}
                      <div className="bg-gray-50 p-2 border border-gray-200 font-mono text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tasa Anual:</span>
                          <span className="font-bold text-blue-900">{evalData.interestRateAnnual}% Anual</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Cuota Mensual:</span>
                          <span className="font-black text-emerald-700 text-sm">
                            L {evalData.monthlyQuotaHNL.toLocaleString('es-HN')}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1 text-[10px]">
                          <span className="text-gray-500">Total a Pagar:</span>
                          <span className="text-gray-700">L {evalData.totalRepaymentHNL.toLocaleString('es-HN')}</span>
                        </div>
                      </div>

                      {/* Special Clauses & Warnings */}
                      {evalData.specialClause && (
                        <div className={`mt-2 p-1.5 text-[10px] font-mono leading-tight ${
                          evalData.bankId === 'tiburon_prestamista'
                            ? 'bg-red-50 border border-red-300 text-red-900'
                            : 'bg-blue-50 border border-blue-200 text-blue-900'
                        }`}>
                          {evalData.specialClause}
                        </div>
                      )}

                      {!evalData.isApproved && evalData.rejectionReason && (
                        <div className="mt-2 p-1.5 bg-red-100 border border-red-300 text-red-800 text-[10px] font-mono">
                          ❌ <strong>Motivo de Rechazo:</strong> {evalData.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Disburse Button */}
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleDisburse(evalData.bankId)}
                        disabled={!evalData.isApproved}
                        className={`w-full py-2 font-bold font-sans text-xs border border-gray-700 shadow-[2px_2px_0px_#000] active:translate-y-0.5 ${
                          evalData.isApproved
                            ? 'bg-blue-800 hover:bg-blue-700 text-white cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {evalData.isApproved
                          ? `Desembolsar Crédito (L ${requestedAmount.toLocaleString()})`
                          : 'Solicitud Denegada'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE LOANS */}
        {activeTab === 'active_loans' && (
          <div className="space-y-3">
            {activeLoans.length === 0 ? (
              <div className="bg-white p-6 border-2 border-gray-500 shadow-[inset_1px_1px_0px_#000] text-center space-y-2">
                <div className="text-3xl">🕊️</div>
                <h3 className="font-bold text-xs uppercase text-gray-800 font-mono">
                  No Tienes Deudas Activas con la Banca NPC
                </h3>
                <p className="text-xs text-gray-600">
                  Tu empresa no mantiene obligaciones pendientes con Banco Nacional, Banco de Inversión ni El Tiburón.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLoans.map((loan) => {
                  const canPayQuota = (simState.storeBankBalance + simState.storeCash) >= loan.monthlyQuota;
                  const canPayoff = (simState.storeBankBalance + simState.storeCash) >= loan.balanceRemaining;

                  return (
                    <div
                      key={loan.id}
                      className={`bg-white p-3 border-2 ${
                        loan.isSharkLoan ? 'border-red-600' : 'border-gray-500'
                      } shadow-[inset_1px_1px_0px_#000] space-y-2`}
                    >
                      <div className="flex items-center justify-between border-b border-gray-300 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{loan.isSharkLoan ? '🦈' : '🏛️'}</span>
                          <div>
                            <span className="font-bold text-xs text-blue-900">{loan.bankName}</span>
                            <div className="text-[10px] text-gray-500 font-mono">
                              Préstamo Original: L {loan.principalAmount.toLocaleString()} al {loan.interestRateAnnual}%
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {loan.isDelinquent && (
                            <span className="bg-red-700 text-white px-2 py-0.5 text-[9px] font-bold uppercase animate-pulse">
                              En Mora Coactiva
                            </span>
                          )}
                          <div className="text-right font-mono">
                            <div className="text-[9px] text-gray-500">Saldo Pendiente</div>
                            <div className="font-black text-sm text-red-700">
                              L {loan.balanceRemaining.toLocaleString('es-HN')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gray-50 p-2 font-mono text-xs">
                        <div>
                          <span className="text-gray-500">Cuota Mensual:</span>
                          <div className="font-bold text-gray-900">L {loan.monthlyQuota.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Meses Restantes:</span>
                          <div className="font-bold text-gray-900">{loan.termMonthsRemaining} meses</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Retención del Tiburón:</span>
                          <div className={`font-bold ${loan.sharkBlockedCash ? 'text-red-700' : 'text-gray-700'}`}>
                            {loan.sharkBlockedCash
                              ? `Reteniendo 50% de ventas (L ${(loan.sharkRetainedAmount || 0).toLocaleString()})`
                              : 'Al día'}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handlePayLoan(loan.id, false)}
                          disabled={!canPayQuota}
                          className={`px-3 py-1 font-bold font-sans text-xs border border-gray-700 shadow-[1px_1px_0px_#000] active:translate-y-0.5 ${
                            canPayQuota
                              ? 'bg-blue-800 hover:bg-blue-700 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Pagar Cuota (L {loan.monthlyQuota.toLocaleString()})
                        </button>

                        <button
                          onClick={() => handlePayLoan(loan.id, true)}
                          disabled={!canPayoff}
                          className={`px-3 py-1 font-bold font-sans text-xs border border-gray-700 shadow-[1px_1px_0px_#000] active:translate-y-0.5 ${
                            canPayoff
                              ? 'bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Cancelar Préstamo Total (L {loan.balanceRemaining.toLocaleString()})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
