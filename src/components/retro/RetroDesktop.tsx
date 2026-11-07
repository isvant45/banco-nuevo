import React, { useState } from 'react';
import { 
  DailySimulationState, 
  CommercialBankId,
  RetailSectorId, 
  RetroRoleMode,
  RetailCustomerWalkIn, 
  ConstructionMaterialId,
  CommercialLoanType,
  TransactionVoucher,
  SimulatedEmail,
  DynamicBankOffer
} from '../../game/retroSimTypes';
import { 
  SECTOR_DEFAULT_PRODUCTS, 
  serveRetailCustomer, 
  orderFromSupplier, 
  advanceRetailDay, 
  generateDailyStoreCustomers,
  DEFAULT_SMART_BANK_OFFERS,
  acceptSmartBankFacility,
  repaySmartBankFacility
} from '../../game/retailBusinessEngine';
import { 
  generateDailyBankApplicants, 
  stampDocket, 
  advanceBankDay 
} from '../../game/bank2000Engine';
import { 
  DEFAULT_CONSTRUCTION_MATERIALS, 
  DEFAULT_INITIAL_SAR_RECORD, 
  generateInitialTenders, 
  submitConstructionBid, 
  orderConstructionMaterial, 
  advanceConstructionDay, 
  advanceConstructionDays,
  paySarTaxReturn 
} from '../../game/constructionEngine';
import {
  createDefaultBankRelationships,
  openBankCheckingAccount,
  requestCommercialBankLoan,
  requestCorporateCard,
  pledgeBankGuarantee,
  releaseBankGuarantee,
  openTermDeposit,
  liquidateTermDeposit,
  accrueTermDeposits,
  chargeCorporateCard,
  payCommercialLoan,
  payCorporateCreditCard,
  depositCashToCheckingAccount,
  withdrawCashFromCheckingAccount,
  negotiateCheckingAccountRate,
  negotiateLoanRate,
  makeExtraordinaryLoanPayment,
  processDailyLoanAmortization,
  processBiweeklyCardEvaluation,
  requestFullCommercialCredit,
  makeExtraordinaryLoanPaymentWithOptions,
  pledgeRealEstateCollateralToLoan,
  releaseRealEstateCollateral,
  executeInvoiceFactoring,
  createDefaultRealEstateCollaterals,
  executeFlexibleLoanPayment,
  FlexibleLoanPaymentOptions,
  transferBetweenAccounts,
  requestNewAppraisal,
  registerNewAssetAsCollateral,
  evaluateAndGenerateBankOffers,
  createInitialSimulatedEmails,
  getInboxUnreadCount,
  negotiateBankOfferFromEmail
} from '../../game/commercialBanksEngine';
import {
  DEFAULT_MACHINERY_DEALERS,
  DEFAULT_MANUFACTURER_QUOTES,
  buyMachineryUnit,
  orderFromMaterialManufacturer
} from '../../game/machineryAndSuppliersEngine';
import { restoreDailySimulationState } from '../../game/savedState';
import { sound } from '../../game/audioFx';
import { RetroWindow } from './RetroWindow';
import { RetroTaskbar, WindowInfo } from './RetroTaskbar';
import { BankerDocketWindow } from './BankerDocketWindow';
import { BankVaultWindow } from './BankVaultWindow';
import { RetailRegisterWindow } from './RetailRegisterWindow';
import { RetailSupplyWindow } from './RetailSupplyWindow';
import { RetailStaffWindow } from './RetailStaffWindow';
import { CommercialBanksWindow } from './CommercialBanksWindow';
import { MachineryDealerWindow } from './MachineryDealerWindow';
import { MaterialTenderWindow } from './MaterialTenderWindow';
import { ConstructionBidsWindow } from './ConstructionBidsWindow';
import { ConstructionSupplyWindow } from './ConstructionSupplyWindow';
import { SarTaxAuditWindow } from './SarTaxAuditWindow';
import { FinancialStatementsWindow } from './FinancialStatementsWindow';
import { LiabilitiesManagerWindow } from './LiabilitiesManagerWindow';
import { CompetitorsMarketWindow } from './CompetitorsMarketWindow';
import { BusinessEmailWindow } from './BusinessEmailWindow';
import { TransactionVoucherModal } from './TransactionVoucherModal';
import { DailyClosingModal } from './DailyClosingModal';
import { RetroNewGameModal } from './RetroNewGameModal';

interface RetroDesktopProps {
  initialRole: RetroRoleMode;
  initialSector?: RetailSectorId;
  initialName?: string;
  onOpenAuditReport?: () => void;
  onToggleViewMode?: () => void;
  onReturnToTitle?: () => void;
}

