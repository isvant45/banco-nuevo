import React, { useState } from 'react';
import { 
  DailySimulationState, 
  CommercialBankId, 
  BankCommercialLoan,
  CommercialLoanType,
  RealEstateCollateralItem,
  TransactionVoucher
} from '../../game/retroSimTypes';
import { 
  COMMERCIAL_BANKS_PROFILES, 
  COMMERCIAL_LOAN_PRODUCTS,
  CORPORATE_CARD_TIERS,
  CORPORATE_REWARDS_CATALOG,
  BankAdvisorTopic,
  BankAdvisorConsultation,
  CreditTermsDisclosure,
  evaluateContractorEconomicCapacity,
  calculateCreditTermsDisclosure,
  consultBankAdvisor,
  calculateDpfTierBonus,
  createDefaultRealEstateCollaterals
} from '../../game/commercialBanksEngine';
import { CustomAmountInput, formatHNLAmount } from '../common/CustomAmountInput';
import { sound } from '../../game/audioFx';

interface CommercialBanksWindowProps {
  state: DailySimulationState;
  initialBankId?: CommercialBankId;
  initialProductType?: CommercialLoanType;
  initialAmount?: number;
  initialTermMonths?: number;
  initialOfferId?: string;
  initialCollateralIds?: string[];
  onRequestLoan: (bankId: CommercialBankId, amount: number, termMonths: number, purpose: string) => void;
  onRequestCard: (bankId: CommercialBankId, limit: number) => void;
  onOpenChecking: (bankId: CommercialBankId, deposit: number) => void;
  onPayLoan: (bankId: CommercialBankId, amount: number) => void;
  onExtraordinaryLoanPayment?: (bankId: CommercialBankId, amount: number) => void;
  onExtraordinaryPaymentWithOptions?: (bankId: CommercialBankId, amount: number, strategy: 'reducir_cuota' | 'reducir_plazo') => void;
  onExecuteFlexiblePayment?: (
    bankId: CommercialBankId, 
    paymentType: 'cuota_mensual' | 'varias_cuotas' | 'pago_parcial' | 'abono_capital' | 'cancelacion_total',
    amount: number,
    sourceAccount: 'checking' | 'cash',
    strategy?: 'reducir_cuota' | 'reducir_plazo',
    numInstallments?: number
  ) => void;
  onPayCard: (bankId: CommercialBankId, amount: number) => void;
  onPledgeGuarantee: (bankId: CommercialBankId, amount: number, purpose: string) => void;
  onReleaseGuarantee: (bankId: CommercialBankId, depositId: string) => void;
  onOpenDpf: (bankId: CommercialBankId, amount: number, termDays: number) => void;
  onDepositCash?: (bankId: CommercialBankId, amount: number) => void;
  onWithdrawCash?: (bankId: CommercialBankId, amount: number) => void;
  onTransferBetweenAccounts?: (fromBankId: CommercialBankId, toBankId: CommercialBankId, amount: number) => void;
  onNegotiateCheckingRate?: (bankId: CommercialBankId, targetRate: number) => void;
  onNegotiateLoanRate?: (bankId: CommercialBankId, discount: number) => void;
  onLiquidateDpf?: (bankId: CommercialBankId, depositId: string, isEarly: boolean) => void;
  onChargeCard?: (bankId: CommercialBankId, amount: number, concept: string) => void;
  onRequestFullCredit?: (
    bankId: CommercialBankId, 
    productType: CommercialLoanType, 
    amount: number, 
    termMonths: number, 
    purpose: string, 
    graceMonths: number, 
    collateralIds?: string[],
    destinationBankId?: CommercialBankId,
    destinationAccountType?: 'checking' | 'cash',
    offerId?: string
  ) => void;
  onRequestNewAppraisal?: (collateralId: string) => void;
  onRegisterAssetAsCollateral?: (asset: any) => void;
  onPledgeCollateral?: (collateralId: string, bankId: CommercialBankId, loanId: string) => void;
  onReleaseCollateral?: (collateralId: string) => void;
  onExecuteFactoring?: (bankId: CommercialBankId, invoiceAmount: number, desc: string) => void;
  onViewVoucher?: (voucher: TransactionVoucher) => void;
}

