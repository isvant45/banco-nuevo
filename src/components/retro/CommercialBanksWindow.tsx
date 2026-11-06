import React, { useState } from 'react';
import { 
  CommercialBankId, 
  CommercialBankRelationship,
  DailySimulationState,
  CommercialLoanType,
  RealEstateCollateralItem
} from '../../game/retroSimTypes';
import { 
  COMMERCIAL_BANKS_PROFILES, 
  evaluateContractorEconomicCapacity,
  COMMERCIAL_LOAN_PRODUCTS,
  calculateCreditTermsDisclosure,
  CreditTermsDisclosure,
  consultBankAdvisor,
  BankAdvisorTopic,
  BankAdvisorConsultation,
  CORPORATE_CARD_TIERS,
  CORPORATE_REWARDS_CATALOG,
  calculateDpfTierBonus,
  createDefaultRealEstateCollaterals
} from '../../game/commercialBanksEngine';
import { sound } from '../../game/audioFx';

interface CommercialBanksWindowProps {
  state: DailySimulationState;
  onRequestLoan: (bankId: CommercialBankId, amount: number, termMonths: number, purpose: string) => void;
  onRequestCard: (bankId: CommercialBankId, limit: number) => void;
  onOpenChecking: (bankId: CommercialBankId, deposit: number) => void;
  onPayLoan: (bankId: CommercialBankId, amount: number) => void;
  onExtraordinaryLoanPayment?: (bankId: CommercialBankId, amount: number) => void;
  onExtraordinaryPaymentWithOptions?: (bankId: CommercialBankId, amount: number, strategy: 'reducir_cuota' | 'reducir_plazo') => void;
  onPayCard: (bankId: CommercialBankId, amount: number) => void;
  onPledgeGuarantee: (bankId: CommercialBankId, amount: number, purpose: string) => void;
  onReleaseGuarantee: (bankId: CommercialBankId, depositId: string) => void;
  onOpenDpf: (bankId: CommercialBankId, amount: number, termDays: number) => void;
  onDepositCash?: (bankId: CommercialBankId, amount: number) => void;
  onWithdrawCash?: (bankId: CommercialBankId, amount: number) => void;
  onNegotiateCheckingRate?: (bankId: CommercialBankId, targetRate: number) => void;
  onNegotiateLoanRate?: (bankId: CommercialBankId, discount: number) => void;
  onLiquidateDpf?: (bankId: CommercialBankId, depositId: string, isEarly: boolean) => void;
  onChargeCard?: (bankId: CommercialBankId, amount: number, concept: string) => void;
  onRequestFullCredit?: (bankId: CommercialBankId, productType: CommercialLoanType, amount: number, termMonths: number, purpose: string, graceMonths: number, collateralId?: string) => void;
  onPledgeCollateral?: (collateralId: string, bankId: CommercialBankId, loanId: string) => void;
  onReleaseCollateral?: (collateralId: string) => void;
  onExecuteFactoring?: (bankId: CommercialBankId, invoiceAmount: number, desc: string) => void;
}

