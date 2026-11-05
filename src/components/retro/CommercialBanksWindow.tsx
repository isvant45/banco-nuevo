import React, { useState } from 'react';
import { 
  CommercialBankId, 
  CommercialBankRelationship,
  DailySimulationState 
} from '../../game/retroSimTypes';
import { 
  COMMERCIAL_BANKS_PROFILES, 
  evaluateContractorEconomicCapacity 
} from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface CommercialBanksWindowProps {
  state: DailySimulationState;
  onRequestLoan: (bankId: CommercialBankId, amount: number, termMonths: number, purpose: string) => void;
  onRequestCard: (bankId: CommercialBankId, limit: number) => void;
  onOpenChecking: (bankId: CommercialBankId, deposit: number) => void;
  onPayLoan: (bankId: CommercialBankId, amount: number) => void;
  onExtraordinaryLoanPayment?: (bankId: CommercialBankId, amount: number) => void;
  onPayCard: (bankId: CommercialBankId, amount: number) => void;
  onPledgeGuarantee: (bankId: CommercialBankId, amount: number, purpose: string) => void;
  onReleaseGuarantee: (bankId: CommercialBankId, depositId: string) => void;
  onOpenDpf: (bankId: CommercialBankId, amount: number, termDays: number) => void;
  onDepositCash?: (bankId: CommercialBankId, amount: number) => void;
  onWithdrawCash?: (bankId: CommercialBankId, amount: number) => void;
  onNegotiateCheckingRate?: (bankId: CommercialBankId, targetRate: number) => void;
  onNegotiateLoanRate?: (bankId: CommercialBankId, discount: number) => void;
}

export const CommercialBanksWindow: React.FC<CommercialBanksWindowProps> = ({
  state,
  onRequestLoan,
  onRequestCard,
  onOpenChecking,
  onPayLoan,
  onExtraordinaryLoanPayment,
  onPayCard,
  onPledgeGuarantee,
  onReleaseGuarantee,
  onOpenDpf,
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
  
  const [cardLimit, setCardLimit] = useState<number>(Math.min(bankOffer.maxCardHNL, 200000));
  const [guaranteeAmount, setGuaranteeAmount] = useState<number>(500000);
  const [guaranteePurpose, setGuaranteePurpose] = useState<string>('Fianza de Cumplimiento de Contrato');

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
                  <div>✓ Aceptada por distribuidores de abarrotes, restaurantes, canteras y concesionarias.</div>
                  <div>✓ Evaluación quincenal para aumento de límite y beneficios automáticos.</div>
                  <div>✓ Membresía corporativa anual de L {selectedProfile.creditCardFeeAnnual.toLocaleString()}.</div>
                </div>

                <button
                  onClick={() => {
                    sound.playApprovalStamp();
                    onRequestCard(selectedBankId, cardLimit);
                  }}
                  className="w-full py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>💳</span>
                  <span>SOLICITAR Y EMITIR TARJETA CORPORATIVA</span>
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

        {/* SUBTAB 4: FIANZAS Y GARANTÍAS */}
        {activeSubTab === 'garantias' && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-300 p-3 space-y-2">
              <h4 className="font-bold text-sm text-slate-900">Constituir Fianza / Depósito en Garantía</h4>
              <p className="text-[11px] text-slate-600">
                Las instituciones públicas (SIT, SEFIN) exigen fianzas bancarias de cumplimiento de contrato o de sostenimiento de oferta.
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
                  <label className="font-semibold text-slate-700 block mb-0.5">Propósito de la Fianza:</label>
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
                className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold border shadow"
              >
                Inmovilizar Fondos y Emitir Fianza Bancaria
              </button>
            </div>

            {/* Lista de Fianzas Constituidas */}
            <div className="space-y-1">
              <span className="font-bold text-[11px] text-slate-700 block">Fianzas Activas:</span>
              {relationship.guaranteeDeposits.length === 0 ? (
                <div className="p-2 bg-slate-50 border text-center text-slate-500 text-[11px]">
                  No tienes depósitos inmovilizados en garantía con este banco.
                </div>
              ) : (
                relationship.guaranteeDeposits.map((dep) => (
                  <div key={dep.id} className="p-2 bg-slate-50 border flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-blue-950">{dep.purpose}</span>
                      <span className="font-mono text-slate-500 block">Monto: L {dep.amountPledged.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => {
                        sound.playApprovalStamp();
                        onReleaseGuarantee(selectedBankId, dep.id);
                      }}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 font-semibold border"
                    >
                      Liberar Fondos
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 5: INVERSION DPF */}
        {activeSubTab === 'dpf' && (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-300 p-3 space-y-2">
              <div className="flex justify-between items-center border-b pb-1">
                <h4 className="font-bold text-sm text-slate-900">Apertura de Depósito a Plazo Fijo (DPF)</h4>
                <span className="font-mono text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 border border-emerald-300">
                  Tasa: {selectedProfile.baseDpfRate}% anual
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Capital a Invertir (HNL):</label>
                  <input
                    type="number"
                    min={50000}
                    step={50000}
                    value={dpfAmount}
                    onChange={(e) => setDpfAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-400 px-2 py-1 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-0.5">Plazo (Días):</label>
                  <select
                    value={dpfDays}
                    onChange={(e) => setDpfDays(Number(e.target.value))}
                    className="w-full bg-white border border-slate-400 px-2 py-1 font-sans font-semibold text-slate-900"
                  >
                    <option value={30}>30 Días</option>
                    <option value={60}>60 Días</option>
                    <option value={90}>90 Días (Recomendado)</option>
                    <option value={180}>180 Días (6 Meses)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playApprovalStamp();
                  onOpenDpf(selectedBankId, dpfAmount, dpfDays);
                }}
                className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border shadow"
              >
                Invertir y Constituir Certificado DPF
              </button>
            </div>

            {/* Certificados DPF Activos */}
            <div className="space-y-1">
              <span className="font-bold text-[11px] text-slate-700 block">Certificados DPF Activos:</span>
              {relationship.termDeposits.length === 0 ? (
                <div className="p-2 bg-slate-50 border text-center text-slate-500 text-[11px]">
                  No tienes certificados de inversión a plazo fijo vigentes con este banco.
                </div>
              ) : (
                relationship.termDeposits.map((dpf) => (
                  <div key={dpf.id} className="p-2 bg-slate-50 border flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-emerald-900">DPF No. {dpf.id}</span>
                      <span className="font-mono text-slate-500 block">
                        Capital: L {dpf.principalAmount.toLocaleString()} · Tasa: {dpf.annualRatePct}% · Plazo: {dpf.daysRemaining}d restantes
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