export const CommercialBanksWindow: React.FC<CommercialBanksWindowProps> = ({
  state,
  initialBankId,
  initialProductType,
  initialAmount,
  initialTermMonths,
  initialOfferId,
  initialCollateralIds,
  onRequestLoan,
  onRequestCard,
  onOpenChecking,
  onPayLoan,
  onExtraordinaryLoanPayment,
  onExtraordinaryPaymentWithOptions,
  onExecuteFlexiblePayment,
  onPayCard,
  onPledgeGuarantee,
  onReleaseGuarantee,
  onOpenDpf,
  onDepositCash,
  onWithdrawCash,
  onTransferBetweenAccounts,
  onNegotiateCheckingRate,
  onNegotiateLoanRate,
  onLiquidateDpf,
  onChargeCard,
  onRequestFullCredit,
  onRequestNewAppraisal,
  onRegisterAssetAsCollateral,
  onPledgeCollateral,
  onReleaseCollateral,
  onExecuteFactoring,
  onViewVoucher
}) => {
  const [selectedBankId, setSelectedBankId] = useState<CommercialBankId>(initialBankId || 'atlantida');
  const [activeTab, setActiveTab] = useState<'cuentas' | 'credito' | 'tarjeta' | 'dpf' | 'garantias' | 'asesor' | 'transferencias'>(
    initialOfferId || initialProductType ? 'credito' : 'cuentas'
  );

  // Formulario Solicitud de Crédito
  const [selectedProductType, setSelectedProductType] = useState<CommercialLoanType>(initialProductType || 'capital_trabajo');
  const [loanAmount, setLoanAmount] = useState<number>(initialAmount || 500000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(initialTermMonths || 24);
  const [loanPurpose, setLoanPurpose] = useState<string>('Capital operativo de compras');
  const [loanGraceMonths, setLoanGraceMonths] = useState<number>(0);
  const [selectedCollateralIds, setSelectedCollateralIds] = useState<string[]>(initialCollateralIds || []);
  const [currentOfferId, setCurrentOfferId] = useState<string | undefined>(initialOfferId);
  const [destinationBankForLoan, setDestinationBankForLoan] = useState<CommercialBankId>(initialBankId || 'atlantida');
  const [loanDestinationType, setLoanDestinationType] = useState<'checking' | 'cash'>('checking');

  // Sincronizar con props iniciales si cambian (por ejemplo al pulsar "Ver condiciones" en un correo)
  React.useEffect(() => {
    if (initialBankId) {
      setSelectedBankId(initialBankId);
      setDestinationBankForLoan(initialBankId);
    }
    if (initialProductType) {
      setSelectedProductType(initialProductType);
      setActiveTab('credito');
    }
    if (initialAmount) setLoanAmount(initialAmount);
    if (initialTermMonths) setLoanTermMonths(initialTermMonths);
    if (initialOfferId !== undefined) setCurrentOfferId(initialOfferId);
    if (initialCollateralIds) setSelectedCollateralIds(initialCollateralIds);
  }, [initialBankId, initialProductType, initialAmount, initialTermMonths, initialOfferId, initialCollateralIds]);

  // Modal de Divulgación y Confirmación de Desembolso
  const [disclosureModalOpen, setDisclosureModalOpen] = useState<boolean>(false);
  const [currentDisclosure, setCurrentDisclosure] = useState<CreditTermsDisclosure | null>(null);
  const [isDisbursing, setIsDisbursing] = useState<boolean>(false);

  // Formulario de Pagos Flexibles de Préstamo
  const [flexiblePaymentModalOpen, setFlexiblePaymentModalOpen] = useState<boolean>(false);
  const [flexiblePaymentType, setFlexiblePaymentType] = useState<'cuota_mensual' | 'varias_cuotas' | 'pago_parcial' | 'abono_capital' | 'cancelacion_total'>('cuota_mensual');
  const [flexiblePaymentAmount, setFlexiblePaymentAmount] = useState<number>(0);
  const [flexiblePaymentSource, setFlexiblePaymentSource] = useState<'checking' | 'cash'>('checking');
  const [flexiblePaymentStrategy, setFlexiblePaymentStrategy] = useState<'reducir_cuota' | 'reducir_plazo'>('reducir_plazo');
  const [numInstallmentsToPay, setNumInstallmentsToPay] = useState<number>(2);

  // Formulario Transferencia entre Cuentas Propias
  const [transferFromBank, setTransferFromBank] = useState<CommercialBankId>('atlantida');
  const [transferToBank, setTransferToBank] = useState<CommercialBankId>('ficohsa');
  const [transferAmount, setTransferAmount] = useState<number>(50000);

  // Formulario Depósitos y Retiros
  const [cashOpAmount, setCashOpAmount] = useState<number>(25000);

  // Formulario DPF
  const [dpfAmount, setDpfAmount] = useState<number>(100000);
  const [dpfDays, setDpfDays] = useState<number>(90);

  // Formulario Nueva Garantía
  const [newAssetModalOpen, setNewAssetModalOpen] = useState<boolean>(false);
  const [newAssetTitle, setNewAssetTitle] = useState<string>('');
  const [newAssetType, setNewAssetType] = useState<'edificio' | 'edificio_corporativo' | 'casa_habitacion' | 'terreno_comercial' | 'local_bodega' | 'planta_industrial' | 'vehiculo_comercial' | 'maquinaria_pesada'>('edificio');
  const [newAssetLocation, setNewAssetLocation] = useState<string>('Tegucigalpa, M.D.C.');
  const [newAssetCost, setNewAssetCost] = useState<number>(1500000);
  const [newAssetDesc, setNewAssetDesc] = useState<string>('');

  // Estados para compras y pagos de Tarjeta de Crédito Corporativa
  const [cardChargeAmount, setCardChargeAmount] = useState<number>(5000);
  const [cardChargeConcept, setCardChargeConcept] = useState<string>('Compra de Insumos y Mercadería');
  const [cardPaymentAmount, setCardPaymentAmount] = useState<number>(0);
  const [cardPaymentSource, setCardPaymentSource] = useState<'checking' | 'cash'>('checking');

  // Asesor Bancario
  const [advisorTopic, setAdvisorTopic] = useState<BankAdvisorTopic>('negociar_tasa');
  const [advisorTargetRate, setAdvisorTargetRate] = useState<number>(9.5);
  const [advisorConversation, setAdvisorConversation] = useState<BankAdvisorConsultation[]>([]);

  const bankProfile = COMMERCIAL_BANKS_PROFILES[selectedBankId];
  const relationship = state.commercialBanks[selectedBankId] || {
    bankId: selectedBankId,
    relationshipScore: 50,
    guaranteeDeposits: [],
    termDeposits: []
  };

  const checkingAcc = relationship.checkingAccount;
  const activeLoan = relationship.activeLoan;
  const corporateCard = relationship.corporateCard;
  const capacity = evaluateContractorEconomicCapacity(state);

  // Garantías reales: usar únicamente activos persistidos pertenecientes al prestatario (Requisito 5)
  const collaterals = state.realEstateCollaterals || [];

  const activeOffer = React.useMemo(() => {
    if (!currentOfferId) return undefined;
    return (state.dynamicBankOffers || []).find(o => o.id === currentOfferId)
      || (state.simulatedEmails || []).find(e => e.bankOfferPayload?.id === currentOfferId)?.bankOfferPayload;
  }, [currentOfferId, state.dynamicBankOffers, state.simulatedEmails]);

  // Evaluación en tiempo real de los términos del crédito (Requisito 5 y 6)
  const liveDisclosure = React.useMemo(() => {
    const customTerms = activeOffer ? {
      rateAnnualPct: activeOffer.annualRatePct ?? activeOffer.interestRateAnnual,
      openingFeePct: activeOffer.openingFeePct,
      offerId: activeOffer.id
    } : undefined;

    return calculateCreditTermsDisclosure(
      state,
      selectedBankId,
      selectedProductType,
      loanAmount,
      loanTermMonths,
      loanGraceMonths,
      selectedCollateralIds,
      customTerms
    );
  }, [state, selectedBankId, selectedProductType, loanAmount, loanTermMonths, loanGraceMonths, selectedCollateralIds, activeOffer]);

  // Manejo de Solicitud de Desembolso
  const handleOpenDisclosureModal = () => {
    sound.playClick();
    setCurrentDisclosure(liveDisclosure);
    setDestinationBankForLoan(selectedBankId);
    setDisclosureModalOpen(true);
  };

  const handleConfirmDisbursement = () => {
    if (isDisbursing) return; // Protección anti doble clic
    setIsDisbursing(true);
    sound.playApprovalStamp();

    if (onRequestFullCredit) {
      onRequestFullCredit(
        selectedBankId,
        selectedProductType,
        loanAmount,
        loanTermMonths,
        loanPurpose,
        loanGraceMonths,
        selectedCollateralIds,
        destinationBankForLoan,
        loanDestinationType,
        currentOfferId
      );
    } else {
      onRequestLoan(selectedBankId, loanAmount, loanTermMonths, loanPurpose);
    }

    setDisclosureModalOpen(false);
    setIsDisbursing(false);
  };

  // Manejo de Pago Flexible
  const handleOpenFlexiblePaymentModal = () => {
    if (!activeLoan) return;
    sound.playClick();
    setFlexiblePaymentType('cuota_mensual');
    setFlexiblePaymentAmount(activeLoan.monthlyPayment);
    setFlexiblePaymentModalOpen(true);
  };

  const handleConfirmFlexiblePayment = () => {
    if (!activeLoan || flexiblePaymentAmount <= 0) return;
    sound.playApprovalStamp();

    if (onExecuteFlexiblePayment) {
      onExecuteFlexiblePayment(
        selectedBankId,
        flexiblePaymentType,
        flexiblePaymentAmount,
        flexiblePaymentSource,
        flexiblePaymentStrategy,
        numInstallmentsToPay
      );
    } else if (onExtraordinaryPaymentWithOptions && flexiblePaymentType === 'abono_capital') {
      onExtraordinaryPaymentWithOptions(selectedBankId, flexiblePaymentAmount, flexiblePaymentStrategy);
    } else {
      onPayLoan(selectedBankId, flexiblePaymentAmount);
    }

    setFlexiblePaymentModalOpen(false);
  };

  // Manejo de Transferencia entre Cuentas
  const handleExecuteTransfer = () => {
    if (transferFromBank === transferToBank) {
      alert('La cuenta de origen y destino deben ser de bancos distintos.');
      return;
    }
    sound.playApprovalStamp();
    if (onTransferBetweenAccounts) {
      onTransferBetweenAccounts(transferFromBank, transferToBank, transferAmount);
    } else {
      alert('Transferencia ejecutada en el sistema.');
    }
  };

  // Manejo de Registro de Nuevo Activo
  const handleRegisterNewAsset = () => {
    if (!newAssetTitle.trim() || newAssetCost <= 0) {
      alert('Por favor completa el nombre y costo de adquisición del activo.');
      return;
    }
    sound.playApprovalStamp();
    if (onRegisterAssetAsCollateral) {
      onRegisterAssetAsCollateral({
        title: newAssetTitle,
        assetType: newAssetType,
        description: newAssetDesc || `Activo comercial incorporado en ${newAssetLocation}.`,
        location: newAssetLocation,
        acquisitionCost: newAssetCost
      });
    }
    setNewAssetModalOpen(false);
    setNewAssetTitle('');
    setNewAssetDesc('');
  };

  // Manejo de Asesor Bancario
  const handleConsultAdvisor = () => {
    sound.playClick();
    const result = consultBankAdvisor(state, selectedBankId, advisorTopic, advisorTargetRate);
    setAdvisorConversation(prev => [result, ...prev]);
    if (result.outcome === 'aceptado') {
      sound.playApprovalStamp();
      if (advisorTopic === 'negociar_tasa' && onNegotiateLoanRate) {
        onNegotiateLoanRate(selectedBankId, result.rateDiscountGrantedPct || 0);
      }
    } else {
      sound.playRejectBuzzer();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-slate-900 font-sans text-xs select-none">
      {/* Selector de Bancos Comerciales Competidores */}
      <div className="bg-[#dfdfdf] border-b-2 border-[#808080] p-1.5 flex items-center justify-between gap-1 overflow-x-auto">
        <div className="flex items-center gap-1">
          {(Object.keys(COMMERCIAL_BANKS_PROFILES) as CommercialBankId[]).map((bankKey) => {
            const b = COMMERCIAL_BANKS_PROFILES[bankKey];
            const isSelected = selectedBankId === bankKey;
            const hasLoan = !!state.commercialBanks[bankKey]?.activeLoan;
            const hasChecking = !!state.commercialBanks[bankKey]?.checkingAccount;

            return (
              <button
                key={bankKey}
                onClick={() => { sound.playClick(); setSelectedBankId(bankKey); }}
                className={`px-3 py-1.5 font-bold border-t border-l border-white border-b-2 border-r-2 flex items-center gap-1.5 cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-white border-[#404040] shadow-sm text-slate-950 font-black'
                    : 'bg-[#d0d0d0] border-[#808080] text-slate-700 hover:bg-[#e0e0e0]'
                }`}
              >
                <span>{b.logo}</span>
                <span>{b.shortName}</span>
                {hasLoan && <span className="w-2 h-2 rounded-full bg-rose-600" title="Préstamo Activo" />}
                {hasChecking && <span className="w-2 h-2 rounded-full bg-emerald-600" title="Cuenta Abierta" />}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono pr-2">
          <span>Score: <strong className="text-blue-900">{capacity.creditRating} ({capacity.creditProfile.score} pts)</strong></span>
          <span>Bancos Activos: <strong>4/4</strong></span>
        </div>
      </div>

      {/* Cabecera del Banco Seleccionado */}
      <div 
        className="px-3 py-2 text-white flex justify-between items-center shadow-xs"
        style={{ backgroundColor: bankProfile.colorHex }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{bankProfile.logo}</span>
          <div>
            <h3 className="font-black text-sm tracking-wide">{bankProfile.name}</h3>
            <p className="text-[10px] text-white/90">{bankProfile.tagline}</p>
          </div>
        </div>

        <div className="text-right text-[11px]">
          <div>Relación Comercial: <strong>{relationship.relationshipScore}%</strong></div>
          <div>Tasa Préstamo Base: <strong>{bankProfile.baseInterestRateLoan}% anual</strong></div>
        </div>
      </div>

      {/* Pestañas de Servicios Financieros */}
      <div className="bg-[#e8e8e8] border-b border-[#808080] px-2 pt-1 flex items-center gap-1 text-xs">
        <button
          onClick={() => { sound.playClick(); setActiveTab('cuentas'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-0 cursor-pointer ${
            activeTab === 'cuentas' ? 'bg-white text-blue-950 border-slate-400' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏦 Cuentas & Depósitos
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('credito'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-0 cursor-pointer ${
            activeTab === 'credito' ? 'bg-white text-blue-950 border-slate-400' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          💰 Créditos Comerciales
          {activeLoan && <span className="ml-1 text-rose-700">●</span>}
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('tarjeta'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-0 cursor-pointer ${
            activeTab === 'tarjeta' ? 'bg-white text-blue-950 border-slate-400' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          💳 Tarjetas Corporativas
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('dpf'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-0 cursor-pointer ${
            activeTab === 'dpf' ? 'bg-white text-blue-950 border-slate-400' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          📈 DPF & Inversiones
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('garantias'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-0 cursor-pointer ${
            activeTab === 'garantias' ? 'bg-white text-blue-950 border-slate-400' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          🛡️ Garantías Reales
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('transferencias'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-0 cursor-pointer ${
            activeTab === 'transferencias' ? 'bg-white text-blue-950 border-slate-400' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          🔄 Transferencias Propias
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveTab('asesor'); }}
          className={`px-3 py-1 font-bold border-t border-l border-white border-b-0 cursor-pointer ${
            activeTab === 'asesor' ? 'bg-white text-blue-950 border-slate-400' : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          👔 Asesor de Crédito
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {/* ========================================================= */}
        {/* TAB 1: CUENTAS DE CHEQUES, DEPÓSITOS Y RETIROS             */}
        {/* ========================================================= */}
        {activeTab === 'cuentas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Estado de la Cuenta Corriente */}
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-2">
              <div className="flex justify-between items-start border-b pb-1">
                <div>
                  <h4 className="font-bold text-slate-900">CUENTA DE CHEQUES EMPRESARIAL</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {checkingAcc ? checkingAcc.accountNumber : 'Sin cuenta activa'}
                  </p>
                </div>
                <span className="text-xl">🏛️</span>
              </div>

              {checkingAcc ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">Saldo Disponible:</span>
                    <strong className="text-blue-950 font-mono text-base">{formatHNLAmount(checkingAcc.balance)}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                    <div>Rendimiento: <strong>{checkingAcc.interestRateYieldPct}% anual</strong></div>
                    <div>Comisión Mensual: <strong>L {checkingAcc.monthlyFeeHNL}</strong></div>
                  </div>

                  {/* Operaciones de Caja Chica / Depósito con CustomAmountInput */}
                  <div className="border-t pt-2 space-y-2">
                    <CustomAmountInput
                      label="Monto para Operación de Cuenta:"
                      value={cashOpAmount}
                      onChange={setCashOpAmount}
                      availableBalance={checkingAcc.balance}
                      minAllowed={10}
                      operationType="generico"
                      helpText="Escribe cualquier monto para retirar a caja chica o depositar efectivo."
                    />

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          if (onWithdrawCash) onWithdrawCash(selectedBankId, cashOpAmount);
                        }}
                        disabled={cashOpAmount <= 0 || cashOpAmount > checkingAcc.balance}
                        className="py-1.5 px-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-xs border border-amber-800 shadow-sm cursor-pointer active:scale-95"
                      >
                        Retirar a Caja Chica ➔
                      </button>

                      <button
                        onClick={() => {
                          if (onDepositCash) onDepositCash(selectedBankId, cashOpAmount);
                        }}
                        disabled={cashOpAmount <= 0 || cashOpAmount > state.storeCash}
                        className="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs border border-emerald-900 shadow-sm cursor-pointer active:scale-95"
                      >
                        Depositar Efectivo de Caja 📥
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center space-y-2 bg-slate-50">
                  <p className="text-slate-600 text-xs">
                    No mantienes cuenta corriente abierta en {bankProfile.name}.
                  </p>
                  <button
                    onClick={() => onOpenChecking(selectedBankId, 15000)}
                    className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                  >
                    Abrir Cuenta Corriente (Apertura: L 15,000)
                  </button>
                </div>
              )}
            </div>

            {/* Resumen Global de Cuentas y Liquidez de la Empresa */}
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-2">
              <h4 className="font-bold text-slate-900 border-b pb-1">
                RESUMEN DE LIQUIDEZ Y CUENTAS EMPRESARIALES
              </h4>

              <div className="space-y-1.5 text-xs">
                {(Object.keys(COMMERCIAL_BANKS_PROFILES) as CommercialBankId[]).map((bKey) => {
                  const b = COMMERCIAL_BANKS_PROFILES[bKey];
                  const rel = state.commercialBanks[bKey];
                  const chk = rel?.checkingAccount;

                  return (
                    <div 
                      key={bKey}
                      className="p-1.5 border border-slate-200 bg-slate-50 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{b.logo}</span>
                        <span className="font-bold text-slate-800">{b.shortName}:</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {chk ? formatHNLAmount(chk.balance) : <span className="text-slate-400 font-normal">Sin cuenta</span>}
                      </span>
                    </div>
                  );
                })}

                <div className="pt-2 border-t flex justify-between items-center bg-blue-50/50 p-2 font-bold">
                  <span className="text-slate-800">Total en Cuentas Bancarias:</span>
                  <span className="font-mono text-blue-950 text-sm">{formatHNLAmount(state.storeBankBalance)}</span>
                </div>

                <div className="flex justify-between items-center p-2 font-bold text-slate-700">
                  <span>Efectivo en Caja Chica:</span>
                  <span className="font-mono text-emerald-800">{formatHNLAmount(state.storeCash)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CRÉDITOS COMERCIALES & FINANCIAMIENTO               */}
        {/* ========================================================= */}
        {activeTab === 'credito' && (
          <div className="space-y-3">
            {/* Préstamo Activo Vigente */}
            {activeLoan ? (
              <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-3">
                <div className="flex justify-between items-start border-b pb-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 border border-rose-200 rounded">
                      CRÉDITO ACTIVO VIGENTE
                    </span>
                    <h4 className="font-black text-sm text-slate-900 mt-0.5">
                      {activeLoan.purpose}
                    </h4>
                  </div>
                  <span className="font-mono text-xs text-slate-500">ID: {activeLoan.id}</span>
                </div>

                {/* Grid de Estado del Préstamo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 border border-slate-300 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Saldo Deudor Insoluto:</span>
                    <strong className="text-rose-900 font-mono text-base">{formatHNLAmount(activeLoan.balanceRemaining)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cuota Mensual:</span>
                    <strong className="text-slate-900 font-mono text-sm">{formatHNLAmount(activeLoan.monthlyPayment)}/mes</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tasa Pactada:</span>
                    <strong className="text-blue-900 font-mono text-sm">{activeLoan.interestRateAnnual}% anual</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Plazo Restante:</span>
                    <strong className="text-slate-800 font-mono text-sm">{activeLoan.termMonthsRemaining} meses</strong>
                  </div>
                </div>

                {/* Acciones de Pago Flexible */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={handleOpenFlexiblePaymentModal}
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    <span>💳</span>
                    <span>Pagar Cuota o Abonar a Capital</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario de Solicitud de Nuevo Crédito */
              <div className="bg-white border-2 border-[#808080] p-4 shadow-inner space-y-4">
                <div className="border-b pb-2 flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm text-slate-900 uppercase">
                      SOLICITUD DE FINANCIAMIENTO COMERCIAL: {bankProfile.name}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Capacidad de endeudamiento evaluada: <strong>{formatHNLAmount(capacity.maxBorrowingCapacity)}</strong>
                    </p>
                  </div>
                  <span className="text-2xl">{bankProfile.logo}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector de Producto */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Línea de Financiamiento:</label>
                    <select
                      value={selectedProductType}
                      onChange={(e) => setSelectedProductType(e.target.value as CommercialLoanType)}
                      className="w-full p-1.5 border border-slate-400 bg-white font-bold text-xs"
                    >
                      {Object.values(COMMERCIAL_LOAN_PRODUCTS).map(p => {
                        const calculatedRate = (bankProfile.baseInterestRateLoan + p.rateSpreadPct).toFixed(1);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.minTermMonths}-{p.maxTermMonths}m) · Tasa est: {calculatedRate}%
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Plazo en Meses */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Plazo de Pago (Meses):</label>
                    <input
                      type="number"
                      min={6}
                      max={120}
                      step={6}
                      value={loanTermMonths}
                      onChange={(e) => setLoanTermMonths(Math.max(6, Number(e.target.value)))}
                      className="w-full p-1.5 border border-slate-400 font-mono font-bold text-xs"
                    />
                  </div>

                  {/* Monto con CustomAmountInput */}
                  <div className="md:col-span-2">
                    <CustomAmountInput
                      label="Monto de Financiamiento Solicitado (HNL):"
                      value={loanAmount}
                      onChange={setLoanAmount}
                      maxAllowed={Math.max(capacity.maxBorrowingCapacity, liveDisclosure.collateralBackedMaxHNL, 150000000)}
                      minAllowed={50000}
                      operationType="prestamo"
                      helpText={`Capacidad de financiamiento contable con respaldo de garantías al 80%: hasta ${formatHNLAmount(Math.max(capacity.maxBorrowingCapacity, liveDisclosure.collateralBackedMaxHNL, 150000000))}.`}
                    />
                  </div>

                  {/* Propósito del Crédito */}
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Destino Comercial de los Fondos:</label>
                    <input
                      type="text"
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      placeholder="Ej. Inversión en insumos y suministros de obra"
                      className="w-full p-1.5 border border-slate-400 font-sans text-xs"
                    />
                  </div>

                  {/* Garantías Reales de Respaldo - Selección Múltiple (Requisito 5) */}
                  <div className="md:col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-slate-700">
                        Garantías Reales a Pignorar (Selección Múltiple sin duplicar cobertura):
                      </label>
                      <span className="text-[11px] font-mono text-slate-600">
                        Seleccionadas: {selectedCollateralIds.length} · Cobertura conjunta: <strong>{formatHNLAmount(liveDisclosure.collateralCoverageProvidedHNL)}</strong>
                      </span>
                    </div>

                    {collaterals.length === 0 ? (
                      <div className="p-2.5 bg-slate-50 border border-slate-300 text-slate-600 text-xs italic">
                        No mantienes bienes inmuebles ni maquinaria registrados en tu balance para pignorar como garantía hipotecaria/prendaria. 
                        El financiamiento se evaluará bajo la modalidad sin garantía real (fianza solidaria). Puedes registrar activos propios en la pestaña "Garantías Reales".
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-300 p-2 bg-slate-50">
                        {collaterals.map(col => {
                          const isSelected = selectedCollateralIds.includes(col.id);
                          const isUnavailable = col.availableCoverageHNL <= 0 && !isSelected;

                          return (
                            <label
                              key={col.id}
                              className={`p-2 border flex items-start gap-2 cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500' 
                                  : isUnavailable 
                                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                                    : 'bg-white border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isUnavailable}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCollateralIds(prev => [...prev, col.id]);
                                  } else {
                                    setSelectedCollateralIds(prev => prev.filter(id => id !== col.id));
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <div className="text-xs leading-tight flex-1">
                                <div className="font-bold text-slate-900 flex justify-between">
                                  <span>{col.title}</span>
                                  <span className="font-mono text-blue-900">{formatHNLAmount(col.availableCoverageHNL)} disp.</span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Avalúo: {formatHNLAmount(col.appraisalValueHNL)} · LTV: {col.ltvAcceptedPct}% · Gravámenes: {formatHNLAmount(col.pledgedAmountTotal || 0)}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Oferta pre-aprobada vinculada si aplica */}
                {currentOfferId && (
                  <div className="bg-amber-50 border border-amber-300 p-2 text-xs flex justify-between items-center text-amber-950">
                    <div>
                      <span className="font-bold">🏷️ Oferta Pre-aprobada Vinculada: </span>
                      <span className="font-mono">{currentOfferId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentOfferId(undefined)}
                      className="text-[11px] underline text-amber-900 hover:text-red-700 cursor-pointer font-semibold"
                    >
                      Desvincular oferta
                    </button>
                  </div>
                )}

                {/* Cuadro Explicativo del Monto Aprobado y Límites de Riesgo (Requisito 6) */}
                <div className="bg-slate-50 border-2 border-blue-900/40 p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                    <h5 className="font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span>📊</span>
                      <span>Determinación del Monto Aprobado y Evaluación de Riesgo</span>
                    </h5>
                    <span className="text-[10px] text-slate-500 font-mono">Normativa de Crédito CNBS</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 border border-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">1. Monto Solicitado:</span>
                      <strong className="font-mono text-slate-900">{formatHNLAmount(loanAmount)}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">2. Máximo sin Garantía:</span>
                      <strong className="font-mono text-slate-800">{formatHNLAmount(liveDisclosure.unsecuredLimitHNL)}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">3. Cobertura Aportada:</span>
                      <strong className="font-mono text-blue-900">{formatHNLAmount(liveDisclosure.collateralCoverageProvidedHNL)}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">4. Máximo por Garantías:</span>
                      <strong className="font-mono text-indigo-900">{formatHNLAmount(liveDisclosure.collateralBackedMaxHNL)}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">5. Máximo por Capacidad de Pago:</span>
                      <strong className="font-mono text-slate-800">{formatHNLAmount(liveDisclosure.paymentCapacityMaxHNL)}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100 bg-blue-50/70 px-1">
                      <span className="text-blue-950 font-bold">6. Máximo Final Aprobado:</span>
                      <strong className="font-mono text-blue-950 font-black">{formatHNLAmount(liveDisclosure.finalMaxApprovedHNL)}</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">7. Cuota Mensual Estimada:</span>
                      <strong className="font-mono text-slate-900">{formatHNLAmount(liveDisclosure.monthlyPaymentHNL)} / mes</strong>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-medium">Tasa Anual Efectiva:</span>
                      <strong className="font-mono text-slate-900">{liveDisclosure.effectiveInterestRateAnnual}% anual</strong>
                    </div>
                  </div>

                  {/* Fila 8: Motivo explicativo detallado */}
                  <div className="p-2 rounded bg-amber-50 border border-amber-300 text-amber-950 text-[11px] flex items-start gap-2">
                    <span className="text-sm">ℹ️</span>
                    <div>
                      <span className="font-bold">Motivo del Límite: </span>
                      <span>{liveDisclosure.limitReasonExplanation}</span>
                    </div>
                  </div>

                  {loanAmount > liveDisclosure.finalMaxApprovedHNL && (
                    <div className="flex justify-between items-center bg-rose-50 border border-rose-300 p-2 text-rose-900 text-xs">
                      <span>El monto solicitado excede el cupo aprobado de {formatHNLAmount(liveDisclosure.finalMaxApprovedHNL)}.</span>
                      <button
                        type="button"
                        onClick={() => setLoanAmount(liveDisclosure.finalMaxApprovedHNL)}
                        className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] cursor-pointer shadow-xs active:scale-95"
                      >
                        Ajustar a {formatHNLAmount(liveDisclosure.finalMaxApprovedHNL)}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-end">
                  <button
                    onClick={handleOpenDisclosureModal}
                    disabled={loanAmount <= 0}
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                  >
                    Revisar Condiciones y Solicitar Desembolso ➔
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TARJETAS DE CRÉDITO CORPORATIVAS                    */}
        {/* ========================================================= */}
        {activeTab === 'tarjeta' && (
          <div className="space-y-3">
            {corporateCard ? (
              <div className="bg-white border-2 border-[#808080] p-4 shadow-inner space-y-3">
                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">{corporateCard.brand}</span>
                    <h4 className="font-black text-sm text-slate-900">{corporateCard.cardNumber || `•••• •••• •••• ${corporateCard.cardId.slice(-4).toUpperCase()}`}</h4>
                  </div>
                  <span className="text-2xl">💳</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 border text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Límite Autorizado:</span>
                    <strong className="text-blue-950 font-mono">{formatHNLAmount(corporateCard.creditLimit)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Saldo al Corte:</span>
                    <strong className="text-rose-900 font-mono">{formatHNLAmount(corporateCard.currentBalance)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Disponible:</span>
                    <strong className="text-emerald-800 font-mono">{formatHNLAmount(corporateCard.availableCredit ?? Math.max(0, corporateCard.creditLimit - corporateCard.currentBalance))}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Puntos Acumulados:</span>
                    <strong className="text-amber-800 font-mono">{corporateCard.rewardPoints || 0} pts</strong>
                  </div>
                </div>

                {/* 1. SECCIÓN DE CONSUMOS / GASTOS CON TARJETA */}
                {(() => {
                  const availableCredit = corporateCard.availableCredit ?? Math.max(0, corporateCard.creditLimit - corporateCard.currentBalance);
                  return (
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="font-bold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                          <span>💳</span> Realizar Gastos / Consumos con Tarjeta (Crédito Revolvente)
                        </h5>
                        <span className="text-[11px] font-mono font-bold text-emerald-800">
                          Disponible para gastar: {formatHNLAmount(availableCredit)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Concepto del Gasto / Compra:</label>
                          <select
                            value={cardChargeConcept}
                            onChange={(e) => setCardChargeConcept(e.target.value)}
                            className="w-full p-1.5 border border-slate-400 bg-white text-xs font-semibold"
                          >
                            <option value="Compra de Insumos y Mercadería">Compra de Insumos y Mercadería</option>
                            <option value="Combustible y Mantenimiento de Flota">Combustible y Mantenimiento de Flota</option>
                            <option value="Equipamiento de Obra y Maquinaria">Equipamiento de Obra y Maquinaria</option>
                            <option value="Servicios Operativos y Telecomunicaciones">Servicios Operativos y Telecomunicaciones</option>
                            <option value="Viáticos y Representación Comercial">Viáticos y Representación Comercial</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Monto a Cargar (HNL):</label>
                          <input
                            type="number"
                            min={100}
                            max={availableCredit}
                            step={500}
                            value={cardChargeAmount}
                            onChange={(e) => setCardChargeAmount(Math.max(0, Math.min(availableCredit, Number(e.target.value))))}
                            className="w-full p-1.5 border border-slate-400 font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      {/* Botones de montos rápidos */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="text-slate-500 font-bold">Carga rápida:</span>
                        {[2000, 5000, 15000, 50000].map((quick) => (
                          quick <= availableCredit && (
                            <button
                              key={quick}
                              type="button"
                              onClick={() => { sound.playClick(); setCardChargeAmount(quick); }}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-800 cursor-pointer"
                            >
                              +{formatHNLAmount(quick)}
                            </button>
                          )
                        ))}
                        {availableCredit > 0 && (
                          <button
                            type="button"
                            onClick={() => { sound.playClick(); setCardChargeAmount(availableCredit); }}
                            className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded text-blue-900 font-bold cursor-pointer"
                          >
                            Todo Disponible
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={availableCredit <= 0 || cardChargeAmount <= 0 || cardChargeAmount > availableCredit}
                        onClick={() => {
                          if (onChargeCard) {
                            sound.playCashChime();
                            onChargeCard(selectedBankId, cardChargeAmount, cardChargeConcept);
                          }
                        }}
                        className="w-full py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold text-xs border border-blue-950 shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>💳</span>
                        <span>
                          {availableCredit <= 0 
                            ? 'Límite Agotado - Efectúa un pago para liberar saldo' 
                            : `Procesar Compra con Tarjeta (${formatHNLAmount(cardChargeAmount)})`}
                        </span>
                      </button>
                    </div>
                  );
                })()}

                {/* 2. SECCIÓN DE PAGOS Y LIBERACIÓN DE CUPO REVOLVENTE */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                      <span>💵</span> Pagar y Restituir Cupo de Tarjeta de Crédito
                    </h5>
                    <span className="text-[11px] font-mono font-bold text-rose-800">
                      Deuda actual: {formatHNLAmount(corporateCard.currentBalance)}
                    </span>
                  </div>

                  {corporateCard.currentBalance <= 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                      <span>✅</span>
                      <span>Tu tarjeta corporativa se encuentra al día con saldo L 0.00 pendiente. ¡Cupo 100% disponible!</span>
                    </div>
                  ) : (
                    <div className="space-y-2 bg-slate-50 p-2.5 border border-slate-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Origen de Fondos para el Pago:</label>
                          <select
                            value={cardPaymentSource}
                            onChange={(e) => setCardPaymentSource(e.target.value as 'checking' | 'cash')}
                            className="w-full p-1.5 border border-slate-400 bg-white text-xs font-semibold"
                          >
                            <option value="checking">Cuenta Bancaria ({formatHNLAmount(state.storeBankBalance)})</option>
                            <option value="cash">Caja Chica en Efectivo ({formatHNLAmount(state.storeCash)})</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Monto a Abonar (HNL):</label>
                          <input
                            type="number"
                            min={1}
                            max={corporateCard.currentBalance}
                            step={100}
                            value={cardPaymentAmount > 0 ? cardPaymentAmount : corporateCard.currentBalance}
                            onChange={(e) => setCardPaymentAmount(Math.max(0, Math.min(corporateCard.currentBalance, Number(e.target.value))))}
                            className="w-full p-1.5 border border-slate-400 font-mono font-bold text-xs"
                          />
                        </div>
                      </div>

                      {/* Botones de pago rápido */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setCardPaymentAmount(corporateCard.currentBalance);
                          }}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 font-bold text-[11px] rounded cursor-pointer"
                        >
                          Pago Total: {formatHNLAmount(corporateCard.currentBalance)}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setCardPaymentAmount(corporateCard.minPaymentMonthly || Math.round(corporateCard.currentBalance * 0.05));
                          }}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-[11px] rounded cursor-pointer"
                        >
                          Pago Mínimo: {formatHNLAmount(corporateCard.minPaymentMonthly || Math.round(corporateCard.currentBalance * 0.05))}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const toPay = cardPaymentAmount > 0 ? cardPaymentAmount : corporateCard.currentBalance;
                          sound.playApprovalStamp();
                          onPayCard(selectedBankId, toPay);
                          setCardPaymentAmount(0);
                        }}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-950 shadow-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>💵</span>
                        <span>
                          Efectuar Pago a Tarjeta ({formatHNLAmount(cardPaymentAmount > 0 ? cardPaymentAmount : corporateCard.currentBalance)})
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-[#808080] p-4 text-center space-y-3 shadow-inner">
                <h4 className="font-black text-sm text-slate-900">TARJETAS DE CRÉDITO EMPRESARIALES {bankProfile.name}</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Gestiona viáticos, compras de insumos, materiales y combustible con acumulación de cashback en cada transacción.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  {Object.values(CORPORATE_CARD_TIERS).map(tier => (
                    <div key={tier.tierId} className="border border-slate-300 p-2.5 bg-slate-50 space-y-1 text-xs">
                      <div className="font-bold text-slate-900">{tier.name}</div>
                      <div className="text-[11px] text-blue-900 font-semibold">{tier.cashbackPct}% Cashback</div>
                      <div className="text-[10px] text-slate-500">Tasa: {tier.interestRateAnnual}% anual</div>
                      <button
                        onClick={() => onRequestCard(selectedBankId, capacity.maxCorporateCardLimit)}
                        className="mt-2 w-full py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] border border-blue-950 cursor-pointer"
                      >
                        Solicitar ({formatHNLAmount(capacity.maxCorporateCardLimit)})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CERTIFICADOS DE DEPÓSITO A PLAZO FIJO (DPF)         */}
        {/* ========================================================= */}
        {activeTab === 'dpf' && (
          <div className="space-y-3">
            <div className="bg-white border-2 border-[#808080] p-4 shadow-inner space-y-3">
              <div className="flex justify-between items-start border-b pb-1">
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase">
                    DEPÓSITOS A PLAZO FIJO (DPF): {bankProfile.name}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Rentabiliza los excedentes de tesorería con tasa garantizada. Base: <strong>{bankProfile.baseDpfRate}% anual</strong>.
                  </p>
                </div>
                <span className="text-2xl">📈</span>
              </div>

              {/* Formulario Constitución DPF con CustomAmountInput */}
              <div className="space-y-3">
                <CustomAmountInput
                  label="Monto a Invertir en DPF (HNL):"
                  value={dpfAmount}
                  onChange={setDpfAmount}
                  availableBalance={checkingAcc?.balance ?? state.storeBankBalance}
                  minAllowed={25000}
                  operationType="inversion"
                  helpText="Se debitará de tu cuenta de cheques disponible."
                />

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">Plazo de Vencimiento:</label>
                  <select
                    value={dpfDays}
                    onChange={(e) => setDpfDays(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-400 bg-white font-bold text-xs"
                  >
                    <option value={30}>30 Días — Tasa {bankProfile.baseDpfRate}%</option>
                    <option value={90}>90 Días — Tasa {bankProfile.baseDpfRate + 0.5}% (+0.5% bonificación)</option>
                    <option value={180}>180 Días — Tasa {bankProfile.baseDpfRate + 0.8}% (+0.8% bonificación)</option>
                    <option value={360}>360 Días — Tasa {bankProfile.baseDpfRate + 1.2}% (+1.2% bonificación)</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => onOpenDpf(selectedBankId, dpfAmount, dpfDays)}
                    disabled={dpfAmount <= 0}
                    className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                  >
                    Constituir Certificado DPF 📈
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de DPFs Activos */}
            {(relationship.termDeposits || []).length > 0 && (
              <div className="bg-white border-2 border-[#808080] p-3 shadow-inner space-y-2">
                <h5 className="font-bold text-slate-800 text-xs border-b pb-1">CERTIFICADOS DPF ACTIVOS EN CUSTODIA</h5>
                <div className="space-y-2">
                  {relationship.termDeposits.map(dpf => (
                    <div key={dpf.id} className="p-2 border border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-900 block">{formatHNLAmount(dpf.currentBalance || dpf.principalAmount)}</strong>
                        <span className="text-[11px] text-slate-500">Tasa: {dpf.interestRateAnnual ?? dpf.effectiveRatePct ?? dpf.annualRatePct}% · Vence el día {dpf.maturesDay ?? (state.currentDay + (dpf.daysRemaining ?? 0))}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (onLiquidateDpf) onLiquidateDpf(selectedBankId, dpf.id, false);
                        }}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] border border-amber-800 cursor-pointer"
                      >
                        Liquidar Certificado
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: GARANTÍAS REALES (BIENES INMUEBLES & PRENDAS)       */}
        {/* ========================================================= */}
        {activeTab === 'garantias' && (
          <div className="space-y-3">
            <div className="bg-white border-2 border-[#808080] p-3 shadow-inner flex justify-between items-center">
              <div>
                <h4 className="font-black text-sm text-slate-900 uppercase">
                  INVENTARIO DE GARANTÍAS REALES REGISTRADAS
                </h4>
                <p className="text-[11px] text-slate-600">
                  Bienes residenciales, comerciales, industriales y maquinaria con cobertura LTV para créditos.
                </p>
              </div>

              <button
                onClick={() => setNewAssetModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-900 cursor-pointer shadow-sm active:scale-95 flex items-center gap-1"
              >
                <span>➕</span>
                <span>Registrar Nuevo Activo</span>
              </button>
            </div>

            {/* Tarjetas de Bienes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {collaterals.map(col => {
                const isLocked = col.isLockedForSale || col.isPledged;
                const statusColor = col.status === 'disponible' ? 'text-emerald-800 bg-emerald-100 border-emerald-300' : 'text-rose-900 bg-rose-100 border-rose-300';

                return (
                  <div key={col.id} className="bg-white border-2 border-[#808080] p-3 space-y-2 shadow-xs">
                    <div className="flex justify-between items-start border-b pb-1">
                      <div>
                        <h5 className="font-bold text-slate-900 text-xs">{col.title}</h5>
                        <p className="text-[10px] text-slate-500 font-mono">Matrícula: {col.registrationNumber}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${statusColor}`}>
                        {col.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-tight">
                      {col.description}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 border border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Valor de Avalúo:</span>
                        <strong className="text-slate-900 font-mono">{formatHNLAmount(col.appraisalValueHNL)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Cobertura LTV ({col.ltvAcceptedPct}%):</span>
                        <strong className="text-blue-900 font-mono">{formatHNLAmount(col.eligibleCollateralValueHNL)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Gravámenes Actuales:</span>
                        <strong className="text-rose-800 font-mono">{formatHNLAmount(col.pledgedAmountTotal || 0)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Disponible para Crédito:</span>
                        <strong className="text-emerald-800 font-mono">{formatHNLAmount(col.availableCoverageHNL)}</strong>
                      </div>
                    </div>

                    {isLocked && (
                      <div className="p-1.5 bg-amber-50 border border-amber-300 text-[10px] text-amber-900 flex items-center gap-1 font-semibold">
                        <span>🔒</span>
                        <span>Bloqueado para venta o enajenación por gravamen activo.</span>
                      </div>
                    )}

                    {/* Acciones de la Garantía */}
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          if (onRequestNewAppraisal) onRequestNewAppraisal(col.id);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] font-bold text-slate-700 cursor-pointer active:scale-95"
                      >
                        Solicitar Reavalúo (L 2,500) 📋
                      </button>

                      {col.isPledged && (
                        <button
                          onClick={() => {
                            if (onReleaseCollateral) onReleaseCollateral(col.id);
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] border border-emerald-900 cursor-pointer active:scale-95"
                        >
                          Liberar Gravamen 🔓
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: TRANSFERENCIAS ENTRE CUENTAS PROPIAS                */}
        {/* ========================================================= */}
        {activeTab === 'transferencias' && (
          <div className="max-w-xl mx-auto bg-white border-2 border-[#808080] p-4 shadow-inner space-y-4">
            <div className="border-b pb-2">
              <h4 className="font-black text-sm text-slate-900 uppercase">
                TRANSFERENCIA INTERBANCARIA ENTRE CUENTAS PROPIAS
              </h4>
              <p className="text-[11px] text-slate-600">
                Mueve fondos líquidos de forma instantánea entre tus cuentas bancarias de Ficohsa, Atlántida, BAC y Occidente.
              </p>
            </div>

            <div className="space-y-3">
              {/* Cuenta Origen */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Cuenta de Origen (Débito):</label>
                <select
                  value={transferFromBank}
                  onChange={(e) => setTransferFromBank(e.target.value as CommercialBankId)}
                  className="w-full p-2 border border-slate-400 bg-white font-bold text-xs"
                >
                  {(Object.keys(COMMERCIAL_BANKS_PROFILES) as CommercialBankId[]).map(bKey => {
                    const b = COMMERCIAL_BANKS_PROFILES[bKey];
                    const rel = state.commercialBanks[bKey];
                    const bal = rel?.checkingAccount?.balance || 0;
                    return (
                      <option key={bKey} value={bKey}>
                        {b.name} — Saldo Disponible: {formatHNLAmount(bal)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Cuenta Destino */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">Cuenta de Destino (Crédito):</label>
                <select
                  value={transferToBank}
                  onChange={(e) => setTransferToBank(e.target.value as CommercialBankId)}
                  className="w-full p-2 border border-slate-400 bg-white font-bold text-xs"
                >
                  {(Object.keys(COMMERCIAL_BANKS_PROFILES) as CommercialBankId[]).map(bKey => {
                    const b = COMMERCIAL_BANKS_PROFILES[bKey];
                    const rel = state.commercialBanks[bKey];
                    const bal = rel?.checkingAccount?.balance || 0;
                    return (
                      <option key={bKey} value={bKey} disabled={bKey === transferFromBank}>
                        {b.name} — Saldo Actual: {formatHNLAmount(bal)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Monto con CustomAmountInput */}
              <CustomAmountInput
                label="Monto a Transferir (HNL):"
                value={transferAmount}
                onChange={setTransferAmount}
                availableBalance={state.commercialBanks[transferFromBank]?.checkingAccount?.balance || 0}
                minAllowed={1}
                operationType="transferencia"
                helpText="Transferencia ACH inmediata sin comisión interbancaria."
              />

              <div className="pt-2 border-t flex justify-end">
                <button
                  onClick={handleExecuteTransfer}
                  disabled={transferAmount <= 0}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                >
                  Transferir Fondos Inmediatamente ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: ASESOR DE CRÉDITO INTERACTIVO                       */}
        {/* ========================================================= */}
        {activeTab === 'asesor' && (
          <div className="max-w-2xl mx-auto bg-white border-2 border-[#808080] p-4 shadow-inner space-y-3">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h4 className="font-black text-sm text-slate-900 uppercase">
                  MESA DE ASESORÍA Y NEGOCIACIÓN: {bankProfile.name}
                </h4>
                <p className="text-[11px] text-slate-600">
                  Plantea contrapropuestas al oficial de crédito empresarial para mejorar tasas o plazos.
                </p>
              </div>
              <span className="text-2xl">👔</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tema a Plantear:</label>
                <select
                  value={advisorTopic}
                  onChange={(e) => setAdvisorTopic(e.target.value as BankAdvisorTopic)}
                  className="w-full p-1.5 border border-slate-400 bg-white font-bold text-xs"
                >
                  <option value="negociar_tasa">Solicitar Descuento en Tasa de Interés</option>
                  <option value="negociar_plazo">Extender Plazo de Amortización</option>
                  <option value="periodo_gracia">Solicitar Periodo de Gracia a Capital</option>
                  <option value="exonerar_comision">Exonerar Comisión de Apertura</option>
                  <option value="mejorar_dpf">Mejorar Tasa de Captación en DPF</option>
                </select>
              </div>

              {advisorTopic === 'negociar_tasa' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tasa Anual Pretendida (%):</label>
                  <input
                    type="number"
                    step={0.1}
                    min={7.0}
                    max={15.0}
                    value={advisorTargetRate}
                    onChange={(e) => setAdvisorTargetRate(Number(e.target.value))}
                    className="w-full p-1.5 border border-slate-400 font-mono font-bold text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleConsultAdvisor}
                className="px-4 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
              >
                Presentar Planteamiento al Asesor 👔
              </button>
            </div>

            {/* Historial de Negociaciones */}
            <div className="border-t pt-3 space-y-2">
              <h5 className="font-bold text-slate-800 text-xs">DIÁLOGOS CON EL OFICIAL DE CRÉDITO:</h5>
              {advisorConversation.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">No has iniciado negociaciones recientes con este banco.</p>
              ) : (
                advisorConversation.map((c, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 border text-xs space-y-1 ${
                      c.outcome === 'aceptado' ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span className={c.outcome === 'aceptado' ? 'text-emerald-900' : c.outcome === 'contraoferta' ? 'text-amber-900' : 'text-rose-900'}>
                        {c.outcome === 'aceptado' ? '✓ PROPUESTA ACEPTADA' : c.outcome === 'contraoferta' ? '⚖ CONTRAOFERTA CONDICIONADA' : '✗ PROPUESTA RECHAZADA'}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">{c.officerName || c.bankName}</span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed italic">
                      {c.officerDialog || c.advisorResponseDialogue}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: DIVULGACIÓN Y CONFIRMACIÓN DE DESEMBOLSO         */}
      {/* ========================================================= */}
      {disclosureModalOpen && currentDisclosure && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#c0c0c0] border-2 border-white shadow-2xl max-w-lg w-full text-slate-900 font-sans p-1">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold px-2 py-1 flex justify-between items-center text-xs">
              <span>🏛️ Divulgación Previa de Crédito y Desembolso Neto</span>
              <button
                onClick={() => setDisclosureModalOpen(false)}
                className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-white/50"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-400 mt-1 space-y-3 text-xs">
              <div className="border-b pb-2">
                <h4 className="font-black text-sm text-slate-900">{currentDisclosure.productConfig.name}</h4>
                <p className="text-[11px] text-slate-600">Institución Acreedora: <strong>{bankProfile.name}</strong></p>
              </div>

              {/* Selector de Tipo de Cuenta de Destino y Banco (Requisito 3) */}
              <div className="bg-slate-50 p-2.5 border border-slate-300 space-y-2">
                <label className="block font-bold text-slate-800 text-xs">
                  Cuenta y Medio de Destino del Desembolso:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoanDestinationType('checking')}
                    className={`p-2 border text-left cursor-pointer rounded-xs text-xs ${
                      loanDestinationType === 'checking' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500 font-bold' : 'bg-white border-slate-300'
                    }`}
                  >
                    <span>🏦 Cuenta de Cheques</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Acreditar a cuenta bancaria</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoanDestinationType('cash')}
                    className={`p-2 border text-left cursor-pointer rounded-xs text-xs ${
                      loanDestinationType === 'cash' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500 font-bold' : 'bg-white border-slate-300'
                    }`}
                  >
                    <span>💵 Caja Chica de Empresa</span>
                    <span className="block text-[10px] text-slate-500 font-normal">Efectivo líquido directo</span>
                  </button>
                </div>

                {loanDestinationType === 'checking' && (
                  <div>
                    <label className="block font-semibold text-slate-700 text-[11px] mb-1">
                      Banco Destinatario:
                    </label>
                    <select
                      value={destinationBankForLoan}
                      onChange={(e) => setDestinationBankForLoan(e.target.value as CommercialBankId)}
                      className="w-full p-1.5 border border-slate-400 bg-white font-bold text-xs"
                    >
                      {(Object.keys(COMMERCIAL_BANKS_PROFILES) as CommercialBankId[]).map(bKey => {
                        const b = COMMERCIAL_BANKS_PROFILES[bKey];
                        const rel = state.commercialBanks[bKey];
                        const chk = rel?.checkingAccount;
                        return (
                          <option key={bKey} value={bKey}>
                            {b.name} — Cuenta Corriente {chk ? chk.accountNumber : '(Se abrirá automáticamente)'} | Saldo: {formatHNLAmount(chk?.balance || 0)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              {/* Desglose Monetario Claro */}
              <div className="space-y-1.5 border border-slate-300 p-2.5 bg-white">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-slate-600">Monto Aprobado Bruto:</span>
                  <span className="font-mono font-bold text-slate-900">{formatHNLAmount(currentDisclosure.approvedAmountHNL)}</span>
                </div>
                <div className="flex justify-between py-1 border-b text-rose-700">
                  <span>(-) Comisión de Apertura ({((currentDisclosure.openingFeeHNL / (currentDisclosure.approvedAmountHNL || 1)) * 100).toFixed(1)}%):</span>
                  <span className="font-mono font-bold">-{formatHNLAmount(currentDisclosure.openingFeeHNL)}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm font-black bg-blue-50/80 px-2 border border-blue-200 text-blue-950">
                  <span>DESEMBOLSO NETO A ACREDITAR:</span>
                  <span className="font-mono text-emerald-800">{formatHNLAmount(currentDisclosure.netDisbursementHNL)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Cuota Mensual Pactada:</span>
                  <span className="font-mono font-bold text-slate-900">{formatHNLAmount(currentDisclosure.monthlyPaymentHNL)}/mes</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic bg-amber-50 p-2 border border-amber-200">
                Al confirmar, el dinero neto se acreditará de forma inmediata en la cuenta seleccionada, sincronizando el saldo y emitiendo el comprobante oficial.
              </p>

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  onClick={() => setDisclosureModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDisbursement}
                  disabled={isDisbursing}
                  className="px-5 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                >
                  {isDisbursing ? 'Procesando Desembolso...' : 'Confirmar y Desembolsar ✍️'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PAGOS Y AMORTIZACIONES FLEXIBLES DE PRÉSTAMO      */}
      {/* ========================================================= */}
      {flexiblePaymentModalOpen && activeLoan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#c0c0c0] border-2 border-white shadow-2xl max-w-lg w-full text-slate-900 font-sans p-1">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold px-2 py-1 flex justify-between items-center text-xs">
              <span>💳 Liquidación & Pagos Flexibles de Crédito</span>
              <button
                onClick={() => setFlexiblePaymentModalOpen(false)}
                className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-white/50"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-400 mt-1 space-y-3 text-xs">
              <div>
                <h4 className="font-black text-sm text-slate-900">{activeLoan.purpose}</h4>
                <p className="text-[11px] text-slate-600">
                  Saldo Insoluto Actual: <strong className="text-rose-900 font-mono">{formatHNLAmount(activeLoan.balanceRemaining)}</strong> | Cuota: <strong className="font-mono">{formatHNLAmount(activeLoan.monthlyPayment)}</strong>
                </p>
              </div>

              {/* Selector de Tipo de Operación de Pago */}
              <div>
                <label className="block font-bold text-slate-800 text-xs mb-1">Tipo de Pago:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFlexiblePaymentType('cuota_mensual');
                      setFlexiblePaymentAmount(activeLoan.monthlyPayment);
                    }}
                    className={`p-2 border text-left cursor-pointer rounded-xs ${
                      flexiblePaymentType === 'cuota_mensual' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500' : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">1 Cuota Ordinaria</span>
                    <span className="text-[10px] text-slate-500">{formatHNLAmount(activeLoan.monthlyPayment)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFlexiblePaymentType('varias_cuotas');
                      setFlexiblePaymentAmount(activeLoan.monthlyPayment * numInstallmentsToPay);
                    }}
                    className={`p-2 border text-left cursor-pointer rounded-xs ${
                      flexiblePaymentType === 'varias_cuotas' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500' : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Varias Cuotas</span>
                    <span className="text-[10px] text-slate-500">{numInstallmentsToPay} cuotas adelantadas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFlexiblePaymentType('pago_parcial');
                      setFlexiblePaymentAmount(Math.round(activeLoan.monthlyPayment * 0.5));
                    }}
                    className={`p-2 border text-left cursor-pointer rounded-xs ${
                      flexiblePaymentType === 'pago_parcial' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500' : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Pago Parcial</span>
                    <span className="text-[10px] text-slate-500">Abono parcial al periodo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFlexiblePaymentType('abono_capital');
                      setFlexiblePaymentAmount(Math.min(activeLoan.balanceRemaining, 50000));
                    }}
                    className={`p-2 border text-left cursor-pointer rounded-xs ${
                      flexiblePaymentType === 'abono_capital' ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-500' : 'bg-white border-slate-300'
                    }`}
                  >
                    <span className="font-bold block">Abono a Capital</span>
                    <span className="text-[10px] text-slate-500">Amortización extraordinaria</span>
                  </button>
                </div>

                <div className="pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFlexiblePaymentType('cancelacion_total');
                      const accrued = Math.round(activeLoan.balanceRemaining * (activeLoan.interestRateAnnual / 100 / 12));
                      setFlexiblePaymentAmount(activeLoan.balanceRemaining + accrued);
                    }}
                    className={`w-full p-2 border text-left cursor-pointer rounded-xs ${
                      flexiblePaymentType === 'cancelacion_total' ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-500' : 'bg-white border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-black text-emerald-950 block">Cancelar Préstamo Totalmente</span>
                        <span className="text-[10px] text-slate-500">Liquidación al día de hoy sin intereses futuros no devengados</span>
                      </div>
                      <span className="text-emerald-800 font-mono font-bold text-sm">
                        {formatHNLAmount(activeLoan.balanceRemaining + Math.round(activeLoan.balanceRemaining * (activeLoan.interestRateAnnual / 100 / 12)))}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Si es abono a capital: selector de estrategia */}
              {flexiblePaymentType === 'abono_capital' && (
                <div className="bg-slate-50 p-2.5 border border-slate-300 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block">Efecto del Abono a Capital:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        checked={flexiblePaymentStrategy === 'reducir_plazo'}
                        onChange={() => setFlexiblePaymentStrategy('reducir_plazo')}
                      />
                      <span>Reducir Plazo (Meses)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="radio"
                        checked={flexiblePaymentStrategy === 'reducir_cuota'}
                        onChange={() => setFlexiblePaymentStrategy('reducir_cuota')}
                      />
                      <span>Reducir Cuota Mensual</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Cuenta de Cargo */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFlexiblePaymentSource('checking')}
                  className={`p-1.5 border text-left cursor-pointer ${
                    flexiblePaymentSource === 'checking' ? 'bg-blue-50 border-blue-600 font-bold' : 'bg-white border-slate-300'
                  }`}
                >
                  <span>Cuenta Bancaria: </span>
                  <span className="font-mono">{formatHNLAmount(checkingAcc?.balance ?? state.storeBankBalance)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlexiblePaymentSource('cash')}
                  className={`p-1.5 border text-left cursor-pointer ${
                    flexiblePaymentSource === 'cash' ? 'bg-blue-50 border-blue-600 font-bold' : 'bg-white border-slate-300'
                  }`}
                >
                  <span>Caja Chica: </span>
                  <span className="font-mono">{formatHNLAmount(state.storeCash)}</span>
                </button>
              </div>

              {/* Entrada de Monto con CustomAmountInput */}
              <CustomAmountInput
                label="Monto Exacto a Aplicar (HNL):"
                value={flexiblePaymentAmount}
                onChange={setFlexiblePaymentAmount}
                availableBalance={flexiblePaymentSource === 'checking' ? (checkingAcc?.balance ?? state.storeBankBalance) : state.storeCash}
                maxAllowed={activeLoan.balanceRemaining + Math.round(activeLoan.balanceRemaining * (activeLoan.interestRateAnnual / 100 / 12))}
                minAllowed={1}
                operationType="pago_cuota"
                helpText="Escribe cualquier monto personalizado con centavos o usa los porcentajes."
              />

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  onClick={() => setFlexiblePaymentModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmFlexiblePayment}
                  disabled={flexiblePaymentAmount <= 0}
                  className="px-5 py-1.5 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-400 text-white font-bold text-xs border border-blue-950 cursor-pointer shadow-sm active:scale-95"
                >
                  Confirmar Pago y Emitir Recibo 💳
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: REGISTRO DE NUEVA GARANTÍA REAL                   */}
      {/* ========================================================= */}
      {newAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-[#c0c0c0] border-2 border-white shadow-2xl max-w-md w-full text-slate-900 font-sans p-1">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold px-2 py-1 flex justify-between items-center text-xs">
              <span>🛡️ Registrar Nuevo Activo como Garantía</span>
              <button
                onClick={() => setNewAssetModalOpen(false)}
                className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center text-xs cursor-pointer border border-white/50"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-white border border-slate-400 mt-1 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre o Título del Activo:</label>
                <input
                  type="text"
                  value={newAssetTitle}
                  onChange={(e) => setNewAssetTitle(e.target.value)}
                  placeholder="Ej. Residencia en Lomas del Guijarro"
                  className="w-full p-1.5 border border-slate-400 font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Bien:</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value as any)}
                    className="w-full p-1.5 border border-slate-400 bg-white font-bold text-xs"
                  >
                    <option value="edificio">Edificio Comercial / Corporativo (80% LTV)</option>
                    <option value="casa_habitacion">Casa Habitación (80% LTV)</option>
                    <option value="terreno_comercial">Terreno Comercial (80% LTV)</option>
                    <option value="local_bodega">Local / Bodega (75% LTV)</option>
                    <option value="planta_industrial">Planta Industrial (75% LTV)</option>
                    <option value="maquinaria_pesada">Maquinaria Pesada (70% LTV)</option>
                    <option value="vehiculo_comercial">Vehículo Comercial (70% LTV)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ubicación:</label>
                  <input
                    type="text"
                    value={newAssetLocation}
                    onChange={(e) => setNewAssetLocation(e.target.value)}
                    placeholder="Ciudad o Plantel"
                    className="w-full p-1.5 border border-slate-400 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Costo de Adquisición / Valor Estimado (HNL):</label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  value={newAssetCost}
                  onChange={(e) => setNewAssetCost(Math.max(50000, Number(e.target.value)))}
                  className="w-full p-1.5 border border-slate-400 font-mono font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción Registral:</label>
                <textarea
                  rows={2}
                  value={newAssetDesc}
                  onChange={(e) => setNewAssetDesc(e.target.value)}
                  placeholder="Detalles sobre escrituración, linderos y estado físico..."
                  className="w-full p-1.5 border border-slate-400 text-xs"
                />
              </div>

              <div className="pt-2 border-t flex justify-end gap-2">
                <button
                  onClick={() => setNewAssetModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 border border-slate-400 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegisterNewAsset}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs border border-emerald-900 cursor-pointer shadow-sm active:scale-95"
                >
                  Registrar Activo 🛡️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
