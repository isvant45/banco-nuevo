import React, { useState } from 'react';
import { 
  DailySimulationState, 
  RetailSectorId, 
  RetailCustomerWalkIn, 
  ConstructionMaterialId 
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
  payCommercialLoan,
  payCorporateCreditCard
} from '../../game/commercialBanksEngine';
import {
  DEFAULT_MACHINERY_DEALERS,
  DEFAULT_MANUFACTURER_QUOTES,
  buyMachineryUnit,
  orderFromMaterialManufacturer
} from '../../game/machineryAndSuppliersEngine';
import { sound } from '../../game/audioFx';
import { RetroWindow } from './RetroWindow';
import { RetroTaskbar, WindowInfo } from './RetroTaskbar';
import { BankerDocketWindow } from './BankerDocketWindow';
import { BankVaultWindow } from './BankVaultWindow';
import { RetailRegisterWindow } from './RetailRegisterWindow';
import { RetailSupplyWindow } from './RetailSupplyWindow';
import { RetailStaffWindow } from './RetailStaffWindow';
import { SmartBankEnterpriseWindow } from './SmartBankEnterpriseWindow';
import { CommercialBanksWindow } from './CommercialBanksWindow';
import { MachineryDealerWindow } from './MachineryDealerWindow';
import { MaterialTenderWindow } from './MaterialTenderWindow';
import { ConstructionBidsWindow } from './ConstructionBidsWindow';
import { ConstructionSupplyWindow } from './ConstructionSupplyWindow';
import { SarTaxAuditWindow } from './SarTaxAuditWindow';
import { DailyClosingModal } from './DailyClosingModal';
import { RetroNewGameModal } from './RetroNewGameModal';

interface RetroDesktopProps {
  initialRole: 'empresario' | 'banquero';
  initialSector?: RetailSectorId;
  initialName?: string;
  onOpenAuditReport: () => void;
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
  const [roleMode, setRoleMode] = useState<'empresario' | 'banquero'>(initialRole);
  const [retailSector, setRetailSector] = useState<RetailSectorId>(initialSector);
  const [entityName, setEntityName] = useState<string>(
    initialName || (initialRole === 'empresario' ? (initialSector === 'constructora' ? 'Constructora Metropolitana' : 'Minimarket San Pedro') : 'Áureo Bank Honduras')
  );

