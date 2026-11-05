import React, { useState } from 'react';
import { 
  CommercialBankId, 
  CommercialBankRelationship,
  CorporateCardTierId,
  DailySimulationState 
} from '../../game/retroSimTypes';
import { 
  COMMERCIAL_BANKS_PROFILES, 
  CORPORATE_CARD_TIERS,
  CORPORATE_REWARDS_CATALOG,
  calculateDpfTierBonus,
  evaluateContractorEconomicCapacity 
} from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface CommercialBanksWindowProps {
  state: DailySimulationState;
  onRequestLoan: (bankId: CommercialBankId, amount: number, termMonths: number, purpose: string) => void;
  onRequestCard: (bankId: CommercialBankId, limit: number, tierId?: CorporateCardTierId) => void;
  onUpgradeCardTier?: (bankId: CommercialBankId, targetTierId: CorporateCardTierId) => void;
  onRedeemCardReward?: (bankId: CommercialBankId, rewardId: string) => void;
  onRestructureLoan?: (bankId: CommercialBankId, additionalMonths: number) => void;
  onOpenChecking: (bankId: CommercialBankId, deposit: number) => void;
  onPayLoan: (bankId: CommercialBankId, amount: number) => void;
  onExtraordinaryLoanPayment?: (bankId: CommercialBankId, amount: number) => void;
  onPayCard: (bankId: CommercialBankId, amount: number) => void;
  onPledgeGuarantee: (bankId: CommercialBankId, amount: number, purpose: string, tenderIdRef?: string) => void;
  onReleaseGuarantee: (bankId: CommercialBankId, depositId: string) => void;
  onOpenDpf: (bankId: CommercialBankId, amount: number, termDays: number) => void;
  onEarlyLiquidateDpf?: (bankId: CommercialBankId, depositId: string) => void;
  onDepositCash?: (bankId: CommercialBankId, amount: number) => void;
  onWithdrawCash?: (bankId: CommercialBankId, amount: number) => void;
  onNegotiateCheckingRate?: (bankId: CommercialBankId, targetRate: number) => void;
  onNegotiateLoanRate?: (bankId: CommercialBankId, discount: number) => void;
}