export const RetroDesktop: React.FC<RetroDesktopProps> = ({
  initialRole,
  initialSector = 'minimarket',
  initialName,
  onOpenAuditReport,
  onToggleViewMode,
  onReturnToTitle
}) => {
  const [roleMode, setRoleMode] = useState<RetroRoleMode>(initialRole);
  const [retailSector, setRetailSector] = useState<RetailSectorId>(initialSector);
  const [entityName, setEntityName] = useState<string>(
    initialName || (
      initialRole === 'empresario'
        ? (initialSector === 'constructora'
            ? 'Constructora Metropolitana'
            : initialSector === 'supermercado'
            ? 'Supermercados del Norte'
            : initialSector === 'autolote'
            ? 'Autolote El Diamante'
            : 'Minimarket San Pedro')
        : initialRole === 'banquero'
        ? 'Áureo Bank Honduras S.A.'
        : 'Grupo Financiero & Empresarial Áureo'
    )
  );

  // Estado diario central de la simulación con persistencia en localStorage (Requisito 2)
  const [simState, setSimState] = useState<DailySimulationState>(() => {
    try {
      const saved = localStorage.getItem('aureo_retro_sim_save_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.simState) {
          return restoreDailySimulationState(parsed.simState);
        }
      }
    } catch (e) {
      // Ignorar errores de acceso a almacenamiento
    }

    const products = SECTOR_DEFAULT_PRODUCTS[initialSector] || SECTOR_DEFAULT_PRODUCTS.minimarket;
    const isConstructora = initialSector === 'constructora';
    const initialStoreCash = isConstructora ? 120000 : 35000;
    const initialStoreBank = isConstructora ? 1850000 : 120000;
    const initialVaultCash = 850000;
    const initialDeposits = 4500000;

    const initialEmails = createInitialSimulatedEmails(initialName || (isConstructora ? 'Constructora Metropolitana' : 'Minimarket San Pedro'), initialSector, initialStoreBank);
    const initialBankOffers = initialEmails
      .filter(e => e.bankOfferPayload)
      .map(e => e.bankOfferPayload!);

    return {
      currentDay: 1,
      currentMonth: 1,
      currentYear: 2026,
      dailyHour: 9,
      isDayClosed: false,
      roleMode: initialRole,
      lastClosingSummary: null,

      // Empresario
      retailSector: initialSector,
      storeName: initialName || (isConstructora ? 'Constructora Metropolitana' : 'Minimarket San Pedro'),
      storeCash: initialStoreCash,
      storeBankBalance: initialStoreBank,
      storeReputation: isConstructora ? 80 : 75,
      storeCleanliness: 90,
      products,
      supplierOrders: [],
      walkInQueue: generateDailyStoreCustomers(initialSector, products, 75, 1),
      dailyReceipts: [],
      staffCount: isConstructora ? 12 : 3,
      dailyWages: isConstructora ? 4800 : 1200,
      dailyRent: isConstructora ? 1500 : 500,
      monthlySalesAccumulated: 0,
      smartBankOffers: DEFAULT_SMART_BANK_OFFERS,
      smartBankCreditRating: 'AA',

      // Módulo Específico: Constructora & Obras
      constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
      constructionOrders: [],
      availableTenders: generateInitialTenders(1),
      activeWorks: [],
      completedWorksHistory: [],

      // SAR & Auditoría Fiscal
      sarTaxRecord: DEFAULT_INITIAL_SAR_RECORD,
      fiscalSolvenciaActive: true,

      // 4 Bancos Comerciales Competidores & Capacidad
      commercialBanks: createDefaultBankRelationships(initialStoreBank),

      // Flota Propia & Concesionarias (1-5 estrellas)
      ownedMachinery: [],
      machineryDealers: DEFAULT_MACHINERY_DEALERS,

      // Fabricantes de Materiales (1-5 estrellas)
      materialManufacturerQuotes: DEFAULT_MANUFACTURER_QUOTES,

      // Banquero
      bankerVaultCash: initialVaultCash,
      bankerBchReserve: 540000,
      bankerTotalDeposits: initialDeposits,
      bankerDepositRatePct: 4.5,
      bankerMonthlyFee: 35,
      bankerAtmFee: 15,
      bankerReputation: 82,
      bankerRunRiskPct: 8,
      docketQueue: generateDailyBankApplicants(6, 1, 1),
      activeLoansCount: 42,
      totalLoanPortfolio: 12500000,
      delinquentLoansCount: 2,
      processedDocketsToday: 0,
      approvedAmountToday: 0,
      rejectedCountToday: 0,

      // Garantías Reales, Correos, Vouchers y Ofertas Dinámicas
      realEstateCollaterals: createDefaultRealEstateCollaterals(initialName || (isConstructora ? 'Constructora Metropolitana' : 'Minimarket San Pedro'), initialSector),
      simulatedEmails: initialEmails,
      transactionVouchers: [],
      dynamicBankOffers: initialBankOffers,
      fiscalPeriods: [],

      dailyHistory: []
    };
  });

  // Estado para precarga de financiamiento desde ofertas de correo (Requisito 3)
  const [preloadedLoan, setPreloadedLoan] = useState<{
    bankId?: CommercialBankId;
    productType?: CommercialLoanType;
    amount?: number;
    termMonths?: number;
    offerId?: string;
    collateralIds?: string[];
  }>({});

  // Auto-guardado en localStorage para persistencia tras recargar página (Requisito 2)
  React.useEffect(() => {
    try {
      localStorage.setItem('aureo_retro_sim_save_v2', JSON.stringify({
        roleMode,
        retailSector,
        entityName,
        simState
      }));
    } catch (e) {
      // Ignorar quota exceeded
    }
  }, [simState, roleMode, retailSector, entityName]);

  // Ventanas activas y estados
  const [openWindows, setOpenWindows] = useState<Record<string, { isOpen: boolean; isMinimized: boolean; isMaximized: boolean; zIndex: number }>>({
    pos_register: { isOpen: roleMode === 'empresario' && initialSector !== 'constructora', isMinimized: false, isMaximized: false, zIndex: 10 },
    supply_stock: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    construction_bids: { isOpen: roleMode === 'empresario' && initialSector === 'constructora', isMinimized: false, isMaximized: false, zIndex: 10 },
    construction_supply: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    bancos_comerciales: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    concesionarias: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    licitacion_materiales: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    sar_audit: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    staff_store: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    business_email: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 10 },
    bank_docket: { isOpen: roleMode === 'banquero', isMinimized: false, isMaximized: false, zIndex: 10 },
    bank_vault: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    holding_board: { isOpen: roleMode === 'grupo_empresarial', isMinimized: false, isMaximized: false, zIndex: 10 },
    financial_statements: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    liabilities_manager: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    competitors_market: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 }
  });

  const [topZIndex, setTopZIndex] = useState(20);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(
    roleMode === 'empresario'
      ? (initialSector === 'constructora' ? 'construction_bids' : 'pos_register')
      : (roleMode === 'banquero' ? 'bank_docket' : 'holding_board')
  );
  const [isDailyClosingModalOpen, setIsDailyClosingModalOpen] = useState(false);
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [activeVoucherModal, setActiveVoucherModal] = useState<TransactionVoucher | null>(null);

  // Manejo de foco y visualización de ventanas
  const bringToFront = (id: string) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setOpenWindows(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { isMaximized: false }),
        isOpen: true,
        isMinimized: false,
        zIndex: nextZ
      }
    }));
  };

  const handleToggleWindow = (id: string) => {
    setOpenWindows(prev => {
      const current = prev[id] || { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 };
      if (current.isOpen && !current.isMinimized && activeWindowId === id) {
        return { ...prev, [id]: { ...current, isMinimized: true } };
      } else {
        const nextZ = topZIndex + 1;
        setTopZIndex(nextZ);
        setActiveWindowId(id);
        return { ...prev, [id]: { ...current, isOpen: true, isMinimized: false, zIndex: nextZ } };
      }
    });
  };

  const handleCloseWindow = (id: string) => {
    sound.playClick();
    setOpenWindows(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { isMinimized: false, isMaximized: false, zIndex: 1 }), isOpen: false }
    }));
  };

  const handleMinimizeWindow = (id: string) => {
    sound.playClick();
    setOpenWindows(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { isOpen: true, isMaximized: false, zIndex: 1 }), isMinimized: true }
    }));
  };

  const handleMaximizeWindow = (id: string) => {
    sound.playClick();
    setOpenWindows(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { isOpen: true, isMinimized: false, zIndex: 1 }), isMaximized: !prev[id]?.isMaximized }
    }));
  };

  // -------------------------------------------------------------------------
  // Acciones Constructora & Obras de Infraestructura
  // -------------------------------------------------------------------------
  const handleSubmitConstructionBid = (tenderId: string, price: number, days: number) => {
    const res = submitConstructionBid(simState, tenderId, price, days);
    setSimState(res.updatedState);
    if (res.won) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleOrderConstructionMaterial = (materialId: ConstructionMaterialId, units: number) => {
    const res = orderConstructionMaterial(simState, materialId, units);
    if (res.error) {
      sound.playRejectBuzzer();
      alert(res.error);
      return;
    }
    setSimState(res.updatedState);
  };

  const handlePaySarTax = () => {
    const res = paySarTaxReturn(simState);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  // -------------------------------------------------------------------------
  // Acciones 4 Bancos Comerciales Competidores
  // -------------------------------------------------------------------------
  const handleOpenBankChecking = (bankId: any, initialDeposit: number) => {
    const res = openBankCheckingAccount(simState, bankId, initialDeposit);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleRequestCommercialLoan = (bankId: any, amount: number, termMonths: number, purpose: string) => {
    const res = requestCommercialBankLoan(simState, bankId, amount, termMonths, purpose);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleRequestCorporateCard = (bankId: any, limit: number) => {
    const res = requestCorporateCard(simState, bankId, limit);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handlePledgeGuarantee = (bankId: any, amount: number, purpose: string) => {
    const res = pledgeBankGuarantee(simState, bankId, amount, purpose);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleReleaseGuarantee = (bankId: any, depositId: string) => {
    const res = releaseBankGuarantee(simState, bankId, depositId);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    }
    alert(res.message);
  };

  const handleOpenTermDeposit = (bankId: any, amount: number, termDays: number) => {
    const res = openTermDeposit(simState, bankId, amount, termDays);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handlePayLoan = (bankId: any, amount: number) => {
    const res = payCommercialLoan(simState, bankId, amount);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handlePayCard = (bankId: any, amount: number) => {
    const res = payCorporateCreditCard(simState, bankId, amount);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleDepositCashToBank = (bankId: any, amount: number) => {
    const res = depositCashToCheckingAccount(simState, bankId, amount);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleWithdrawCashFromBank = (bankId: any, amount: number) => {
    const res = withdrawCashFromCheckingAccount(simState, bankId, amount);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleNegotiateCheckingRate = (bankId: any, targetRate: number) => {
    const res = negotiateCheckingAccountRate(simState, bankId, targetRate);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleNegotiateLoanRate = (bankId: any, discount: number) => {
    const res = negotiateLoanRate(simState, bankId, discount);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleExtraordinaryLoanPayment = (bankId: any, amount: number) => {
    const res = makeExtraordinaryLoanPayment(simState, bankId, amount);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleLiquidateDpf = (bankId: any, depositId: string, isEarly: boolean) => {
    const res = liquidateTermDeposit(simState, bankId, depositId, isEarly);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleChargeCorporateCard = (bankId: any, amount: number, concept: string) => {
    const res = chargeCorporateCard(simState, bankId, amount, concept);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleRequestFullCredit = (
    bankId: any,
    productType: CommercialLoanType,
    amount: number,
    termMonths: number,
    purpose: string,
    graceMonths: number = 0,
    collateralIds?: string[] | string,
    destinationBankId?: CommercialBankId,
    destinationAccountType: 'checking' | 'cash' = 'checking',
    offerId?: string
  ) => {
    const res = requestFullCommercialCredit(
      simState,
      bankId,
      productType,
      amount,
      termMonths,
      purpose,
      graceMonths,
      collateralIds,
      destinationBankId,
      destinationAccountType,
      offerId
    );
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
      if (res.voucher) {
        setActiveVoucherModal(res.voucher);
      }
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  // Handlers para Acciones del Correo Empresarial (Requisitos 1, 2, 3, 4, 8)
  const handleEmailUpdateState = (emailId: string, partial: Partial<SimulatedEmail>) => {
    setSimState(prev => {
      const updated = (prev.simulatedEmails || []).map(em => {
        if (em.id === emailId) {
          return { ...em, ...partial };
        }
        return em;
      });
      return {
        ...prev,
        simulatedEmails: updated
      };
    });
  };

  const handleOpenLoanTerms = (
    bankId: CommercialBankId,
    productType: CommercialLoanType,
    amount: number,
    termMonths: number,
    offerId?: string
  ) => {
    sound.playClick();
    setPreloadedLoan({
      bankId,
      productType,
      amount,
      termMonths,
      offerId: offerId || ''
    });
    bringToFront('bancos_comerciales');
  };

  const handleRespondEmail = (originalEmail: SimulatedEmail, replyText: string) => {
    const replyEmail: SimulatedEmail = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      simDay: simState.currentDay,
      simMonth: simState.currentMonth,
      simYear: simState.currentYear,
      senderName: `${entityName} (Tú)`,
      senderEmail: `gerencia@${entityName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
      recipient: originalEmail.senderName || originalEmail.sender,
      recipientEmail: originalEmail.senderEmail,
      subject: originalEmail.subject.startsWith('RE:') ? originalEmail.subject : `RE: ${originalEmail.subject}`,
      category: originalEmail.category,
      body: replyText,
      isRead: true,
      isStarred: false,
      isArchived: false,
      folder: 'sent',
      sentDate: `Día ${simState.currentDay}/0${simState.currentMonth}/${simState.currentYear} 09:30 AM`
    };

    setSimState(prev => ({
      ...prev,
      simulatedEmails: [replyEmail, ...(prev.simulatedEmails || [])]
    }));
    sound.playClick();
  };

  const handlePayLoanFromEmail = (
    bankId: CommercialBankId,
    amount: number,
    sourceAccount: 'checking' | 'cash'
  ): { success: boolean; message: string; remainingBalance?: number } => {
    const res = payCommercialLoan(simState, bankId, amount, sourceAccount);
    if (res.success) {
      setSimState(res.updatedState);
      sound.playApprovalStamp();
      if (res.voucher) {
        setActiveVoucherModal(res.voucher);
      }
      return { success: true, message: res.message, remainingBalance: res.remainingBalance };
    } else {
      sound.playRejectBuzzer();
      return { success: false, message: res.message, remainingBalance: res.remainingBalance };
    }
  };

  const handlePaySarFromEmail = (
    amount: number,
    sourceAccount: 'checking' | 'cash'
  ): { success: boolean; message: string; remainingDebt?: number } => {
    const sarRecord = simState.sarTaxRecord || DEFAULT_INITIAL_SAR_RECORD;
    const isCash = sourceAccount === 'cash';
    const availableFunds = isCash ? simState.storeCash : simState.storeBankBalance;

    if (amount <= 0) {
      return { success: false, message: 'El monto a pagar debe ser mayor a cero.' };
    }
    if (amount > availableFunds) {
      return {
        success: false,
        message: `Fondos insuficientes en ${isCash ? 'Caja Chica' : 'Cuentas Bancarias'}. Saldo disponible: L ${availableFunds.toLocaleString()}, Monto a pagar: L ${amount.toLocaleString()}.`
      };
    }

    const newCash = isCash ? simState.storeCash - amount : simState.storeCash;
    const newBank = !isCash ? simState.storeBankBalance - amount : simState.storeBankBalance;

    let updatedBanks = { ...simState.commercialBanks };
    if (!isCash) {
      for (const bId of Object.keys(updatedBanks) as CommercialBankId[]) {
        const rel = updatedBanks[bId];
        if (rel?.checkingAccount && rel.checkingAccount.balance >= amount) {
          updatedBanks = {
            ...updatedBanks,
            [bId]: {
              ...rel,
              checkingAccount: {
                ...rel.checkingAccount,
                balance: rel.checkingAccount.balance - amount
              }
            }
          };
          break;
        }
      }
    }

    const currentTaxDebt = sarRecord.pendingTaxDue ?? sarRecord.isrTaxAmount ?? amount;
    const newTaxDebt = Math.max(0, currentTaxDebt - amount);

    const updatedSar = {
      ...sarRecord,
      totalTaxPaidYtd: (sarRecord.totalTaxPaidYtd || 0) + amount,
      pendingTaxDue: newTaxDebt,
      isPaid: newTaxDebt <= 0,
      sarAuditRiskScore: Math.max(0, (sarRecord.sarAuditRiskScore || 0) - 15),
      sarNoticesPending: Math.max(0, (sarRecord.sarNoticesPending || 0) - 1),
      lastAuditResult: `Pago de impuestos por L ${amount.toLocaleString()} efectuado con éxito mediante correo/SAR.`
    };

    const voucher: TransactionVoucher = {
      id: `vouc_sar_${Date.now()}`,
      voucherNumber: `SAR-VOUC-${Math.floor(100000 + Math.random() * 900000)}`,
      simDay: simState.currentDay,
      simMonth: simState.currentMonth,
      simYear: simState.currentYear,
      companyName: entityName,
      operationType: 'pago_prestamo',
      title: 'COMPROBANTE OFICIAL DE PAGO TRIBUTARIO SAR',
      grossAmountHNL: amount,
      deductionsHNL: 0,
      netDisbursedOrPaidHNL: amount,
      priorBalanceHNL: currentTaxDebt,
      newBalanceHNL: newTaxDebt,
      referenceCode: `REF-SAR-${Math.floor(100000 + Math.random() * 900000)}`,
      authStamp: 'SELLO DIGITAL SAR - MINISTERIO DE FINANZAS',
      destinationAccountNumber: 'TRIB-SAR-2026-HN',
      timestamp: `Día ${simState.currentDay}/0${simState.currentMonth}/${simState.currentYear} 10:00 AM`
    };

    const updatedEmails = (simState.simulatedEmails || []).map(em => {
      if (em.category === 'sar_tributario') {
        return { ...em, isResolved: true };
      }
      return em;
    });

    setSimState(prev => ({
      ...prev,
      storeCash: newCash,
      storeBankBalance: newBank,
      commercialBanks: updatedBanks,
      sarTaxRecord: updatedSar,
      transactionVouchers: [voucher, ...(prev.transactionVouchers || [])],
      simulatedEmails: updatedEmails
    }));

    sound.playApprovalStamp();
    setActiveVoucherModal(voucher);
    return { 
      success: true, 
      message: `¡Pago a SAR por L ${amount.toLocaleString()} procesado exitosamente! Comprobante oficial emitido.`,
      remainingDebt: newTaxDebt
    };
  };

  const handleNegotiateOffer = (
    offerOrId: string | DynamicBankOffer,
    proposal: {
      requestedAmount?: number;
      requestedRate?: number;
      requestedTerm?: number;
      requestedFee?: number;
      collateralIds?: string[];
      requestedCollateralIds?: string[];
    }
  ) => {
    const offerId = typeof offerOrId === 'string' ? offerOrId : offerOrId.id;
    const res = negotiateBankOfferFromEmail(simState, offerId, {
      ...proposal,
      requestedCollateralIds: proposal.collateralIds || proposal.requestedCollateralIds
    });
    setSimState(res.updatedState);
    if (res.outcome === 'aprobado' || res.outcome === 'contraoferta') {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    return {
      success: res.outcome !== 'rechazado',
      message: res.message,
      dialogue: res.dialogue,
      updatedOffer: res.updatedOffer
    };
  };

  const handleAcceptOfferFromEmail = (
    offerOrId: DynamicBankOffer | string,
    destinationAccount?: 'checking' | 'cash' | CommercialBankId,
    destinationAccountType: 'checking' | 'cash' = 'checking',
    collateralIds?: string[]
  ) => {
    const offerId = typeof offerOrId === 'string' ? offerOrId : offerOrId.id;
    const offer = (typeof offerOrId === 'object' ? offerOrId : null)
      || (simState.dynamicBankOffers || []).find(o => o.id === offerId)
      || (simState.simulatedEmails || []).find(e => e.bankOfferPayload?.id === offerId)?.bankOfferPayload;

    if (!offer) {
      return { success: false, message: 'Oferta no encontrada.' };
    }

    const targetBank = (destinationAccount && destinationAccount !== 'checking' && destinationAccount !== 'cash')
      ? (destinationAccount as CommercialBankId)
      : (offer.bankId);

    const actualAccountType = (destinationAccount === 'checking' || destinationAccount === 'cash')
      ? destinationAccount
      : destinationAccountType;

    const res = requestFullCommercialCredit(
      simState,
      offer.bankId,
      offer.productType,
      offer.approvedAmount || offer.amountOrLimitHNL,
      offer.termMonths,
      `Línea de crédito desembolsada desde oferta pre-aprobada ${offerId}`,
      0,
      collateralIds || offer.linkedCollateralIds,
      targetBank,
      actualAccountType,
      offerId
    );

    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
      if (res.voucher) {
        setActiveVoucherModal(res.voucher);
      }
    } else {
      sound.playRejectBuzzer();
    }

    return {
      success: res.success,
      message: res.message,
      voucher: res.voucher
    };
  };

  const handleExecuteFlexiblePayment = (
    bankIdOrParams: CommercialBankId | FlexibleLoanPaymentOptions,
    paymentType?: 'cuota_mensual' | 'varias_cuotas' | 'pago_parcial' | 'abono_capital' | 'cancelacion_total',
    amount?: number,
    sourceAccount?: 'checking' | 'cash',
    strategy?: 'reducir_cuota' | 'reducir_plazo',
    numInstallments?: number
  ) => {
    let res;
    if (typeof bankIdOrParams === 'string') {
      res = executeFlexibleLoanPayment(
        simState,
        bankIdOrParams as CommercialBankId,
        paymentType,
        amount,
        sourceAccount || 'checking',
        strategy || 'reducir_plazo',
        numInstallments || 1
      );
    } else {
      res = executeFlexibleLoanPayment(simState, bankIdOrParams);
    }
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
      if (res.voucher) {
        setActiveVoucherModal(res.voucher);
      }
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleTransferBetweenAccounts = (
    fromBankId: CommercialBankId,
    toBankId: CommercialBankId,
    amount: number,
    concept?: string
  ) => {
    const res = transferBetweenAccounts(simState, fromBankId, toBankId, amount, concept);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
      if (res.voucher) {
        setActiveVoucherModal(res.voucher);
      }
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleRequestNewAppraisal = (collateralId: string) => {
    const res = requestNewAppraisal(simState, collateralId);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleRegisterAssetAsCollateral = (data: any) => {
    const res = registerNewAssetAsCollateral(simState, data);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleExtraordinaryPaymentWithOptions = (
    bankId: any,
    amount: number,
    strategy: 'reducir_cuota' | 'reducir_plazo'
  ) => {
    const res = makeExtraordinaryLoanPaymentWithOptions(simState, bankId, amount, strategy);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handlePledgeCollateral = (collateralId: string, bankId: any, loanId: string) => {
    const res = pledgeRealEstateCollateralToLoan(simState, collateralId, bankId, loanId);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    alert(res.message);
  };

  const handleReleaseCollateral = (collateralId: string) => {
    const res = releaseRealEstateCollateral(simState, collateralId);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    alert(res.message);
  };

  const handleExecuteFactoring = (bankId: any, invoiceAmount: number, desc: string) => {
    const res = executeInvoiceFactoring(simState, bankId, invoiceAmount, desc);
    setSimState(res.updatedState);
    if (res.success) sound.playApprovalStamp();
    else sound.playRejectBuzzer();
    alert(res.message);
  };

  const handleSaveGameJson = () => {
    sound.playApprovalStamp();
    const savePayload = {
      version: '2.0-retro',
      savedAt: new Date().toISOString(),
      roleMode,
      retailSector,
      entityName,
      simState
    };
    const blob = new Blob([JSON.stringify(savePayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aureo_bank_partida_${entityName.toLowerCase().replace(/\s+/g, '_')}_dia${simState.currentDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('¡Partida guardada y descargada exitosamente en formato .JSON!');
  };

  const handleLoadGameJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.simState) {
          const restored = restoreDailySimulationState(parsed.simState);
          setSimState(restored);
          if (parsed.roleMode) setRoleMode(parsed.roleMode);
          if (parsed.retailSector) setRetailSector(parsed.retailSector);
          if (parsed.entityName) setEntityName(parsed.entityName);
          sound.playApprovalStamp();
          alert('¡Partida restaurada con éxito!');
        } else {
          sound.playRejectBuzzer();
          alert('El archivo no contiene un estado de partida válido.');
        }
      } catch (err) {
        sound.playRejectBuzzer();
        alert('Error al leer el archivo de guardado.');
      }
    };
    reader.readAsText(file);
  };

  // -------------------------------------------------------------------------
  // Acciones Concesionarias de Maquinaria y Licitación Directa de Materiales
  // -------------------------------------------------------------------------
  const handleBuyMachinery = (dealerId: string, machineryId: string) => {
    const res = buyMachineryUnit(simState, dealerId, machineryId);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  const handleOrderFromManufacturerQuote = (quoteId: string, batchUnits: number) => {
    const res = orderFromMaterialManufacturer(simState, quoteId, batchUnits);
    setSimState(res.updatedState);
    if (res.success) {
      sound.playApprovalStamp();
    } else {
      sound.playRejectBuzzer();
    }
    alert(res.message);
  };

  // -------------------------------------------------------------------------
  // Acciones Comercio Minorista / Bar (POS y Proveedores)
  // -------------------------------------------------------------------------
  const handleServeCustomer = (customer: RetailCustomerWalkIn, paymentMethod: 'efectivo' | 'tarjeta') => {
    const res = serveRetailCustomer(customer, simState.products, paymentMethod, simState.currentDay);
    setSimState(prev => {
      const updatedQueue = prev.walkInQueue.map(q => q.id === customer.id ? res.updatedCustomer : q);
      const newCash = paymentMethod === 'efectivo' ? prev.storeCash + res.revenue : prev.storeCash;
      const newBank = paymentMethod === 'tarjeta' ? prev.storeBankBalance + res.revenue : prev.storeBankBalance;
      const newRep = res.receipt ? Math.min(100, prev.storeReputation + 1) : Math.max(20, prev.storeReputation - 2);
      const newMonthly = (prev.monthlySalesAccumulated || 0) + res.revenue;

      return {
        ...prev,
        products: res.updatedProducts,
        walkInQueue: updatedQueue,
        dailyReceipts: res.receipt ? [res.receipt, ...prev.dailyReceipts] : prev.dailyReceipts,
        storeCash: newCash,
        storeBankBalance: newBank,
        storeReputation: newRep,
        monthlySalesAccumulated: newMonthly
      };
    });
  };

  const handleBatchServe = () => {
    setSimState(prev => {
      let currentProducts = [...prev.products];
      let currentCash = prev.storeCash;
      let newReceipts = [...prev.dailyReceipts];
      let addedRevenue = 0;

      const updatedQueue = prev.walkInQueue.map(cust => {
        if (cust.isServed) return cust;
        const res = serveRetailCustomer(cust, currentProducts, 'efectivo', prev.currentDay);
        currentProducts = res.updatedProducts;
        if (res.receipt) {
          currentCash += res.revenue;
          addedRevenue += res.revenue;
          newReceipts.unshift(res.receipt);
        }
        return res.updatedCustomer;
      });

      return {
        ...prev,
        products: currentProducts,
        walkInQueue: updatedQueue,
        dailyReceipts: newReceipts,
        storeCash: currentCash,
        monthlySalesAccumulated: (prev.monthlySalesAccumulated || 0) + addedRevenue
      };
    });
  };

  const handleOrderProduct = (productId: string, units: number) => {
    const res = orderFromSupplier(productId, units, simState.products, simState.storeCash);
    if (res.order) {
      setSimState(prev => ({
        ...prev,
        storeCash: res.newCash,
        supplierOrders: [...prev.supplierOrders, res.order!]
      }));
    }
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setSimState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, sellingPrice: newPrice } : p)
    }));
  };

  // Acciones Empresario (Banco Inteligente)
  const handleAcceptBankFacility = (facilityId: string) => {
    const res = acceptSmartBankFacility(simState, facilityId);
    setSimState(res.updatedState);
  };

  const handleRepayBankFacility = (facilityId: string, amount: number) => {
    const res = repaySmartBankFacility(simState, facilityId, amount);
    if (res.error) {
      sound.playRejectBuzzer();
      alert(res.error);
      return;
    }
    setSimState(res.updatedState);
  };

  // Acciones Empresario (Personal)
  const handleHireStaff = () => {
    setSimState(prev => ({
      ...prev,
      staffCount: prev.staffCount + 1,
      dailyWages: Math.round(((prev.staffCount + 1) * 12000) / 30)
    }));
  };

  const handleFireStaff = () => {
    setSimState(prev => ({
      ...prev,
      staffCount: Math.max(1, prev.staffCount - 1),
      dailyWages: Math.round((Math.max(1, prev.staffCount - 1) * 12000) / 30)
    }));
  };

  const handleCleanStore = () => {
    setSimState(prev => ({
      ...prev,
      storeCash: Math.max(0, prev.storeCash - 450),
      storeCleanliness: 100,
      storeReputation: Math.min(100, prev.storeReputation + 3)
    }));
  };

  // -------------------------------------------------------------------------
  // Acciones Banquero (Ventanilla de Expedientes)
  // -------------------------------------------------------------------------
  const handleApproveDocket = (docketId: string, adjustedAmount: number, adjustedRate: number) => {
    setSimState(prev => {
      const docket = prev.docketQueue.find(d => d.id === docketId);
      if (!docket) return prev;
      const stamped = stampDocket(docket, 'aprobado', adjustedAmount, adjustedRate);

      const isAccountOpening = docket.requestType === 'Cuenta Corriente';
      const newVault = isAccountOpening ? prev.bankerVaultCash + adjustedAmount : Math.max(0, prev.bankerVaultCash - adjustedAmount);
      const newPortfolio = isAccountOpening ? prev.totalLoanPortfolio : prev.totalLoanPortfolio + adjustedAmount;
      const newDeposits = isAccountOpening ? prev.bankerTotalDeposits + adjustedAmount : prev.bankerTotalDeposits;

      return {
        ...prev,
        bankerVaultCash: newVault,
        totalLoanPortfolio: newPortfolio,
        bankerTotalDeposits: newDeposits,
        activeLoansCount: prev.activeLoansCount + (isAccountOpening ? 0 : 1),
        approvedAmountToday: prev.approvedAmountToday + adjustedAmount,
        processedDocketsToday: prev.processedDocketsToday + 1,
        bankerReputation: Math.min(100, prev.bankerReputation + 1),
        docketQueue: prev.docketQueue.map(d => d.id === docketId ? stamped : d)
      };
    });
  };

  const handleRejectDocket = (docketId: string) => {
    setSimState(prev => {
      const docket = prev.docketQueue.find(d => d.id === docketId);
      if (!docket) return prev;
      const stamped = stampDocket(docket, 'rechazado');

      return {
        ...prev,
        rejectedCountToday: prev.rejectedCountToday + 1,
        processedDocketsToday: prev.processedDocketsToday + 1,
        docketQueue: prev.docketQueue.map(d => d.id === docketId ? stamped : d)
      };
    });
  };

  const handleBatchProcessDockets = () => {
    setSimState(prev => {
      let currentVault = prev.bankerVaultCash;
      let currentPortfolio = prev.totalLoanPortfolio;
      let approvedAmount = prev.approvedAmountToday;
      let approvedCount = 0;
      let rejectedCount = prev.rejectedCountToday;

      const updatedQueue = prev.docketQueue.map(docket => {
        if (docket.decisionStatus !== 'pendiente') return docket;
        const isSafe = (docket.riskEvaluation.dtiRatioPct <= 45 || docket.totalCollateralValue > docket.requestedAmount) &&
                       docket.creditScore >= 600 && currentVault >= docket.requestedAmount;
        if (isSafe) {
          currentVault -= docket.requestedAmount;
          currentPortfolio += docket.requestedAmount;
          approvedAmount += docket.requestedAmount;
          approvedCount++;
          return stampDocket(docket, 'aprobado');
        } else {
          rejectedCount++;
          return stampDocket(docket, 'rechazado');
        }
      });

      return {
        ...prev,
        bankerVaultCash: currentVault,
        totalLoanPortfolio: currentPortfolio,
        approvedAmountToday: approvedAmount,
        rejectedCountToday: rejectedCount,
        processedDocketsToday: prev.processedDocketsToday + approvedCount,
        docketQueue: updatedQueue
      };
    });
  };

  const handleUpdateBankerRates = (rate: number, mFee: number, aFee: number) => {
    setSimState(prev => ({
      ...prev,
      bankerDepositRatePct: rate,
      bankerMonthlyFee: mFee,
      bankerAtmFee: aFee
    }));
  };

  // Cierre y Avance de Jornada Diaria (1 Día)
  const handleAdvanceDay = () => {
    sound.playApprovalStamp();
    let nextState: DailySimulationState;
    if (roleMode === 'empresario') {
      if (retailSector === 'constructora') {
        nextState = advanceConstructionDay(simState);
      } else {
        nextState = advanceRetailDay(simState);
      }
      // Amortización periódica de préstamos, evaluación quincenal de tarjetas y devengo DPF
      const amortRes = processDailyLoanAmortization(nextState);
      const cardRes = processBiweeklyCardEvaluation(amortRes.updatedState);
      const dpfRes = accrueTermDeposits(cardRes, 1);
      nextState = dpfRes.updatedState;
    } else {
      nextState = advanceBankDay(simState);
    }

    // Evaluar y generar ofertas bancarias dinámicas según salud financiera
    nextState = evaluateAndGenerateBankOffers(nextState);

    // Enviar resumen diario de ventas por correo si hubo cobros en el día
    if (nextState.dailyReceipts && nextState.dailyReceipts.length > 0) {
      const totalVentasDia = nextState.dailyReceipts.reduce((sum, r) => sum + (r.totalAmount ?? r.total ?? 0), 0);
      const emailResumen: SimulatedEmail = {
        id: `em-sales-resumen-d${nextState.currentDay}-${Date.now()}`,
        dateDay: nextState.currentDay,
        dateMonth: nextState.currentMonth,
        dateYear: nextState.currentYear,
        sender: 'Caja & Terminal POS',
        senderEmail: 'pos-terminal@aureo-sistema.hn',
        recipient: entityName,
        recipientEmail: `gerencia@${entityName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
        subject: `📊 Resumen de Ventas Diarias - Día ${nextState.currentDay}: L ${totalVentasDia.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`,
        category: 'ventas_clientes',
        snippet: `Cierre del día completado con ${nextState.dailyReceipts.length} transacciones registradas.`,
        body: `Estimada Gerencia:\n\nSe ha completado el corte de caja del día ${nextState.currentDay}/${nextState.currentMonth}/${nextState.currentYear}.\n\nTotal de clientes atendidos: ${nextState.dailyReceipts.length} ventas.\nIngresos totales brutos: L ${totalVentasDia.toLocaleString('es-HN', { minimumFractionDigits: 2 })}.\n\nEl arqueo de efectivo y comprobantes ha sido sincronizado con la contabilidad.`,
        isRead: false,
        isStarred: false,
        status: 'informativo'
      };
      nextState = {
        ...nextState,
        simulatedEmails: [emailResumen, ...(nextState.simulatedEmails || [])]
      };
    }

    setSimState(nextState);
    setIsDailyClosingModalOpen(true);
  };

  // Avance Rápido de Tiempo (15 Días o 1 Mes)
  const handleAdvanceDays = (daysCount: number) => {
    sound.playApprovalStamp();
    let nextState: DailySimulationState;
    if (roleMode === 'empresario' && retailSector === 'constructora') {
      const res = advanceConstructionDays(simState, daysCount);
      nextState = res.updatedState;
    } else {
      // Para otros modos iterar días
      let cur = simState;
      for (let i = 0; i < daysCount; i++) {
        cur = roleMode === 'empresario' ? advanceRetailDay(cur) : advanceBankDay(cur);
      }
      nextState = cur;
    }

    if (roleMode === 'empresario') {
      const amortRes = processDailyLoanAmortization(nextState);
      const cardRes = processBiweeklyCardEvaluation(amortRes.updatedState);
      const dpfRes = accrueTermDeposits(cardRes, daysCount);
      nextState = dpfRes.updatedState;
    }

    // Ofertas bancarias dinámicas
    nextState = evaluateAndGenerateBankOffers(nextState);

    setSimState(nextState);
    setIsDailyClosingModalOpen(true);
  };

  // Iniciar Nueva Partida desde el asistente retro
  const handleStartNewGame = (params: {
    roleMode: RetroRoleMode;
    retailSector: RetailSectorId;
    entityName: string;
    city: string;
  }) => {
    setRoleMode(params.roleMode);
    setRetailSector(params.retailSector);
    setEntityName(params.entityName);
    setIsNewGameModalOpen(false);

    const isConstructora = params.retailSector === 'constructora';
    const prods = SECTOR_DEFAULT_PRODUCTS[params.retailSector] || SECTOR_DEFAULT_PRODUCTS.minimarket;
    const initialCash = params.roleMode === 'empresario' ? (isConstructora ? 120000 : 45000) : (params.roleMode === 'grupo_empresarial' ? 5000000 : 850000);
    const initialBank = params.roleMode === 'empresario' ? (isConstructora ? 1850000 : 120000) : (params.roleMode === 'grupo_empresarial' ? 18000000 : 120000);

    setSimState({
      currentDay: 1,
      currentMonth: 1,
      currentYear: 2026,
      dailyHour: 9,
      isDayClosed: false,
      roleMode: params.roleMode,
      lastClosingSummary: null,

      retailSector: params.retailSector,
      storeName: params.entityName,
      storeCash: initialCash,
      storeBankBalance: initialBank,
      storeReputation: isConstructora ? 80 : 80,
      storeCleanliness: 95,
      products: prods,
      supplierOrders: [],
      walkInQueue: generateDailyStoreCustomers(params.retailSector, prods, 80, 1),
      dailyReceipts: [],
      staffCount: isConstructora ? 12 : 3,
      dailyWages: isConstructora ? 4800 : 1200,
      dailyRent: isConstructora ? 1500 : 500,
      monthlySalesAccumulated: 0,
      smartBankOffers: DEFAULT_SMART_BANK_OFFERS,
      smartBankCreditRating: 'AA',

      constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
      constructionOrders: [],
      availableTenders: generateInitialTenders(1),
      activeWorks: [],
      completedWorksHistory: [],

      sarTaxRecord: DEFAULT_INITIAL_SAR_RECORD,
      fiscalSolvenciaActive: true,

      commercialBanks: createDefaultBankRelationships(initialBank),
      ownedMachinery: [],
      machineryDealers: DEFAULT_MACHINERY_DEALERS,
      materialManufacturerQuotes: DEFAULT_MANUFACTURER_QUOTES,

      bankerVaultCash: params.roleMode === 'banquero' ? initialCash : 500000,
      bankerBchReserve: 540000,
      bankerTotalDeposits: 4500000,
      bankerDepositRatePct: 4.5,
      bankerMonthlyFee: 35,
      bankerAtmFee: 15,
      bankerReputation: 82,
      bankerRunRiskPct: 8,
      docketQueue: generateDailyBankApplicants(6, 1, 1),
      activeLoansCount: 42,
      totalLoanPortfolio: 12500000,
      delinquentLoansCount: 2,
      processedDocketsToday: 0,
      approvedAmountToday: 0,
      rejectedCountToday: 0,

      // Garantías, Correos, Vouchers y Ofertas
      realEstateCollaterals: createDefaultRealEstateCollaterals(params.entityName, params.retailSector),
      simulatedEmails: createInitialSimulatedEmails(params.entityName, params.retailSector, initialBank),
      transactionVouchers: [],
      dynamicBankOffers: [],
      fiscalPeriods: [],

      dailyHistory: []
    });

    if (params.roleMode === 'empresario') {
      if (params.retailSector === 'constructora') {
        bringToFront('construction_bids');
      } else {
        bringToFront('pos_register');
      }
    } else if (params.roleMode === 'banquero') {
      bringToFront('bank_docket');
    } else {
      bringToFront('holding_board');
    }
  };

  // Construir lista de ventanas activas para la barra de tareas
  const isConstructora = retailSector === 'constructora';
  const isSupermercado = retailSector === 'supermercado';
  const isAutolote = retailSector === 'autolote';
  const isTienda = retailSector === 'minimarket' || retailSector === 'bar_restaurante';

  const windowsInfo: WindowInfo[] = [
    ...(roleMode === 'empresario' ? (
      isConstructora ? [
        { id: 'construction_bids', title: `Licitaciones: ${entityName}`, icon: '🏛️', isOpen: !!openWindows.construction_bids?.isOpen, isMinimized: !!openWindows.construction_bids?.isMinimized },
        { id: 'bancos_comerciales', title: 'Banco', icon: '🏦', isOpen: !!openWindows.bancos_comerciales?.isOpen, isMinimized: !!openWindows.bancos_comerciales?.isMinimized },
        { id: 'concesionarias', title: 'Concesionarias Maquinaria (1-5★)', icon: '🚜', isOpen: !!openWindows.concesionarias?.isOpen, isMinimized: !!openWindows.concesionarias?.isMinimized },
        { id: 'licitacion_materiales', title: 'Licitación Fabricantes (1-5★)', icon: '📦', isOpen: !!openWindows.licitacion_materiales?.isOpen, isMinimized: !!openWindows.licitacion_materiales?.isMinimized },
        { id: 'construction_supply', title: 'Almacén de Materiales', icon: '🧱', isOpen: !!openWindows.construction_supply?.isOpen, isMinimized: !!openWindows.construction_supply?.isMinimized },
        { id: 'sar_audit', title: 'SAR - Solvencia Fiscal', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized },
        { id: 'staff_store', title: 'Cuadrilla de Obras', icon: '👥', isOpen: !!openWindows.staff_store?.isOpen, isMinimized: !!openWindows.staff_store?.isMinimized }
      ] : isSupermercado ? [
        { id: 'pos_register', title: `Góndolas & Ventas: ${entityName}`, icon: '🏪', isOpen: !!openWindows.pos_register?.isOpen, isMinimized: !!openWindows.pos_register?.isMinimized },
        { id: 'supply_stock', title: 'Almacén Mayorista & Caducidad', icon: '📦', isOpen: !!openWindows.supply_stock?.isOpen, isMinimized: !!openWindows.supply_stock?.isMinimized },
        { id: 'bancos_comerciales', title: 'Banco', icon: '🏦', isOpen: !!openWindows.bancos_comerciales?.isOpen, isMinimized: !!openWindows.bancos_comerciales?.isMinimized },
        { id: 'sar_audit', title: 'SAR - Auditoría Fiscal', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized },
        { id: 'staff_store', title: 'Personal de Supermercado', icon: '👥', isOpen: !!openWindows.staff_store?.isOpen, isMinimized: !!openWindows.staff_store?.isMinimized }
      ] : isAutolote ? [
        { id: 'pos_register', title: `Sala de Ventas Autos: ${entityName}`, icon: '🚗', isOpen: !!openWindows.pos_register?.isOpen, isMinimized: !!openWindows.pos_register?.isMinimized },
        { id: 'supply_stock', title: 'Lotes de Vehículos & Trade-in', icon: '🔄', isOpen: !!openWindows.supply_stock?.isOpen, isMinimized: !!openWindows.supply_stock?.isMinimized },
        { id: 'bancos_comerciales', title: 'Banco', icon: '🏦', isOpen: !!openWindows.bancos_comerciales?.isOpen, isMinimized: !!openWindows.bancos_comerciales?.isMinimized },
        { id: 'sar_audit', title: 'SAR - Declaración Autolote', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized },
        { id: 'staff_store', title: 'Asesores & Taller', icon: '👥', isOpen: !!openWindows.staff_store?.isOpen, isMinimized: !!openWindows.staff_store?.isMinimized }
      ] : [
        // Tienda / Minimarket
        { id: 'pos_register', title: `Caja Registradora: ${entityName}`, icon: '🛒', isOpen: !!openWindows.pos_register?.isOpen, isMinimized: !!openWindows.pos_register?.isMinimized },
        { id: 'supply_stock', title: 'Almacén & Proveedores de Tienda', icon: '📦', isOpen: !!openWindows.supply_stock?.isOpen, isMinimized: !!openWindows.supply_stock?.isMinimized },
        { id: 'bancos_comerciales', title: 'Banco', icon: '🏦', isOpen: !!openWindows.bancos_comerciales?.isOpen, isMinimized: !!openWindows.bancos_comerciales?.isMinimized },
        { id: 'sar_audit', title: 'SAR - Auditoría Fiscal', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized },
        { id: 'staff_store', title: 'Personal & Local', icon: '👥', isOpen: !!openWindows.staff_store?.isOpen, isMinimized: !!openWindows.staff_store?.isMinimized }
      ]
    ) : []),
    ...(roleMode === 'banquero' ? [
      { id: 'bank_docket', title: `Ventanilla Créditos: ${entityName}`, icon: '📋', isOpen: !!openWindows.bank_docket?.isOpen, isMinimized: !!openWindows.bank_docket?.isMinimized },
      { id: 'bank_vault', title: 'Bóveda, Depósitos & Tasas', icon: '🏦', isOpen: !!openWindows.bank_vault?.isOpen, isMinimized: !!openWindows.bank_vault?.isMinimized },
      { id: 'sar_audit', title: 'SAR - Impuestos Bancarios', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized }
    ] : []),
    ...(roleMode === 'grupo_empresarial' ? [
      { id: 'holding_board', title: `Directorio del Holding: ${entityName}`, icon: '🏢', isOpen: !!openWindows.holding_board?.isOpen, isMinimized: !!openWindows.holding_board?.isMinimized },
      { id: 'bank_docket', title: 'Banco Áureo (Banca 360°)', icon: '🏛️', isOpen: !!openWindows.bank_docket?.isOpen, isMinimized: !!openWindows.bank_docket?.isMinimized },
      { id: 'construction_bids', title: 'Constructora del Holding', icon: '🏗️', isOpen: !!openWindows.construction_bids?.isOpen, isMinimized: !!openWindows.construction_bids?.isMinimized },
      { id: 'pos_register', title: 'Supermercado del Holding', icon: '🏪', isOpen: !!openWindows.pos_register?.isOpen, isMinimized: !!openWindows.pos_register?.isMinimized },
      { id: 'bancos_comerciales', title: 'Tesorería & Bancos', icon: '🏦', isOpen: !!openWindows.bancos_comerciales?.isOpen, isMinimized: !!openWindows.bancos_comerciales?.isMinimized },
      { id: 'sar_audit', title: 'SAR - Consolidado', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized }
    ] : []),
    { 
      id: 'business_email', 
      title: `Correo Empresarial (${getInboxUnreadCount(simState.simulatedEmails)})`, 
      icon: '📨', 
      isOpen: !!openWindows.business_email?.isOpen, 
      isMinimized: !!openWindows.business_email?.isMinimized 
    },
    { id: 'financial_statements', title: 'Contabilidad: Balance & P&L', icon: '⚖️', isOpen: !!openWindows.financial_statements?.isOpen, isMinimized: !!openWindows.financial_statements?.isMinimized },
    { id: 'liabilities_manager', title: 'Centro de Pasivos & Obligaciones', icon: '📑', isOpen: !!openWindows.liabilities_manager?.isOpen, isMinimized: !!openWindows.liabilities_manager?.isMinimized },
    { id: 'competitors_market', title: 'Mercado Competidor & M&A', icon: '🏢', isOpen: !!openWindows.competitors_market?.isOpen, isMinimized: !!openWindows.competitors_market?.isMinimized }
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#008080] select-none font-sans">
      {/* Fondo de Escritorio Retro Windows con Iconos */}
      <div className="p-4 grid grid-flow-col auto-cols-max grid-rows-6 gap-6 z-0">
        {/* Iconos del Escritorio según Rol 100% aislado */}
        {roleMode === 'empresario' ? (
          isConstructora ? (
            /* Iconos Exclusivos de Constructora */
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('construction_bids');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🏛️
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Licitaciones
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('bancos_comerciales');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🏦
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Banco
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('concesionarias');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🚜
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Maquinaria 5★
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('licitacion_materiales');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  📦
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Materiales 5★
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('construction_supply');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🧱
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Almacén Obras
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('sar_audit');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  📋
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  SAR Solvencia
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('staff_store');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  👥
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Cuadrilla Obra
                </span>
              </button>
            </>
          ) : isSupermercado ? (
            /* Iconos Exclusivos de Supermercado */
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('pos_register');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🏪
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Góndolas & Ventas
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('supply_stock');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  📦
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Almacén Mayorista
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('bancos_comerciales');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🏦
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Banco
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('staff_store');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  👥
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Personal Súper
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('sar_audit');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  📋
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  SAR Impuestos
                </span>
              </button>
            </>
          ) : isAutolote ? (
            /* Iconos Exclusivos de Autolote */
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('pos_register');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🚗
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Autos & Exhibición
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('supply_stock');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🔄
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Lotes & Trade-in
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('bancos_comerciales');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🏦
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Banco
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('staff_store');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  👥
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Asesores & Taller
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('sar_audit');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  📋
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  SAR Impuestos
                </span>
              </button>
            </>
          ) : (
            /* Iconos Exclusivos de Tienda Minorista / Minimarket */
            <>
              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('pos_register');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🛒
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Caja Registradora
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('supply_stock');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  📦
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Almacén & Pedidos
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('bancos_comerciales');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  🏦
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Banco
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('sar_audit');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  📋
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  SAR Impuestos
                </span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('staff_store');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  👥
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Personal & Local
                </span>
              </button>
            </>
          )
        ) : roleMode === 'banquero' ? (
          /* Iconos Banquero (Bank 2000) */
          <>
            <button
              onClick={() => {
                sound.playClick();
                bringToFront('bank_docket');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                📋
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                Ventanilla Créditos
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                bringToFront('bank_vault');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                🏦
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                Bóveda & Tasas
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                bringToFront('sar_audit');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                📋
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                SAR Bancario
              </span>
            </button>
          </>
        ) : (
          /* Iconos Grupo Empresarial (Holding) */
          <>
            <button
              onClick={() => {
                sound.playClick();
                bringToFront('holding_board');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                🏢
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                Directorio Holding
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                bringToFront('bank_docket');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                🏛️
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                Banco Áureo
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                bringToFront('construction_bids');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                🏗️
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                Constructora Filial
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                bringToFront('pos_register');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                🏪
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                Supermercado Filial
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                bringToFront('bancos_comerciales');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                🏦
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                Tesorería & 4 Bancos
              </span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                bringToFront('sar_audit');
              }}
              className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                📋
              </div>
              <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                SAR Consolidado
              </span>
            </button>
          </>
        )}

        {/* Iconos Universales */}
        <button
          onClick={() => {
            sound.playClick();
            bringToFront('business_email');
          }}
          className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none relative"
        >
          <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1 relative">
            📨
            {getInboxUnreadCount(simState.simulatedEmails) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                {getInboxUnreadCount(simState.simulatedEmails)}
              </span>
            )}
          </div>
          <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
            Correo Empresarial
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            bringToFront('financial_statements');
          }}
          className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
            ⚖️
          </div>
          <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
            Balance & P&L
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            bringToFront('liabilities_manager');
          }}
          className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
            📑
          </div>
          <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
            Pasivos & Deudas
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            bringToFront('competitors_market');
          }}
          className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
            🏢
          </div>
          <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
            Mercado M&A
          </span>
        </button>

        {onReturnToTitle && (
          <button
            onClick={() => {
              sound.playClick();
              onReturnToTitle();
            }}
            className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
          >
            <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
              🏠
            </div>
            <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
              Menú Principal
            </span>
          </button>
        )}

        <button
          onClick={() => {
            sound.playClick();
            setIsNewGameModalOpen(true);
          }}
          className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
            ⭐
          </div>
          <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
            Nueva Partida
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VENTANAS DE CONSTRUCTORA & OBRAS                             */}
      {/* ------------------------------------------------------------- */}
      {roleMode === 'empresario' && isConstructora && (
        <>
          <RetroWindow
            id="construction_bids"
            title={`Mesa de Licitaciones & Obras: ${entityName}`}
            icon="🏛️"
            initialX={60}
            initialY={35}
            isOpen={!!openWindows.construction_bids?.isOpen}
            isMinimized={!!openWindows.construction_bids?.isMinimized}
            isMaximized={!!openWindows.construction_bids?.isMaximized}
            zIndex={openWindows.construction_bids?.zIndex || 10}
            onFocus={() => bringToFront('construction_bids')}
            onClose={() => handleCloseWindow('construction_bids')}
            onMinimize={() => handleMinimizeWindow('construction_bids')}
            onMaximize={() => handleMaximizeWindow('construction_bids')}
          >
            <ConstructionBidsWindow
              tenders={simState.availableTenders}
              activeWorks={simState.activeWorks}
              completedWorks={simState.completedWorksHistory}
              materials={simState.constructionMaterials}
              fiscalSolvenciaActive={simState.fiscalSolvenciaActive}
              storeReputation={simState.storeReputation}
              staffCount={simState.staffCount}
              onSubmitBid={handleSubmitConstructionBid}
            />
          </RetroWindow>

          <RetroWindow
            id="construction_supply"
            title="Patio de Acopio & Almacén de Materiales Pesados"
            icon="🧱"
            initialX={180}
            initialY={60}
            isOpen={!!openWindows.construction_supply?.isOpen}
            isMinimized={!!openWindows.construction_supply?.isMinimized}
            isMaximized={!!openWindows.construction_supply?.isMaximized}
            zIndex={openWindows.construction_supply?.zIndex || 5}
            onFocus={() => bringToFront('construction_supply')}
            onClose={() => handleCloseWindow('construction_supply')}
            onMinimize={() => handleMinimizeWindow('construction_supply')}
            onMaximize={() => handleMaximizeWindow('construction_supply')}
          >
            <ConstructionSupplyWindow
              materials={simState.constructionMaterials}
              orders={simState.constructionOrders}
              storeCash={simState.storeCash}
              storeBankBalance={simState.storeBankBalance}
              onOrderMaterial={handleOrderConstructionMaterial}
            />
          </RetroWindow>
        </>
      )}

      {/* Ventana Universal Tributaria: SAR Solvencia & Auditoría */}
      {roleMode === 'empresario' && (
        <RetroWindow
          id="sar_audit"
          title={`SAR - Declaración Jurada de ISR & Solvencia Fiscal: ${entityName}`}
          icon="📋"
          initialX={240}
          initialY={75}
          isOpen={!!openWindows.sar_audit?.isOpen}
          isMinimized={!!openWindows.sar_audit?.isMinimized}
          isMaximized={!!openWindows.sar_audit?.isMaximized}
          zIndex={openWindows.sar_audit?.zIndex || 5}
          onFocus={() => bringToFront('sar_audit')}
          onClose={() => handleCloseWindow('sar_audit')}
          onMinimize={() => handleMinimizeWindow('sar_audit')}
          onMaximize={() => handleMaximizeWindow('sar_audit')}
        >
          <SarTaxAuditWindow
            state={simState}
            onUpdateState={(nextSt) => setSimState(nextSt)}
            companyName={entityName}
            sarRecord={simState.sarTaxRecord}
            storeCash={simState.storeCash}
            storeBankBalance={simState.storeBankBalance}
            currentYear={simState.currentYear}
            fiscalSolvenciaActive={simState.fiscalSolvenciaActive}
            onPayTax={handlePaySarTax}
          />
        </RetroWindow>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VENTANAS DE COMERCIO MINORISTA / BAR                          */}
      {/* ------------------------------------------------------------- */}
      {roleMode === 'empresario' && !isConstructora && (
        <>
          <RetroWindow
            id="pos_register"
            title={`Caja Registradora: ${entityName}`}
            icon="🛒"
            initialX={60}
            initialY={35}
            isOpen={!!openWindows.pos_register?.isOpen}
            isMinimized={!!openWindows.pos_register?.isMinimized}
            isMaximized={!!openWindows.pos_register?.isMaximized}
            zIndex={openWindows.pos_register?.zIndex || 10}
            onFocus={() => bringToFront('pos_register')}
            onClose={() => handleCloseWindow('pos_register')}
            onMinimize={() => handleMinimizeWindow('pos_register')}
            onMaximize={() => handleMaximizeWindow('pos_register')}
          >
            <RetailRegisterWindow
              queue={simState.walkInQueue}
              products={simState.products}
              receipts={simState.dailyReceipts}
              storeCash={simState.storeCash}
              storeName={entityName}
              onServeCustomer={handleServeCustomer}
              onBatchServe={handleBatchServe}
            />
          </RetroWindow>

          <RetroWindow
            id="supply_stock"
            title="Almacén, Pedidos a Proveedores y Precios"
            icon="📦"
            initialX={180}
            initialY={60}
            isOpen={!!openWindows.supply_stock?.isOpen}
            isMinimized={!!openWindows.supply_stock?.isMinimized}
            isMaximized={!!openWindows.supply_stock?.isMaximized}
            zIndex={openWindows.supply_stock?.zIndex || 5}
            onFocus={() => bringToFront('supply_stock')}
            onClose={() => handleCloseWindow('supply_stock')}
            onMinimize={() => handleMinimizeWindow('supply_stock')}
            onMaximize={() => handleMaximizeWindow('supply_stock')}
          >
            <RetailSupplyWindow
              products={simState.products}
              orders={simState.supplierOrders}
              storeCash={simState.storeCash}
              onOrderProduct={handleOrderProduct}
              onUpdateProductPrice={handleUpdateProductPrice}
            />
          </RetroWindow>
        </>
      )}

      {/* Ventana: Personal & Cuadrilla - Arrastrable */}
      {roleMode === 'empresario' && (
        <RetroWindow
          id="staff_store"
          title={isConstructora ? "Cuadrilla de Obras, Albañiles & Sueldos" : "Personal, Nómina & Local Comercial"}
          icon="👥"
          initialX={280}
          initialY={85}
          isOpen={!!openWindows.staff_store?.isOpen}
          isMinimized={!!openWindows.staff_store?.isMinimized}
          isMaximized={!!openWindows.staff_store?.isMaximized}
          zIndex={openWindows.staff_store?.zIndex || 5}
          onFocus={() => bringToFront('staff_store')}
          onClose={() => handleCloseWindow('staff_store')}
          onMinimize={() => handleMinimizeWindow('staff_store')}
          onMaximize={() => handleMaximizeWindow('staff_store')}
        >
          <RetailStaffWindow
            staffCount={simState.staffCount}
            dailyWages={simState.dailyWages}
            dailyRent={simState.dailyRent}
            reputation={simState.storeReputation}
            cleanliness={simState.storeCleanliness}
            storeCash={simState.storeCash}
            onHireStaff={handleHireStaff}
            onFireStaff={handleFireStaff}
            onCleanStore={handleCleanStore}
          />
        </RetroWindow>
      )}

      {/* Fin de ventanas operativas */}

      {/* ------------------------------------------------------------- */}
      {/* VENTANAS DE BANQUERO (BANK 2000)                              */}
      {/* ------------------------------------------------------------- */}
      {roleMode === 'banquero' && (
        <>
          <RetroWindow
            id="bank_docket"
            title={`Ventanilla de Expedientes & Colateral: ${entityName}`}
            icon="📋"
            initialX={70}
            initialY={35}
            isOpen={!!openWindows.bank_docket?.isOpen}
            isMinimized={!!openWindows.bank_docket?.isMinimized}
            isMaximized={!!openWindows.bank_docket?.isMaximized}
            zIndex={openWindows.bank_docket?.zIndex || 10}
            onFocus={() => bringToFront('bank_docket')}
            onClose={() => handleCloseWindow('bank_docket')}
            onMinimize={() => handleMinimizeWindow('bank_docket')}
            onMaximize={() => handleMaximizeWindow('bank_docket')}
          >
            <BankerDocketWindow
              queue={simState.docketQueue}
              vaultCash={simState.bankerVaultCash}
              onApprove={handleApproveDocket}
              onReject={handleRejectDocket}
              onBatchProcess={handleBatchProcessDockets}
            />
          </RetroWindow>

          <RetroWindow
            id="bank_vault"
            title="Bóveda, Depósitos & Encaje Legal"
            icon="🏦"
            initialX={200}
            initialY={70}
            isOpen={!!openWindows.bank_vault?.isOpen}
            isMinimized={!!openWindows.bank_vault?.isMinimized}
            isMaximized={!!openWindows.bank_vault?.isMaximized}
            zIndex={openWindows.bank_vault?.zIndex || 5}
            onFocus={() => bringToFront('bank_vault')}
            onClose={() => handleCloseWindow('bank_vault')}
            onMinimize={() => handleMinimizeWindow('bank_vault')}
            onMaximize={() => handleMaximizeWindow('bank_vault')}
          >
            <BankVaultWindow
              vaultCash={simState.bankerVaultCash}
              bchReserve={simState.bankerBchReserve}
              totalDeposits={simState.bankerTotalDeposits}
              depositRatePct={simState.bankerDepositRatePct}
              monthlyFee={simState.bankerMonthlyFee}
              atmFee={simState.bankerAtmFee}
              reputation={simState.bankerReputation}
              runRiskPct={simState.bankerRunRiskPct}
              totalLoans={simState.totalLoanPortfolio}
              onUpdateRatesAndFees={handleUpdateBankerRates}
            />
          </RetroWindow>
        </>
      )}

      {/* Modal de Auditoría de Cierre Diario */}
      <DailyClosingModal
        isOpen={isDailyClosingModalOpen}
        day={simState.currentDay}
        month={simState.currentMonth}
        year={simState.currentYear}
        summary={simState.lastClosingSummary}
        onCloseAndContinue={() => setIsDailyClosingModalOpen(false)}
      />

      {/* Modal Asistente de Nueva Partida */}
      <RetroNewGameModal
        isOpen={isNewGameModalOpen}
        currentRole={roleMode}
        currentSector={retailSector}
        currentName={entityName}
        onClose={() => setIsNewGameModalOpen(false)}
        onStartNewGame={handleStartNewGame}
      />

      {/* Ventana: 4 Bancos Comerciales Competidores - Arrastrable */}
      {roleMode === 'empresario' && (
        <RetroWindow
          id="bancos_comerciales"
          title="Banca Comercial Empresarial: Ficohsa · Atlántida · BAC · Occidente"
          icon="🏦"
          initialX={110}
          initialY={40}
          isOpen={!!openWindows.bancos_comerciales?.isOpen}
          isMinimized={!!openWindows.bancos_comerciales?.isMinimized}
          isMaximized={!!openWindows.bancos_comerciales?.isMaximized}
          zIndex={openWindows.bancos_comerciales?.zIndex || 5}
          onFocus={() => bringToFront('bancos_comerciales')}
          onClose={() => handleCloseWindow('bancos_comerciales')}
          onMinimize={() => handleMinimizeWindow('bancos_comerciales')}
          onMaximize={() => handleMaximizeWindow('bancos_comerciales')}
        >
          <CommercialBanksWindow
            state={simState}
            initialBankId={preloadedLoan.bankId}
            initialProductType={preloadedLoan.productType}
            initialAmount={preloadedLoan.amount}
            initialTermMonths={preloadedLoan.termMonths}
            initialOfferId={preloadedLoan.offerId}
            initialCollateralIds={preloadedLoan.collateralIds}
            onOpenChecking={handleOpenBankChecking}
            onRequestLoan={handleRequestCommercialLoan}
            onRequestCard={handleRequestCorporateCard}
            onPledgeGuarantee={handlePledgeGuarantee}
            onReleaseGuarantee={handleReleaseGuarantee}
            onOpenDpf={handleOpenTermDeposit}
            onPayLoan={handlePayLoan}
            onPayCard={handlePayCard}
            onExtraordinaryLoanPayment={handleExtraordinaryLoanPayment}
            onExtraordinaryPaymentWithOptions={handleExtraordinaryPaymentWithOptions}
            onDepositCash={handleDepositCashToBank}
            onWithdrawCash={handleWithdrawCashFromBank}
            onNegotiateCheckingRate={handleNegotiateCheckingRate}
            onNegotiateLoanRate={handleNegotiateLoanRate}
            onLiquidateDpf={handleLiquidateDpf}
            onChargeCard={handleChargeCorporateCard}
            onRequestFullCredit={handleRequestFullCredit}
            onPledgeCollateral={handlePledgeCollateral}
            onReleaseCollateral={handleReleaseCollateral}
            onExecuteFactoring={handleExecuteFactoring}
            onExecuteFlexiblePayment={handleExecuteFlexiblePayment}
            onTransferBetweenAccounts={handleTransferBetweenAccounts}
            onRequestNewAppraisal={handleRequestNewAppraisal}
            onRegisterAssetAsCollateral={handleRegisterAssetAsCollateral}
            onViewVoucher={(v) => setActiveVoucherModal(v)}
          />
        </RetroWindow>
      )}

      {/* Ventana: Concesionarias de Maquinaria Pesada & Volquetas (1 a 5 Estrellas) - Exclusivo Constructora */}
      {roleMode === 'empresario' && isConstructora && (
        <RetroWindow
          id="concesionarias"
          title="Concesionarias de Maquinaria Pesada & Volquetas (1-5★)"
          icon="🚜"
          initialX={150}
          initialY={65}
          isOpen={!!openWindows.concesionarias?.isOpen}
          isMinimized={!!openWindows.concesionarias?.isMinimized}
          isMaximized={!!openWindows.concesionarias?.isMaximized}
          zIndex={openWindows.concesionarias?.zIndex || 5}
          onFocus={() => bringToFront('concesionarias')}
          onClose={() => handleCloseWindow('concesionarias')}
          onMinimize={() => handleMinimizeWindow('concesionarias')}
          onMaximize={() => handleMaximizeWindow('concesionarias')}
        >
          <MachineryDealerWindow
            dealers={simState.machineryDealers || DEFAULT_MACHINERY_DEALERS}
            ownedMachinery={simState.ownedMachinery || []}
            storeCash={simState.storeCash}
            storeBankBalance={simState.storeBankBalance}
            onBuyMachinery={handleBuyMachinery}
          />
        </RetroWindow>
      )}

      {/* Ventana: Licitación Mayorista de Materiales con Fabricantes (1 a 5 Estrellas) - Exclusivo Constructora */}
      {roleMode === 'empresario' && isConstructora && (
        <RetroWindow
          id="licitacion_materiales"
          title="Licitación Mayorista Directa de Materiales con Fabricantes (1-5★)"
          icon="📦"
          initialX={190}
          initialY={80}
          isOpen={!!openWindows.licitacion_materiales?.isOpen}
          isMinimized={!!openWindows.licitacion_materiales?.isMinimized}
          isMaximized={!!openWindows.licitacion_materiales?.isMaximized}
          zIndex={openWindows.licitacion_materiales?.zIndex || 5}
          onFocus={() => bringToFront('licitacion_materiales')}
          onClose={() => handleCloseWindow('licitacion_materiales')}
          onMinimize={() => handleMinimizeWindow('licitacion_materiales')}
          onMaximize={() => handleMaximizeWindow('licitacion_materiales')}
        >
          <MaterialTenderWindow
            quotes={simState.materialManufacturerQuotes || DEFAULT_MANUFACTURER_QUOTES}
            storeCash={simState.storeCash}
            storeBankBalance={simState.storeBankBalance}
            onOrderFromManufacturer={handleOrderFromManufacturerQuote}
          />
        </RetroWindow>
      )}

      {/* Ventana Holding: Directorio Corporativo */}
      {roleMode === 'grupo_empresarial' && (
        <RetroWindow
          id="holding_board"
          title={`Directorio Ejecutivo & Holding Conglomerado: ${entityName}`}
          icon="🏢"
          initialX={60}
          initialY={35}
          isOpen={!!openWindows.holding_board?.isOpen}
          isMinimized={!!openWindows.holding_board?.isMinimized}
          isMaximized={!!openWindows.holding_board?.isMaximized}
          zIndex={openWindows.holding_board?.zIndex || 10}
          onFocus={() => bringToFront('holding_board')}
          onClose={() => handleCloseWindow('holding_board')}
          onMinimize={() => handleMinimizeWindow('holding_board')}
          onMaximize={() => handleMaximizeWindow('holding_board')}
        >
          <div className="p-4 bg-[#dfdfdf] space-y-4 text-xs font-sans">
            <div className="bg-[#000080] text-white p-3 flex justify-between items-center shadow">
              <div>
                <h3 className="font-bold text-sm">Directorio Ejecutivo del Conglomerado</h3>
                <p className="text-[11px] opacity-80">{entityName} · Visión Consolidada</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] block opacity-75">Tesorería Consolidada</span>
                <span className="font-bold text-emerald-300 text-sm">L {simState.storeBankBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-[#808080] p-3 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-1 mb-2">
                  <span>🏛️</span>
                  <span>Filial Bancaria: Áureo Bank</span>
                </div>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <p>Bóveda: <strong>L {simState.bankerVaultCash.toLocaleString()}</strong></p>
                  <p>Depósitos Captados: <strong>L {simState.bankerTotalDeposits.toLocaleString()}</strong></p>
                  <p>Encaje BCH (12%): <strong>L {simState.bankerBchReserve.toLocaleString()}</strong></p>
                </div>
                <button
                  onClick={() => bringToFront('bank_docket')}
                  className="mt-2 w-full py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-bold text-slate-800 text-[10px]"
                >
                  Abrir Ventanilla Bancaria
                </button>
              </div>

              <div className="bg-white border border-[#808080] p-3 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-1 mb-2">
                  <span>🏗️</span>
                  <span>Filial Construcción: Obras</span>
                </div>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <p>Obras Activas: <strong>{simState.activeWorks.length}</strong></p>
                  <p>Cuadrilla: <strong>{simState.staffCount} obreros</strong></p>
                  <p>Solvencia SAR: <strong className="text-emerald-700">{simState.fiscalSolvenciaActive ? 'VIGENTE' : 'PENDIENTE'}</strong></p>
                </div>
                <button
                  onClick={() => bringToFront('construction_bids')}
                  className="mt-2 w-full py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-bold text-slate-800 text-[10px]"
                >
                  Abrir Licitaciones & Obras
                </button>
              </div>

              <div className="bg-white border border-[#808080] p-3 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-1 mb-2">
                  <span>🏪</span>
                  <span>Filial Retail & Supermercado</span>
                </div>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <p>Caja Efectivo: <strong>L {simState.storeCash.toLocaleString()}</strong></p>
                  <p>Reputación Comercial: <strong>{simState.storeReputation}/100</strong></p>
                  <p>Clientes Atendidos Hoy: <strong>{simState.dailyReceipts.length}</strong></p>
                </div>
                <button
                  onClick={() => bringToFront('pos_register')}
                  className="mt-2 w-full py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-bold text-slate-800 text-[10px]"
                >
                  Abrir Góndolas & Ventas
                </button>
              </div>

              <div className="bg-white border border-[#808080] p-3 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-1 mb-2">
                  <span>🏦</span>
                  <span>Mesa Financiera Interbancaria</span>
                </div>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <p>Bancos Aliados: <strong>4 Entidades</strong></p>
                  <p>Líneas de Crédito Activas: <strong>Disponibles</strong></p>
                  <p>Calificación Crediticia: <strong className="text-blue-700">{simState.smartBankCreditRating}</strong></p>
                </div>
                <button
                  onClick={() => bringToFront('bancos_comerciales')}
                  className="mt-2 w-full py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-white border-b-[#404040] border-r-[#404040] font-bold text-slate-800 text-[10px]"
                >
                  Abrir Mesa de 4 Bancos
                </button>
              </div>
            </div>

            <div className="bg-amber-100 border border-amber-400 p-2 text-[11px] text-amber-950 flex items-center justify-between">
              <span>Sinergias Corporativas: El Banco provee liquidez a las obras y las obras abastecen la expansión comercial del holding.</span>
            </div>
          </div>
        </RetroWindow>
      )}

      {/* Ventana: Contabilidad & Estados Financieros (Balance General, P&L, Flujo) */}
      <RetroWindow
        id="financial_statements"
        title={`Estados Financieros & Contabilidad: ${entityName}`}
        icon="⚖️"
        initialX={85}
        initialY={30}
        isOpen={!!openWindows.financial_statements?.isOpen}
        isMinimized={!!openWindows.financial_statements?.isMinimized}
        isMaximized={!!openWindows.financial_statements?.isMaximized}
        zIndex={openWindows.financial_statements?.zIndex || 5}
        onFocus={() => bringToFront('financial_statements')}
        onClose={() => handleCloseWindow('financial_statements')}
        onMinimize={() => handleMinimizeWindow('financial_statements')}
        onMaximize={() => handleMaximizeWindow('financial_statements')}
      >
        <FinancialStatementsWindow state={simState} />
      </RetroWindow>

      {/* Ventana: Centro de Pasivos & Obligaciones */}
      <RetroWindow
        id="liabilities_manager"
        title={`Centro de Pasivos & Obligaciones Financieras: ${entityName}`}
        icon="📑"
        initialX={120}
        initialY={50}
        isOpen={!!openWindows.liabilities_manager?.isOpen}
        isMinimized={!!openWindows.liabilities_manager?.isMinimized}
        isMaximized={!!openWindows.liabilities_manager?.isMaximized}
        zIndex={openWindows.liabilities_manager?.zIndex || 5}
        onFocus={() => bringToFront('liabilities_manager')}
        onClose={() => handleCloseWindow('liabilities_manager')}
        onMinimize={() => handleMinimizeWindow('liabilities_manager')}
        onMaximize={() => handleMaximizeWindow('liabilities_manager')}
      >
        <LiabilitiesManagerWindow
          state={simState}
          onUpdateState={(nextSt) => setSimState(nextSt)}
        />
      </RetroWindow>

      {/* Ventana: Mercado Competidor & M&A */}
      <RetroWindow
        id="competitors_market"
        title="Directorio de Competidores Locales & Fusiones / Adquisiciones (M&A)"
        icon="🏢"
        initialX={140}
        initialY={60}
        isOpen={!!openWindows.competitors_market?.isOpen}
        isMinimized={!!openWindows.competitors_market?.isMinimized}
        isMaximized={!!openWindows.competitors_market?.isMaximized}
        zIndex={openWindows.competitors_market?.zIndex || 5}
        onFocus={() => bringToFront('competitors_market')}
        onClose={() => handleCloseWindow('competitors_market')}
        onMinimize={() => handleMinimizeWindow('competitors_market')}
        onMaximize={() => handleMaximizeWindow('competitors_market')}
      >
        <CompetitorsMarketWindow
          state={simState}
          onUpdateState={(nextSt) => setSimState(nextSt)}
        />
      </RetroWindow>

      {/* Ventana: Correo Empresarial */}
      <RetroWindow
        id="business_email"
        title={`Correo Empresarial - Bandeja Corporativa: ${entityName}`}
        icon="📨"
        initialX={95}
        initialY={40}
        isOpen={!!openWindows.business_email?.isOpen}
        isMinimized={!!openWindows.business_email?.isMinimized}
        isMaximized={!!openWindows.business_email?.isMaximized}
        zIndex={openWindows.business_email?.zIndex || 10}
        onFocus={() => bringToFront('business_email')}
        onClose={() => handleCloseWindow('business_email')}
        onMinimize={() => handleMinimizeWindow('business_email')}
        onMaximize={() => handleMaximizeWindow('business_email')}
      >
        <BusinessEmailWindow
          state={simState}
          companyName={entityName}
          onUpdateEmailState={handleEmailUpdateState}
          onOpenLoanTerms={handleOpenLoanTerms}
          onOpenWindow={bringToFront}
          onRespondEmail={handleRespondEmail}
          onPayLoanFromEmail={handlePayLoanFromEmail}
          onPaySarFromEmail={handlePaySarFromEmail}
          onNegotiateOffer={handleNegotiateOffer}
          onAcceptOfferFromEmail={handleAcceptOfferFromEmail}
          onViewVoucher={(voucher) => setActiveVoucherModal(voucher)}
          onOpenBank={() => bringToFront('bancos_comerciales')}
          onOpenSar={() => bringToFront('sar_audit')}
          onOpenRegister={() => bringToFront('pos_register')}
          onUpdateState={(nextSt: DailySimulationState) => setSimState(nextSt)}
        />
      </RetroWindow>

      {/* Modal de Comprobante Oficial de Transacción Bancaria */}
      {activeVoucherModal && (
        <TransactionVoucherModal
          voucher={activeVoucherModal}
          companyName={entityName}
          onClose={() => setActiveVoucherModal(null)}
        />
      )}

      {/* Barra de Tareas Inferior */}
      <RetroTaskbar
        windows={windowsInfo}
        activeWindowId={activeWindowId}
        currentDay={simState.currentDay}
        currentMonth={simState.currentMonth}
        currentYear={simState.currentYear}
        isDayClosed={simState.isDayClosed}
        onToggleWindow={handleToggleWindow}
        onOpenWindow={bringToFront}
        onAdvanceDay={handleAdvanceDay}
        onAdvanceDays={handleAdvanceDays}
        onOpenNewGame={() => setIsNewGameModalOpen(true)}
        onOpenAuditReport={onOpenAuditReport || (() => {})}
        onOpenBusinessEmail={() => bringToFront('business_email')}
        unreadEmailsCount={getInboxUnreadCount(simState.simulatedEmails)}
        onOpenFinancialStatements={() => bringToFront('financial_statements')}
        onOpenLiabilitiesManager={() => bringToFront('liabilities_manager')}
        onOpenCompetitorsMarket={() => bringToFront('competitors_market')}
        onSaveGame={handleSaveGameJson}
        onLoadGame={handleLoadGameJson}
      />
    </div>
  );
};