  // Estado diario central de la simulación
  const [simState, setSimState] = useState<DailySimulationState>(() => {
    const products = SECTOR_DEFAULT_PRODUCTS[initialSector] || SECTOR_DEFAULT_PRODUCTS.minimarket;
    const isConstructora = initialSector === 'constructora';
    const initialStoreCash = isConstructora ? 120000 : 35000;
    const initialStoreBank = isConstructora ? 1850000 : 120000;
    const initialVaultCash = 850000;
    const initialDeposits = 4500000;

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

      dailyHistory: []
    };
  });

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
    smart_bank: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 },
    bank_docket: { isOpen: roleMode === 'banquero', isMinimized: false, isMaximized: false, zIndex: 10 },
    bank_vault: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 5 }
  });

  const [topZIndex, setTopZIndex] = useState(20);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(
    roleMode === 'empresario' ? (initialSector === 'constructora' ? 'construction_bids' : 'pos_register') : 'bank_docket'
  );
  const [isDailyClosingModalOpen, setIsDailyClosingModalOpen] = useState(false);
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);

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
    } else {
      nextState = advanceBankDay(simState);
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
    setSimState(nextState);
    setIsDailyClosingModalOpen(true);
  };

  // Iniciar Nueva Partida desde el asistente retro
  const handleStartNewGame = (params: {
    roleMode: 'empresario' | 'banquero';
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
    const initialCash = params.roleMode === 'empresario' ? (isConstructora ? 120000 : 45000) : 850000;
    const initialBank = params.roleMode === 'empresario' ? (isConstructora ? 1850000 : 120000) : 120000;

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

      dailyHistory: []
    });

    if (params.roleMode === 'empresario') {
      if (isConstructora) {
        bringToFront('construction_bids');
      } else {
        bringToFront('pos_register');
      }
    } else {
      bringToFront('bank_docket');
    }
  };

  // Construir lista de ventanas activas para la barra de tareas
  const isConstructora = retailSector === 'constructora';

  const windowsInfo: WindowInfo[] = [
    ...(roleMode === 'empresario' ? (
      isConstructora ? [
        { id: 'construction_bids', title: `Licitaciones: ${entityName}`, icon: '🏛️', isOpen: !!openWindows.construction_bids?.isOpen, isMinimized: !!openWindows.construction_bids?.isMinimized },
        { id: 'bancos_comerciales', title: '4 Bancos Comerciales', icon: '🏦', isOpen: !!openWindows.bancos_comerciales?.isOpen, isMinimized: !!openWindows.bancos_comerciales?.isMinimized },
        { id: 'concesionarias', title: 'Concesionarias Maquinaria (1-5★)', icon: '🚜', isOpen: !!openWindows.concesionarias?.isOpen, isMinimized: !!openWindows.concesionarias?.isMinimized },
        { id: 'licitacion_materiales', title: 'Licitación Fabricantes (1-5★)', icon: '📦', isOpen: !!openWindows.licitacion_materiales?.isOpen, isMinimized: !!openWindows.licitacion_materiales?.isMinimized },
        { id: 'construction_supply', title: 'Almacén de Materiales', icon: '🧱', isOpen: !!openWindows.construction_supply?.isOpen, isMinimized: !!openWindows.construction_supply?.isMinimized },
        { id: 'sar_audit', title: 'SAR - Solvencia Fiscal', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized },
        { id: 'staff_store', title: 'Cuadrilla de Obras', icon: '👥', isOpen: !!openWindows.staff_store?.isOpen, isMinimized: !!openWindows.staff_store?.isMinimized },
        { id: 'smart_bank', title: 'Banco Aliado (IA)', icon: '💳', isOpen: !!openWindows.smart_bank?.isOpen, isMinimized: !!openWindows.smart_bank?.isMinimized }
      ] : [
        { id: 'pos_register', title: `Caja Registradora: ${entityName}`, icon: '🛒', isOpen: !!openWindows.pos_register?.isOpen, isMinimized: !!openWindows.pos_register?.isMinimized },
        { id: 'bancos_comerciales', title: '4 Bancos Comerciales', icon: '🏦', isOpen: !!openWindows.bancos_comerciales?.isOpen, isMinimized: !!openWindows.bancos_comerciales?.isMinimized },
        { id: 'supply_stock', title: 'Almacén & Proveedores', icon: '📦', isOpen: !!openWindows.supply_stock?.isOpen, isMinimized: !!openWindows.supply_stock?.isMinimized },
        { id: 'sar_audit', title: 'SAR - Auditoría Fiscal', icon: '📋', isOpen: !!openWindows.sar_audit?.isOpen, isMinimized: !!openWindows.sar_audit?.isMinimized },
        { id: 'staff_store', title: 'Personal & Local', icon: '👥', isOpen: !!openWindows.staff_store?.isOpen, isMinimized: !!openWindows.staff_store?.isMinimized },
        { id: 'smart_bank', title: 'Banco Aliado (IA)', icon: '💳', isOpen: !!openWindows.smart_bank?.isOpen, isMinimized: !!openWindows.smart_bank?.isMinimized }
      ]
    ) : []),
    ...(roleMode === 'banquero' ? [
      { id: 'bank_docket', title: `Ventanilla Créditos: ${entityName}`, icon: '📋', isOpen: !!openWindows.bank_docket?.isOpen, isMinimized: !!openWindows.bank_docket?.isMinimized },
      { id: 'bank_vault', title: 'Bóveda, Depósitos & Tasas', icon: '🏦', isOpen: !!openWindows.bank_vault?.isOpen, isMinimized: !!openWindows.bank_vault?.isMinimized }
    ] : [])
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
                  4 Bancos
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

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('smart_bank');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  💳
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Banco Aliado (IA)
                </span>
              </button>
            </>
          ) : (
            /* Iconos de Tienda Minorista / Bar */
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

              <button
                onClick={() => {
                  sound.playClick();
                  bringToFront('smart_bank');
                }}
                className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
                  💳
                </div>
                <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
                  Banco Aliado (IA)
                </span>
              </button>
            </>
          )
        ) : (
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
          </>
        )}

        {/* Iconos Universales */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenAuditReport();
          }}
          className="w-20 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
        >
          <div className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow group-hover:bg-white/40 mb-1">
            📊
          </div>
          <span className="text-white text-[11px] font-semibold leading-tight drop-shadow px-1 group-focus:bg-[#000080]">
            Auditoría General
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

      {/* Ventana: Banco Aliado IA para la Empresa - Arrastrable */}
      {roleMode === 'empresario' && (
        <RetroWindow
          id="smart_bank"
          title="Banco Aliado & Financiamiento Empresarial (IA)"
          icon="💳"
          initialX={220}
          initialY={50}
          isOpen={!!openWindows.smart_bank?.isOpen}
          isMinimized={!!openWindows.smart_bank?.isMinimized}
          isMaximized={!!openWindows.smart_bank?.isMaximized}
          zIndex={openWindows.smart_bank?.zIndex || 5}
          onFocus={() => bringToFront('smart_bank')}
          onClose={() => handleCloseWindow('smart_bank')}
          onMinimize={() => handleMinimizeWindow('smart_bank')}
          onMaximize={() => handleMaximizeWindow('smart_bank')}
        >
          <SmartBankEnterpriseWindow
            offers={simState.smartBankOffers}
            monthlySales={simState.monthlySalesAccumulated || 0}
            storeCash={simState.storeCash}
            creditRating={simState.smartBankCreditRating}
            onAcceptFacility={handleAcceptBankFacility}
            onRepayFacility={handleRepayBankFacility}
          />
        </RetroWindow>
      )}

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
            onOpenChecking={handleOpenBankChecking}
            onRequestLoan={handleRequestCommercialLoan}
            onRequestCard={handleRequestCorporateCard}
            onPledgeGuarantee={handlePledgeGuarantee}
            onReleaseGuarantee={handleReleaseGuarantee}
            onOpenDpf={handleOpenTermDeposit}
            onPayLoan={handlePayLoan}
            onPayCard={handlePayCard}
          />
        </RetroWindow>
      )}

      {/* Ventana: Concesionarias de Maquinaria Pesada & Volquetas (1 a 5 Estrellas) */}
      {roleMode === 'empresario' && (
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

      {/* Ventana: Licitación Mayorista de Materiales con Fabricantes (1 a 5 Estrellas) */}
      {roleMode === 'empresario' && (
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
        onOpenAuditReport={onOpenAuditReport}
      />
    </div>
  );
};