export const CommercialBanksWindow: React.FC<CommercialBanksWindowProps> = ({
  state,
  onRequestLoan,
  onRequestCard,
  onUpgradeCardTier,
  onRedeemCardReward,
  onRestructureLoan,
  onOpenChecking,
  onPayLoan,
  onExtraordinaryLoanPayment,
  onPayCard,
  onPledgeGuarantee,
  onReleaseGuarantee,
  onOpenDpf,
  onEarlyLiquidateDpf,
  onDepositCash,
  onWithdrawCash,
  onNegotiateCheckingRate,
  onNegotiateLoanRate
}) => {
  const [selectedBankId, setSelectedBankId] = useState<CommercialBankId>('atlantida');
  const [activeSubTab, setActiveSubTab] = useState<'prestamos' | 'tarjetas' | 'cuenta' | 'garantias' | 'dpf'>('prestamos');

  const capacity = evaluateContractorEconomicCapacity(state);
  const creditProfile = capacity.creditProfile;
  const selectedProfile = COMMERCIAL_BANKS_PROFILES[selectedBankId];
  const bankOffer = capacity.offersByBank[selectedBankId];
  const relationship: CommercialBankRelationship = state.commercialBanks[selectedBankId] || {
    bankId: selectedBankId,
    relationshipScore: 50,
    guaranteeDeposits: [],
    termDeposits: []
  };

  // Estados de formularios
  const [loanAmount, setLoanAmount] = useState<number>(Math.min(bankOffer.maxLoanHNL, 1000000));
  const [loanTerm, setLoanTerm] = useState<number>(24);
  const [loanPurpose, setLoanPurpose] = useState<string>('Capital de Trabajo y Compra de Insumos');
  
  // Reestructuración de Deuda
  const [showRestructureModal, setShowRestructureModal] = useState<boolean>(false);
  const [restructureAdditionalMonths, setRestructureAdditionalMonths] = useState<number>(12);

  // Tarjetas y Recompensas
  const [selectedCardTier, setSelectedCardTier] = useState<CorporateCardTierId>('business_standard');
  const [cardLimit, setCardLimit] = useState<number>(Math.min(bankOffer.maxCardHNL, 200000));
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);

  // Garantías con Rendimiento Pasivo
  const [guaranteeAmount, setGuaranteeAmount] = useState<number>(500000);
  const [guaranteePurpose, setGuaranteePurpose] = useState<string>('Fianza de Cumplimiento de Contrato');

  // DPF con Tramos y Compuesto
  const [dpfAmount, setDpfAmount] = useState<number>(300000);
  const [dpfDays, setDpfDays] = useState<number>(90);

  const [loanPayAmount, setLoanPayAmount] = useState<number>(relationship.activeLoan?.monthlyPayment || 0);
  const [extraordinaryPayAmount, setExtraordinaryPayAmount] = useState<number>(50000);
  const [showExtraordinaryModal, setShowExtraordinaryModal] = useState<boolean>(false);
  const [cardPayAmount, setCardPayAmount] = useState<number>(relationship.corporateCard?.currentBalance || 0);

  // Estados para Cuentas
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(25000);
  const [requestedCheckingRate, setRequestedCheckingRate] = useState<number>(5.5);
  const [showRateNegotiation, setShowRateNegotiation] = useState<boolean>(false);
  const [loanRateDiscount, setLoanRateDiscount] = useState<number>(1.0);

  const handleSelectBank = (id: CommercialBankId) => {
    sound.playClick();
    setSelectedBankId(id);
    const newOffer = capacity.offersByBank[id];
    setLoanAmount(Math.min(newOffer.maxLoanHNL, 1000000));
    setCardLimit(Math.min(newOffer.maxCardHNL, 200000));
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 680) return 'text-blue-800 bg-blue-50 border-blue-300';
    if (score >= 580) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-800 bg-rose-50 border-rose-300';
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Selector de Bancos */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-1.5 flex items-center justify-between gap-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[11px] text-slate-700 px-1 hidden sm:inline">BANCOS:</span>
          {(Object.keys(COMMERCIAL_BANKS_PROFILES) as CommercialBankId[]).map((bankId) => {
            const profile = COMMERCIAL_BANKS_PROFILES[bankId];
            const isSelected = selectedBankId === bankId;
            const relScore = state.commercialBanks[bankId]?.relationshipScore || 50;

            return (
              <button
                key={bankId}
                onClick={() => handleSelectBank(bankId)}
                className={`px-3 py-1 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                    : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
                }`}
              >
                <span>{profile.logo}</span>
                <span>{profile.shortName}</span>
                <span className={`text-[10px] px-1 py-0.2 border ${
                  isSelected ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}>
                  {relScore} pts
                </span>
              </button>
            );
          })}
        </div>

        {/* HUD Score Crediticio de la Empresa */}
        <div className={`font-mono text-[11px] px-2.5 py-1 border flex items-center gap-2 ${getScoreColor(creditProfile.score)}`}>
          <span>📊 Score Empresa:</span>
          <strong className="text-sm font-black">{creditProfile.score} pts</strong>
          <span className="hidden md:inline font-bold">({creditProfile.tierLabel.split('·')[0]})</span>
        </div>
      </div>

      {/* Banner del Banco Seleccionado */}
      <div 
        className="p-2.5 text-white flex items-center justify-between shadow-inner"
        style={{ backgroundColor: selectedProfile.colorHex }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">{selectedProfile.logo}</span>
          <div>
            <h3 className="font-black text-sm tracking-wide">{selectedProfile.name}</h3>
            <p className="text-[10px] text-white/90">{selectedProfile.tagline}</p>
          </div>
        </div>

        <div className="text-right text-[11px] font-mono bg-black/25 px-2.5 py-1 border border-white/20">
          <div>Tasa Préstamo: <strong>{bankOffer.recommendedRatePct}% anual</strong></div>
          <div>Tasa DPF: <strong>{selectedProfile.baseDpfRate}% anual</strong></div>
        </div>
      </div>

      {/* Barra de Sub-Pestañas de Productos Financieros */}
      <div className="flex gap-1 border-b border-[#808080] p-1 bg-[#d8d8d8]">
        <button
          onClick={() => { sound.playClick(); setActiveSubTab('prestamos'); }}
          className={`px-2.5 py-1 font-bold border ${
            activeSubTab === 'prestamos' ? 'bg-white border-[#404040] text-blue-950' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          💰 Préstamos Comerciales
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('tarjetas'); }}
          className={`px-2.5 py-1 font-bold border ${
            activeSubTab === 'tarjetas' ? 'bg-white border-[#404040] text-blue-950' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          💳 Tarjeta Corporativa
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('cuenta'); }}
          className={`px-2.5 py-1 font-bold border ${
            activeSubTab === 'cuenta' ? 'bg-white border-[#404040] text-blue-950' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          📄 Cuenta Corriente & Chequera
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('garantias'); }}
          className={`px-2.5 py-1 font-bold border ${
            activeSubTab === 'garantias' ? 'bg-white border-[#404040] text-blue-950' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          🛡️ Fianzas & Depósitos en Garantía
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('dpf'); }}
          className={`px-2.5 py-1 font-bold border ${
            activeSubTab === 'dpf' ? 'bg-white border-[#404040] text-blue-950' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          📈 Inversión DPF
        </button>
      </div>

      {/* Contenido Principal por Sub-Pestaña */}
      <div className="flex-1 p-2.5 overflow-y-auto bg-white border-t border-[#808080]">
        {/* SUBTAB 1: PRÉSTAMOS COMERCIALES */}
        {activeSubTab === 'prestamos' && (
          <div className="space-y-3">
            {relationship.activeLoan && relationship.activeLoan.balanceRemaining > 0 ? (
              <div className="bg-slate-50 border-2 border-blue-900 p-3 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-blue-950">Préstamo Comercial Activo</span>
                    {relationship.activeLoan.loanType === 'vehicular_equipo' && (
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-1.5 py-0.5 border border-purple-300">
                        🚜 CRÉDITO VEHICULAR / EQUIPO
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-300">
                    ID: {relationship.activeLoan.id}
                  </span>
                </div>

                {relationship.activeLoan.equipmentModel && (
                  <div className="bg-amber-50 border border-amber-300 p-1.5 text-[11px] text-amber-900 font-semibold flex items-center justify-between">
                    <span>Unidad Financiada: <strong>{relationship.activeLoan.equipmentModel}</strong></span>
                    <span className="text-[10px] text-amber-800">Garantía Prendaria Inscrita</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Monto Original:</span>
                    <span className="font-bold">L {relationship.activeLoan.principalAmount.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Saldo Pendiente:</span>
                    <span className="font-bold text-rose-800">L {relationship.activeLoan.balanceRemaining.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Cuota Mensual:</span>
                    <span className="font-bold text-blue-900">L {relationship.activeLoan.monthlyPayment.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Tasa / Meses:</span>
                    <span className="font-bold">{relationship.activeLoan.interestRateAnnual}% · {relationship.activeLoan.termMonthsRemaining}m</span>
                  </div>
                </div>

                {/* Barra de Progreso de Amortización */}
                <div className="bg-white p-2 border space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span>Amortizado a Capital: L {(relationship.activeLoan.amortizedPrincipalTotal || (relationship.activeLoan.principalAmount - relationship.activeLoan.balanceRemaining)).toLocaleString()}</span>
                    <span className="font-bold text-blue-900">
                      {Math.round(((relationship.activeLoan.principalAmount - relationship.activeLoan.balanceRemaining) / relationship.activeLoan.principalAmount) * 100)}% cancelado
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(5, Math.round(((relationship.activeLoan.principalAmount - relationship.activeLoan.balanceRemaining) / relationship.activeLoan.principalAmount) * 100)))}%` }}
                    />
                  </div>
                </div>

                {/* Controles de Pago de Cuota y Abono Extraordinario a Capital */}
                <div className="mt-2 pt-2 border-t grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white p-2 border space-y-1.5">
                    <span className="font-bold text-xs text-slate-800 block">1. Pago de Cuota Mensual Ordinaria:</span>
                    <p className="text-[10px] text-slate-500">
                      La cuota se debita automáticamente de tus cuentas cada quincena/mes, o puedes pagarla de inmediato.
                    </p>
                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onPayLoan(selectedBankId, relationship.activeLoan!.monthlyPayment);
                      }}
                      className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold border-t border-l border-blue-300 border-b border-r border-blue-950 shadow cursor-pointer text-xs"
                    >
                      Pagar Cuota Mensual (L {relationship.activeLoan!.monthlyPayment.toLocaleString()})
                    </button>
                  </div>

                  <div className="bg-white p-2 border space-y-1.5">
                    <span className="font-bold text-xs text-emerald-900 block">2. Abono Extraordinario a Capital:</span>
                    <p className="text-[10px] text-slate-500">
                      Amortiza capital directamente para reducir tu saldo deudor y bajar la cuota mensual.
                    </p>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={5000}
                        step={10000}
                        max={relationship.activeLoan.balanceRemaining}
                        value={extraordinaryPayAmount}
                        onChange={(e) => setExtraordinaryPayAmount(Math.max(1000, Number(e.target.value)))}
                        className="flex-1 bg-slate-50 border border-slate-400 px-2 py-1 font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => {
                          sound.playApprovalStamp();
                          if (onExtraordinaryLoanPayment) {
                            onExtraordinaryLoanPayment(selectedBankId, extraordinaryPayAmount);
                          } else {
                            onPayLoan(selectedBankId, extraordinaryPayAmount);
                          }
                        }}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow cursor-pointer text-xs whitespace-nowrap"
                      >
                        Abonar a Capital
                      </button>
                    </div>
                  </div>
                </div>

                {/* Negociación de Tasa Activa del Préstamo */}
                <div className="bg-blue-50 border border-blue-200 p-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px]">
                    <span className="font-bold text-blue-950 block">Negociar Tasa con el Banco:</span>
                    <span className="text-[10px] text-slate-600">
                      Tu Score Crediticio ({creditProfile.score} pts · {creditProfile.tierLabel.split('·')[0]}) califica para descuentos de tasa.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={loanRateDiscount}
                      onChange={(e) => setLoanRateDiscount(Number(e.target.value))}
                      className="bg-white border border-slate-400 px-2 py-1 font-bold text-xs"
                    >
                      <option value={0.5}>-0.5% Rebaja</option>
                      <option value={1.0}>-1.0% Rebaja</option>
                      <option value={1.5}>-1.5% Rebaja</option>
                      <option value={2.0}>-2.0% Rebaja (Score AAA/AA)</option>
                    </select>
                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onNegotiateLoanRate && onNegotiateLoanRate(selectedBankId, loanRateDiscount);
                      }}
                      className="px-3 py-1 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs border cursor-pointer"
                    >
                      Solicitar Rebaja
                    </button>
                  </div>
                </div>

                {/* Asistente de Reestructuración de Deuda y Refinanciamiento */}
                <div className="bg-amber-50 border-2 border-amber-400 p-2.5 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">🤝</span>
                      <strong className="text-amber-950 font-bold text-xs">Reestructuración y Alivio de Deuda Comercial:</strong>
                      {relationship.activeLoan.isRestructured && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 border border-emerald-300">
                          REESTRUCTURADO
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-900">
                      ¿Necesitas más flujo de caja para planillas u obras? Extiende el plazo de amortización y reduce inmediatamente tu cuota mensual.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowRestructureModal(true);
                    }}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs border-t border-l border-amber-300 border-b border-r border-amber-950 shadow cursor-pointer whitespace-nowrap"
                  >
                    🔄 Reestructurar Préstamo
                  </button>
                </div>

                {/* MODAL DE REESTRUCTURACIÓN DE DEUDA */}
                {showRestructureModal && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
                    <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black p-3 max-w-lg w-full shadow-2xl space-y-3 font-sans">
                      <div className="bg-blue-950 text-white px-2 py-1 font-bold text-xs flex justify-between items-center">
                        <span>🤝 ASISTENTE DE REESTRUCTURACIÓN DE DEUDA - {selectedProfile.name}</span>
                        <button 
                          onClick={() => setShowRestructureModal(false)}
                          className="px-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="bg-white p-2.5 border text-xs space-y-2">
                        <div className="text-[11px] text-slate-700">
                          Saldo deudor a reestructurar: <strong className="font-mono text-rose-900 font-bold">L {relationship.activeLoan.balanceRemaining.toLocaleString()}</strong>.
                          Plazo actual restante: <strong>{relationship.activeLoan.termMonthsRemaining} meses</strong>.
                        </div>

                        <div>
                          <label className="font-bold text-slate-800 block mb-1">
                            Selecciona meses adicionales de prórroga:
                          </label>
                          <select
                            value={restructureAdditionalMonths}
                            onChange={(e) => setRestructureAdditionalMonths(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-400 p-1.5 font-bold"
                          >
                            <option value={12}>+12 Meses Adicionales (1 Año más)</option>
                            <option value={24}>+24 Meses Adicionales (2 Años más - Recomendado)</option>
                            <option value={36}>+36 Meses Adicionales (3 Años más)</option>
                            <option value={48}>+48 Meses Adicionales (4 Años más)</option>
                          </select>
                        </div>

                        {/* Comparación Visual Cuota Actual vs Nueva Cuota */}
                        {(() => {
                          const newTermMonths = relationship.activeLoan.termMonthsRemaining + restructureAdditionalMonths;
                          const restructuredApr = Math.max(9.5, Number((relationship.activeLoan.interestRateAnnual - 0.75).toFixed(2)));
                          const mRate = restructuredApr / 100 / 12;
                          const projectedPayment = Math.round((relationship.activeLoan.balanceRemaining * mRate) / (1 - Math.pow(1 + mRate, -newTermMonths)));
                          const monthlySavings = relationship.activeLoan.monthlyPayment - projectedPayment;

                          return (
                            <div className="bg-emerald-50 border border-emerald-300 p-2 space-y-1.5 font-mono text-[11px]">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Cuota Mensual Actual:</span>
                                <span className="line-through text-slate-500">L {relationship.activeLoan.monthlyPayment.toLocaleString()}/mes</span>
                              </div>
                              <div className="flex justify-between font-bold text-emerald-950 text-xs">
                                <span>Nueva Cuota Mensual:</span>
                                <span className="text-emerald-700 text-sm">L {projectedPayment.toLocaleString()}/mes</span>
                              </div>
                              <div className="flex justify-between border-t border-emerald-200 pt-1 text-[10px] text-emerald-800">
                                <span>Alivio de Liquidez Mensual:</span>
                                <strong className="text-emerald-900">+L {monthlySavings.toLocaleString()} libres cada mes</strong>
                              </div>
                              <div className="text-[10px] text-slate-600">
                                Tasa renegociada: <strong>{restructuredApr}% anual</strong> (-0.75% descuento por plan de reestructuración)
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRestructureModal(false)}
                          className="px-3 py-1.5 bg-[#d0d0d0] hover:bg-[#e0e0e0] border text-xs font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            sound.playApprovalStamp();
                            if (onRestructureLoan) {
                              onRestructureLoan(selectedBankId, restructureAdditionalMonths);
                            }
                            setShowRestructureModal(false);
                          }}
                          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow text-xs cursor-pointer"
                        >
                          Firmar Convenio y Reestructurar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-300 p-3 space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Solicitud de Financiamiento Comercial</h4>
                    <span className="text-[10px] text-slate-500">Disponible para Supermercados, Restaurantes y Constructoras</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Capacidad pre-aprobada: <strong className="text-blue-900">L {bankOffer.maxLoanHNL.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Monto del Préstamo (HNL):</label>
                    <input
                      type="number"
                      min={50000}
                      max={bankOffer.maxLoanHNL}
                      step={25000}
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-400 px-2 py-1.5 font-mono font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Máximo con {selectedProfile.shortName}: L {bankOffer.maxLoanHNL.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Plazo de Amortización:</label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-400 px-2 py-1.5 font-sans font-semibold text-slate-900"
                    >
                      <option value={12}>12 Meses (1 Año) · Tasa {bankOffer.recommendedRatePct}%</option>
                      <option value={24}>24 Meses (2 Años) · Tasa {bankOffer.recommendedRatePct}%</option>
                      <option value={36}>36 Meses (3 Años) · Tasa {bankOffer.recommendedRatePct + 0.5}%</option>
                      <option value={48}>48 Meses (4 Años) · Tasa {bankOffer.recommendedRatePct + 1.0}%</option>
                      <option value={60}>60 Meses (5 Años) · Tasa {bankOffer.recommendedRatePct + 1.5}%</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Destino de los Fondos:</label>
                  <input
                    type="text"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className="w-full bg-white border border-slate-400 px-2 py-1 text-slate-900"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 p-2 font-mono text-[11px] flex justify-between">
                  <span>Tasa Anual con descuento de Score: <strong>{bankOffer.recommendedRatePct}%</strong></span>
                  <span>Cuota Estimada: <strong>~L {Math.round((loanAmount * (bankOffer.recommendedRatePct / 100 / 12)) / (1 - Math.pow(1 + (bankOffer.recommendedRatePct / 100 / 12), -loanTerm))).toLocaleString()}/mes</strong></span>
                </div>

                <button
                  onClick={() => {
                    sound.playApprovalStamp();
                    onRequestLoan(selectedBankId, loanAmount, loanTerm, loanPurpose);
                  }}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border-t border-l border-emerald-300 border-b-2 border-r-2 border-emerald-950 shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💰</span>
                  <span>SOLICITAR Y DESEMBOLSAR PRÉSTAMO COMERCIAL</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: TARJETA DE CRÉDITO CORPORATIVA */}
        {activeSubTab === 'tarjetas' && (
          <div className="space-y-3">
            {relationship.corporateCard ? (
              <div className="bg-slate-50 border-2 border-slate-700 p-3 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💳</span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{relationship.corporateCard.brand}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Tasa Rotativa: {relationship.corporateCard.interestRateAnnual}% anual · Cashback: {relationship.corporateCard.cashbackPct || 1.5}%
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                    TARJETA ACTIVA
                  </span>
                </div>

                {/* Banner de Revisión Quincenal */}
                <div className="bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-900 flex items-center justify-between">
                  <div>
                    <strong>🔄 Revisión Quincenal de Aumento de Límite:</strong>
                    <span className="block text-[10px] text-emerald-800">
                      Evaluada automáticamente los días 15 y 30. Pagos puntuales y bajo saldo desbloquean aumentos del +15% al +25%.
                    </span>
                  </div>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 border border-emerald-300 text-xs">
                    {relationship.corporateCard.limitIncreasesCount ? `${relationship.corporateCard.limitIncreasesCount} aumentos` : 'Próxima evaluación: D15'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Límite Total:</span>
                    <span className="font-bold text-blue-950">L {relationship.corporateCard.creditLimit.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Saldo Utilizado:</span>
                    <span className="font-bold text-rose-800">L {relationship.corporateCard.currentBalance.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Cupo Disponible:</span>
                    <span className="font-bold text-emerald-800">
                      L {(relationship.corporateCard.creditLimit - relationship.corporateCard.currentBalance).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Selector de Nivel de Tarjeta y Puntos de Recompensa */}
                <div className="bg-slate-100 border p-2 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">Nivel de Tarjeta:</span>
                      <span className="font-black text-xs px-2 py-0.5 rounded text-white" style={{ backgroundColor: CORPORATE_CARD_TIERS[relationship.corporateCard.tier || 'business_standard']?.colorHex || '#334155' }}>
                        {CORPORATE_CARD_TIERS[relationship.corporateCard.tier || 'business_standard']?.badge || '💳 CLÁSICA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-amber-100 text-amber-950 px-2 py-0.5 border border-amber-300 font-mono font-bold text-xs flex items-center gap-1">
                        <span>⭐ Puntos Corporativos:</span>
                        <strong className="text-sm">{relationship.corporateCard.rewardPoints || 0} pts</strong>
                      </div>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setShowRewardsModal(true);
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs border cursor-pointer"
                      >
                        🎁 Catálogo de Recompensas
                      </button>
                    </div>
                  </div>

                  {/* Niveles Disponibles y Upgrade */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {(Object.keys(CORPORATE_CARD_TIERS) as CorporateCardTierId[]).map((tId) => {
                      const tConfig = CORPORATE_CARD_TIERS[tId];
                      const isCurrent = (relationship.corporateCard?.tier || 'business_standard') === tId;
                      const monthlySales = Math.max(state.monthlySalesAccumulated || 0, 0);
                      const meetsSales = monthlySales >= tConfig.minMonthlySales;

                      return (
                        <div 
                          key={tId}
                          className={`p-2 border text-[11px] space-y-1 ${isCurrent ? 'bg-blue-50 border-blue-900' : 'bg-white border-slate-300'}`}
                        >
                          <div className="flex justify-between items-center">
                            <strong className="font-bold text-slate-900">{tConfig.name}</strong>
                            {isCurrent ? (
                              <span className="text-[10px] bg-blue-900 text-white px-1 font-bold">ACTUAL</span>
                            ) : null}
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            <div>Tasa: <strong>{tConfig.interestRateAnnual}%</strong> · Cashback: <strong>{tConfig.cashbackPct}%</strong></div>
                            <div>Puntos: <strong>x{tConfig.pointsMultiplier}</strong> por compras</div>
                          </div>
                          {!isCurrent && (
                            <button
                              onClick={() => {
                                sound.playApprovalStamp();
                                onUpgradeCardTier && onUpgradeCardTier(selectedBankId, tId);
                              }}
                              disabled={!meetsSales}
                              className={`w-full py-1 text-[10px] font-bold border mt-1 cursor-pointer ${
                                meetsSales 
                                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                                  : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                              }`}
                            >
                              {meetsSales ? `Ascender a ${tConfig.name}` : `Requiere L ${tConfig.minMonthlySales.toLocaleString()} vtas`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {relationship.corporateCard.currentBalance > 0 && (
                  <div className="mt-2 pt-2 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Monto a pagar:</span>
                      <input
                        type="number"
                        min={100}
                        max={relationship.corporateCard.currentBalance}
                        value={cardPayAmount}
                        onChange={(e) => setCardPayAmount(Number(e.target.value))}
                        className="w-32 bg-slate-100 border border-slate-400 px-2 py-1 font-mono font-bold"
                      />
                    </div>
                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onPayCard(selectedBankId, cardPayAmount || relationship.corporateCard!.currentBalance);
                      }}
                      className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border"
                    >
                      Pagar Saldo Tarjeta
                    </button>
                  </div>
                )}

                {/* MODAL DEL CATÁLOGO DE RECOMPENSAS CORPORATIVAS */}
                {showRewardsModal && (
                  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
                    <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black p-3 max-w-xl w-full shadow-2xl space-y-3 font-sans">
                      <div className="bg-amber-900 text-white px-2 py-1 font-bold text-xs flex justify-between items-center">
                        <span>🎁 CATÁLOGO DE RECOMPENSAS CORPORATIVAS - {selectedProfile.name}</span>
                        <button 
                          onClick={() => setShowRewardsModal(false)}
                          className="px-1.5 bg-rose-700 hover:bg-rose-800 text-white font-black"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="bg-amber-50 border border-amber-300 p-2 text-xs flex justify-between items-center font-mono">
                        <span>Puntos Acumulados Disponibles:</span>
                        <strong className="text-sm text-amber-900 font-bold">{relationship.corporateCard.rewardPoints || 0} PUNTOS</strong>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {CORPORATE_REWARDS_CATALOG.map((reward) => {
                          const canAfford = (relationship.corporateCard?.rewardPoints || 0) >= reward.pointsCost;

                          return (
                            <div key={reward.id} className="bg-white border p-2.5 text-xs flex items-center justify-between gap-3 shadow-sm">
                              <div className="space-y-0.5">
                                <strong className="font-bold text-slate-900 block">{reward.title}</strong>
                                <p className="text-[11px] text-slate-600">{reward.description}</p>
                                <span className="font-mono text-[10px] text-emerald-800 font-bold">
                                  Beneficio Económico Directo: L {reward.benefitValueHNL.toLocaleString()}
                                </span>
                              </div>

                              <div className="text-right space-y-1 whitespace-nowrap">
                                <span className="font-mono font-black text-amber-900 block text-xs">
                                  {reward.pointsCost} pts
                                </span>
                                <button
                                  onClick={() => {
                                    sound.playApprovalStamp();
                                    if (onRedeemCardReward) {
                                      onRedeemCardReward(selectedBankId, reward.id);
                                    }
                                  }}
                                  disabled={!canAfford}
                                  className={`px-3 py-1 font-bold text-xs border ${
                                    canAfford
                                      ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                                      : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                                  }`}
                                >
                                  {canAfford ? 'Canjear Premio' : 'Puntos Insuficientes'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowRewardsModal(false)}
                          className="px-4 py-1 bg-[#d0d0d0] hover:bg-[#e0e0e0] border font-bold text-xs"
                        >
                          Cerrar Catálogo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-300 p-3 space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <h4 className="font-bold text-sm text-slate-900">Emisión de Tarjeta de Crédito Empresarial</h4>
                  <span className="text-[11px] text-slate-500">
                    Límite pre-aprobado: <strong className="text-blue-900">L {bankOffer.maxCardHNL.toLocaleString()}</strong>
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Selecciona el Nivel de Tarjeta:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    {(Object.keys(CORPORATE_CARD_TIERS) as CorporateCardTierId[]).map((tId) => {
                      const t = CORPORATE_CARD_TIERS[tId];
                      const isSelected = selectedCardTier === tId;

                      return (
                        <div
                          key={tId}
                          onClick={() => setSelectedCardTier(tId)}
                          className={`p-2 border cursor-pointer text-xs ${isSelected ? 'bg-blue-100 border-blue-900 font-bold' : 'bg-white border-slate-300'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{t.badge}</span>
                            <span className="text-[10px]">{t.cashbackPct}% cash</span>
                          </div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Tasa: {t.interestRateAnnual}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Límite de Crédito Solicitado (HNL):</label>
                  <input
                    type="number"
                    min={50000}
                    max={bankOffer.maxCardHNL}
                    step={10000}
                    value={cardLimit}
                    onChange={(e) => setCardLimit(Number(e.target.value))}
                    className="w-full bg-white border border-slate-400 px-2 py-1.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="text-[10px] text-slate-600 bg-white p-2 border space-y-0.5">
                  <div>✓ Compras sin interés hasta por 54 días (corte y pago).</div>
                  <div>✓ Multiplicador de Puntos Corporativos canjeables por combustible, repuestos y efectivo.</div>
                  <div>✓ Evaluación quincenal para aumento de límite y beneficios automáticos.</div>
                  <div>✓ Membresía anual de L {CORPORATE_CARD_TIERS[selectedCardTier]?.annualFeeHNL.toLocaleString()}.</div>
                </div>

                <button
                  onClick={() => {
                    sound.playApprovalStamp();
                    onRequestCard(selectedBankId, cardLimit, selectedCardTier);
                  }}
                  className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💳</span>
                  <span>SOLICITAR Y EMITIR TARJETA {CORPORATE_CARD_TIERS[selectedCardTier]?.name.toUpperCase()}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: CUENTA CORRIENTE, CHEQUERA & RENDIMIENTO */}
        {activeSubTab === 'cuenta' && (
          <div className="space-y-3">
            {relationship.checkingAccount ? (
              <div className="bg-slate-50 border border-slate-300 p-3 space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <div>
                    <span className="font-bold text-sm text-slate-900">Cuenta Corriente Comercial & Ahorro Empresarial</span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      No. {relationship.checkingAccount.accountNumber} · Rendimiento Anual: <strong>{relationship.checkingAccount.interestRateAnnual || 4.5}%</strong>
                    </span>
                  </div>
                  <span className="font-mono text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-300 font-bold">
                    CUENTA ACTIVA
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Saldo en Banco:</span>
                    <span className="font-bold text-blue-900 text-sm">L {relationship.checkingAccount.balance.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Línea Sobregiro:</span>
                    <span className="font-bold text-slate-700">L {relationship.checkingAccount.overdraftLimit.toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Cheques Emitidos:</span>
                    <span className="font-bold">{relationship.checkingAccount.checksUsedCount} cheques</span>
                  </div>
                </div>

                {/* Transferencias entre Caja y Banco */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                  {/* Depositar Efectivo de Caja a Banco */}
                  <div className="bg-white p-2 border space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">➕ Agregar Fondos (Depositar de Caja):</span>
                      <span className="font-mono text-[10px] text-slate-500">Caja: L {state.storeCash.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={1000}
                        step={5000}
                        max={state.storeCash}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
                        className="flex-1 bg-slate-50 border border-slate-400 px-2 py-1 font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => {
                          sound.playApprovalStamp();
                          onDepositCash && onDepositCash(selectedBankId, depositAmount);
                        }}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border cursor-pointer whitespace-nowrap"
                      >
                        Depositar a Banco
                      </button>
                    </div>
                  </div>

                  {/* Retirar Efectivo de Banco a Caja */}
                  <div className="bg-white p-2 border space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">➖ Retirar Efectivo (Banco a Caja):</span>
                      <span className="font-mono text-[10px] text-slate-500">Banco: L {relationship.checkingAccount.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min={1000}
                        step={5000}
                        max={relationship.checkingAccount.balance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Math.max(0, Number(e.target.value)))}
                        className="flex-1 bg-slate-50 border border-slate-400 px-2 py-1 font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => {
                          sound.playApprovalStamp();
                          onWithdrawCash && onWithdrawCash(selectedBankId, withdrawAmount);
                        }}
                        className="px-3 py-1 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border cursor-pointer whitespace-nowrap"
                      >
                        Retirar a Caja
                      </button>
                    </div>
                  </div>
                </div>

                {/* Negociación de Rendimiento / Tasa de la Cuenta */}
                <div className="bg-amber-50 border border-amber-300 p-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px]">
                    <span className="font-bold text-amber-950 block">Negociar Tasa de Interés Pasiva:</span>
                    <span className="text-[10px] text-amber-900">
                      Tasa actual: {relationship.checkingAccount.interestRateAnnual || 4.5}% anual. Negocia un mayor rendimiento según tu Score y saldo depositado.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={0.25}
                      min={4.0}
                      max={7.5}
                      value={requestedCheckingRate}
                      onChange={(e) => setRequestedCheckingRate(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-400 px-1.5 py-1 text-xs font-mono font-bold"
                    />
                    <span className="text-xs font-bold">%</span>
                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onNegotiateCheckingRate && onNegotiateCheckingRate(selectedBankId, requestedCheckingRate);
                      }}
                      className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs border cursor-pointer"
                    >
                      Negociar Tasa
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-300 p-3 space-y-2">
                <h4 className="font-bold text-sm text-slate-900">Apertura de Cuenta Corriente Comercial</h4>
                <p className="text-xs text-slate-600">
                  Abre una cuenta corriente con chequera en {selectedProfile.name} para realizar transferencias ACH, depósitos y pago a proveedores de cualquier rubro.
                </p>

                <button
                  onClick={() => {
                    sound.playApprovalStamp();
                    onOpenChecking(selectedBankId, 100000);
                  }}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold border shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📄</span>
                  <span>APERTURAR CUENTA CORRIENTE (Depósito inicial L 100,000)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 4: FIANZAS Y GARANTÍAS CON RENDIMIENTO PASIVO */}
        {activeSubTab === 'garantias' && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-300 p-3 space-y-2">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="font-bold text-sm text-slate-900">Constituir Fianza / Depósito en Garantía con Rendimiento</h4>
                <span className="font-mono text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-300 font-bold">
                  Rendimiento Pasivo: {selectedBankId === 'occidente' ? '4.5%' : selectedBankId === 'atlantida' ? '4.2%' : selectedBankId === 'ficohsa' ? '3.8%' : '3.5%'} APR
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Inmoviliza fondos para licitaciones públicas (SIT, SEFIN, alcaldías) o contratos privados sin perder dinero: tus fondos devengan intereses diarios mientras están en custodia bancaria.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Monto de la Fianza (HNL):</label>
                  <input
                    type="number"
                    min={50000}
                    step={25000}
                    value={guaranteeAmount}
                    onChange={(e) => setGuaranteeAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-400 px-2 py-1 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Propósito o Licitación Vinculada:</label>
                  <input
                    type="text"
                    value={guaranteePurpose}
                    onChange={(e) => setGuaranteePurpose(e.target.value)}
                    className="w-full bg-white border border-slate-400 px-2 py-1 text-slate-900"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playApprovalStamp();
                  onPledgeGuarantee(selectedBankId, guaranteeAmount, guaranteePurpose);
                }}
                className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold border-t border-l border-blue-300 border-b border-r border-blue-950 shadow cursor-pointer text-xs"
              >
                Inmovilizar Fondos y Emitir Fianza Bancaria Remunerada
              </button>
            </div>

            {/* Lista de Fianzas Constituidas con Rendimiento Acumulado */}
            <div className="space-y-1.5">
              <span className="font-bold text-[11px] text-slate-700 block">Fianzas Activas Pignoradas:</span>
              {relationship.guaranteeDeposits.length === 0 ? (
                <div className="p-3 bg-slate-50 border text-center text-slate-500 text-[11px]">
                  No tienes depósitos inmovilizados en garantía con este banco.
                </div>
              ) : (
                relationship.guaranteeDeposits.map((dep) => (
                  <div key={dep.id} className="p-2.5 bg-white border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <strong className="font-bold text-blue-950 text-xs">{dep.purpose}</strong>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 border border-emerald-300">
                          {dep.annualRatePct || 4.0}% APR ACTIVO
                        </span>
                      </div>
                      <div className="font-mono text-slate-600 flex items-center gap-3">
                        <span>Capital: <strong className="text-slate-900">L {dep.amountPledged.toLocaleString()}</strong></span>
                        <span>Intereses Ganados: <strong className="text-emerald-700 font-bold">+L {(dep.accruedInterest || 0).toLocaleString()}</strong></span>
                        <span className="text-slate-500 text-[10px]">(Total a Liberar: L {(dep.amountPledged + (dep.accruedInterest || 0)).toLocaleString()})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onReleaseGuarantee(selectedBankId, dep.id);
                      }}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border-t border-l border-emerald-300 border-b border-r border-emerald-950 shadow text-xs cursor-pointer whitespace-nowrap"
                    >
                      Liberar Fondos + Intereses Ganados
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 5: INVERSION DPF CON CAPITALIZACIÓN DIARIA Y BONIFICACIÓN */}
        {activeSubTab === 'dpf' && (
          <div className="space-y-3">
            {/* Simulador y Apertura de DPF */}
            <div className="bg-slate-50 border border-slate-300 p-3 space-y-2.5">
              {(() => {
                const tierBonus = calculateDpfTierBonus(dpfAmount);
                const effectiveApr = Number((selectedProfile.baseDpfRate + tierBonus.bonusPct).toFixed(2));
                const estimatedEarnings = Math.round((dpfAmount * (effectiveApr / 100) * dpfDays) / 365);

                return (
                  <>
                    <div className="flex flex-wrap justify-between items-center border-b pb-1.5 gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Apertura de Depósito a Plazo Fijo (DPF Compuesto)</h4>
                        <span className="text-[10px] text-slate-500">Capitalización Diaria de Intereses & Liquidez Garantizada</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-300 font-bold">
                          {tierBonus.badge}
                        </span>
                        <span className="font-mono text-xs bg-blue-900 text-white px-2 py-0.5 font-bold">
                          Tasa Efectiva: {effectiveApr}% anual
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Capital a Invertir (HNL):</label>
                        <input
                          type="number"
                          min={50000}
                          step={50000}
                          value={dpfAmount}
                          onChange={(e) => setDpfAmount(Number(e.target.value))}
                          className="w-full bg-white border border-slate-400 px-2 py-1.5 font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5">Plazo de Vencimiento (Días):</label>
                        <select
                          value={dpfDays}
                          onChange={(e) => setDpfDays(Number(e.target.value))}
                          className="w-full bg-white border border-slate-400 px-2 py-1.5 font-sans font-semibold text-slate-900"
                        >
                          <option value={30}>30 Días · Rentabilidad Inmediata</option>
                          <option value={60}>60 Días · Plazo Corto</option>
                          <option value={90}>90 Días · Plazo Trimestral Recomendado</option>
                          <option value={180}>180 Días (6 Meses) · Máximo Rendimiento</option>
                        </select>
                      </div>
                    </div>

                    {/* Proyección de Rendimiento */}
                    <div className="bg-emerald-50 border border-emerald-200 p-2 text-[11px] font-mono flex justify-between">
                      <div>
                        Tasa Base: <strong>{selectedProfile.baseDpfRate}%</strong> + Bono por Monto: <strong className="text-emerald-700">+{tierBonus.bonusPct}% ({tierBonus.tierName})</strong>
                      </div>
                      <div>
                        Ganancia Estimada: <strong className="text-emerald-900 font-bold">+L {estimatedEarnings.toLocaleString()}</strong> al vencimiento
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onOpenDpf(selectedBankId, dpfAmount, dpfDays);
                      }}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border-t border-l border-emerald-300 border-b-2 border-r-2 border-emerald-950 shadow cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>📈</span>
                      <span>INVERTIR Y CONSTITUIR CERTIFICADO DPF ({effectiveApr}% APR)</span>
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Certificados DPF Activos con Interés Compuesto y Cancelación Anticipada */}
            <div className="space-y-1.5">
              <span className="font-bold text-[11px] text-slate-700 block">Certificados DPF Activos:</span>
              {relationship.termDeposits.length === 0 ? (
                <div className="p-3 bg-slate-50 border text-center text-slate-500 text-[11px]">
                  No tienes certificados de inversión a plazo fijo vigentes con este banco.
                </div>
              ) : (
                relationship.termDeposits.map((dpf) => {
                  const currentBalance = dpf.currentBalance || (dpf.principalAmount + (dpf.accruedInterest || 0));

                  return (
                    <div key={dpf.id} className="p-2.5 bg-white border-2 border-slate-300 shadow-sm flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="font-bold text-emerald-900 text-xs">DPF No. {dpf.id}</strong>
                          <span className="font-mono bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.2 border border-blue-300 font-bold">
                            Tasa: {dpf.effectiveRatePct || dpf.annualRatePct}% anual
                          </span>
                          <span className="font-mono bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 border border-amber-300">
                            {dpf.daysRemaining} días restantes
                          </span>
                        </div>
                        <div className="font-mono text-slate-600 flex items-center gap-3">
                          <span>Capital Original: <strong>L {dpf.principalAmount.toLocaleString()}</strong></span>
                          <span>Interés Compuesto Ganado: <strong className="text-emerald-700 font-bold">+L {(dpf.accruedInterest || 0).toLocaleString()}</strong></span>
                          <span className="text-blue-900 font-bold">Valor Actual: L {currentBalance.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          sound.playApprovalStamp();
                          if (onEarlyLiquidateDpf) {
                            onEarlyLiquidateDpf(selectedBankId, dpf.id);
                          }
                        }}
                        className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs border-t border-l border-amber-300 border-b border-r border-amber-950 shadow cursor-pointer whitespace-nowrap"
                        title="Rescata tu capital completo de inmediato con retención justa del 75% sobre el interés ganado"
                      >
                        ⚡ Rescate Anticipado (Liquidez Inmediata)
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