export const CommercialBanksWindow: React.FC<CommercialBanksWindowProps> = ({
  state,
  onRequestLoan,
  onRequestCard,
  onOpenChecking,
  onPayLoan,
  onExtraordinaryLoanPayment,
  onExtraordinaryPaymentWithOptions,
  onPayCard,
  onPledgeGuarantee,
  onReleaseGuarantee,
  onOpenDpf,
  onDepositCash,
  onWithdrawCash,
  onNegotiateCheckingRate,
  onNegotiateLoanRate,
  onLiquidateDpf,
  onChargeCard,
  onRequestFullCredit,
  onPledgeCollateral,
  onReleaseCollateral,
  onExecuteFactoring
}) => {
  const [selectedBankId, setSelectedBankId] = useState<CommercialBankId>('atlantida');
  const [activeSubTab, setActiveSubTab] = useState<'prestamos' | 'tarjetas' | 'cuenta' | 'garantias' | 'asesor' | 'dpf' | 'factoraje'>('prestamos');

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

  // Bienes inmuebles y colaterales registrados
  const collaterals: RealEstateCollateralItem[] = state.realEstateCollaterals && state.realEstateCollaterals.length > 0
    ? state.realEstateCollaterals
    : createDefaultRealEstateCollaterals(state.retailSector);

  // Estados de formularios para 12+ productos de crédito
  const [selectedProductType, setSelectedProductType] = useState<CommercialLoanType>('capital_trabajo');
  const [loanAmount, setLoanAmount] = useState<number>(Math.min(bankOffer.maxLoanHNL, 1000000));
  const [loanTerm, setLoanTerm] = useState<number>(24);
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(0);
  const [selectedCollateralId, setSelectedCollateralId] = useState<string>('');
  const [loanPurpose, setLoanPurpose] = useState<string>('Capital de Trabajo y Compra de Insumos');
  
  // Modal de Hoja de Liquidación y Pre-Confirmación
  const [showDisclosureModal, setShowDisclosureModal] = useState<boolean>(false);
  const [currentDisclosure, setCurrentDisclosure] = useState<CreditTermsDisclosure | null>(null);

  // Abono Extraordinario
  const [extraordinaryPayAmount, setExtraordinaryPayAmount] = useState<number>(50000);
  const [extraordinaryStrategy, setExtraordinaryStrategy] = useState<'reducir_cuota' | 'reducir_plazo'>('reducir_plazo');

  // Tarjeta Corporativa
  const [cardLimit, setCardLimit] = useState<number>(Math.min(bankOffer.maxCardHNL, 200000));
  const [cardChargeAmount, setCardChargeAmount] = useState<number>(15000);
  const [cardChargeConcept, setCardChargeConcept] = useState<string>('Compra de Combustible y Materiales');
  const [cardPayAmount, setCardPayAmount] = useState<number>(relationship.corporateCard?.currentBalance || 0);

  // Cuentas y Tasas
  const [depositAmount, setDepositAmount] = useState<number>(50000);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(25000);
  const [requestedCheckingRate, setRequestedCheckingRate] = useState<number>(5.5);
  const [loanRateDiscount, setLoanRateDiscount] = useState<number>(1.0);

  // Fianzas & DPF
  const [guaranteeAmount, setGuaranteeAmount] = useState<number>(500000);
  const [guaranteePurpose, setGuaranteePurpose] = useState<string>('Fianza de Cumplimiento de Contrato');
  const [dpfAmount, setDpfAmount] = useState<number>(300000);
  const [dpfDays, setDpfDays] = useState<number>(90);

  // Factoraje
  const [factoringInvoiceAmount, setFactoringInvoiceAmount] = useState<number>(250000);
  const [factoringProjectName, setFactoringProjectName] = useState<string>('Estimación No. 3 - SIT Obras Públicas');

  // Asesor Bancario Interactivo
  const [advisorTopic, setAdvisorTopic] = useState<BankAdvisorTopic>('negociar_tasa');
  const [advisorConsultation, setAdvisorConsultation] = useState<BankAdvisorConsultation | null>(null);

  const formatHNL = (amount: number) => `L ${Math.round(amount).toLocaleString()}`;

  const handleSelectBank = (id: CommercialBankId) => {
    sound.playClick();
    setSelectedBankId(id);
    const newOffer = capacity.offersByBank[id];
    setLoanAmount(Math.min(newOffer.maxLoanHNL, 1000000));
    setCardLimit(Math.min(newOffer.maxCardHNL, 200000));
    setAdvisorConsultation(null);
  };

  const handleOpenDisclosure = () => {
    sound.playClick();
    const disclosure = calculateCreditTermsDisclosure(
      state,
      selectedBankId,
      selectedProductType,
      loanAmount,
      loanTerm,
      gracePeriodMonths,
      selectedCollateralId || undefined
    );
    setCurrentDisclosure(disclosure);
    setShowDisclosureModal(true);
  };

  const handleConfirmAndDisburse = () => {
    sound.playApprovalStamp();
    setShowDisclosureModal(false);
    if (onRequestFullCredit) {
      onRequestFullCredit(
        selectedBankId,
        selectedProductType,
        loanAmount,
        loanTerm,
        loanPurpose,
        gracePeriodMonths,
        selectedCollateralId || undefined
      );
    } else {
      onRequestLoan(selectedBankId, loanAmount, loanTerm, loanPurpose);
    }
  };

  const handleConsultAdvisor = () => {
    sound.playClick();
    const consultation = consultBankAdvisor(state, selectedBankId, advisorTopic);
    setAdvisorConsultation(consultation);
  };

  const handleExecuteExtraordinaryPayment = () => {
    sound.playApprovalStamp();
    if (onExtraordinaryPaymentWithOptions) {
      onExtraordinaryPaymentWithOptions(selectedBankId, extraordinaryPayAmount, extraordinaryStrategy);
    } else if (onExtraordinaryLoanPayment) {
      onExtraordinaryLoanPayment(selectedBankId, extraordinaryPayAmount);
    } else {
      onPayLoan(selectedBankId, extraordinaryPayAmount);
    }
  };

  const handleFactoring = () => {
    sound.playApprovalStamp();
    if (onExecuteFactoring) {
      onExecuteFactoring(selectedBankId, factoringInvoiceAmount, factoringProjectName);
    } else {
      alert(`Factoraje solicitado por L ${factoringInvoiceAmount.toLocaleString()} a ${COMMERCIAL_BANKS_PROFILES[selectedBankId].name}.`);
    }
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
          <span className="font-bold text-[11px] text-slate-700 px-1 hidden sm:inline">BANCO:</span>
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
          <div>Tasa Base: <strong>{bankOffer.recommendedRatePct}% anual</strong></div>
          <div>DPF Rendimiento: <strong>{selectedProfile.baseDpfRate}% anual</strong></div>
        </div>
      </div>

      {/* Barra de Sub-Pestañas de Productos Financieros */}
      <div className="flex gap-1 border-b border-[#808080] p-1 bg-[#d8d8d8] overflow-x-auto">
        <button
          onClick={() => { sound.playClick(); setActiveSubTab('prestamos'); }}
          className={`px-2.5 py-1 font-bold border whitespace-nowrap ${
            activeSubTab === 'prestamos' ? 'bg-white border-[#404040] text-blue-950 font-black' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          💰 Créditos (12+ Productos)
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('tarjetas'); }}
          className={`px-2.5 py-1 font-bold border whitespace-nowrap ${
            activeSubTab === 'tarjetas' ? 'bg-white border-[#404040] text-blue-950 font-black' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          💳 Tarjetas (3 Tiers)
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('garantias'); }}
          className={`px-2.5 py-1 font-bold border whitespace-nowrap ${
            activeSubTab === 'garantias' ? 'bg-white border-[#404040] text-blue-950 font-black' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          🛡️ Garantías Reales ({collaterals.length})
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('asesor'); }}
          className={`px-2.5 py-1 font-bold border whitespace-nowrap ${
            activeSubTab === 'asesor' ? 'bg-white border-[#404040] text-blue-950 font-black' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          🗣️ Asesor Bancario (Negociación)
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('factoraje'); }}
          className={`px-2.5 py-1 font-bold border whitespace-nowrap ${
            activeSubTab === 'factoraje' ? 'bg-white border-[#404040] text-blue-950 font-black' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          ⚡ Factoraje
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('cuenta'); }}
          className={`px-2.5 py-1 font-bold border whitespace-nowrap ${
            activeSubTab === 'cuenta' ? 'bg-white border-[#404040] text-blue-950 font-black' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          📄 Cuenta Corriente
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveSubTab('dpf'); }}
          className={`px-2.5 py-1 font-bold border whitespace-nowrap ${
            activeSubTab === 'dpf' ? 'bg-white border-[#404040] text-blue-950 font-black' : 'bg-[#c0c0c0] border-transparent text-slate-700'
          }`}
        >
          📈 Inversión DPF
        </button>
      </div>

      {/* Contenido Principal por Sub-Pestaña */}
      <div className="flex-1 p-3 overflow-y-auto bg-white border-t border-[#808080]">
        {/* ========================================================= */}
        {/* SUBTAB 1: PRÉSTAMOS COMERCIALES (12+ PRODUCTOS)          */}
        {/* ========================================================= */}
        {activeSubTab === 'prestamos' && (
          <div className="space-y-4">
            {relationship.activeLoan && relationship.activeLoan.balanceRemaining > 0 ? (
              <div className="bg-slate-50 border-2 border-blue-900 p-3 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-blue-950">Préstamo Comercial Activo</span>
                    <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-1.5 py-0.5 border border-blue-300">
                      {relationship.activeLoan.loanType?.toUpperCase() || 'COMERCIAL'}
                    </span>
                    {relationship.activeLoan.isRestructured && (
                      <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-1.5 py-0.5 border border-purple-300">
                        REESTRUCTURADO
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs bg-blue-100 text-blue-900 px-2 py-0.5 border border-blue-300">
                    ID: {relationship.activeLoan.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Monto Original:</span>
                    <span className="font-bold">{formatHNL(relationship.activeLoan.principalAmount)}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Saldo Deudor:</span>
                    <span className="font-bold text-rose-800">{formatHNL(relationship.activeLoan.balanceRemaining)}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Cuota Mensual:</span>
                    <span className="font-bold text-blue-900">{formatHNL(relationship.activeLoan.monthlyPayment)}</span>
                  </div>
                  <div className="bg-white p-2 border">
                    <span className="text-slate-500 block">Tasa / Plazo:</span>
                    <span className="font-bold">{relationship.activeLoan.interestRateAnnual}% · {relationship.activeLoan.termMonthsRemaining}m</span>
                  </div>
                </div>

                {/* Abono Extraordinario con Opción Reducir Plazo vs Reducir Cuota */}
                <div className="border border-slate-300 p-3 bg-white space-y-2">
                  <span className="font-bold text-xs text-slate-800 block">
                    Abono Extraordinario a Capital (Amortización Directa):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <div>
                      <label className="text-[10px] text-slate-500 block">Monto a amortizar:</label>
                      <input
                        type="number"
                        min={5000}
                        step={10000}
                        max={relationship.activeLoan.balanceRemaining}
                        value={extraordinaryPayAmount}
                        onChange={(e) => setExtraordinaryPayAmount(Math.max(1000, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-400 px-2 py-1 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block">Estrategia Financiera:</label>
                      <select
                        value={extraordinaryStrategy}
                        onChange={(e) => setExtraordinaryStrategy(e.target.value as any)}
                        className="w-full bg-white border border-slate-400 px-2 py-1 font-sans text-xs"
                      >
                        <option value="reducir_plazo">Reducir Plazo (Ahorra Intereses)</option>
                        <option value="reducir_cuota">Reducir Cuota Mensual</option>
                      </select>
                    </div>
                    <div className="pt-3">
                      <button
                        onClick={handleExecuteExtraordinaryPayment}
                        className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border shadow cursor-pointer"
                      >
                        Aplicar Abono 💰
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-300 p-3 space-y-3">
                <div className="border-b pb-2 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Catálogo de Financiamiento Empresarial (12 Productos)</h4>
                    <span className="text-[10px] text-slate-500">
                      Selecciona el producto específico para tu rubro ({state.retailSector})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-900 bg-blue-50 px-2 py-1 border border-blue-200">
                    Cupo Base: {formatHNL(bankOffer.maxLoanHNL)}
                  </span>
                </div>

                {/* Selector de Producto */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Producto de Crédito Requerido:</label>
                  <select
                    value={selectedProductType}
                    onChange={(e) => setSelectedProductType(e.target.value as CommercialLoanType)}
                    className="w-full bg-white border-2 border-slate-400 p-2 font-sans font-bold text-xs text-slate-900"
                  >
                    {Object.values(COMMERCIAL_LOAN_PRODUCTS).map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.icon} {prod.name} (Tasa: {bankOffer.recommendedRatePct + prod.rateSpreadPct}% · Hasta {prod.maxTermMonths}m)
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-600 mt-1 font-sans italic">
                    {COMMERCIAL_LOAN_PRODUCTS[selectedProductType]?.description}
                  </p>
                </div>

                {/* Formulario de Solicitud */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Monto Solicitado (HNL):</label>
                    <input
                      type="number"
                      min={COMMERCIAL_LOAN_PRODUCTS[selectedProductType]?.minAmountHNL || 50000}
                      step={25000}
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-400 p-1.5 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Plazo de Pago (Meses):</label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-400 p-1.5 font-sans font-semibold text-xs"
                    >
                      <option value={12}>12 Meses (1 Año)</option>
                      <option value={24}>24 Meses (2 Años)</option>
                      <option value={36}>36 Meses (3 Años)</option>
                      <option value={48}>48 Meses (4 Años)</option>
                      <option value={60}>60 Meses (5 Años)</option>
                      <option value={84}>84 Meses (7 Años)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Período de Gracia (Meses):</label>
                    <select
                      value={gracePeriodMonths}
                      onChange={(e) => setGracePeriodMonths(Number(e.target.value))}
                      className="w-full bg-white border border-slate-400 p-1.5 font-sans font-semibold text-xs"
                      disabled={!COMMERCIAL_LOAN_PRODUCTS[selectedProductType]?.admitsGracePeriod}
                    >
                      <option value={0}>Sin período de gracia</option>
                      <option value={3}>3 Meses (Solo intereses)</option>
                      <option value={6}>6 Meses (Solo intereses)</option>
                    </select>
                  </div>
                </div>

                {/* Garantía Requerida / Vinculada */}
                {COMMERCIAL_LOAN_PRODUCTS[selectedProductType]?.requiresCollateral && (
                  <div className="border border-amber-300 p-2.5 bg-amber-50">
                    <label className="font-bold text-amber-900 block mb-1">
                      🛡️ Respaldar con Garantía Real / Inmueble Patrimonial:
                    </label>
                    <select
                      value={selectedCollateralId}
                      onChange={(e) => setSelectedCollateralId(e.target.value)}
                      className="w-full bg-white border border-amber-400 p-1 font-sans text-xs"
                    >
                      <option value="">Seleccionar de mis propiedades...</option>
                      {collaterals.map(col => (
                        <option key={col.id} value={col.id} disabled={col.isPledged}>
                          {col.title} — Avalúo: {formatHNL(col.appraisalValueHNL)} (LTV {col.ltvAcceptedPct}%) {col.isPledged ? '· [PIGNORADA]' : '· [DISPONIBLE]'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Destino */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Destino Oficial del Crédito:</label>
                  <input
                    type="text"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    className="w-full bg-white border border-slate-400 p-1.5 text-xs text-slate-900 font-sans"
                  />
                </div>

                {/* Botón para Abrir Hoja de Pre-Confirmación y Términos */}
                <button
                  onClick={handleOpenDisclosure}
                  className="w-full py-2.5 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📋</span>
                  <span>VER CONDICIONES FINANCIERAS & HOJA DE LIQUIDACIÓN PREVIA</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 2: TARJETAS CORPORATIVAS (3 TIERS)                 */}
        {/* ========================================================= */}
        {activeSubTab === 'tarjetas' && (
          <div className="space-y-4">
            {relationship.corporateCard ? (
              <div className="space-y-3">
                <div className="border-2 border-slate-700 p-3 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-sm text-slate-900">{relationship.corporateCard.brand}</h4>
                      <div className="text-[11px] text-slate-600 font-mono">
                        Límite: <strong className="text-blue-900">{formatHNL(relationship.corporateCard.creditLimit)}</strong> | Saldo: <strong className="text-rose-900">{formatHNL(relationship.corporateCard.currentBalance)}</strong>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 border font-bold">
                      {relationship.corporateCard.rewardPoints || 0} PUNTOS DE RECOMPENSA
                    </span>
                  </div>

                  {/* Simulador de Compras Rápidas con Tarjeta */}
                  <div className="border p-2 bg-white space-y-2">
                    <span className="font-bold text-xs text-slate-800 block">Efectuar Compra de Insumos con Tarjeta:</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={500}
                        value={cardChargeAmount}
                        onChange={(e) => setCardChargeAmount(Number(e.target.value))}
                        className="w-32 p-1 border font-mono font-bold text-xs"
                      />
                      <input
                        type="text"
                        value={cardChargeConcept}
                        onChange={(e) => setCardChargeConcept(e.target.value)}
                        className="flex-1 p-1 border font-sans text-xs"
                      />
                      <button
                        onClick={() => {
                          if (onChargeCard) onChargeCard(selectedBankId, cardChargeAmount, cardChargeConcept);
                        }}
                        className="px-3 py-1 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border shadow cursor-pointer whitespace-nowrap"
                      >
                        Cargar Tarjeta 💳
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-300 space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Solicitud de Tarjeta de Crédito Corporativa</h4>
                <p className="text-[11px] text-slate-600 font-sans">
                  Hasta 30 días de crédito sin interés para compras ordinarias con 1.5% a 4.5% de cashback.
                </p>
                <button
                  onClick={() => onRequestCard(selectedBankId, cardLimit)}
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border shadow cursor-pointer"
                >
                  Solicitar Tarjeta Corporativa con Cupo {formatHNL(cardLimit)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 3: GARANTÍAS REALES (BIENES PATRIMONIALES)         */}
        {/* ========================================================= */}
        {activeSubTab === 'garantias' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Registro de Bienes Patrimoniales & Garantías Reales</h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  Casas, terrenos y bodegas inscritos para respaldar líneas de crédito y licitaciones de gran escala.
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 border border-emerald-300">
                Valor Total: {formatHNL(collaterals.reduce((s, c) => s + c.appraisalValueHNL, 0))}
              </span>
            </div>

            <div className="space-y-2.5">
              {collaterals.map(col => (
                <div key={col.id} className="border border-slate-300 p-3 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{col.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 border font-bold ${
                        col.isPledged 
                          ? 'bg-rose-100 text-rose-800 border-rose-300' 
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {col.isPledged ? '🔒 PIGNORADO A CRÉDITO' : '✅ LIBRE DE GRAVAMEN'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 font-mono">
                      Avalúo Oficial: <strong>{formatHNL(col.appraisalValueHNL)}</strong> | Cobertura LTV: <strong>{col.ltvAcceptedPct}%</strong> (Capacidad: {formatHNL(col.appraisalValueHNL * (col.ltvAcceptedPct / 100))})
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      Ubicación: {col.location} | Matrícula: {col.registrationNumber}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {col.isPledged ? (
                      <button
                        onClick={() => {
                          if (onReleaseCollateral) onReleaseCollateral(col.id);
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs border shadow cursor-pointer whitespace-nowrap"
                      >
                        Liberar Gravamen 🔓
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-bold bg-white px-2 py-1 border border-slate-300">
                        Disponible para Garantía
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 4: ASESOR BANCARIO DETERMINISTA INTERACTIVO        */}
        {/* ========================================================= */}
        {activeSubTab === 'asesor' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="border-b pb-2">
              <h4 className="font-black text-sm text-slate-900 uppercase">
                DESPACHO EJECUTIVO DE NEGOCIACIÓN BANCARIA
              </h4>
              <p className="text-[11px] text-slate-600 font-sans">
                Dialoga directamente con el Vicepresidente de Crédito de {selectedProfile.name}. Presenta solicitudes de menor tasa, períodos de gracia o consolidación.
              </p>
            </div>

            {/* Selector de Asunto */}
            <div className="bg-slate-50 border p-3 space-y-2">
              <label className="font-bold text-slate-800 block text-xs">¿Qué condición deseas negociar con el Banco?</label>
              <div className="flex gap-2">
                <select
                  value={advisorTopic}
                  onChange={(e) => setAdvisorTopic(e.target.value as BankAdvisorTopic)}
                  className="flex-1 bg-white border border-slate-400 p-2 font-sans font-bold text-xs"
                >
                  <option value="negociar_tasa">Solicitar menor tasa de interés (-1.5% APR)</option>
                  <option value="periodo_gracia">Solicitar 3 meses de período de gracia (solo intereses)</option>
                  <option value="consolidar_deuda">Consolidar múltiples deudas en una sola cuota</option>
                  <option value="exonerar_comision">Exonerar comisión de apertura y desembolso</option>
                  <option value="aportar_garantia">Aportar garantía real para ampliar capacidad</option>
                </select>

                <button
                  onClick={handleConsultAdvisor}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border shadow cursor-pointer whitespace-nowrap"
                >
                  Consultar al Comité 🗣️
                </button>
              </div>
            </div>

            {/* Resultado de la Negociación con el Asesor */}
            {advisorConsultation && (
              <div className="bg-white border-2 border-[#808080] p-4 shadow-inner space-y-3 font-sans">
                <div className="flex items-center gap-3 border-b pb-2">
                  <span className="text-3xl">👨‍💼</span>
                  <div>
                    <strong className="text-slate-900 text-sm block">{advisorConsultation.officerName}</strong>
                    <span className="text-[11px] text-slate-500 block">{advisorConsultation.officerRole}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100 border border-slate-300 italic text-slate-800 leading-relaxed text-xs">
                  {advisorConsultation.officerDialog}
                </div>

                {/* Métricas Auditadas */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
                  {advisorConsultation.keyFinancialData.map(m => (
                    <div key={m.label} className={`p-1.5 border ${m.isHealthy ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
                      <span className="text-[9px] block text-slate-500 font-sans">{m.label}:</span>
                      <strong className="font-bold">{m.value}</strong>
                    </div>
                  ))}
                </div>

                {advisorConsultation.concessionOffered && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-400 text-emerald-950 text-xs">
                    <strong className="font-bold block">✨ CONTRAPROPUESTA CONCEDIDA POR EL BANCO:</strong>
                    <span>{advisorConsultation.concessionOffered.type}: <strong>{advisorConsultation.concessionOffered.value}</strong> ({advisorConsultation.concessionOffered.tradeOff})</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 5: FACTORAJE                                       */}
        {/* ========================================================= */}
        {activeSubTab === 'factoraje' && (
          <div className="space-y-4 max-w-2xl mx-auto bg-slate-50 border border-slate-300 p-4">
            <div className="border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">Línea de Factoraje de Facturas & Estimaciones</h4>
              <p className="text-[11px] text-slate-600 font-sans">
                Convierte tus facturas comerciales o estimaciones de obra pendientes de cobro en efectivo líquido inmediato con anticipo del 90%.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Monto de la Factura / Estimación a Factorizar (HNL):</label>
                <input
                  type="number"
                  min={50000}
                  step={25000}
                  value={factoringInvoiceAmount}
                  onChange={(e) => setFactoringInvoiceAmount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-400 p-2 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descripción del Proyecto o Cliente Deudor:</label>
                <input
                  type="text"
                  value={factoringProjectName}
                  onChange={(e) => setFactoringProjectName(e.target.value)}
                  className="w-full bg-white border border-slate-400 p-2 font-sans text-xs"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-2.5 font-mono text-xs text-blue-950 space-y-1">
                <div className="flex justify-between">
                  <span>Anticipo Inmediato (90%):</span>
                  <strong>{formatHNL(factoringInvoiceAmount * 0.90)}</strong>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>Comisión Financiera de Factoraje (6%):</span>
                  <strong>-{formatHNL(factoringInvoiceAmount * 0.06)}</strong>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold text-emerald-800 text-sm">
                  <span>Efectivo Neto a Recibir:</span>
                  <span>{formatHNL((factoringInvoiceAmount * 0.90) - (factoringInvoiceAmount * 0.06))}</span>
                </div>
              </div>

              <button
                onClick={handleFactoring}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border shadow cursor-pointer"
              >
                Ejecutar Factoraje y Recibir Efectivo Inmediato ⚡
              </button>
            </div>
          </div>
        )}

        {/* SUBTAB 6: CUENTA CORRIENTE */}
        {activeSubTab === 'cuenta' && (
          <div className="space-y-4">
            {relationship.checkingAccount ? (
              <div className="bg-slate-50 border border-slate-300 p-3 space-y-3">
                <div className="flex justify-between items-center border-b pb-1">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{relationship.checkingAccount.accountNumber}</h4>
                    <span className="text-[10px] text-slate-500 font-sans">Cuenta Comercial Activa</span>
                  </div>
                  <span className="font-mono text-base font-bold text-blue-900">
                    {formatHNL(relationship.checkingAccount.balance)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="border p-2 bg-white space-y-2">
                    <span className="font-bold text-xs text-slate-800 block">Depositar Efectivo de Caja:</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1000}
                        step={5000}
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(Number(e.target.value))}
                        className="flex-1 p-1 border font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => {
                          if (onDepositCash) onDepositCash(selectedBankId, depositAmount);
                        }}
                        className="px-3 py-1 bg-emerald-700 text-white font-bold text-xs border cursor-pointer"
                      >
                        Depositar
                      </button>
                    </div>
                  </div>

                  <div className="border p-2 bg-white space-y-2">
                    <span className="font-bold text-xs text-slate-800 block">Retirar Efectivo a Caja:</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1000}
                        step={5000}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="flex-1 p-1 border font-mono font-bold text-xs"
                      />
                      <button
                        onClick={() => {
                          if (onWithdrawCash) onWithdrawCash(selectedBankId, withdrawAmount);
                        }}
                        className="px-3 py-1 bg-blue-800 text-white font-bold text-xs border cursor-pointer"
                      >
                        Retirar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border text-center space-y-3">
                <p className="text-slate-700 font-sans">Aún no posees una cuenta corriente aperturada en {selectedProfile.name}.</p>
                <button
                  onClick={() => onOpenChecking(selectedBankId, 50000)}
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs border shadow cursor-pointer"
                >
                  Aperturar Cuenta Corriente con L 50,000 📄
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 7: INVERSIÓN DPF */}
        {activeSubTab === 'dpf' && (
          <div className="space-y-4">
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
                onClick={() => onOpenDpf(selectedBankId, dpfAmount, dpfDays)}
                className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold border shadow cursor-pointer"
              >
                Invertir y Constituir Certificado DPF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL DE HOJA DE LIQUIDACIÓN Y CONDICIONES PREVIAS        */}
      {/* ========================================================= */}
      {showDisclosureModal && currentDisclosure && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-3 z-50">
          <div className="bg-[#c0c0c0] border-2 border-white shadow-2xl max-w-2xl w-full p-1 space-y-2 text-slate-900 font-sans">
            {/* Barra de Título Modal */}
            <div className="bg-blue-900 text-white font-bold px-2 py-1 flex justify-between items-center text-xs">
              <span>📋 HOJA DE LIQUIDACIÓN Y CONDICIONES PREVIAS AL DESEMBOLSO</span>
              <button 
                onClick={() => setShowDisclosureModal(false)}
                className="px-1.5 bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border border-[#808080] max-h-[80vh] overflow-y-auto space-y-3 text-xs font-mono">
              <div className="text-center border-b pb-2">
                <h3 className="font-sans font-black text-sm text-slate-900">
                  {currentDisclosure.bankName}
                </h3>
                <p className="font-sans text-[11px] text-slate-600">
                  {currentDisclosure.productConfig.name} | Destino: {loanPurpose}
                </p>
              </div>

              {/* Parámetros Financieros Clave */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="border p-2 bg-slate-50">
                  <span className="text-slate-500 block font-sans">Monto Aprobado:</span>
                  <strong className="text-slate-900 text-sm">{formatHNL(currentDisclosure.approvedAmountHNL)}</strong>
                </div>
                <div className="border p-2 bg-slate-50">
                  <span className="text-slate-500 block font-sans">Desembolso Neto a Cuenta:</span>
                  <strong className="text-emerald-800 text-sm">{formatHNL(currentDisclosure.netDisbursementHNL)}</strong>
                </div>
                <div className="border p-2 bg-slate-50">
                  <span className="text-slate-500 block font-sans">Tasa Nominal Anual:</span>
                  <strong className="text-slate-900">{currentDisclosure.annualNominalRatePct}% APR</strong>
                </div>
                <div className="border p-2 bg-slate-50">
                  <span className="text-slate-500 block font-sans">Cuota Mensual Estimada:</span>
                  <strong className="text-blue-900 font-bold">{formatHNL(currentDisclosure.monthlyPaymentHNL)} / mes</strong>
                </div>
                <div className="border p-2 bg-slate-50">
                  <span className="text-slate-500 block font-sans">Comisión por Desembolso (1.5%):</span>
                  <span className="text-rose-800">{formatHNL(currentDisclosure.openingFeeHNL)}</span>
                </div>
                <div className="border p-2 bg-slate-50">
                  <span className="text-slate-500 block font-sans">Total a Pagar (Capital + Intereses):</span>
                  <strong className="text-slate-900">{formatHNL(currentDisclosure.totalRepaymentHNL)}</strong>
                </div>
              </div>

              {/* Amortización Primeras Cuotas */}
              <div>
                <span className="font-sans font-bold text-slate-800 text-[11px] block mb-1">
                  CALENDARIO RESUMIDO DE AMORTIZACIÓN (PRIMERAS CUOTAS):
                </span>
                <table className="w-full text-center border text-[10px]">
                  <thead className="bg-slate-200">
                    <tr>
                      <th className="p-1 border">Mes</th>
                      <th className="p-1 border">Cuota</th>
                      <th className="p-1 border">Capital</th>
                      <th className="p-1 border">Interés</th>
                      <th className="p-1 border">Saldo Deudor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDisclosure.amortizationPreview.map(row => (
                      <tr key={row.monthNumber} className="bg-slate-50">
                        <td className="p-1 border font-bold">Mes {row.monthNumber}</td>
                        <td className="p-1 border">{formatHNL(row.paymentHNL)}</td>
                        <td className="p-1 border text-emerald-800">{formatHNL(row.principalHNL)}</td>
                        <td className="p-1 border text-rose-800">{formatHNL(row.interestHNL)}</td>
                        <td className="p-1 border font-bold">{formatHNL(row.remainingBalanceHNL)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Impacto de Liquidez */}
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-950 font-sans text-xs">
                <strong>💡 Impacto sobre la Liquidez Futura:</strong> {currentDisclosure.liquidityImpactSummary}
              </div>

              {/* Botón de Confirmación Definitiva */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDisclosureModal(false)}
                  className="flex-1 py-2 bg-slate-200 border border-slate-400 font-sans font-bold text-xs cursor-pointer hover:bg-slate-300"
                >
                  Modificar Condiciones
                </button>
                <button
                  onClick={handleConfirmAndDisburse}
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-black text-xs border border-emerald-950 shadow cursor-pointer"
                >
                  CONFIRMAR Y DESEMBOLSAR FONDOS 💰
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
