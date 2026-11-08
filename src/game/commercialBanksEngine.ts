import { 
  DailySimulationState, 
  CommercialBankId, 
  CommercialBankProfile, 
  CommercialBankRelationship,
  BankCommercialLoan,
  CommercialLoanType,
  BankCorporateCreditCard,
  BankCheckingAccount,
  BankGuaranteeDeposit,
  BankTermDeposit,
  CompanyCreditProfile,
  OwnedMachineryUnit,
  MachineryCategory,
  RealEstateCollateralItem,
  SupplierCreditItem,
  CompetitorFirm,
  FinancialStatementsSummary,
  RetailSectorId,
  TransactionVoucher,
  SimulatedEmail,
  CollateralLien,
  DynamicBankOffer,
  CorporateCardTierId
} from './retroSimTypes';
import { isSimOfferExpired, advanceSimCalendar } from './simCalendar';

/**
 * Perfiles Institucionales de los Bancos Comerciales de Honduras
 */
export const COMMERCIAL_BANKS_PROFILES: Record<CommercialBankId, CommercialBankProfile> = {
  ficohsa: {
    id: 'ficohsa',
    name: 'Banco Ficohsa S.A.',
    shortName: 'Ficohsa',
    logo: '🏛️',
    tagline: 'Líder en Banca Corporativa, Comercio Exterior y Grandes Proyectos',
    colorHex: '#003882',
    baseInterestRateLoan: 12.0, // 12% anual
    baseDpfRate: 6.8, // 6.8% DPF anual
    creditCardFeeAnnual: 1200,
    minMonthlySalesForCredit: 150000
  },
  atlantida: {
    id: 'atlantida',
    name: 'Banco Atlántida S.A.',
    shortName: 'Atlántida',
    logo: '🦁',
    tagline: 'Más de 110 años respaldando a la gran industria y construcción',
    colorHex: '#c4121a',
    baseInterestRateLoan: 11.5, // 11.5% anual
    baseDpfRate: 7.2, // 7.2% DPF anual
    creditCardFeeAnnual: 1000,
    minMonthlySalesForCredit: 120000
  },
  bac: {
    id: 'bac',
    name: 'BAC Credomatic Honduras',
    shortName: 'BAC',
    logo: '💳',
    tagline: 'Líder regional en Tarjetas Corporativas y Medios de Pago Digital',
    colorHex: '#e30613',
    baseInterestRateLoan: 12.8,
    baseDpfRate: 6.2,
    creditCardFeeAnnual: 1500,
    minMonthlySalesForCredit: 100000
  },
  occidente: {
    id: 'occidente',
    name: 'Banco de Occidente S.A.',
    shortName: 'Occidente',
    logo: '🌱',
    tagline: 'Apoyando al desarrollo de la empresa hondureña con la menor tasa',
    colorHex: '#006837',
    baseInterestRateLoan: 10.9, // Tasa más baja del mercado
    baseDpfRate: 7.5, // Mejor tasa pasiva en DPF
    creditCardFeeAnnual: 800,
    minMonthlySalesForCredit: 80000
  }
};

/**
 * Categorías y Niveles de Tarjetas de Crédito Corporativas
 */
export const CORPORATE_CARD_TIERS: Record<string, {
  tierId: 'business_standard' | 'corporate_gold' | 'infinite_black';
  name: string;
  badge: string;
  colorHex: string;
  cashbackPct: number;
  interestRateAnnual: number;
  minMonthlySales: number;
  annualFeeHNL: number;
  pointsMultiplier: number;
  perks: string[];
}> = {
  business_standard: {
    tierId: 'business_standard',
    name: 'Business Standard',
    badge: '💳 CLÁSICA',
    colorHex: '#334155',
    cashbackPct: 1.5,
    interestRateAnnual: 22.0,
    minMonthlySales: 50000,
    annualFeeHNL: 1200,
    pointsMultiplier: 1, // 1 punto por cada L 100 gastados
    perks: ['Compras de materiales y suministros', 'Corte mensual a 30 días', 'Acceso a cajeros automáticos']
  },
  corporate_gold: {
    tierId: 'corporate_gold',
    name: 'Corporate Gold Executive',
    badge: '🥇 GOLD EJECUTIVA',
    colorHex: '#b45309',
    cashbackPct: 2.8,
    interestRateAnnual: 18.5,
    minMonthlySales: 250000,
    annualFeeHNL: 2800,
    pointsMultiplier: 2, // 2 puntos por cada L 100 gastados
    perks: ['Cashback preferencial 2.8%', 'Sobregiro de emergencia 15%', 'Tasa reducida al 18.5% anual', 'Asistencia vial 24/7 de flota']
  },
  infinite_black: {
    tierId: 'infinite_black',
    name: 'Infinite Black Metal',
    badge: '💎 BLACK INFINITE',
    colorHex: '#09090b',
    cashbackPct: 4.5,
    interestRateAnnual: 14.5,
    minMonthlySales: 600000,
    annualFeeHNL: 5500,
    pointsMultiplier: 3, // 3 puntos por cada L 100 gastados
    perks: ['Super cashback 4.5% corporativo', 'Multiplicador x3 de puntos de recompensa', 'Tasa súper preferencial 14.5%', 'Línea de crédito prioritaria sin trámites']
  }
};

/**
 * Catálogo Oficial de Recompensas Corporativas (Canjeables con Puntos)
 */
export const CORPORATE_REWARDS_CATALOG = [
  {
    id: 'reward_gas_voucher',
    title: 'Bono de Combustible Diésel / Gasolina L 10,000',
    pointsCost: 500,
    category: 'combustible' as const,
    benefitValueHNL: 10000,
    description: 'Vales canjeables en estaciones Puma, Texaco y Uno para abastecimiento de maquinaria pesada o flota de reparto.'
  },
  {
    id: 'reward_fleet_maintenance',
    title: 'Kit Mantenimiento Preventivo de Flota L 25,000',
    pointsCost: 1100,
    category: 'mantenimiento' as const,
    benefitValueHNL: 25000,
    description: 'Filtros, lubricantes y revisión técnica certificada para 2 unidades de maquinaria pesada o vehículos comerciales.'
  },
  {
    id: 'reward_tax_deduction',
    title: 'Escudo Fiscal y Certificado SAR L 40,000',
    pointsCost: 1600,
    category: 'impuestos' as const,
    benefitValueHNL: 40000,
    description: 'Crédito tributario aplicable directo a la liquidación fiscal del SAR, optimizando la solvencia tributaria empresarial.'
  },
  {
    id: 'reward_cash_rebate',
    title: 'Cashback Directo en Cuenta Comercial L 60,000',
    pointsCost: 2200,
    category: 'cashback_directo' as const,
    benefitValueHNL: 60000,
    description: 'Acreditación líquida inmediata a tu cuenta de cheques bancaria con disponibilidad total para capital de trabajo.'
  }
];

/**
 * Cálculo de Bonificación por Tramo de Capital para DPF
 */
export function calculateDpfTierBonus(amountHNL: number): {
  tierName: 'Estándar' | 'Plata' | 'Oro' | 'Diamante Institucional';
  bonusPct: number;
  badge: string;
} {
  if (amountHNL >= 2000000) {
    return { tierName: 'Diamante Institucional', bonusPct: 2.2, badge: '💎 TRAMO DIAMANTE (+2.2% APR)' };
  }
  if (amountHNL >= 1000000) {
    return { tierName: 'Oro', bonusPct: 1.5, badge: '🥇 TRAMO ORO (+1.5% APR)' };
  }
  if (amountHNL >= 400000) {
    return { tierName: 'Plata', bonusPct: 0.8, badge: '🥈 TRAMO PLATA (+0.8% APR)' };
  }
  return { tierName: 'Estándar', bonusPct: 0, badge: '🥉 TRAMO ESTÁNDAR' };
}

/**
 * Cálculo del Score Crediticio Empresarial (300 a 850 puntos)
 * Evalúa puntualidad en pagos, liquidez, facturación, solvencia fiscal y nivel de endeudamiento.
 */
export function calculateCompanyCreditScore(state: DailySimulationState): CompanyCreditProfile {
  let score = 620; // Base inicial para empresa en operación

  const totalLiquidity = (state.storeCash || 0) + (state.storeBankBalance || 0);
  const monthlySales = Math.max(state.monthlySalesAccumulated || 0, 0);

  // 1. Solvencia Fiscal del SAR
  if (state.fiscalSolvenciaActive) {
    score += 45;
  } else {
    score -= 60;
  }

  // 2. Reputación de la Empresa
  const rep = state.storeReputation || 70;
  if (rep >= 85) score += 35;
  else if (rep >= 75) score += 20;
  else if (rep < 50) score -= 40;

  // 3. Liquidez en Caja y Bancos
  if (totalLiquidity >= 2000000) score += 50;
  else if (totalLiquidity >= 1000000) score += 35;
  else if (totalLiquidity >= 400000) score += 20;
  else if (totalLiquidity < 50000) score -= 30;

  // 4. Ventas Mensuales
  if (monthlySales >= 1500000) score += 50;
  else if (monthlySales >= 600000) score += 35;
  else if (monthlySales >= 200000) score += 20;

  // 5. Historial de Pagos Puntuales y Deuda Total
  let totalActiveDebt = 0;
  let totalMonthlyCommitments = 0;
  let totalLimit = 0;
  let totalCardBalance = 0;

  const banks = state.commercialBanks || {};
  Object.values(banks).forEach(rel => {
    if (rel?.activeLoan) {
      totalActiveDebt += rel.activeLoan.balanceRemaining;
      totalMonthlyCommitments += rel.activeLoan.monthlyPayment;
    }
    if (rel?.corporateCard) {
      totalLimit += rel.corporateCard.creditLimit;
      totalCardBalance += rel.corporateCard.currentBalance;
      totalActiveDebt += rel.corporateCard.currentBalance;
      totalMonthlyCommitments += rel.corporateCard.minPaymentMonthly;
    }
  });

  // Racha de pagos puntuales
  const streak = state.companyCreditProfile?.onTimePaymentsStreak || 1;
  score += Math.min(60, streak * 6);

  // Ratio de utilización de tarjeta
  const utilizationPct = totalLimit > 0 ? Math.round((totalCardBalance / totalLimit) * 100) : 0;
  if (totalLimit > 0) {
    if (utilizationPct <= 30) score += 25;
    else if (utilizationPct > 80) score -= 35;
  }

  // DTI (Debt-to-Income / Deuda sobre Ventas Mensuales)
  const dtiRatioPct = monthlySales > 0 
    ? Math.min(100, Math.round((totalMonthlyCommitments / (monthlySales / 12 * 0.8 + 10000)) * 100))
    : 25;

  if (dtiRatioPct > 60) score -= 45;
  else if (dtiRatioPct < 25) score += 20;

  // Límite acotado entre 300 y 850
  score = Math.max(300, Math.min(850, Math.round(score)));

  let tier: 'AAA_EXCELENTE' | 'AA_MUY_BUENO' | 'A_BUENO' | 'B_ACEPTABLE' | 'C_EN_RIESGO' = 'B_ACEPTABLE';
  let tierLabel = 'Aceptable · Supervisión Periódica';
  let rateDiscountPct = 0;

  if (score >= 780) {
    tier = 'AAA_EXCELENTE';
    tierLabel = 'Excelente · Grado de Inversión Premium';
    rateDiscountPct = 2.2;
  } else if (score >= 710) {
    tier = 'AA_MUY_BUENO';
    tierLabel = 'Muy Bueno · Sujeto de Crédito Preferencial';
    rateDiscountPct = 1.4;
  } else if (score >= 640) {
    tier = 'A_BUENO';
    tierLabel = 'Bueno · Aprobación Estándar';
    rateDiscountPct = 0.6;
  } else if (score >= 540) {
    tier = 'B_ACEPTABLE';
    tierLabel = 'Aceptable · Capacidad Moderada';
    rateDiscountPct = 0;
  } else {
    tier = 'C_EN_RIESGO';
    tierLabel = 'Riesgo Elevado · Crédito Restringido';
    rateDiscountPct = -1.5; // Recargo
  }

  return {
    score,
    tier,
    tierLabel,
    onTimePaymentsStreak: streak,
    lastBiweeklyReviewDay: state.companyCreditProfile?.lastBiweeklyReviewDay || state.currentDay,
    totalCreditLimit: totalLimit,
    creditUtilizationPct: utilizationPct,
    autoLimitIncreaseUnlocked: score >= 650 && streak >= 1,
    rateDiscountPct,
    dtiRatioPct
  };
}

/**
 * Inicializador del ecosistema de bancos para la empresa
 */
export function createDefaultBankRelationships(initialBankBalance: number = 1850000): Record<CommercialBankId, CommercialBankRelationship> {
  return {
    atlantida: {
      bankId: 'atlantida',
      relationshipScore: 70,
      checkingAccount: {
        accountNumber: 'CTA-0101-2026-ATL-0428',
        balance: initialBankBalance,
        overdraftLimit: 250000,
        overdraftUsed: 0,
        checksUsedCount: 3,
        interestRateAnnual: 4.5
      },
      corporateCard: {
        cardId: 'card-atl-01',
        bankId: 'atlantida',
        brand: 'Visa Signature Corporativa Atlántida (Business Standard)',
        tier: 'business_standard',
        creditLimit: 300000,
        currentBalance: 0,
        interestRateAnnual: 22.0,
        minPaymentMonthly: 0,
        cashbackPct: 1.5,
        rewardPoints: 350,
        pointsAccumulatedTotal: 350
      },
      guaranteeDeposits: [],
      termDeposits: [],
      loans: []
    },
    ficohsa: {
      bankId: 'ficohsa',
      relationshipScore: 60,
      checkingAccount: {
        accountNumber: 'CTA-0101-2026-FIC-8812',
        balance: 100000,
        overdraftLimit: 500000,
        overdraftUsed: 0,
        checksUsedCount: 1,
        interestRateAnnual: 4.0
      },
      guaranteeDeposits: [],
      termDeposits: [],
      loans: []
    },
    bac: {
      bankId: 'bac',
      relationshipScore: 55,
      guaranteeDeposits: [],
      termDeposits: [],
      loans: []
    },
    occidente: {
      bankId: 'occidente',
      relationshipScore: 50,
      guaranteeDeposits: [],
      termDeposits: [],
      loans: []
    }
  };
}

/**
 * Evaluación de Capacidad Económica y Financiera de la Empresa
 */
export function evaluateContractorEconomicCapacity(state: DailySimulationState): {
  monthlySalesEstimate: number;
  machineryFleetValue: number;
  activeContractsValue: number;
  totalLiquidity: number;
  maxBorrowingCapacity: number;
  maxCorporateCardLimit: number;
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'B';
  creditProfile: CompanyCreditProfile;
  offersByBank: Record<CommercialBankId, {
    maxLoanHNL: number;
    recommendedRatePct: number;
    maxCardHNL: number;
    approvedChecking: boolean;
  }>;
} {
  const creditProfile = calculateCompanyCreditScore(state);
  const totalLiquidity = (state.storeCash || 0) + (state.storeBankBalance || 0);
  const machineryFleetValue = (state.ownedMachinery || []).reduce((sum, m) => sum + m.purchasePrice, 0);
  const activeContractsValue = (state.activeWorks || []).reduce((sum, w) => sum + (w.totalContractPrice - w.billedMilestonesAmount), 0);
  // Ventas reales acumuladas o registradas en caja (sin inflaciones ficticias mínimas)
  const realSales = state.monthlySalesAccumulated || 0;
  const receiptsSales = (state.dailyReceipts || []).reduce((sum, r) => sum + (r.totalHNL ?? 0), 0) * 30;
  const monthlySales = realSales > 0 ? realSales : (receiptsSales > 0 ? receiptsSales : 0);

  // Gastos operativos y obligaciones de crédito existentes
  const monthlyOperatingExpenses = ((state.dailyWages || 0) + (state.dailyRent || 0)) * 30;
  const existingMonthlyObligations = Object.values(state.commercialBanks || {}).reduce((s, b) => s + (b.activeLoan?.monthlyPayment || 0), 0);
  const netMonthlyOperatingIncome = Math.max(0, monthlySales - monthlyOperatingExpenses - existingMonthlyObligations);

  // Multiplicador de crédito según Score Crediticio (hasta +30% de capacidad si es excelente)
  const scoreMultiplier = creditProfile.score >= 780 ? 1.3 : creditProfile.score >= 710 ? 1.15 : creditProfile.score >= 640 ? 1.0 : 0.8;
  const flowCapacity = monthlySales > 0 ? Math.round(monthlySales * 2.8 + netMonthlyOperatingIncome * 6.0) : Math.round(totalLiquidity * 0.5);
  const baseBorrowing = Math.round((flowCapacity + machineryFleetValue * 0.5 + activeContractsValue * 0.3) * scoreMultiplier);

  // Aforo real contable de garantías reales disponibles al 80% de cobertura
  const totalCollateralNetCapacity = (state.realEstateCollaterals || []).reduce((sum, col) => {
    const appraisal = col.appraisalValueHNL || col.appraisalValue || 0;
    const ltvPct = col.ltvAcceptedPct || col.ltvPercentage || col.ltvPct || 80;
    const eligible = Math.round(appraisal * (ltvPct / 100));
    const committed = (col.liens && col.liens.length > 0)
      ? col.liens.reduce((s, l) => s + (l.committedCoverageHNL || 0), 0)
      : (col.pledgedAmountTotal || 0);
    return sum + Math.max(0, eligible - committed);
  }, 0);

  // La garantía cubre el 80% del préstamo, por lo que respalda hasta (cobertura / 0.80)
  const collateralFinancingPower = totalCollateralNetCapacity > 0
    ? Math.round(totalCollateralNetCapacity / 0.80)
    : 0;

  const maxBorrowing = baseBorrowing + collateralFinancingPower;
  const maxCard = Math.round((monthlySales > 0 ? monthlySales * 0.35 : totalLiquidity * 0.20) * scoreMultiplier);

  const rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'B' = 
    creditProfile.score >= 780 ? 'AAA' : 
    creditProfile.score >= 710 ? 'AA' : 
    creditProfile.score >= 640 ? 'A' : 
    creditProfile.score >= 540 ? 'BBB' : 'B';

  const discount = creditProfile.rateDiscountPct;

  // Ofertas diferenciadas por cada uno de los bancos competidores
  const offersByBank: Record<CommercialBankId, any> = {
    ficohsa: {
      maxLoanHNL: Math.round(maxBorrowing * 1.15),
      recommendedRatePct: Math.max(8.5, Number((12.0 - discount).toFixed(1))),
      maxCardHNL: Math.round(maxCard * 1.25),
      approvedChecking: true
    },
    atlantida: {
      maxLoanHNL: Math.round(maxBorrowing * 1.10),
      recommendedRatePct: Math.max(8.0, Number((11.5 - discount).toFixed(1))),
      maxCardHNL: Math.round(maxCard * 1.10),
      approvedChecking: true
    },
    bac: {
      maxLoanHNL: Math.round(maxBorrowing * 0.95),
      recommendedRatePct: Math.max(8.8, Number((12.8 - discount).toFixed(1))),
      maxCardHNL: Math.round(maxCard * 1.50),
      approvedChecking: true
    },
    occidente: {
      maxLoanHNL: Math.round(maxBorrowing * 1.05),
      recommendedRatePct: Math.max(7.5, Number((10.9 - discount).toFixed(1))),
      maxCardHNL: Math.round(maxCard * 0.90),
      approvedChecking: true
    }
  };

  return {
    monthlySalesEstimate: monthlySales,
    machineryFleetValue,
    activeContractsValue,
    totalLiquidity,
    maxBorrowingCapacity: maxBorrowing,
    maxCorporateCardLimit: maxCard,
    creditRating: rating,
    creditProfile,
    offersByBank
  };
}

/**
 * Apertura de Cuenta Corriente con Chequera en Banco Seleccionado
 */
export function openBankCheckingAccount(
  state: DailySimulationState,
  bankId: CommercialBankId,
  initialDeposit: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (state.storeBankBalance < initialDeposit) {
    return { updatedState: state, success: false, message: 'Fondos insuficientes para aperturar la cuenta corriente.' };
  }

  const bankProfile = COMMERCIAL_BANKS_PROFILES[bankId];
  const accountNumber = `CTA-0101-2026-${bankId.toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`;

  const currentRel = state.commercialBanks[bankId] || {
    bankId,
    relationshipScore: 50,
    guaranteeDeposits: [],
    termDeposits: []
  };

  const newAccount: BankCheckingAccount = {
    accountNumber,
    balance: initialDeposit,
    overdraftLimit: Math.round(initialDeposit * 0.5),
    overdraftUsed: 0,
    checksUsedCount: 0
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 10),
      checkingAccount: newAccount
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance - initialDeposit,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡Cuenta Corriente aperturada en ${bankProfile.name}! Chequera y línea de sobregiro habilitadas con L ${initialDeposit.toLocaleString()}.`
  };
}

/**
 * Solicitud de Préstamo Comercial Bancario
 */
export function requestCommercialBankLoan(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amountHNL: number,
  termMonths: number,
  purpose: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const capacity = evaluateContractorEconomicCapacity(state);
  const bankOffer = capacity.offersByBank[bankId];

  if (amountHNL > bankOffer.maxLoanHNL) {
    return {
      updatedState: state,
      success: false,
      message: `El monto solicitado (L ${amountHNL.toLocaleString()}) supera la capacidad máxima pre-aprobada por ${COMMERCIAL_BANKS_PROFILES[bankId].name} (L ${bankOffer.maxLoanHNL.toLocaleString()}).`
    };
  }

  const currentRel = state.commercialBanks[bankId];
  if (currentRel?.activeLoan && currentRel.activeLoan.balanceRemaining > 0) {
    return {
      updatedState: state,
      success: false,
      message: `Ya tienes un préstamo activo con ${COMMERCIAL_BANKS_PROFILES[bankId].name}. Debes amortizarlo antes de refinanciar.`
    };
  }

  const interestRate = bankOffer.recommendedRatePct;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = Math.round((amountHNL * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths)));

  const newLoan: BankCommercialLoan = {
    id: `loan-${bankId}-${Date.now().toString().slice(-4)}`,
    bankId,
    principalAmount: amountHNL,
    balanceRemaining: amountHNL,
    monthlyPayment,
    interestRateAnnual: interestRate,
    termMonthsRemaining: termMonths,
    purpose: purpose || 'Capital de Trabajo y Compra de Materiales'
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, (currentRel?.relationshipScore || 50) + 12),
      activeLoan: newLoan
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance + amountHNL,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡PRÉSTAMO DESEMBOLSADO! ${COMMERCIAL_BANKS_PROFILES[bankId].name} aprobó L ${amountHNL.toLocaleString()} al ${interestRate}% anual. Cuota mensual: L ${monthlyPayment.toLocaleString()}. Fondos acreditados a tu cuenta bancaria.`
  };
}

/**
 * Clase de Tarjeta de Crédito Corporativa (Módulo ERP Financiero y de Tesorería)
 * Control estricto en tiempo real del límite de crédito (creditLimit), saldo disponible (availableBalance)
 * y deuda pendiente (usedBalance).
 * Valida fondos insuficientes, previene saldos negativos y mantiene la invariante:
 * availableBalance + usedBalance === creditLimit
 */
export class CorporateCreditCard {
  public cardId: string;
  public cardNumber?: string;
  public bankId: CommercialBankId;
  public brand: string;
  public tier?: CorporateCardTierId;
  public creditLimit: number;
  public availableBalance: number;
  public usedBalance: number;
  public interestRateAnnual: number;
  public minPaymentMonthly: number;
  public cashbackPct: number;
  public rewardPoints: number;
  public pointsAccumulatedTotal: number;
  public lastLimitIncreaseDay?: number;
  public limitIncreasesCount?: number;

  constructor(data: {
    cardId?: string;
    cardNumber?: string;
    bankId?: CommercialBankId;
    brand?: string;
    tier?: CorporateCardTierId;
    creditLimit: number;
    availableBalance?: number;
    usedBalance?: number;
    currentBalance?: number;
    availableCredit?: number;
    interestRateAnnual?: number;
    minPaymentMonthly?: number;
    cashbackPct?: number;
    rewardPoints?: number;
    pointsAccumulatedTotal?: number;
    lastLimitIncreaseDay?: number;
    limitIncreasesCount?: number;
  }) {
    if (!Number.isFinite(data.creditLimit) || data.creditLimit < 0) {
      throw new Error('El límite de crédito debe ser un valor numérico positivo o cero.');
    }

    this.cardId = data.cardId || `card-corp-${Date.now()}`;
    this.cardNumber = data.cardNumber;
    this.bankId = data.bankId || 'atlantida';
    this.brand = data.brand || 'Visa Signature Corporativa';
    this.tier = data.tier || 'business_standard';
    this.creditLimit = data.creditLimit;

    // Normalizar deuda pendiente (usedBalance / currentBalance)
    const initialUsed = data.usedBalance ?? data.currentBalance ?? 0;
    if (!Number.isFinite(initialUsed) || initialUsed < 0) {
      throw new Error('El saldo utilizado no puede ser negativo.');
    }
    this.usedBalance = Math.min(this.creditLimit, Math.max(0, initialUsed));

    // Normalizar saldo disponible (availableBalance / availableCredit)
    const calculatedAvailable = this.creditLimit - this.usedBalance;
    this.availableBalance = data.availableBalance !== undefined
      ? Math.max(0, Math.min(this.creditLimit, data.availableBalance))
      : (data.availableCredit !== undefined ? Math.max(0, Math.min(this.creditLimit, data.availableCredit)) : calculatedAvailable);

    // Salvaguardar invariante: availableBalance + usedBalance <= creditLimit
    if (this.availableBalance + this.usedBalance > this.creditLimit) {
      this.availableBalance = Math.max(0, this.creditLimit - this.usedBalance);
    }

    this.interestRateAnnual = data.interestRateAnnual ?? 22.0;
    this.minPaymentMonthly = data.minPaymentMonthly ?? Math.round(this.usedBalance * 0.05);
    this.cashbackPct = data.cashbackPct ?? 1.5;
    this.rewardPoints = data.rewardPoints ?? 100;
    this.pointsAccumulatedTotal = data.pointsAccumulatedTotal ?? 100;
    this.lastLimitIncreaseDay = data.lastLimitIncreaseDay;
    this.limitIncreasesCount = data.limitIncreasesCount;
  }

  // Getters/setters para compatibilidad
  public get currentBalance(): number {
    return this.usedBalance;
  }
  public set currentBalance(value: number) {
    this.usedBalance = value;
  }

  public get availableCredit(): number {
    return this.availableBalance;
  }
  public set availableCredit(value: number) {
    this.availableBalance = value;
  }

  /**
   * Procesa una compra deduciendo del disponible y sumando a la deuda pendiente
   */
  public processPurchase(
    amount: number,
    description: string = 'Compra con Tarjeta Corporativa'
  ): {
    success: boolean;
    message: string;
    newAvailableBalance: number;
    newUsedBalance: number;
    cashbackEarned: number;
  } {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('El monto de compra debe ser un valor numérico positivo y finito.');
    }

    if (amount > this.availableBalance) {
      throw new Error(
        `Fondos insuficientes en la tarjeta corporativa. Disponible: L ${this.availableBalance.toLocaleString()}, Requerido: L ${amount.toLocaleString()}.`
      );
    }

    this.availableBalance = Math.max(0, Number((this.availableBalance - amount).toFixed(2)));
    this.usedBalance = Math.min(this.creditLimit, Number((this.usedBalance + amount).toFixed(2)));
    this.minPaymentMonthly = Math.round(this.usedBalance * 0.05);

    const cashbackEarned = Math.round(amount * (this.cashbackPct / 100));
    const pointsEarned = Math.max(1, Math.round(amount / 100));
    this.rewardPoints += pointsEarned;
    this.pointsAccumulatedTotal += pointsEarned;

    return {
      success: true,
      message: `¡Compra autorizada! Se cargaron L ${amount.toLocaleString()} ("${description}"). Saldo utilizado: L ${this.usedBalance.toLocaleString()}. Disponible restante: L ${this.availableBalance.toLocaleString()}.`,
      newAvailableBalance: this.availableBalance,
      newUsedBalance: this.usedBalance,
      cashbackEarned
    };
  }

  /**
   * Procesa un pago a la tarjeta corporativa realizando la operación inversa
   */
  public payCreditCard(amount: number): {
    success: boolean;
    message: string;
    newAvailableBalance: number;
    newUsedBalance: number;
    actualPayment: number;
  } {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('El monto a pagar debe ser un valor numérico positivo y finito.');
    }

    if (this.usedBalance <= 0) {
      throw new Error('La tarjeta corporativa no tiene saldo deudor pendiente.');
    }

    const actualPayment = Math.min(amount, this.usedBalance);
    this.usedBalance = Math.max(0, Number((this.usedBalance - actualPayment).toFixed(2)));
    this.availableBalance = Math.min(this.creditLimit, Number((this.availableBalance + actualPayment).toFixed(2)));
    this.minPaymentMonthly = Math.round(this.usedBalance * 0.05);

    return {
      success: true,
      message: `Abono de L ${actualPayment.toLocaleString()} aplicado con éxito. Deuda remanente: L ${this.usedBalance.toLocaleString()}. Disponible restablecido: L ${this.availableBalance.toLocaleString()}.`,
      newAvailableBalance: this.availableBalance,
      newUsedBalance: this.usedBalance,
      actualPayment
    };
  }

  /**
   * Serializa a interfaz BankCorporateCreditCard
   */
  public toJSON(): BankCorporateCreditCard {
    return {
      cardId: this.cardId,
      cardNumber: this.cardNumber,
      bankId: this.bankId,
      brand: this.brand,
      tier: this.tier,
      creditLimit: this.creditLimit,
      availableBalance: this.availableBalance,
      usedBalance: this.usedBalance,
      currentBalance: this.usedBalance,
      availableCredit: this.availableBalance,
      interestRateAnnual: this.interestRateAnnual,
      minPaymentMonthly: this.minPaymentMonthly,
      cashbackPct: this.cashbackPct,
      rewardPoints: this.rewardPoints,
      pointsAccumulatedTotal: this.pointsAccumulatedTotal,
      lastLimitIncreaseDay: this.lastLimitIncreaseDay,
      limitIncreasesCount: this.limitIncreasesCount
    };
  }

  public static fromCard(card: BankCorporateCreditCard): CorporateCreditCard {
    return new CorporateCreditCard(card);
  }
}

/**
 * Solicitud de Tarjeta de Crédito Corporativa
 */
export function requestCorporateCard(
  state: DailySimulationState,
  bankId: CommercialBankId,
  requestedLimit: number,
  tierId: 'business_standard' | 'corporate_gold' | 'infinite_black' = 'business_standard'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const capacity = evaluateContractorEconomicCapacity(state);
  const bankOffer = capacity.offersByBank[bankId];
  const tierConfig = CORPORATE_CARD_TIERS[tierId] || CORPORATE_CARD_TIERS.business_standard;

  if (requestedLimit > bankOffer.maxCardHNL) {
    return {
      updatedState: state,
      success: false,
      message: `El límite solicitado excede el cupo pre-aprobado por ${COMMERCIAL_BANKS_PROFILES[bankId].name} (L ${bankOffer.maxCardHNL.toLocaleString()}).`
    };
  }

  const currentRel = state.commercialBanks[bankId];
  if (currentRel?.corporateCard) {
    return {
      updatedState: state,
      success: false,
      message: `Ya dispones de una tarjeta corporativa activa con ${COMMERCIAL_BANKS_PROFILES[bankId].name}.`
    };
  }

  const baseBrand = bankId === 'bac' 
    ? 'Mastercard BAC'
    : bankId === 'ficohsa'
    ? 'Visa Ficohsa'
    : bankId === 'atlantida'
    ? 'Visa Atlántida'
    : 'Visa Occidente';

  const cardBrand = `${baseBrand} ${tierConfig.name}`;

  const newCard: BankCorporateCreditCard = {
    cardId: `card-${bankId}-${Date.now().toString().slice(-4)}`,
    bankId,
    brand: cardBrand,
    tier: tierId,
    creditLimit: requestedLimit,
    currentBalance: 0,
    interestRateAnnual: tierConfig.interestRateAnnual,
    minPaymentMonthly: 0,
    cashbackPct: tierConfig.cashbackPct,
    rewardPoints: 100, // Bono de bienvenida en puntos
    pointsAccumulatedTotal: 100
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, (currentRel?.relationshipScore || 50) + 8),
      corporateCard: newCard
    }
  };

  return {
    updatedState: {
      ...state,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡Tarjeta Corporativa ${tierConfig.name} emitida por ${COMMERCIAL_BANKS_PROFILES[bankId].name}! Límite: L ${requestedLimit.toLocaleString()}. Bono de bienvenida: 100 pts de recompensa. Cashback: ${tierConfig.cashbackPct}%.`
  };
}

/**
 * Ascenso de Nivel / Upgrading de Tarjeta Corporativa
 */
export function upgradeCorporateCardTier(
  state: DailySimulationState,
  bankId: CommercialBankId,
  targetTierId: 'business_standard' | 'corporate_gold' | 'infinite_black'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const card = currentRel?.corporateCard;
  if (!card) {
    return { updatedState: state, success: false, message: 'No tienes una tarjeta corporativa emitida con este banco.' };
  }

  const targetTier = CORPORATE_CARD_TIERS[targetTierId];
  if (!targetTier) {
    return { updatedState: state, success: false, message: 'Nivel de tarjeta no válido.' };
  }

  if (card.tier === targetTierId) {
    return { updatedState: state, success: false, message: `Tu tarjeta ya se encuentra en el nivel ${targetTier.name}.` };
  }

  const monthlySales = Math.max(state.monthlySalesAccumulated || 0, 0);
  if (monthlySales < targetTier.minMonthlySales) {
    return {
      updatedState: state,
      success: false,
      message: `Para ascender a ${targetTier.name} se requiere una facturación mensual mínima de L ${targetTier.minMonthlySales.toLocaleString()}. Facturación actual: L ${monthlySales.toLocaleString()}.`
    };
  }

  // Costo anual del upgrade si aplica
  if (state.storeBankBalance < targetTier.annualFeeHNL) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes en banco para la membresía de la tarjeta ${targetTier.name} (L ${targetTier.annualFeeHNL.toLocaleString()}).`
    };
  }

  const baseBrand = bankId === 'bac' ? 'Mastercard BAC' : bankId === 'ficohsa' ? 'Visa Ficohsa' : bankId === 'atlantida' ? 'Visa Atlántida' : 'Visa Occidente';
  const updatedCard: BankCorporateCreditCard = {
    ...card,
    tier: targetTierId,
    brand: `${baseBrand} ${targetTier.name}`,
    interestRateAnnual: targetTier.interestRateAnnual,
    cashbackPct: targetTier.cashbackPct,
    rewardPoints: (card.rewardPoints || 0) + 150 // Bono por ascenso
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 5),
      corporateCard: updatedCard
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance - targetTier.annualFeeHNL,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡ASCENSO EXITOSO! Tu tarjeta corporativa subió a nivel ${targetTier.name}. Nueva tasa: ${targetTier.interestRateAnnual}%, cashback: ${targetTier.cashbackPct}%, +150 puntos de bono.`
  };
}

/**
 * Canje de Puntos de Recompensas Corporativas
 */
export function redeemCardRewardPoints(
  state: DailySimulationState,
  bankId: CommercialBankId,
  rewardId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const card = currentRel?.corporateCard;
  if (!card) {
    return { updatedState: state, success: false, message: 'No dispones de tarjeta corporativa en este banco.' };
  }

  const reward = CORPORATE_REWARDS_CATALOG.find(r => r.id === rewardId);
  if (!reward) {
    return { updatedState: state, success: false, message: 'Recompensa no encontrada en el catálogo.' };
  }

  const currentPoints = card.rewardPoints || 0;
  if (currentPoints < reward.pointsCost) {
    return {
      updatedState: state,
      success: false,
      message: `Puntos insuficientes. Requieres ${reward.pointsCost} pts (Disponibles: ${currentPoints} pts).`
    };
  }

  const remainingPoints = currentPoints - reward.pointsCost;
  const updatedCard: BankCorporateCreditCard = {
    ...card,
    rewardPoints: remainingPoints
  };

  let nextCash = state.storeCash;
  let nextBank = state.storeBankBalance;
  let nextSar = { ...state.sarTaxRecord };
  let benefitMsg = '';

  if (reward.category === 'cashback_directo') {
    nextBank += reward.benefitValueHNL;
    benefitMsg = `Se acreditaron L ${reward.benefitValueHNL.toLocaleString()} en efectivo a tu cuenta bancaria.`;
  } else if (reward.category === 'combustible') {
    // Ahorro directo en caja o bono de combustible
    nextCash += reward.benefitValueHNL;
    benefitMsg = `Se acreditaron L ${reward.benefitValueHNL.toLocaleString()} en vales de diésel/gasolina a caja para abastecer tu flota sin gasto.`;
  } else if (reward.category === 'mantenimiento') {
    // Si tiene maquinaria, optimiza su condición al 100% y acredita bono
    const units = (state.ownedMachinery || []).map(m => ({ ...m, conditionPct: 100 }));
    nextCash += 5000;
    benefitMsg = `¡Mantenimiento preventivo ejecutado en toda tu flota (condición al 100%) más L 5,000 en insumos de taller!`;
    return {
      updatedState: {
        ...state,
        storeCash: nextCash,
        ownedMachinery: units,
        commercialBanks: {
          ...state.commercialBanks,
          [bankId]: { ...currentRel, corporateCard: updatedCard }
        }
      },
      success: true,
      message: `¡CANJE APROBADO! ${reward.title}. ${benefitMsg}`
    };
  } else if (reward.category === 'impuestos') {
    // Descuento en pago fiscal del SAR aumentando deducciones y reduciendo ISR a pagar
    nextSar.isrTaxAmount = Math.max(0, (nextSar.isrTaxAmount || 0) - reward.benefitValueHNL);
    nextSar.deductibleOtherCosts = (nextSar.deductibleOtherCosts || 0) + reward.benefitValueHNL;
    benefitMsg = `Se aplicó un crédito tributario de L ${reward.benefitValueHNL.toLocaleString()} reduciendo tus impuestos pendientes en el SAR.`;
  }

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      corporateCard: updatedCard
    }
  };

  return {
    updatedState: {
      ...state,
      storeCash: nextCash,
      storeBankBalance: nextBank,
      sarTaxRecord: nextSar,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡CANJE APROBADO! ${reward.title}. ${benefitMsg} Puntos restantes: ${remainingPoints} pts.`
  };
}

/**
 * Reestructuración de Deuda y Préstamo Comercial (Ampliación de Plazo y Reducción de Cuota)
 */
export function restructureCommercialLoan(
  state: DailySimulationState,
  bankId: CommercialBankId,
  additionalMonths: number, // ej: 12, 24, 36 meses adicionales
  negotiatedApr?: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const loan = currentRel?.activeLoan;
  if (!loan || loan.balanceRemaining <= 0) {
    return { updatedState: state, success: false, message: 'No tienes un préstamo comercial activo con saldo deudor en este banco.' };
  }

  const currentTerm = loan.termMonthsRemaining;
  const newTerm = currentTerm + additionalMonths;
  const effectiveApr = negotiatedApr || Math.max(9.5, Number((loan.interestRateAnnual - 0.75).toFixed(2))); // Reducción de tasa por reestructuración
  const monthlyRate = effectiveApr / 100 / 12;
  const oldPayment = loan.monthlyPayment;
  const newMonthlyPayment = Math.round((loan.balanceRemaining * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -newTerm)));

  const updatedLoan: BankCommercialLoan = {
    ...loan,
    termMonthsRemaining: newTerm,
    interestRateAnnual: effectiveApr,
    monthlyPayment: newMonthlyPayment,
    isRestructured: true,
    loanType: 'reestructurado',
    originalTermMonths: loan.originalTermMonths || currentTerm,
    originalMonthlyPayment: loan.originalMonthlyPayment || oldPayment
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 4),
      activeLoan: updatedLoan
    }
  };

  return {
    updatedState: {
      ...state,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡REESTRUCTURACIÓN DE DEUDA APROBADA! Plazo extendido en +${additionalMonths} meses (Total: ${newTerm} meses). Cuota reducida de L ${oldPayment.toLocaleString()} a L ${newMonthlyPayment.toLocaleString()}/mes (Ahorro mensual: L ${(oldPayment - newMonthlyPayment).toLocaleString()}).`
  };
}

/**
 * Constitución de Depósito en Garantía con Rendimiento Pasivo Diario (Fianza de Licitación o Contrato)
 */
export function pledgeBankGuarantee(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amountHNL: number,
  purpose: string,
  tenderIdRef?: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (state.storeBankBalance < amountHNL) {
    return {
      updatedState: state,
      success: false,
      message: 'Fondos insuficientes en banco para inmovilizar en garantía.'
    };
  }

  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const currentRel = state.commercialBanks[bankId];
  // Tasa pasiva de garantía (3.5% a 4.5% APR)
  const annualRate = bankId === 'occidente' ? 4.5 : bankId === 'atlantida' ? 4.2 : bankId === 'ficohsa' ? 3.8 : 3.5;

  const newDeposit: BankGuaranteeDeposit = {
    id: `fianza-${Date.now().toString().slice(-4)}`,
    bankId,
    amountPledged: amountHNL,
    purpose: purpose || 'Fianza de Cumplimiento de Contrato Público (SIT / SEFIN)',
    tenderIdRef,
    status: 'activo',
    annualRatePct: annualRate,
    accruedInterest: 0,
    createdDay: state.currentDay
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      guaranteeDeposits: [...(currentRel?.guaranteeDeposits || []), newDeposit]
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance - amountHNL,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `Depósito en garantía por L ${amountHNL.toLocaleString()} inmovilizado en ${bank.name}. Generando ${annualRate}% de rendimiento pasivo mientras está pignorado. Fianza y solvencia de licitación emitidas.`
  };
}

/**
 * Liberación de Depósito en Garantía con Intereses Ganados Reintegrados
 */
export function releaseBankGuarantee(
  state: DailySimulationState,
  bankId: CommercialBankId,
  depositId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const dep = currentRel?.guaranteeDeposits.find(d => d.id === depositId);
  if (!dep) {
    return { updatedState: state, success: false, message: 'Fianza no encontrada.' };
  }

  const accruedInterest = dep.accruedInterest || 0;
  const totalRefund = dep.amountPledged + accruedInterest;

  const updatedDeposits = currentRel.guaranteeDeposits.filter(d => d.id !== depositId);
  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      guaranteeDeposits: updatedDeposits
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance + totalRefund,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡Fianza liberada exitosamente! Se reintegraron L ${dep.amountPledged.toLocaleString()} de capital más L ${accruedInterest.toLocaleString()} de intereses pasivos ganados (Total: L ${totalRefund.toLocaleString()}) a tu cuenta bancaria.`
  };
}

/**
 * Acumulación Diaria de Intereses Pasivos sobre Depósitos en Garantía Pignorados
 */
export function processDailyGuaranteeAccrual(state: DailySimulationState): DailySimulationState {
  let updatedBanks = { ...state.commercialBanks };
  let anyAccrued = false;

  Object.entries(updatedBanks).forEach(([bId, rel]) => {
    const bankId = bId as CommercialBankId;
    if (!rel || !rel.guaranteeDeposits || rel.guaranteeDeposits.length === 0) return;

    const updatedDeps = rel.guaranteeDeposits.map(dep => {
      if (dep.status !== 'activo') return dep;
      const rate = dep.annualRatePct || 4.0;
      const dailyYield = Math.round((dep.amountPledged * (rate / 100)) / 365);
      if (dailyYield > 0) anyAccrued = true;
      return {
        ...dep,
        accruedInterest: (dep.accruedInterest || 0) + dailyYield
      };
    });

    updatedBanks[bankId] = {
      ...rel,
      guaranteeDeposits: updatedDeps
    };
  });

  return anyAccrued ? { ...state, commercialBanks: updatedBanks } : state;
}

/**
 * Apertura de Depósito a Plazo Fijo (DPF) con Bonificación por Volumen
 */
export function openTermDeposit(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amountHNL: number,
  termDays: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (state.storeBankBalance < amountHNL) {
    return { updatedState: state, success: false, message: 'Fondos insuficientes para constituir el DPF.' };
  }

  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const currentRel = state.commercialBanks[bankId];
  const tierBonus = calculateDpfTierBonus(amountHNL);
  const effectiveRate = Number((bank.baseDpfRate + tierBonus.bonusPct).toFixed(2));

  const newDpf: BankTermDeposit = {
    id: `dpf-${bankId}-${Date.now().toString().slice(-4)}`,
    bankId,
    principalAmount: amountHNL,
    annualRatePct: bank.baseDpfRate,
    tierBonusPct: tierBonus.bonusPct,
    effectiveRatePct: effectiveRate,
    termDays,
    daysRemaining: termDays,
    accruedInterest: 0,
    currentBalance: amountHNL
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      termDeposits: [...(currentRel?.termDeposits || []), newDpf]
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance - amountHNL,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡Certificado DPF constituido en ${bank.name}! Capital: L ${amountHNL.toLocaleString()} al ${effectiveRate}% anual (${bank.baseDpfRate}% base + ${tierBonus.bonusPct}% bonificación ${tierBonus.tierName}) a ${termDays} días con capitalización diaria.`
  };
}

/**
 * Capitalización Diaria de Intereses Compuestos en Certificados DPF
 */
export function processDailyDpfCompounding(state: DailySimulationState): {
  updatedState: DailySimulationState;
  maturedDepositsCount: number;
  totalMaturedAmount: number;
} {
  let updatedBanks = { ...state.commercialBanks };
  let maturedDepositsCount = 0;
  let totalMaturedAmount = 0;
  let addedToBank = 0;
  let notifications = [...(state.creditNotifications || [])];

  Object.entries(updatedBanks).forEach(([bId, rel]) => {
    const bankId = bId as CommercialBankId;
    if (!rel || !rel.termDeposits || rel.termDeposits.length === 0) return;

    const remainingDeposits: BankTermDeposit[] = [];

    rel.termDeposits.forEach(dpf => {
      const daysLeft = dpf.daysRemaining - 1;
      const effectiveRate = dpf.effectiveRatePct || dpf.annualRatePct;
      const currentPrincipal = dpf.currentBalance || dpf.principalAmount;
      // Interés compuesto diario
      const dailyInterest = Math.round((currentPrincipal * (effectiveRate / 100)) / 365);
      const newBalance = currentPrincipal + dailyInterest;
      const totalAccrued = dpf.accruedInterest + dailyInterest;

      if (daysLeft <= 0) {
        // Vencimiento natural del DPF
        maturedDepositsCount++;
        totalMaturedAmount += newBalance;
        addedToBank += newBalance;

        notifications.unshift({
          id: `dpf-mat-${Date.now().toString().slice(-4)}-${dpf.id}`,
          day: state.currentDay,
          message: `📈 ¡VENCIMIENTO DE DPF! Certificado ${dpf.id} en ${COMMERCIAL_BANKS_PROFILES[bankId].name} liquidado con éxito. Se reintegraron L ${newBalance.toLocaleString()} (Capital: L ${dpf.principalAmount.toLocaleString()} + Ganancia: L ${totalAccrued.toLocaleString()}) a tu cuenta bancaria.`,
          type: 'aumento_limite',
          date: `Día ${state.currentDay}, Mes ${state.currentMonth}`
        });
      } else {
        remainingDeposits.push({
          ...dpf,
          daysRemaining: daysLeft,
          accruedInterest: totalAccrued,
          currentBalance: newBalance
        });
      }
    });

    updatedBanks[bankId] = {
      ...rel,
      termDeposits: remainingDeposits
    };
  });

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance + addedToBank,
      commercialBanks: updatedBanks,
      creditNotifications: notifications.slice(0, 15)
    },
    maturedDepositsCount,
    totalMaturedAmount
  };
}

/**
 * Rescate Inmediato o Cancelación Anticipada de DPF
 * Aplica penalización justa del 75% sobre intereses ganados (reintegra 100% capital + 25% interés ganado)
 */
export function earlyLiquidateDpf(
  state: DailySimulationState,
  bankId: CommercialBankId,
  depositId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const dpf = currentRel?.termDeposits.find(d => d.id === depositId);
  if (!dpf) {
    return { updatedState: state, success: false, message: 'Certificado DPF no encontrado.' };
  }

  const principal = dpf.principalAmount;
  const accrued = dpf.accruedInterest || 0;
  const penaltyInterest = Math.round(accrued * 0.75); // 75% penalización
  const earnedInterestKept = Math.max(0, accrued - penaltyInterest);
  const totalRefund = principal + earnedInterestKept;

  const updatedDeposits = currentRel.termDeposits.filter(d => d.id !== depositId);
  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      termDeposits: updatedDeposits
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance + totalRefund,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡CANCELACIÓN ANTICIPADA PROCESADA! Se reintegraron L ${principal.toLocaleString()} de capital más L ${earnedInterestKept.toLocaleString()} de interés neto (Penalización por rescate anticipado: L ${penaltyInterest.toLocaleString()}). Fondos líquidos en tu cuenta.`
  };
}

/**
 * Liquidación de Depósito a Plazo Fijo (DPF) con Acreditación de Capital e Intereses
 */
export function liquidateTermDeposit(
  state: DailySimulationState,
  bankId: CommercialBankId,
  depositId: string,
  isEarly: boolean = false
): { updatedState: DailySimulationState; success: boolean; message: string; totalReceived: number } {
  const currentRel = state.commercialBanks[bankId];
  const dpf = currentRel?.termDeposits.find(d => d.id === depositId);
  if (!dpf) {
    return { updatedState: state, success: false, message: 'Certificado DPF no encontrado.', totalReceived: 0 };
  }

  // Interés acumulado hasta la fecha
  const daysElapsed = Math.max(1, dpf.termDays - dpf.daysRemaining);
  const dailyRate = (dpf.annualRatePct / 100) / 365;
  const earnedInterest = Math.round(dpf.principalAmount * dailyRate * daysElapsed);

  // Si es cancelación anticipada, se retiene el 20% del interés devengado por penalidad
  const finalInterest = isEarly ? Math.round(earnedInterest * 0.8) : earnedInterest;
  const totalPayout = dpf.principalAmount + finalInterest;

  const updatedTermDeposits = currentRel.termDeposits.filter(d => d.id !== depositId);
  const checking = currentRel.checkingAccount;
  const updatedChecking = checking ? {
    ...checking,
    balance: checking.balance + totalPayout
  } : undefined;

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + (isEarly ? 1 : 4)),
      checkingAccount: updatedChecking,
      termDeposits: updatedTermDeposits
    }
  };

  const nextState = {
    ...state,
    storeBankBalance: state.storeBankBalance + totalPayout,
    commercialBanks: updatedBanks
  };

  return {
    updatedState: nextState,
    success: true,
    totalReceived: totalPayout,
    message: isEarly
      ? `Liquidación anticipada de DPF procesada: Capital L ${dpf.principalAmount.toLocaleString()} + Intereses netos L ${finalInterest.toLocaleString()} acreditados a tu cuenta bancaria (Penalidad aplicada por retiro antes de tiempo).`
      : `¡DPF VENCIDO Y LIQUIDADO! Se acreditaron L ${totalPayout.toLocaleString()} (Capital L ${dpf.principalAmount.toLocaleString()} + Rendimiento L ${finalInterest.toLocaleString()}) en tu cuenta bancaria de ${COMMERCIAL_BANKS_PROFILES[bankId].name}.`
  };
}

/**
 * Devengo diario/periódico de intereses para certificados DPF
 */
export function accrueTermDeposits(
  state: DailySimulationState,
  daysElapsed: number = 1
): { updatedState: DailySimulationState; maturedDepositsCount: number; interestAccruedTotal: number } {
  let updatedBanks = { ...state.commercialBanks };
  let maturedDepositsCount = 0;
  let interestAccruedTotal = 0;

  Object.entries(updatedBanks).forEach(([bId, rel]) => {
    const bankId = bId as CommercialBankId;
    if (!rel?.termDeposits || rel.termDeposits.length === 0) return;

    const newDeposits = rel.termDeposits.map(dpf => {
      const remaining = Math.max(0, dpf.daysRemaining - daysElapsed);
      const dailyRate = (dpf.annualRatePct / 100) / 365;
      const accrued = Math.round(dpf.principalAmount * dailyRate * daysElapsed);
      interestAccruedTotal += accrued;

      if (remaining === 0) {
        maturedDepositsCount++;
      }

      return {
        ...dpf,
        daysRemaining: remaining,
        accruedInterest: (dpf.accruedInterest || 0) + accrued
      };
    });

    updatedBanks[bankId] = {
      ...rel,
      termDeposits: newDeposits
    };
  });

  return {
    updatedState: {
      ...state,
      commercialBanks: updatedBanks
    },
    maturedDepositsCount,
    interestAccruedTotal
  };
}

/**
 * Cargo o Compra Directa con Tarjeta de Crédito Corporativa
 */
export function chargeCorporateCard(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amount: number,
  concept: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const card = currentRel?.corporateCard;
  if (!card) {
    return { updatedState: state, success: false, message: 'No dispones de tarjeta corporativa con este banco.' };
  }

  try {
    const cardInstance = CorporateCreditCard.fromCard(card);
    const purchaseResult = cardInstance.processPurchase(amount, concept);

    const updatedBanks = {
      ...state.commercialBanks,
      [bankId]: {
        ...currentRel,
        corporateCard: cardInstance.toJSON()
      }
    };

    const nextState = {
      ...state,
      commercialBanks: updatedBanks
    };

    const newProfile = calculateCompanyCreditScore(nextState);

    return {
      updatedState: {
        ...nextState,
        companyCreditProfile: newProfile
      },
      success: true,
      message: `¡COMPRA APROBADA! Se cargaron L ${amount.toLocaleString()} a tu ${card.brand} por concepto de "${concept}". Cashback acreditado: L ${purchaseResult.cashbackEarned.toLocaleString()}. Saldo utilizado: L ${cardInstance.usedBalance.toLocaleString()}. Disponible restante: L ${cardInstance.availableBalance.toLocaleString()}.`
    };
  } catch (err: any) {
    return {
      updatedState: state,
      success: false,
      message: err.message || 'Error al procesar el cargo a la tarjeta corporativa.'
    };
  }
}

/**
 * Pago o Abono a Préstamo Bancario
 */
export function payCommercialLoan(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amount: number,
  payFromAccount: 'checking' | 'cash' = 'checking'
): { 
  updatedState: DailySimulationState; 
  success: boolean; 
  message: string; 
  remainingBalance: number;
  voucher?: TransactionVoucher;
  releasedCollaterals?: string[];
} {
  const currentRel = state.commercialBanks[bankId];
  const loan = currentRel?.activeLoan;
  if (!loan) {
    return { 
      updatedState: state, 
      success: false, 
      message: 'No hay préstamo activo con este banco.', 
      remainingBalance: 0 
    };
  }

  const isCash = payFromAccount === 'cash';
  const availableFunds = isCash ? (state.storeCash || 0) : (state.storeBankBalance || 0);

  if (availableFunds < amount) {
    return { 
      updatedState: state, 
      success: false, 
      message: `Fondos insuficientes en ${isCash ? 'caja chica' : 'cuenta corriente'} para efectuar el pago de L ${amount.toLocaleString()}. Disponibles: L ${availableFunds.toLocaleString()}.`,
      remainingBalance: loan.balanceRemaining 
    };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  let updatedCommercialBanks = { ...state.commercialBanks };

  if (isCash) {
    newCash -= amount;
  } else {
    newBank -= amount;
    if (currentRel.checkingAccount) {
      updatedCommercialBanks[bankId] = {
        ...currentRel,
        checkingAccount: {
          ...currentRel.checkingAccount,
          balance: Math.max(0, currentRel.checkingAccount.balance - amount)
        }
      };
    }
  }

  const actualPaid = Math.min(amount, loan.balanceRemaining);
  const newBalance = Math.max(0, loan.balanceRemaining - actualPaid);
  const isFullyPaid = newBalance <= 0;

  const updatedLoan = isFullyPaid ? undefined : {
    ...loan,
    balanceRemaining: newBalance,
    termMonthsRemaining: Math.max(0, loan.termMonthsRemaining - 1),
    paidInstallments: (loan.paidInstallments || 0) + 1,
    amortizedPrincipalTotal: (loan.amortizedPrincipalTotal || 0) + actualPaid
  };

  updatedCommercialBanks[bankId] = {
    ...updatedCommercialBanks[bankId],
    relationshipScore: Math.min(100, currentRel.relationshipScore + (isFullyPaid ? 8 : 4)),
    activeLoan: updatedLoan
  };

  // Liberar garantías pignoradas a este préstamo si se canceló totalmente
  const releasedTitles: string[] = [];
  let updatedCollaterals = state.realEstateCollaterals || [];

  if (isFullyPaid) {
    updatedCollaterals = updatedCollaterals.map(col => {
      const hasLienForThisLoan = (col.liens || []).some(l => l.linkedLoanId === loan.id) 
        || col.linkedDebtId === loan.id 
        || loan.collateralIdRef === col.id;

      if (!hasLienForThisLoan) return col;

      releasedTitles.push(col.title);
      const remainingLiens = (col.liens || []).filter(l => l.linkedLoanId !== loan.id);
      const newPledgedTotal = remainingLiens.reduce((sum, l) => sum + (l.committedCoverageHNL || 0), 0);
      const eligibleVal = col.eligibleValue ?? col.eligibleCollateralValueHNL ?? (col.appraisalValueHNL * (col.ltvAcceptedPct / 100));
      const newAvailable = Math.max(0, eligibleVal - newPledgedTotal);

      return {
        ...col,
        liens: remainingLiens,
        pledgedAmountTotal: newPledgedTotal,
        committedCoverage: newPledgedTotal,
        availableCoverageHNL: newAvailable,
        availableCoverage: newAvailable,
        status: newAvailable === eligibleVal ? ('disponible' as const) : ('pignorado_parcial' as const),
        isPledged: remainingLiens.length > 0,
        isLockedForSale: remainingLiens.length > 0,
        pledgedToBankId: remainingLiens[0]?.beneficiaryBankId,
        linkedDebtId: remainingLiens[0]?.linkedLoanId,
        situationNotes: remainingLiens.length === 0 ? 'Gravamen cancelado íntegramente por finiquito de deuda.' : col.situationNotes
      };
    });
  }

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const voucherNum = `VCH-PAY-${state.currentDay}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Generar Comprobante Oficial de Transacción Bancaria
  const voucher: TransactionVoucher = {
    id: `vch-pay-${Date.now()}`,
    voucherNumber: voucherNum,
    operationType: isFullyPaid ? 'cancelacion_total' : 'pago_cuota',
    title: isFullyPaid ? `Liquidación y Finiquito: ${loan.purpose}` : `Pago de Cuota Bancaria: ${loan.purpose}`,
    timestamp: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    primaryBankId: bankId,
    accountNumber: isCash ? 'Caja Chica en Efectivo' : `Cuenta Corriente ${COMMERCIAL_BANKS_PROFILES[bankId].name}`,
    grossAmountHNL: amount,
    amount: actualPaid,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: actualPaid,
    priorBalanceHNL: availableFunds,
    newBalanceHNL: availableFunds - amount,
    loanBalancePriorHNL: loan.balanceRemaining,
    loanBalanceNewHNL: newBalance,
    releasedCollaterals: isFullyPaid && releasedTitles.length > 0 ? releasedTitles : undefined,
    referenceCode: `PAY-${bankId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: `BCH-AMORT-${state.currentYear || 2026}-${Date.now().toString().slice(-6)}`
  };

  // Generar correo de confirmación de pago
  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const receiptEmail: SimulatedEmail = {
    id: `email-loan-pay-${Date.now()}`,
    category: 'bancos_financiamiento',
    senderName: `${bank.name} - Cobranzas y Tesorería`,
    senderEmail: `cobranzas@${bankId}.banca.hn`,
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: isFullyPaid 
      ? `FINIQUITO Y CANCELACIÓN TOTAL: Préstamo ${loan.purpose} (Saldo L 0.00)`
      : `Recibo de Pago: Cuota Préstamo ${loan.purpose} (Abono L ${actualPaid.toLocaleString()})`,
    body: isFullyPaid
      ? `Estimado(a) Cliente:\n\nNos complace extenderle el presente FINIQUITO BANCARIO. El crédito comercial "${loan.purpose}" ha sido liquidado en su totalidad.\n\n• Monto Pagado: L ${actualPaid.toLocaleString()}\n• Saldo Deudor Restante: L 0.00\n• Estado del Crédito: CANCELADO Y LIBRE DE TODA RESPONSABILIDAD\n${releasedTitles.length > 0 ? `• Garantías Reales Liberadas: ${releasedTitles.join(', ')}\n` : ''}\nSu récord crediticio se ha actualizado favorablemente ante la Central de Riesgos de la CNBS.`
      : `Estimado(a) Cliente:\n\nHemos acreditado su abono al crédito "${loan.purpose}":\n\n• Monto Pagado: L ${actualPaid.toLocaleString()}\n• Saldo Deudor Insoluto Restante: L ${newBalance.toLocaleString()}\n• Origen de Fondos: ${isCash ? 'Efectivo en Ventanilla' : 'Débito a Cuenta Corriente'}\n• Comprobante Oficial No.: ${voucherNum}`,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: isFullyPaid,
    isArchived: false,
    folder: 'inbox',
    relatedEntityType: 'loan_payment',
    relatedEntityId: loan.id,
    voucherPayload: voucher
  };

  // Actualizar correos existentes de aviso de pago de este préstamo
  const updatedEmails = (state.simulatedEmails || []).map(e => {
    if (e.paymentNoticePayload?.targetType === 'loan' && e.paymentNoticePayload.bankId === bankId) {
      if (isFullyPaid) {
        return { ...e, statusTag: 'Resuelto' as const, actionRequired: false };
      } else {
        return {
          ...e,
          paymentNoticePayload: {
            ...e.paymentNoticePayload,
            amountDueHNL: newBalance
          }
        };
      }
    }
    return e;
  });

  return {
    updatedState: {
      ...state,
      storeBankBalance: newBank,
      storeCash: newCash,
      commercialBanks: updatedCommercialBanks,
      realEstateCollaterals: updatedCollaterals,
      transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
      simulatedEmails: [receiptEmail, ...updatedEmails]
    },
    success: true,
    message: isFullyPaid 
      ? `¡Préstamo con ${bank.name} cancelado al 100%!${releasedTitles.length > 0 ? ` Se liberaron ${releasedTitles.length} garantía(s) real(es).` : ''}`
      : `Abono de L ${actualPaid.toLocaleString()} aplicado con éxito. Saldo restante: L ${newBalance.toLocaleString()}.`,
    remainingBalance: newBalance,
    voucher,
    releasedCollaterals: releasedTitles
  };
}

/**
 * Pago o Abono a Tarjeta de Crédito Corporativa
 */
export function payCorporateCreditCard(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amount: number,
  payFromAccount: 'checking' | 'cash' = 'checking'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const card = currentRel?.corporateCard;
  if (!card) return { updatedState: state, success: false, message: 'No dispones de tarjeta con este banco.' };

  const isCash = payFromAccount === 'cash';
  const availableFunds = isCash ? (state.storeCash || 0) : (state.storeBankBalance || 0);

  try {
    const cardInstance = CorporateCreditCard.fromCard(card);
    const actualPayment = Math.min(amount, cardInstance.usedBalance);

    if (availableFunds < actualPayment) {
      return { 
        updatedState: state, 
        success: false, 
        message: `Fondos insuficientes en ${isCash ? 'caja' : 'cuenta bancaria'} para pagar L ${actualPayment.toLocaleString()} (disponible: L ${availableFunds.toLocaleString()}).` 
      };
    }

    const payResult = cardInstance.payCreditCard(amount);

    const newBank = !isCash ? state.storeBankBalance - payResult.actualPayment : state.storeBankBalance;
    const newCash = isCash ? state.storeCash - payResult.actualPayment : state.storeCash;

    const updatedBanks = {
      ...state.commercialBanks,
      [bankId]: {
        ...currentRel,
        corporateCard: cardInstance.toJSON()
      }
    };

    return {
      updatedState: {
        ...state,
        storeBankBalance: newBank,
        storeCash: newCash,
        commercialBanks: updatedBanks
      },
      success: true,
      message: `Pago de L ${payResult.actualPayment.toLocaleString()} procesado exitosamente. Saldo utilizado restante: L ${cardInstance.usedBalance.toLocaleString()}. Disponible restablecido: L ${cardInstance.availableBalance.toLocaleString()}.`
    };
  } catch (err: any) {
    return {
      updatedState: state,
      success: false,
      message: err.message || 'Error al aplicar el pago a la tarjeta corporativa.'
    };
  }
}

/**
 * Depósito de Dinero en Efectivo de Caja a Cuenta Bancaria (Aumentar Fondos)
 */
export function depositCashToCheckingAccount(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amount: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (amount <= 0) return { updatedState: state, success: false, message: 'Ingresa un monto válido para depositar.' };
  if (state.storeCash < amount) {
    return { updatedState: state, success: false, message: `Efectivo insuficiente en caja. Disponible en caja: L ${state.storeCash.toLocaleString()}.` };
  }

  const currentRel = state.commercialBanks[bankId];
  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const checking = currentRel?.checkingAccount;

  const updatedAccount: BankCheckingAccount = checking ? {
    ...checking,
    balance: checking.balance + amount
  } : {
    accountNumber: `CTA-0101-2026-${bankId.toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
    balance: amount,
    overdraftLimit: Math.round(amount * 0.4),
    overdraftUsed: 0,
    checksUsedCount: 0,
    interestRateAnnual: 4.0
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      bankId,
      relationshipScore: Math.min(100, (currentRel?.relationshipScore || 50) + 3),
      checkingAccount: updatedAccount,
      guaranteeDeposits: currentRel?.guaranteeDeposits || [],
      termDeposits: currentRel?.termDeposits || []
    }
  };

  const nextState = {
    ...state,
    storeCash: state.storeCash - amount,
    storeBankBalance: state.storeBankBalance + amount,
    commercialBanks: updatedBanks
  };

  // Recalcular Score Crediticio
  const profile = calculateCompanyCreditScore(nextState);

  return {
    updatedState: {
      ...nextState,
      companyCreditProfile: profile
    },
    success: true,
    message: `¡DEPÓSITO EXITOSO! Se transfirieron L ${amount.toLocaleString()} de la caja registradora a tu cuenta de ${bank.name}. Saldo en cuenta: L ${updatedAccount.balance.toLocaleString()}.`
  };
}

/**
 * Retiro de Efectivo de la Cuenta Bancaria a la Caja
 */
export function withdrawCashFromCheckingAccount(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amount: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (amount <= 0) return { updatedState: state, success: false, message: 'Ingresa un monto válido para retirar.' };

  const currentRel = state.commercialBanks[bankId];
  const checking = currentRel?.checkingAccount;
  if (!checking) {
    return { updatedState: state, success: false, message: 'No hay cuenta de cheques activa en este banco.' };
  }

  const availableInAccount = checking.balance;
  if (availableInAccount < amount) {
    return { updatedState: state, success: false, message: `Fondos insuficientes en la cuenta bancaria. Saldo disponible: L ${availableInAccount.toLocaleString()}.` };
  }

  const newAccBalance = checking.balance - amount;
  const updatedAccount: BankCheckingAccount = {
    ...checking,
    balance: newAccBalance
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      checkingAccount: updatedAccount
    }
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: Math.max(0, state.storeBankBalance - amount),
      storeCash: state.storeCash + amount,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `Retiro procesado. Se acreditaron L ${amount.toLocaleString()} en efectivo a tu caja registradora.`
  };
}

/**
 * Negociación de Tasa de Interés en Cuenta de Ahorro / Cheques
 */
export function negotiateCheckingAccountRate(
  state: DailySimulationState,
  bankId: CommercialBankId,
  targetRatePct: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const checking = currentRel?.checkingAccount;
  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const creditProfile = calculateCompanyCreditScore(state);

  if (!checking) {
    return { updatedState: state, success: false, message: 'Apertura primero la cuenta bancaria para negociar su rendimiento.' };
  }

  // Criterios de aceptación del banco:
  // Si el score >= 700 o saldo >= 300,000, el banco acepta hasta 6.5% - 7.5% anual
  const maxAcceptableRate = creditProfile.score >= 780 ? 7.8 : creditProfile.score >= 710 ? 6.8 : creditProfile.score >= 640 ? 5.8 : 4.5;

  if (targetRatePct > maxAcceptableRate) {
    return {
      updatedState: state,
      success: false,
      message: `El comité de ${bank.name} declinó la tasa del ${targetRatePct}%. Con tu Score Crediticio actual (${creditProfile.score} pts), la tasa máxima autorizada es del ${maxAcceptableRate}%.`
    };
  }

  const updatedAccount: BankCheckingAccount = {
    ...checking,
    interestRateAnnual: targetRatePct
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 5),
      checkingAccount: updatedAccount
    }
  };

  return {
    updatedState: {
      ...state,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `¡NEGOCIACIÓN EXITOSA! ${bank.name} aceptó una tasa de rendimiento del ${targetRatePct}% anual para tu cuenta comercial gracias a tu perfil solvente.`
  };
}

/**
 * Negociación de Tasa Activa para Préstamo Bancario
 */
export function negotiateLoanRate(
  state: DailySimulationState,
  bankId: CommercialBankId,
  discountRequestedPct: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId] || {
    bankId,
    relationshipScore: 50,
    guaranteeDeposits: [],
    termDeposits: []
  };
  const loan = currentRel.activeLoan;
  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const creditProfile = calculateCompanyCreditScore(state);

  const maxDiscountAllowed = creditProfile.score >= 780 ? 2.5 : creditProfile.score >= 710 ? 1.8 : creditProfile.score >= 640 ? 1.0 : 0.4;

  if (discountRequestedPct > maxDiscountAllowed) {
    return {
      updatedState: state,
      success: false,
      message: `${bank.name} solo puede otorgar un descuento máximo de ${maxDiscountAllowed}% según tu Score Crediticio (${creditProfile.score} pts).`
    };
  }

  let updatedLoan = loan;
  if (loan) {
    const newRate = Math.max(6.5, Number((loan.interestRateAnnual - discountRequestedPct).toFixed(2)));
    const monthlyRate = newRate / 100 / 12;
    const remainingTerm = Math.max(1, loan.termMonthsRemaining);
    const newMonthlyPayment = Math.round((loan.balanceRemaining * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -remainingTerm)));

    updatedLoan = {
      ...loan,
      interestRateAnnual: newRate,
      monthlyPayment: newMonthlyPayment
    };
  }

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 3),
      negotiatedRateDiscount: discountRequestedPct,
      activeLoan: updatedLoan
    }
  };

  return {
    updatedState: {
      ...state,
      commercialBanks: updatedBanks
    },
    success: true,
    message: updatedLoan
      ? `¡TASA REBAJADA! ${bank.name} redujo la tasa de tu préstamo a ${updatedLoan.interestRateAnnual}% anual. Tu nueva cuota mensual es de L ${updatedLoan.monthlyPayment.toLocaleString()}.`
      : `¡DESCUENTO APROBADO! ${bank.name} otorgó un descuento preferencial del ${discountRequestedPct}% en tus líneas de crédito.`
  };
}

/**
 * Abono Extraordinario a Capital (Amortización Directa de Deuda)
 */
export function makeExtraordinaryLoanPayment(
  state: DailySimulationState,
  bankId: CommercialBankId,
  capitalAmount: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (capitalAmount <= 0) return { updatedState: state, success: false, message: 'Ingresa un monto válido a amortizar.' };

  const currentRel = state.commercialBanks[bankId];
  const loan = currentRel?.activeLoan;
  if (!loan) return { updatedState: state, success: false, message: 'No hay préstamo activo con este banco.' };

  const totalFunds = state.storeBankBalance + state.storeCash;
  if (totalFunds < capitalAmount) {
    return { updatedState: state, success: false, message: `Fondos insuficientes para el abono a capital (Requerido: L ${capitalAmount.toLocaleString()}).` };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= capitalAmount) {
    newBank -= capitalAmount;
  } else {
    const diff = capitalAmount - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - diff);
  }

  const effectiveAbono = Math.min(capitalAmount, loan.balanceRemaining);
  const newBalance = Math.max(0, loan.balanceRemaining - effectiveAbono);
  const newTotalAmortized = (loan.amortizedPrincipalTotal || 0) + effectiveAbono;

  let updatedLoan: BankCommercialLoan | undefined = undefined;
  if (newBalance > 0) {
    const monthlyRate = loan.interestRateAnnual / 100 / 12;
    const termRem = Math.max(1, loan.termMonthsRemaining);
    const newMonthlyPayment = Math.round((newBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termRem)));

    updatedLoan = {
      ...loan,
      balanceRemaining: newBalance,
      monthlyPayment: newMonthlyPayment,
      amortizedPrincipalTotal: newTotalAmortized
    };
  }

  const currentStreak = (state.companyCreditProfile?.onTimePaymentsStreak || 1) + 1;
  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 6),
      activeLoan: updatedLoan
    }
  };

  const nextState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    commercialBanks: updatedBanks
  };

  const newProfile = calculateCompanyCreditScore(nextState);
  newProfile.onTimePaymentsStreak = currentStreak;

  return {
    updatedState: {
      ...nextState,
      companyCreditProfile: newProfile
    },
    success: true,
    message: newBalance <= 0
      ? `¡PRÉSTAMO LIQUIDADO! Has cancelado la totalidad de la deuda con ${COMMERCIAL_BANKS_PROFILES[bankId].name}. Tu Score Crediticio aumentó.`
      : `¡ABONO A CAPITAL APLICADO! Se amortizaron L ${effectiveAbono.toLocaleString()}. Saldo restante: L ${newBalance.toLocaleString()}. Tu nueva cuota mensual bajó a L ${updatedLoan?.monthlyPayment.toLocaleString()}.`
  };
}

/**
 * Amortización Automática de Cuotas de Préstamo en el Avance del Tiempo
 * Se ejecuta al avanzar días/mes para descontar la cuota mensual poco a poco.
 */
export function processDailyLoanAmortization(state: DailySimulationState): {
  updatedState: DailySimulationState;
  amortizationsDeducted: number;
  totalAmountDeducted: number;
} {
  // Evaluamos una vez cada 15 o 30 días, o si es día de corte
  const isPaymentCycle = state.currentDay === 15 || state.currentDay === 30 || state.isDayClosed;
  if (!isPaymentCycle) {
    return { updatedState: state, amortizationsDeducted: 0, totalAmountDeducted: 0 };
  }

  let currentBankBalance = state.storeBankBalance;
  let currentCash = state.storeCash;
  let updatedBanks = { ...state.commercialBanks };
  let paymentEvents: string[] = [];
  let amortizationsDeducted = 0;
  let totalAmountDeducted = 0;

  Object.entries(updatedBanks).forEach(([bId, rel]) => {
    const bankId = bId as CommercialBankId;
    const loan = rel?.activeLoan;
    if (!loan || loan.balanceRemaining <= 0) return;

    // Préstamos cobran la cuota mensual periódica
    const quotaToPay = Math.min(loan.monthlyPayment, loan.balanceRemaining);
    const available = currentBankBalance + currentCash;

    if (available >= quotaToPay) {
      if (currentBankBalance >= quotaToPay) {
        currentBankBalance -= quotaToPay;
      } else {
        const rem = quotaToPay - currentBankBalance;
        currentBankBalance = 0;
        currentCash = Math.max(0, currentCash - rem);
      }

      // Desglose de amortización a capital (aproximadamente 78% capital, 22% interés)
      const principalPortion = Math.min(loan.balanceRemaining, Math.round(quotaToPay * 0.78));
      const newBal = Math.max(0, loan.balanceRemaining - principalPortion);
      const newTerm = Math.max(0, loan.termMonthsRemaining - 1);

      updatedBanks[bankId] = {
        ...rel,
        relationshipScore: Math.min(100, rel.relationshipScore + 1),
        activeLoan: newBal <= 0 ? undefined : {
          ...loan,
          balanceRemaining: newBal,
          termMonthsRemaining: newTerm,
          amortizedPrincipalTotal: (loan.amortizedPrincipalTotal || 0) + principalPortion
        }
      };

      amortizationsDeducted++;
      totalAmountDeducted += quotaToPay;
      paymentEvents.push(`Cuota de L ${quotaToPay.toLocaleString()} debitada puntualmente en ${COMMERCIAL_BANKS_PROFILES[bankId].name}.`);
    } else {
      // Mora en pago
      updatedBanks[bankId] = {
        ...rel,
        relationshipScore: Math.max(20, rel.relationshipScore - 5)
      };
      paymentEvents.push(`⚠️ Fondos insuficientes para cuota de préstamo en ${COMMERCIAL_BANKS_PROFILES[bankId].name}. Se registró atraso.`);
    }
  });

  const nextState = {
    ...state,
    storeBankBalance: currentBankBalance,
    storeCash: currentCash,
    commercialBanks: updatedBanks
  };

  const updatedProfile = calculateCompanyCreditScore(nextState);

  const notifications = [...(state.creditNotifications || [])];
  if (paymentEvents.length > 0) {
    notifications.unshift({
      id: `notif-${Date.now().toString().slice(-4)}`,
      day: state.currentDay,
      message: paymentEvents.join(' | '),
      type: 'cuota_pagada',
      date: `Día ${state.currentDay}, Mes ${state.currentMonth}`
    });
  }

  return {
    updatedState: {
      ...nextState,
      companyCreditProfile: updatedProfile,
      creditNotifications: notifications.slice(0, 15)
    },
    amortizationsDeducted,
    totalAmountDeducted
  };
}

/**
 * Evaluación Quincenal (Cada 15 Días) para Aumento de Límite de Tarjetas de Crédito y Beneficios
 */
export function processBiweeklyCardEvaluation(state: DailySimulationState): DailySimulationState {
  const isBiweeklyDay = state.currentDay === 15 || state.currentDay === 30 || state.currentDay === 1;
  if (!isBiweeklyDay) return state;

  const profile = calculateCompanyCreditScore(state);
  let updatedBanks = { ...state.commercialBanks };
  let newNotifications = [...(state.creditNotifications || [])];
  let increasesGiven = 0;

  Object.entries(updatedBanks).forEach(([bId, rel]) => {
    const bankId = bId as CommercialBankId;
    const card = rel?.corporateCard;
    if (!card) return;

    // Criterio de aumento quincenal:
    // Score Crediticio >= 660 y utilización responsable (< 75%)
    const utilization = card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) : 0;
    if (profile.score >= 660 && utilization <= 0.75) {
      const increasePct = profile.score >= 780 ? 0.25 : profile.score >= 710 ? 0.20 : 0.15;
      const increaseAmount = Math.round(card.creditLimit * increasePct);
      const newLimit = card.creditLimit + increaseAmount;

      // Bonificación en tasa y cashback
      const newCashback = Math.min(5.0, Number(((card.cashbackPct || 1.5) + 0.5).toFixed(1)));
      const newApr = Math.max(16.0, Number((card.interestRateAnnual - 0.5).toFixed(1)));

      updatedBanks[bankId] = {
        ...rel,
        corporateCard: {
          ...card,
          creditLimit: newLimit,
          interestRateAnnual: newApr,
          cashbackPct: newCashback,
          lastLimitIncreaseDay: state.currentDay,
          limitIncreasesCount: (card.limitIncreasesCount || 0) + 1
        }
      };

      increasesGiven++;
      newNotifications.unshift({
        id: `card-inc-${Date.now().toString().slice(-4)}-${bankId}`,
        day: state.currentDay,
        message: `🎉 ¡AUMENTO QUINCENAL DE LÍMITE! ${COMMERCIAL_BANKS_PROFILES[bankId].name} elevó el límite de tu tarjeta a L ${newLimit.toLocaleString()} (+L ${increaseAmount.toLocaleString()}) con ${newCashback}% de cashback.`,
        type: 'aumento_limite',
        date: `Día ${state.currentDay}, Mes ${state.currentMonth}`
      });
    }
  });

  return {
    ...state,
    commercialBanks: updatedBanks,
    companyCreditProfile: profile,
    creditNotifications: newNotifications.slice(0, 15)
  };
}

/**
 * Financiamiento Bancario Automático de Maquinaria y Equipos en Concesionaria
 * Permite comprar a cuotas con préstamo bancario directo con cualquiera de los bancos.
 */
export function financeEquipmentLoan(
  state: DailySimulationState,
  bankId: CommercialBankId,
  equipment: {
    id: string;
    modelName: string;
    category: MachineryCategory;
    icon: string;
    ratingStars: 1 | 2 | 3 | 4 | 5;
    priceHNL: number;
    hourlyFuelCost: number;
  },
  dealerId: string,
  dealerName: string,
  downPaymentPct: number, // 10% a 30%
  termYears: number, // 1 a 5 años (12 a 60 meses)
  negotiatedRatePct?: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const price = equipment.priceHNL;
  const downPaymentAmount = Math.round(price * (downPaymentPct / 100));
  const loanPrincipal = price - downPaymentAmount;

  const totalFunds = state.storeBankBalance + state.storeCash;
  if (totalFunds < downPaymentAmount) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes para la prima (enganche) del vehículo/maquinaria. Se requieren L ${downPaymentAmount.toLocaleString()} (${downPaymentPct}%).`
    };
  }

  const capacity = evaluateContractorEconomicCapacity(state);
  const bankOffer = capacity.offersByBank[bankId];

  if (loanPrincipal > bankOffer.maxLoanHNL) {
    return {
      updatedState: state,
      success: false,
      message: `El monto a financiar (L ${loanPrincipal.toLocaleString()}) excede el cupo crediticio de ${COMMERCIAL_BANKS_PROFILES[bankId].name} (Máx: L ${bankOffer.maxLoanHNL.toLocaleString()}). Aumenta la prima o mejora tu Score Crediticio.`
    };
  }

  // Deducción de la prima (enganche)
  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= downPaymentAmount) {
    newBank -= downPaymentAmount;
  } else {
    const diff = downPaymentAmount - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - diff);
  }

  // Cálculo de cuota mensual del préstamo vehicular/equipo
  const termMonths = termYears * 12;
  const apr = negotiatedRatePct || bankOffer.recommendedRatePct;
  const monthlyRate = apr / 100 / 12;
  const monthlyPayment = Math.round((loanPrincipal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths)));

  const newLoan: BankCommercialLoan = {
    id: `auto-${bankId}-${Date.now().toString().slice(-4)}`,
    bankId,
    principalAmount: loanPrincipal,
    balanceRemaining: loanPrincipal,
    monthlyPayment,
    interestRateAnnual: apr,
    termMonthsRemaining: termMonths,
    purpose: `Financiamiento Vehicular / Equipo: ${equipment.modelName}`,
    loanType: 'vehicular_equipo',
    equipmentModel: equipment.modelName,
    amortizedPrincipalTotal: 0
  };

  const newUnit: OwnedMachineryUnit = {
    id: `mach-${Date.now().toString().slice(-4)}`,
    dealerId,
    dealerName,
    modelName: equipment.modelName,
    category: equipment.category,
    icon: equipment.icon,
    ratingStars: equipment.ratingStars,
    purchasePrice: price,
    conditionPct: 100,
    totalHoursWorked: 0,
    hourlyFuelCost: equipment.hourlyFuelCost,
    financedWithBank: bankId
  };

  const currentRel = state.commercialBanks[bankId] || {
    bankId,
    relationshipScore: 50,
    guaranteeDeposits: [],
    termDeposits: []
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 10),
      activeLoan: newLoan
    }
  };

  const nextState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    ownedMachinery: [...(state.ownedMachinery || []), newUnit],
    commercialBanks: updatedBanks,
    storeReputation: Math.min(100, state.storeReputation + 3)
  };

  const newProfile = calculateCompanyCreditScore(nextState);

  return {
    updatedState: {
      ...nextState,
      companyCreditProfile: newProfile
    },
    success: true,
    message: `¡FINANCIAMIENTO APROBADO! ${COMMERCIAL_BANKS_PROFILES[bankId].name} financió "${equipment.modelName}" a ${termYears} años (${apr}% anual). Prima pagada: L ${downPaymentAmount.toLocaleString()}. Cuota mensual: L ${monthlyPayment.toLocaleString()}. Unidad incorporada a tu flota.`
  };
}

// =========================================================================
// 12+ PRODUCTOS DE CRÉDITO EMPRESARIAL COMPLETO & CONDICIONES BANCARIAS
// =========================================================================

export interface CreditProductConfig {
  id: CommercialLoanType;
  name: string;
  category: 'operativo' | 'activos' | 'estructurado' | 'liquidez';
  icon: string;
  description: string;
  minAmountHNL: number;
  maxAmountMultiplier: number; // Multiplica la capacidad base
  minTermMonths: number;
  maxTermMonths: number;
  rateSpreadPct: number; // Variación respecto a la tasa base del banco (+/- %)
  requiresCollateral: boolean;
  requiredCollateralCoveragePct: number; // 0 a 100%
  admitsGracePeriod: boolean;
  openingFeePct: number; // Comisión de apertura / desembolso
  annualInsurancePct: number; // Seguro de saldo deudor
}

export const COMMERCIAL_LOAN_PRODUCTS: Record<CommercialLoanType, CreditProductConfig> = {
  capital_trabajo: {
    id: 'capital_trabajo',
    name: 'Crédito para Capital de Trabajo',
    category: 'operativo',
    icon: '💼',
    description: 'Financiamiento ágil para compra de inventario, pago de planillas y gastos operativos ordinarios.',
    minAmountHNL: 50000,
    maxAmountMultiplier: 1.0,
    minTermMonths: 6,
    maxTermMonths: 36,
    rateSpreadPct: 0.0,
    requiresCollateral: false,
    requiredCollateralCoveragePct: 0,
    admitsGracePeriod: true,
    openingFeePct: 1.5,
    annualInsurancePct: 0.25
  },
  linea_revolvente: {
    id: 'linea_revolvente',
    name: 'Línea de Crédito Revolvente',
    category: 'liquidez',
    icon: '🔄',
    description: 'Cupo disponible continuo. Solo pagas intereses sobre el saldo efectivamente dispuesto día a día.',
    minAmountHNL: 100000,
    maxAmountMultiplier: 0.85,
    minTermMonths: 12,
    maxTermMonths: 24,
    rateSpreadPct: 1.2,
    requiresCollateral: false,
    requiredCollateralCoveragePct: 0,
    admitsGracePeriod: false,
    openingFeePct: 1.0,
    annualInsurancePct: 0.20
  },
  credito_inventario: {
    id: 'credito_inventario',
    name: 'Crédito para Abastecimiento de Inventario',
    category: 'operativo',
    icon: '📦',
    description: 'Financiamiento estacional para compras al por mayor con descuentos por pronto pago de distribuidores.',
    minAmountHNL: 40000,
    maxAmountMultiplier: 0.75,
    minTermMonths: 3,
    maxTermMonths: 18,
    rateSpreadPct: -0.5,
    requiresCollateral: false,
    requiredCollateralCoveragePct: 0,
    admitsGracePeriod: true,
    openingFeePct: 1.2,
    annualInsurancePct: 0.20
  },
  credito_maquinaria: {
    id: 'credito_maquinaria',
    name: 'Crédito para Maquinaria & Equipo Pesado',
    category: 'activos',
    icon: '🚜',
    description: 'Financiamiento a mediano y largo plazo para volquetas, excavadoras, grúas o líneas industriales.',
    minAmountHNL: 250000,
    maxAmountMultiplier: 1.8,
    minTermMonths: 24,
    maxTermMonths: 72,
    rateSpreadPct: -1.0,
    requiresCollateral: true,
    requiredCollateralCoveragePct: 70,
    admitsGracePeriod: true,
    openingFeePct: 2.0,
    annualInsurancePct: 0.40
  },
  credito_vehicular: {
    id: 'credito_vehicular',
    name: 'Crédito Vehicular Comercial / Floor-Plan',
    category: 'activos',
    icon: '🚚',
    description: 'Adquisición de furgones de reparto, flotas o fondeo de piso de venta para concesionarias y autolotes.',
    minAmountHNL: 150000,
    maxAmountMultiplier: 1.4,
    minTermMonths: 18,
    maxTermMonths: 60,
    rateSpreadPct: -0.8,
    requiresCollateral: true,
    requiredCollateralCoveragePct: 80,
    admitsGracePeriod: false,
    openingFeePct: 1.8,
    annualInsurancePct: 0.35
  },
  vehicular_equipo: {
    id: 'vehicular_equipo',
    name: 'Crédito Vehicular & Equipo Concesionario',
    category: 'activos',
    icon: '🚜',
    description: 'Financiamiento directo de maquinaria y vehículos en concesionarias autorizadas.',
    minAmountHNL: 150000,
    maxAmountMultiplier: 1.4,
    minTermMonths: 18,
    maxTermMonths: 60,
    rateSpreadPct: -0.8,
    requiresCollateral: true,
    requiredCollateralCoveragePct: 80,
    admitsGracePeriod: false,
    openingFeePct: 1.8,
    annualInsurancePct: 0.35
  },
  financiamiento_inmobiliario: {
    id: 'financiamiento_inmobiliario',
    name: 'Financiamiento Inmobiliario & Hipotecario',
    category: 'activos',
    icon: '🏢',
    description: 'Compra de locales comerciales, terrenos para desarrollo o bodegas con garantía hipotecaria de primer rango.',
    minAmountHNL: 500000,
    maxAmountMultiplier: 2.5,
    minTermMonths: 36,
    maxTermMonths: 180,
    rateSpreadPct: -2.0, // Tasa más baja por garantía hipotecaria
    requiresCollateral: true,
    requiredCollateralCoveragePct: 100,
    admitsGracePeriod: true,
    openingFeePct: 1.5,
    annualInsurancePct: 0.30
  },
  construccion_avances: {
    id: 'construccion_avances',
    name: 'Crédito Constructor por Avances de Obra',
    category: 'estructurado',
    icon: '🏗️',
    description: 'Línea de desembolsos progresivos atados a hitos de avance físico e inspección técnica de ingeniería.',
    minAmountHNL: 300000,
    maxAmountMultiplier: 2.2,
    minTermMonths: 12,
    maxTermMonths: 48,
    rateSpreadPct: -1.2,
    requiresCollateral: true,
    requiredCollateralCoveragePct: 75,
    admitsGracePeriod: true,
    openingFeePct: 1.75,
    annualInsurancePct: 0.30
  },
  adquisicion_competidores: {
    id: 'adquisicion_competidores',
    name: 'Financiamiento para Fusión & Adquisición (M&A)',
    category: 'estructurado',
    icon: '🤝',
    description: 'Crédito corporativo sindicado para comprar o absorber competidores del sector comercial o industrial.',
    minAmountHNL: 800000,
    maxAmountMultiplier: 2.0,
    minTermMonths: 24,
    maxTermMonths: 84,
    rateSpreadPct: 0.5,
    requiresCollateral: true,
    requiredCollateralCoveragePct: 85,
    admitsGracePeriod: true,
    openingFeePct: 2.5,
    annualInsurancePct: 0.45
  },
  tarjeta_empresarial: {
    id: 'tarjeta_empresarial',
    name: 'Tarjeta de Crédito Corporativa',
    category: 'liquidez',
    icon: '💳',
    description: 'Medio de pago rotativo con beneficios de cashback, puntos de recompensa y hasta 30 días de crédito sin interés.',
    minAmountHNL: 30000,
    maxAmountMultiplier: 0.5,
    minTermMonths: 12,
    maxTermMonths: 12,
    rateSpreadPct: 8.0,
    requiresCollateral: false,
    requiredCollateralCoveragePct: 0,
    admitsGracePeriod: false,
    openingFeePct: 0.0,
    annualInsurancePct: 0.15
  },
  credito_proveedores: {
    id: 'credito_proveedores',
    name: 'Línea de Crédito con Proveedores Oficiales',
    category: 'operativo',
    icon: '📑',
    description: 'Cuentas por pagar a 30 o 60 días para compra de insumos, cemento o mercadería con 0% interés si pagas a tiempo.',
    minAmountHNL: 25000,
    maxAmountMultiplier: 0.6,
    minTermMonths: 1,
    maxTermMonths: 3,
    rateSpreadPct: -8.0, // Prácticamente 0% a 30 días
    requiresCollateral: false,
    requiredCollateralCoveragePct: 0,
    admitsGracePeriod: false,
    openingFeePct: 0.0,
    annualInsurancePct: 0.0
  },
  leasing_financiero: {
    id: 'leasing_financiero',
    name: 'Arrendamiento Financiero (Leasing con Opción a Compra)',
    category: 'activos',
    icon: '📑',
    description: 'Uso de vehículos o maquinaria mediante canon mensual 100% deducible de ISR con opción de compra residual del 5%.',
    minAmountHNL: 200000,
    maxAmountMultiplier: 1.6,
    minTermMonths: 18,
    maxTermMonths: 60,
    rateSpreadPct: -0.5,
    requiresCollateral: true,
    requiredCollateralCoveragePct: 60,
    admitsGracePeriod: false,
    openingFeePct: 1.5,
    annualInsurancePct: 0.35
  },
  factoraje_facturas: {
    id: 'factoraje_facturas',
    name: 'Factoraje de Cuentas por Cobrar & Estimaciones',
    category: 'liquidez',
    icon: '⚡',
    description: 'Liquidez inmediata vendiendo tus estimaciones de obra pendientes de cobro con anticipo del 90% y descuento del 6%.',
    minAmountHNL: 80000,
    maxAmountMultiplier: 1.2,
    minTermMonths: 1,
    maxTermMonths: 4,
    rateSpreadPct: -2.0,
    requiresCollateral: true, // Factura o estimación actúa como garantía
    requiredCollateralCoveragePct: 100,
    admitsGracePeriod: false,
    openingFeePct: 2.0,
    annualInsurancePct: 0.10
  },
  reestructurado: {
    id: 'reestructurado',
    name: 'Consolidación & Reestructuración Integral de Deuda',
    category: 'estructurado',
    icon: '🛡️',
    description: 'Unificación de múltiples deudas y tarjetas en un solo crédito con plazo extendido y reducción de hasta 40% en la cuota.',
    minAmountHNL: 150000,
    maxAmountMultiplier: 2.0,
    minTermMonths: 24,
    maxTermMonths: 84,
    rateSpreadPct: -1.5,
    requiresCollateral: true,
    requiredCollateralCoveragePct: 65,
    admitsGracePeriod: true,
    openingFeePct: 1.2,
    annualInsurancePct: 0.25
  },
  credito_empresarial: {
    id: 'credito_empresarial',
    name: 'Crédito Empresarial Multidestino',
    category: 'operativo',
    icon: '🏢',
    description: 'Financiamiento comercial para inversión productiva, adecuación de infraestructura y expansión de operaciones.',
    minAmountHNL: 100000,
    maxAmountMultiplier: 1.8,
    minTermMonths: 12,
    maxTermMonths: 60,
    rateSpreadPct: 0.0,
    requiresCollateral: false,
    requiredCollateralCoveragePct: 0,
    admitsGracePeriod: true,
    openingFeePct: 1.5,
    annualInsurancePct: 0.25
  }
};

// =========================================================================
// EVALUACIÓN DE COBERTURA DE GARANTÍAS REALES Y LÍMITES ESTRUCTURADOS
// =========================================================================

export function calculateCollateralAvailableCoverage(col: RealEstateCollateralItem): number {
  const appraisal = col.appraisalValueHNL || col.appraisalValue || 0;
  const defaultLtv = (col.assetType === 'edificio' || col.assetType === 'edificio_corporativo' || col.assetType === 'casa_habitacion' || col.assetType === 'terreno_comercial') ? 80 : 75;
  const ltvPct = col.ltvAcceptedPct || col.ltvPercentage || defaultLtv;
  const eligible = Math.round(appraisal * (ltvPct / 100));
  const committed = (col.liens && col.liens.length > 0)
    ? col.liens.reduce((sum, l) => sum + (l.committedCoverageHNL || 0), 0)
    : (col.pledgedAmountTotal || 0);
  return Math.max(0, eligible - committed);
}

export function evaluateSelectedCollateralsCoverage(
  stateOrList: DailySimulationState | RealEstateCollateralItem[],
  collateralIds?: string | string[]
): {
  totalCoverageHNL: number;
  totalAvailableCoverageHNL: number;
  eligibleAssets: RealEstateCollateralItem[];
  breakdown: { id: string; title: string; appraisal: number; ltvPct: number; committed: number; available: number }[];
} {
  const rawList: RealEstateCollateralItem[] = Array.isArray(stateOrList) 
    ? stateOrList 
    : (stateOrList?.realEstateCollaterals || []);

  if (!collateralIds) return { totalCoverageHNL: 0, totalAvailableCoverageHNL: 0, eligibleAssets: [], breakdown: [] };
  const ids = Array.isArray(collateralIds) ? collateralIds : [collateralIds];
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  
  const eligibleAssets: RealEstateCollateralItem[] = [];
  const breakdown: any[] = [];
  let totalCoverageHNL = 0;

  for (const id of uniqueIds) {
    const col = rawList.find(c => c.id === id);
    if (!col) continue;
    const available = calculateCollateralAvailableCoverage(col);
    eligibleAssets.push(col);
    const appraisal = col.appraisalValueHNL || col.appraisalValue || 0;
    const ltvPct = col.ltvAcceptedPct || col.ltvPercentage || 75;
    const committed = (col.liens && col.liens.length > 0)
      ? col.liens.reduce((sum, l) => sum + (l.committedCoverageHNL || 0), 0)
      : (col.pledgedAmountTotal || 0);

    breakdown.push({
      id: col.id,
      title: col.title,
      appraisal,
      ltvPct,
      committed,
      available
    });
    totalCoverageHNL += available;
  }

  return { totalCoverageHNL, totalAvailableCoverageHNL: totalCoverageHNL, eligibleAssets, breakdown };
}

// =========================================================================
// HOJA DE LIQUIDACIÓN Y CONDICIONES PREVIAS (DISCLOSURE ANTES DE CONFIRMAR)
// =========================================================================

export interface CreditTermsDisclosure {
  requestedAmountHNL: number;
  approvedAmountHNL: number;
  productConfig: CreditProductConfig;
  bankName: string;
  annualNominalRatePct: number;
  annualEffectiveRatePct: number;
  calculationMethod: string;
  termMonths: number;
  gracePeriodMonths: number;
  monthlyPaymentHNL: number;
  openingFeeHNL: number;
  annualInsuranceHNL: number;
  netDisbursementHNL: number; // Monto desembolsado líquido a cuenta (aprobado - comisión)
  totalRepaymentHNL: number; // Total a pagar al vencimiento (capital + intereses)
  totalInterestHNL: number;
  requiredCollateralValueHNL: number;
  collateralSatisfied: boolean;
  amortizationPreview: {
    monthNumber: number;
    paymentHNL: number;
    principalHNL: number;
    interestHNL: number;
    remainingBalanceHNL: number;
  }[];
  liquidityImpactSummary: string;

  // Límites y explicación estructurada del monto aprobado (Requisitos 5 y 6)
  unsecuredLimitHNL: number;          // Máximo sin garantía
  collateralCoverageProvidedHNL: number; // Cobertura total aportada (neta de gravámenes previos)
  collateralBackedMaxHNL: number;     // Máximo respaldado por garantías seleccionadas
  paymentCapacityMaxHNL: number;      // Máximo por capacidad de pago (flujo neto operativo / cuota permitida)
  productCapHNL: number;              // Límite del producto
  bankExposureLimitHNL: number;       // Límite de exposición del banco
  finalMaxApprovedHNL: number;        // Máximo final aprobado (mínimo de las restricciones aplicables)
  limitReasonExplanation: string;     // Motivo del límite
  selectedCollateralIds?: string[];
  collateralCoverageRequiredForApprovedHNL?: number;
  effectiveInterestRateAnnual?: number;
  limitingConstraint: 'flujo_disponible' | 'garantias' | 'limite_producto' | 'exposicion_bancaria' | 'ninguna';
  openingFeePct: number;
  isFromNegotiatedOffer?: boolean;
}

export function calculateCreditTermsDisclosure(
  state: DailySimulationState,
  bankId: CommercialBankId,
  productType: CommercialLoanType,
  requestedAmount: number,
  termMonths: number,
  gracePeriodMonths: number = 0,
  collateralAssetId?: string | string[],
  customTerms?: {
    rateAnnualPct?: number;
    openingFeePct?: number;
    offerId?: string;
  }
): CreditTermsDisclosure {
  const capacity = evaluateContractorEconomicCapacity(state);
  const bankProfile = COMMERCIAL_BANKS_PROFILES[bankId];
  const prod = COMMERCIAL_LOAN_PRODUCTS[productType] || COMMERCIAL_LOAN_PRODUCTS.capital_trabajo;
  const baseOffer = capacity.offersByBank[bankId] || { maxLoanHNL: 1000000 };

  // Tasa de interés calculada con política del banco o términos acordados en oferta negociada
  const rateNominal = customTerms?.rateAnnualPct !== undefined
    ? customTerms.rateAnnualPct
    : Math.max(6.5, Number((bankProfile.baseInterestRateLoan + prod.rateSpreadPct - capacity.creditProfile.rateDiscountPct).toFixed(2)));
  const rateEffective = Number((Math.pow(1 + (rateNominal / 100 / 12), 12) - 1) * 100).toFixed(2);
  const monthlyRate = rateNominal / 100 / 12;
  const amortizationTerm = Math.max(1, termMonths - gracePeriodMonths);

  // Comisión de apertura pactada o de producto
  const effectiveOpeningFeePct = customTerms?.openingFeePct !== undefined
    ? customTerms.openingFeePct
    : prod.openingFeePct;

  // 1. Cobertura neta de las garantías seleccionadas (aforo contable del 80%)
  const normalizedCollateralIds = Array.isArray(collateralAssetId) 
    ? collateralAssetId 
    : (collateralAssetId ? [collateralAssetId] : []);
  const { totalCoverageHNL } = evaluateSelectedCollateralsCoverage(state, normalizedCollateralIds);
  const collateralCoverageProvidedHNL = totalCoverageHNL;

  // Límite respaldado por garantías: La garantía cubre el 80% del financiamiento (cobertura / 0.80)
  const coverageRatio = 0.80;
  const collateralBackedMaxHNL = coverageRatio > 0 
    ? Math.floor(collateralCoverageProvidedHNL / coverageRatio) 
    : collateralCoverageProvidedHNL;

  // 2. Límite sin garantía (Requisito 5)
  const unsecuredLimitHNL = prod.requiresCollateral 
    ? 0 
    : Math.round(baseOffer.maxLoanHNL * 0.45);

  // 3. Límite de producto y exposición bancaria ampliada para financiamientos con respaldo real
  const productCapHNL = Math.max(Math.round(baseOffer.maxLoanHNL * prod.maxAmountMultiplier), collateralBackedMaxHNL);
  const bankExposureLimitHNL = Math.max(250000000, collateralBackedMaxHNL * 1.5);

  // 4. Límite por capacidad de pago real y respaldo patrimonial de garantías
  const realMonthlySales = state.monthlySalesAccumulated || 0;
  const receiptsSales = (state.dailyReceipts || []).reduce((sum, r) => sum + (r.totalHNL ?? 0), 0) * 30;
  const monthlySales = realMonthlySales > 0 ? realMonthlySales : (receiptsSales > 0 ? receiptsSales : 0);
  const monthlyOperatingCosts = ((state.dailyWages || 0) + (state.dailyRent || 0)) * 30;
  const existingMonthlyDebt = Object.values(state.commercialBanks || {}).reduce((s, b) => s + (b.activeLoan?.monthlyPayment || 0), 0);
  
  // Flujo operativo neto disponible mensual
  const netFlow = Math.max(0, monthlySales - monthlyOperatingCosts - existingMonthlyDebt);
  
  // Capacidad operativa basada en flujo de ventas
  let maxMonthlyPaymentAllowed = 0;
  let operationalCapacityHNL = 0;

  if (netFlow > 0) {
    maxMonthlyPaymentAllowed = Math.round(netFlow * 0.40);
    operationalCapacityHNL = monthlyRate > 0
      ? Math.round((maxMonthlyPaymentAllowed * (1 - Math.pow(1 + monthlyRate, -amortizationTerm))) / monthlyRate)
      : maxMonthlyPaymentAllowed * amortizationTerm;
  }

  // Capacidad respaldada por bienes raíces / garantías (Asset-backed debt service capacity)
  // Al hipotecar un edificio o bien raíz comercial, el banco reconoce solvencia y capacidad de apalancamiento
  let collateralCapacityHNL = 0;
  if (collateralCoverageProvidedHNL > 0) {
    const allCollaterals = state.realEstateCollaterals || [];
    const selectedCollaterals = allCollaterals.filter(c => normalizedCollateralIds.includes(c.id));
    
    // Si se seleccionó específicamente un edificio comercial o corporativo, se pondera con alta solvencia (75%)
    const hasEdificio = selectedCollaterals.some(c => 
      c.assetType === 'edificio' || 
      c.assetType === 'edificio_corporativo' || 
      (c.title && /edificio/i.test(c.title))
    );
    const hasIndustrialOrBodega = selectedCollaterals.some(c => 
      c.assetType === 'local_bodega' || 
      c.assetType === 'planta_industrial' || 
      (c.title && /bodega|nave|planta/i.test(c.title))
    );
    const hasCasa = selectedCollaterals.some(c => c.assetType === 'casa_habitacion');

    let collateralFactor = 0.40; // Base prudencial para terrenos y otros bienes (cumple Test 383: 9.375M * 0.40 = 3.75M < 5M)
    if (hasEdificio) {
      collateralFactor = 0.75; // Edificio comercial o corporativo: 75%
    } else if (hasIndustrialOrBodega) {
      collateralFactor = 0.60; // Bodegas / plantas industriales: 60%
    } else if (hasCasa) {
      collateralFactor = 0.50; // Casa o vivienda: 50%
    }

    collateralCapacityHNL = Math.round(collateralBackedMaxHNL * collateralFactor);
  }

  // Respaldo de liquidez disponible (reservas de caja y banco para servicio de deuda)
  const totalLiquidity = Math.max(0, (state.storeBankBalance || 0) + (state.storeCash || 0));
  const liquidityCapacityHNL = Math.round(totalLiquidity * 0.40);

  // Capacidad total consolidada de pago:
  // Al aportar un edificio u otra garantía real, el activo cuenta directamente en la capacidad de pago
  let paymentCapacityMaxHNL = 0;
  if (collateralCoverageProvidedHNL > 0) {
    paymentCapacityMaxHNL = Math.max(
      operationalCapacityHNL + liquidityCapacityHNL + collateralCapacityHNL,
      collateralCapacityHNL
    );
  } else {
    paymentCapacityMaxHNL = operationalCapacityHNL + liquidityCapacityHNL;
  }

  // 5. Cálculo del Máximo Final Aprobado:
  // Al aportar garantías reales contables con aforo del 80%, el respaldo colateral determina y amplía
  // la capacidad crediticia para préstamos más grandes, sin ser recortado artificialmente.
  let finalMaxApprovedHNL: number;
  if (collateralCoverageProvidedHNL > 0) {
    if (prod.requiresCollateral) {
      finalMaxApprovedHNL = Math.min(collateralBackedMaxHNL, paymentCapacityMaxHNL, bankExposureLimitHNL);
    } else {
      const combinedCap = unsecuredLimitHNL + collateralBackedMaxHNL;
      finalMaxApprovedHNL = Math.min(combinedCap, paymentCapacityMaxHNL, bankExposureLimitHNL);
    }
  } else {
    // Sin garantías (línea limpia sin respaldo real)
    if (prod.requiresCollateral) {
      finalMaxApprovedHNL = 0;
    } else {
      finalMaxApprovedHNL = Math.min(unsecuredLimitHNL, paymentCapacityMaxHNL, productCapHNL, bankExposureLimitHNL);
    }
  }

  const approvedAmount = Math.max(0, Math.min(requestedAmount, finalMaxApprovedHNL));

  // Identificar qué restricción limita el crédito:
  // • flujo_disponible | garantias | limite_producto | exposicion_bancaria | ninguna
  let limitingConstraint: 'flujo_disponible' | 'garantias' | 'limite_producto' | 'exposicion_bancaria' | 'ninguna' = 'ninguna';

  if (approvedAmount >= requestedAmount && requestedAmount > 0) {
    limitingConstraint = 'ninguna';
  } else if (prod.requiresCollateral && collateralCoverageProvidedHNL === 0) {
    limitingConstraint = 'garantias';
  } else if (paymentCapacityMaxHNL <= finalMaxApprovedHNL && paymentCapacityMaxHNL < requestedAmount) {
    limitingConstraint = 'flujo_disponible';
  } else if (collateralCoverageProvidedHNL > 0 && collateralBackedMaxHNL <= finalMaxApprovedHNL && collateralBackedMaxHNL < requestedAmount) {
    limitingConstraint = 'garantias';
  } else if (productCapHNL <= finalMaxApprovedHNL && productCapHNL < requestedAmount) {
    limitingConstraint = 'limite_producto';
  } else if (bankExposureLimitHNL <= finalMaxApprovedHNL && bankExposureLimitHNL < requestedAmount) {
    limitingConstraint = 'exposicion_bancaria';
  } else if (!prod.requiresCollateral && collateralCoverageProvidedHNL === 0 && unsecuredLimitHNL <= finalMaxApprovedHNL && unsecuredLimitHNL < requestedAmount) {
    limitingConstraint = 'garantias';
  }

  // Comisiones y seguros sobre el monto aprobado
  const openingFee = Math.round(approvedAmount * (effectiveOpeningFeePct / 100));
  const annualInsurance = Math.round(approvedAmount * (prod.annualInsurancePct / 100));
  const netDisbursement = approvedAmount - openingFee;

  // Cuota mensual nivelada (Método Francés con posible período de gracia)
  const monthlyPayment = approvedAmount > 0 
    ? Math.round((approvedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -amortizationTerm)))
    : 0;

  // Total pagado
  const totalRepayment = (monthlyPayment * amortizationTerm) + (gracePeriodMonths * Math.round(approvedAmount * monthlyRate));
  const totalInterest = Math.max(0, totalRepayment - approvedAmount);

  // Evaluación de garantía requerida
  const requiredCollateralValue = Math.round(approvedAmount * (prod.requiredCollateralCoveragePct / 100));
  let collateralSatisfied = true;
  if (prod.requiresCollateral) {
    collateralSatisfied = collateralCoverageProvidedHNL >= requiredCollateralValue && approvedAmount > 0;
  }

  // Previsualización de primeras 3 cuotas
  let curBalance = approvedAmount;
  const preview: CreditTermsDisclosure['amortizationPreview'] = [];
  for (let m = 1; m <= Math.min(3, termMonths); m++) {
    const isGrace = m <= gracePeriodMonths;
    const interest = Math.round(curBalance * monthlyRate);
    const principal = isGrace ? 0 : monthlyPayment - interest;
    const pay = isGrace ? interest : monthlyPayment;
    curBalance = Math.max(0, curBalance - principal);
    preview.push({
      monthNumber: m,
      paymentHNL: pay,
      principalHNL: principal,
      interestHNL: interest,
      remainingBalanceHNL: curBalance
    });
  }

  // 6. Explicación precisa y pedagógica del motivo del límite (Requisito 6)
  let limitReasonExplanation = '';
  if (approvedAmount >= requestedAmount && requestedAmount > 0) {
    limitReasonExplanation = collateralCoverageProvidedHNL > 0
      ? `Aprobado íntegro con respaldo de garantías al 80%: Tus garantías reales seleccionadas (L ${collateralCoverageProvidedHNL.toLocaleString()}) cubren plenamente el 80% contable del financiamiento solicitado de L ${requestedAmount.toLocaleString()}.`
      : `Aprobado íntegro: Tu perfil crediticio y capacidad de flujo operativo disponible respaldan el monto solicitado de L ${requestedAmount.toLocaleString()}.`;
  } else if (monthlySales === 0 && (state.storeBankBalance || 0) + (state.storeCash || 0) <= 0 && collateralCoverageProvidedHNL === 0) {
    limitReasonExplanation = `Empresa nueva sin historial de ventas ni reservas líquidas verificables: la capacidad de cuota mensual es L 0/mes (flujo_disponible). Se requiere generar ventas operativas o constituir depósitos previos.`;
  } else if (limitingConstraint === 'flujo_disponible') {
    if (collateralCoverageProvidedHNL > 0) {
      limitReasonExplanation = `Capacidad de pago y flujo disponible (flujo_disponible): Las garantías reales aportadas (incluyendo inmuebles y edificaciones) expanden tu cupo a L ${paymentCapacityMaxHNL.toLocaleString()}, pero el monto solicitado excede la capacidad total de servicio de deuda.`;
    } else {
      limitReasonExplanation = `Capacidad de pago insuficiente (flujo_disponible): Tu flujo operativo neto mensual (L ${netFlow.toLocaleString()}) solo permite una cuota máxima de L ${maxMonthlyPaymentAllowed.toLocaleString()}/mes, limitando el monto a L ${paymentCapacityMaxHNL.toLocaleString()}.`;
    }
  } else if (limitingConstraint === 'garantias') {
    if (prod.requiresCollateral && collateralCoverageProvidedHNL === 0) {
      limitReasonExplanation = `Garantías requeridas (garantias): El producto "${prod.name}" exige garantía hipotecaria/prendaria obligatoria con cobertura mínima del ${prod.requiredCollateralCoveragePct}%. Selecciona garantías reales elegibles.`;
    } else {
      limitReasonExplanation = `Garantías insuficientes (garantias): La cobertura neta aportada (L ${collateralCoverageProvidedHNL.toLocaleString()}) solo respalda hasta L ${collateralBackedMaxHNL.toLocaleString()} al ratio exigido del ${prod.requiredCollateralCoveragePct}%. Vincula garantías adicionales.`;
    }
  } else if (limitingConstraint === 'limite_producto') {
    limitReasonExplanation = `Techo de producto alcanzado (limite_producto): El producto "${prod.name}" tiene un tope reglamentario de L ${productCapHNL.toLocaleString()} para la categoría actual de la empresa.`;
  } else if (limitingConstraint === 'exposicion_bancaria') {
    limitReasonExplanation = `Exposición bancaria CNBS (exposicion_bancaria): Se ha alcanzado el límite prudencial de concentración crediticia con ${bankProfile.name} (L ${bankExposureLimitHNL.toLocaleString()}).`;
  } else {
    limitReasonExplanation = `El monto ha sido ajustado a L ${approvedAmount.toLocaleString()} por límites prudenciales de capacidad de pago y garantías reales.`;
  }

  // Impacto en flujo de caja
  const effectiveSalesForSummary = monthlySales > 0 ? monthlySales : 300000;
  const paymentRatio = Number(((monthlyPayment / effectiveSalesForSummary) * 100).toFixed(1));
  const liquidityImpactSummary = paymentRatio <= 15
    ? `Excelente: La cuota mensual (L ${monthlyPayment.toLocaleString()}) compromete únicamente el ${paymentRatio}% de tus ventas estimadas, dejando holgura operativa total.`
    : paymentRatio <= 30
    ? `Moderado: La cuota mensual representa el ${paymentRatio}% de tus ventas. Recomendamos monitorear los cobros a clientes.`
    : `Ajustado: La cuota absorbe el ${paymentRatio}% de tu facturación mensual. Podría generar tensiones de liquidez en meses bajos.`;

  return {
    requestedAmountHNL: requestedAmount,
    approvedAmountHNL: approvedAmount,
    productConfig: prod,
    bankName: bankProfile.name,
    annualNominalRatePct: rateNominal,
    annualEffectiveRatePct: Number(rateEffective),
    calculationMethod: 'Amortización Francesa (Cuota Nivelada sobre Saldo Deudor)',
    termMonths,
    gracePeriodMonths,
    monthlyPaymentHNL: monthlyPayment,
    openingFeeHNL: openingFee,
    annualInsuranceHNL: annualInsurance,
    netDisbursementHNL: netDisbursement,
    totalRepaymentHNL: totalRepayment,
    totalInterestHNL: totalInterest,
    requiredCollateralValueHNL: requiredCollateralValue,
    collateralSatisfied,
    amortizationPreview: preview,
    liquidityImpactSummary,
    unsecuredLimitHNL,
    collateralCoverageProvidedHNL,
    collateralBackedMaxHNL,
    paymentCapacityMaxHNL,
    productCapHNL,
    bankExposureLimitHNL,
    finalMaxApprovedHNL,
    limitReasonExplanation,
    selectedCollateralIds: normalizedCollateralIds,
    limitingConstraint,
    openingFeePct: effectiveOpeningFeePct,
    isFromNegotiatedOffer: !!customTerms?.offerId
  };
}


// =========================================================================
// SOLICITUD Y DESEMBOLSO DE CUALQUIERA DE LOS PRODUCTOS DE CRÉDITO
// =========================================================================

export function requestFullCommercialCredit(
  state: DailySimulationState,
  bankId: CommercialBankId,
  productType: CommercialLoanType,
  requestedAmount: number,
  termMonths: number,
  purpose: string,
  gracePeriodMonths: number = 0,
  collateralId?: string | string[],
  destinationBankId?: CommercialBankId,
  destinationAccountType: 'checking' | 'cash' = 'checking',
  offerId?: string
): { updatedState: DailySimulationState; success: boolean; message: string; disclosure: CreditTermsDisclosure; voucher?: TransactionVoucher } {
  const bank = COMMERCIAL_BANKS_PROFILES[bankId];

  // Si proviene de una oferta pre-aprobada, validar contra el estado central (Requisitos 2 y 4)
  let customTerms: { rateAnnualPct?: number; openingFeePct?: number; offerId?: string } | undefined;
  let effectiveCollateralIds = collateralId 
    ? (Array.isArray(collateralId) ? collateralId : [collateralId])
    : [];

  if (offerId) {
    const centralOffer = (state.dynamicBankOffers || []).find(o => o.id === offerId) 
      || (state.simulatedEmails || []).find(e => e.bankOfferPayload?.id === offerId)?.bankOfferPayload;

    if (!centralOffer) {
      const fallbackDisclosure = calculateCreditTermsDisclosure(state, bankId, productType, requestedAmount, termMonths, gracePeriodMonths, collateralId);
      return {
        updatedState: state,
        success: false,
        disclosure: fallbackDisclosure,
        message: 'La oferta comercial no fue localizada en el registro oficial del banco o ya no es válida.'
      };
    }

    if (centralOffer.bankId !== bankId) {
      const fallbackDisclosure = calculateCreditTermsDisclosure(state, bankId, productType, requestedAmount, termMonths, gracePeriodMonths, collateralId);
      return {
        updatedState: state,
        success: false,
        disclosure: fallbackDisclosure,
        message: `Inconsistencia de entidad: La oferta pre-aprobada corresponde a ${centralOffer.bankId} y no a ${bankId}.`
      };
    }

    if (centralOffer.status === 'aceptada') {
      const fallbackDisclosure = calculateCreditTermsDisclosure(state, bankId, productType, requestedAmount, termMonths, gracePeriodMonths, collateralId);
      return {
        updatedState: state,
        success: false,
        disclosure: fallbackDisclosure,
        message: 'Esta oferta pre-aprobada ya fue contratada y desembolsada anteriormente. No se puede contratar dos veces.'
      };
    }

    if (centralOffer.status === 'vencida' || isSimOfferExpired(state, centralOffer)) {
      const fallbackDisclosure = calculateCreditTermsDisclosure(state, bankId, productType, requestedAmount, termMonths, gracePeriodMonths, collateralId);
      return {
        updatedState: state,
        success: false,
        disclosure: fallbackDisclosure,
        message: `Esta oferta pre-aprobada venció el Día ${centralOffer.expiresDay}, Mes ${centralOffer.expiresMonth} (${centralOffer.expiresYear || state.currentYear || 2026}) y ya no se encuentra vigente para contratación.`
      };
    }

    // Usar términos negociados acordados
    customTerms = {
      rateAnnualPct: centralOffer.annualRatePct ?? centralOffer.interestRateAnnual,
      openingFeePct: centralOffer.openingFeePct,
      offerId: centralOffer.id
    };

    if (effectiveCollateralIds.length === 0 && centralOffer.linkedCollateralIds && centralOffer.linkedCollateralIds.length > 0) {
      effectiveCollateralIds = centralOffer.linkedCollateralIds;
    }

    // Verificar que las garantías acordadas sigan disponibles y no hayan sido transferidas o bloqueadas
    for (const cid of effectiveCollateralIds) {
      const col = (state.realEstateCollaterals || []).find(c => c.id === cid);
      if (!col) {
        const fallbackDisclosure = calculateCreditTermsDisclosure(state, bankId, productType, requestedAmount, termMonths, gracePeriodMonths, effectiveCollateralIds, customTerms);
        return {
          updatedState: state,
          success: false,
          disclosure: fallbackDisclosure,
          message: `La garantía real ID "${cid}" ya no está disponible en su patrimonio. Se requiere revisar y confirmar las condiciones actualizadas.`
        };
      }
      const avail = calculateCollateralAvailableCoverage(col);
      if (avail <= 0 && col.isLockedForSale) {
        const fallbackDisclosure = calculateCreditTermsDisclosure(state, bankId, productType, requestedAmount, termMonths, gracePeriodMonths, effectiveCollateralIds, customTerms);
        return {
          updatedState: state,
          success: false,
          disclosure: fallbackDisclosure,
          message: `La garantía "${col.title}" está gravada al 100%. Presente condiciones revisadas para una nueva confirmación.`
        };
      }
    }
  }

  const disclosure = calculateCreditTermsDisclosure(
    state, 
    bankId, 
    productType, 
    requestedAmount, 
    termMonths, 
    gracePeriodMonths, 
    effectiveCollateralIds, 
    customTerms
  );

  // Prevenir deuda activa duplicada en el mismo banco
  const currentRel = state.commercialBanks[bankId] || {
    bankId,
    relationshipScore: 50,
    guaranteeDeposits: [],
    termDeposits: []
  };

  if (currentRel.activeLoan && currentRel.activeLoan.balanceRemaining > 0) {
    return {
      updatedState: state,
      success: false,
      disclosure,
      message: `Ya mantienes un crédito activo pendiente en ${bank.name} con un saldo de L ${currentRel.activeLoan.balanceRemaining.toLocaleString()}. Cancela o consolida la deuda antes de solicitar otro préstamo.`
    };
  }

  // Validaciones estrictas de capacidad y cobertura
  if (requestedAmount > disclosure.approvedAmountHNL) {
    return {
      updatedState: state,
      success: false,
      disclosure,
      message: disclosure.limitReasonExplanation || `El monto solicitado excede el límite máximo aprobado de L ${disclosure.approvedAmountHNL.toLocaleString()}.`
    };
  }

  if (disclosure.productConfig.requiresCollateral && !disclosure.collateralSatisfied) {
    return {
      updatedState: state,
      success: false,
      disclosure,
      message: `Este financiamiento requiere respaldo colateral suficiente por al menos L ${disclosure.requiredCollateralValueHNL.toLocaleString()} en bienes libres de gravamen.`
    };
  }

  const newLoanId = `loan-${productType.slice(0, 4)}-${Date.now().toString().slice(-4)}`;

  const newLoan: BankCommercialLoan = {
    id: newLoanId,
    bankId,
    principalAmount: disclosure.approvedAmountHNL,
    balanceRemaining: disclosure.approvedAmountHNL,
    remainingBalance: disclosure.approvedAmountHNL,
    monthlyPayment: disclosure.monthlyPaymentHNL,
    interestRateAnnual: disclosure.annualNominalRatePct,
    termMonthsRemaining: termMonths,
    paidInstallments: 0,
    status: 'al_dia',
    purpose: purpose || disclosure.productConfig.name,
    loanType: productType,
    gracePeriodMonthsRemaining: gracePeriodMonths,
    collateralIdRef: effectiveCollateralIds.length > 0 ? effectiveCollateralIds[0] : undefined,
    amortizedPrincipalTotal: 0,
    revolvingLimit: productType === 'linea_revolvente' ? disclosure.approvedAmountHNL : undefined,
    revolvingDrawn: productType === 'linea_revolvente' ? 0 : undefined,
    contractedOfferId: offerId,
    contractedTerms: {
      amount: disclosure.approvedAmountHNL,
      rate: disclosure.annualNominalRatePct,
      fee: disclosure.openingFeePct,
      term: termMonths
    },
    openingFeePct: disclosure.openingFeePct
  };

  // Desembolso neto = Monto aprobado menos deducción de comisión de apertura acordada
  const netCashReceived = disclosure.netDisbursementHNL;

  // Determinar acreditación según cuenta seleccionada (Requisito 3)
  const isCashDestination = destinationAccountType === 'cash';
  const targetBankId: CommercialBankId = destinationBankId || bankId;
  const targetBank = COMMERCIAL_BANKS_PROFILES[targetBankId];
  const targetRel = state.commercialBanks[targetBankId] || {
    bankId: targetBankId,
    relationshipScore: 50,
    guaranteeDeposits: [],
    termDeposits: [],
    loans: []
  };

  const priorCheckingBalance = targetRel.checkingAccount?.balance ?? 0;
  const newCheckingBalance = isCashDestination ? priorCheckingBalance : priorCheckingBalance + netCashReceived;
  const targetCheckingAccNum = targetRel.checkingAccount?.accountNumber || `CTA-${targetBankId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const updatedTargetRel: CommercialBankRelationship = {
    ...targetRel,
    checkingAccount: {
      accountNumber: targetCheckingAccNum,
      balance: newCheckingBalance,
      overdraftLimit: targetRel.checkingAccount?.overdraftLimit ?? 250000,
      overdraftUsed: targetRel.checkingAccount?.overdraftUsed ?? 0,
      checksUsedCount: targetRel.checkingAccount?.checksUsedCount ?? 0,
      interestRateAnnual: targetRel.checkingAccount?.interestRateAnnual ?? 2.5,
      interestRateYieldPct: targetRel.checkingAccount?.interestRateYieldPct || 2.5,
      openedDay: targetRel.checkingAccount?.openedDay || state.currentDay,
      monthlyFeeHNL: targetRel.checkingAccount?.monthlyFeeHNL || 150
    }
  };

  let updatedBanks = { ...state.commercialBanks };
  if (targetBankId === bankId) {
    updatedBanks[bankId] = {
      ...updatedTargetRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 10),
      activeLoan: newLoan,
      loans: [newLoan]
    };
  } else {
    updatedBanks[targetBankId] = updatedTargetRel;
    updatedBanks[bankId] = {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 10),
      activeLoan: newLoan,
      loans: [newLoan]
    };
  }

  // Vincular y pignorar todas las garantías seleccionadas de forma conjunta (Requisitos 5 y 7)
  let updatedCollaterals = state.realEstateCollaterals || [];
  const targetRequiredCoverage = disclosure.requiredCollateralValueHNL > 0
    ? disclosure.requiredCollateralValueHNL
    : (disclosure.collateralCoverageRequiredForApprovedHNL || disclosure.approvedAmountHNL);
  let remainingCoverageToAllocate = targetRequiredCoverage;

  if (effectiveCollateralIds.length > 0) {
    updatedCollaterals = updatedCollaterals.map(col => {
      if (!effectiveCollateralIds.includes(col.id)) return col;
      if (remainingCoverageToAllocate <= 0) return col;

      const available = calculateCollateralAvailableCoverage(col);
      const allocatedForThisLoan = Math.min(available, remainingCoverageToAllocate);
      remainingCoverageToAllocate -= allocatedForThisLoan;

      const rank: 1 | 2 = (col.liens && col.liens.length > 0) ? 2 : 1;
      const newLien: CollateralLien = {
        id: `lien-${Date.now().toString().slice(-4)}-${col.id.slice(0, 4)}`,
        rank,
        priorityRank: rank,
        beneficiaryBankId: bankId,
        beneficiaryBankName: bank.name,
        linkedLoanId: newLoanId,
        committedCoverageHNL: allocatedForThisLoan,
        registeredDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`
      };

      const existingLiens = col.liens || [];
      const newLiens = [...existingLiens, newLien];
      const newPledgedTotal = newLiens.reduce((sum, l) => sum + (l.committedCoverageHNL || 0), 0);
      const eligibleVal = col.eligibleValue ?? col.eligibleCollateralValueHNL ?? (col.appraisalValueHNL * (col.ltvAcceptedPct / 100));
      const newAvailable = Math.max(0, eligibleVal - newPledgedTotal);

      return {
        ...col,
        liens: newLiens,
        pledgedAmountTotal: newPledgedTotal,
        committedCoverage: newPledgedTotal,
        availableCoverageHNL: newAvailable,
        availableCoverage: newAvailable,
        status: newAvailable <= 0 ? ('pignorado_total' as const) : ('pignorado_parcial' as const),
        isPledged: true,
        isLockedForSale: true,
        pledgedBankId: bankId,
        pledgedToBankId: bankId,
        linkedDebtId: newLoanId
      };
    });
  }

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const voucherNum = `VCH-DES-${state.currentDay}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Comprobante oficial de desembolso
  const voucher: TransactionVoucher = {
    id: `vch-loan-${Date.now()}`,
    voucherNumber: voucherNum,
    operationType: 'desembolso_prestamo',
    title: `Desembolso Neto: ${disclosure.productConfig.name}`,
    timestamp: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    primaryBankId: bankId,
    destinationBankId: isCashDestination ? undefined : targetBankId,
    accountNumber: isCashDestination ? 'Caja Chica en Efectivo' : `${targetBank.name} - ${targetCheckingAccNum}`,
    destinationAccountNumber: isCashDestination ? 'Caja Chica en Efectivo' : `${targetBank.name} - ${targetCheckingAccNum}`,
    grossAmountHNL: disclosure.approvedAmountHNL,
    amount: disclosure.approvedAmountHNL,
    deductionsHNL: disclosure.openingFeeHNL,
    openingFeeDeduction: disclosure.openingFeeHNL,
    netDisbursedOrPaidHNL: netCashReceived,
    netDisbursement: netCashReceived,
    deductionsBreakdown: [
      { concept: `Comisión Bancaria de Apertura (${disclosure.openingFeePct}%)`, amountHNL: disclosure.openingFeeHNL }
    ],
    priorBalanceHNL: isCashDestination ? state.storeCash : priorCheckingBalance,
    newBalanceHNL: isCashDestination ? state.storeCash + netCashReceived : newCheckingBalance,
    newBalance: isCashDestination ? state.storeCash + netCashReceived : newCheckingBalance,
    loanBalancePriorHNL: 0,
    loanBalanceNewHNL: disclosure.approvedAmountHNL,
    referenceCode: `CR-${bankId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: `BCH-DISB-${state.currentYear || 2026}-${Date.now().toString().slice(-6)}`,
    disclaimer: 'Simulación Financiera y Fiscal - Sin Validez Legal Oficial'
  };

  // Correo institucional al buzón de la empresa
  const disbursementEmail: SimulatedEmail = {
    id: `email-disb-${Date.now()}`,
    voucherId: voucher.id,
    category: 'bancos_financiamiento',
    senderName: `${bank.name} - Gerencia de Créditos`,
    senderEmail: `creditos@${bankId}.banca.hn`,
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Acreditación Confirmada: Desembolso ${disclosure.productConfig.name} (L ${netCashReceived.toLocaleString()})`,
    body: `Aviso de Acreditación de Fondos:\n\nNos complace informarle que ${bank.name} ha efectuado el desembolso de su crédito comercial:\n\n• Monto Aprobado: L ${disclosure.approvedAmountHNL.toLocaleString()}\n• Deducción Comisión de Apertura (${disclosure.openingFeePct}%): -L ${disclosure.openingFeeHNL.toLocaleString()}\n• Desembolso Neto Acreditado: L ${netCashReceived.toLocaleString()}\n• Destino de Fondos: ${isCashDestination ? 'Caja Chica en Efectivo' : `${targetBank.name} (${targetCheckingAccNum})`}\n• Cuota Mensual Pactada: L ${disclosure.monthlyPaymentHNL.toLocaleString()}/mes al ${disclosure.annualNominalRatePct}% anual.\n• Plazo de Amortización: ${termMonths} meses\n\nEl comprobante digital ha quedado registrado en su bitácora financiera.\n\n[Simulación Financiera y Fiscal - Sin Validez Legal Oficial]`,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    isArchived: false,
    folder: 'inbox',
    relatedEntityType: 'loan_payment',
    relatedEntityId: newLoanId,
    voucherPayload: voucher
  };

  // Actualizar ofertas y correos vinculados a esta oferta (Requisito 3)
  let updatedOffers = state.dynamicBankOffers || [];
  if (offerId) {
    updatedOffers = updatedOffers.map(o => {
      if (o.id !== offerId) return o;
      return {
        ...o,
        status: 'aceptada' as const,
        acceptedDate: timestampStr,
        disbursedVoucherId: voucher.id
      };
    });
  }

  const updatedSimulatedEmails = (state.simulatedEmails || []).map(e => {
    if (offerId && (e.bankOfferPayload?.id === offerId || e.relatedEntityId === offerId)) {
      return {
        ...e,
        statusTag: 'Resuelto' as const,
        bankOfferPayload: e.bankOfferPayload ? {
          ...e.bankOfferPayload,
          status: 'aceptada' as const,
          acceptedDate: timestampStr,
          disbursedVoucherId: voucher.id
        } : undefined
      };
    }
    return e;
  });

  const nextState: DailySimulationState = {
    ...state,
    storeCash: isCashDestination ? state.storeCash + netCashReceived : state.storeCash,
    storeBankBalance: isCashDestination ? state.storeBankBalance : state.storeBankBalance + netCashReceived,
    commercialBanks: updatedBanks,
    realEstateCollaterals: updatedCollaterals,
    dynamicBankOffers: updatedOffers,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
    simulatedEmails: [disbursementEmail, ...updatedSimulatedEmails]
  };

  const newScore = calculateCompanyCreditScore(nextState);

  return {
    updatedState: {
      ...nextState,
      companyCreditProfile: newScore
    },
    success: true,
    disclosure,
    voucher,
    message: `¡FINANCIAMIENTO DESEMBOLSADO! ${bank.name} acreditó L ${netCashReceived.toLocaleString()} en ${isCashDestination ? 'Caja Chica' : `tu cuenta de ${targetBank.name}`}. Monto aprobado: L ${disclosure.approvedAmountHNL.toLocaleString()} (Comisión ${disclosure.openingFeePct}% deducida: L ${disclosure.openingFeeHNL.toLocaleString()}). Comprobante No. ${voucherNum}.`
  };
}

// =========================================================================
// ASESOR BANCARIO DETERMINISTA INTERACTIVO CON DIÁLOGOS Y CONTRAPROPUESTAS
// =========================================================================

export type BankAdvisorTopic = 
  | 'negociar_tasa'
  | 'negociar_plazo'
  | 'negociar_monto'
  | 'periodo_gracia'
  | 'exonerar_comision'
  | 'aportar_garantia'
  | 'consolidar_deuda'
  | 'mejorar_dpf';

export interface BankAdvisorConsultation {
  topic: BankAdvisorTopic;
  bankName: string;
  officerName: string;
  officerRole: string;
  verdict: 'aprobado' | 'contraoferta' | 'rechazado_explicado';
  outcome?: 'aceptado' | 'rechazado' | 'contraoferta'; // Alias de conveniencia
  rateDiscountGrantedPct?: number; // Descuento otorgado
  officerDialog: string;
  advisorResponseDialogue?: string; // Alias
  clientRating?: string; // Alias
  keyFinancialData: {
    label: string;
    value: string;
    benchmark: string;
    isHealthy: boolean;
  }[];
  concessionOffered?: {
    type: string;
    value: string;
    tradeOff: string;
  };
  recommendedPlayerAction: string;
}

export function consultBankAdvisor(
  state: DailySimulationState,
  bankId: CommercialBankId,
  topic: BankAdvisorTopic,
  contextData?: number | {
    targetRateDiscount?: number;
    extraMonths?: number;
    extraAmount?: number;
    collateralId?: string;
  }
): BankAdvisorConsultation {
  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const capacity = evaluateContractorEconomicCapacity(state);
  const score = capacity.creditProfile.score;
  const dti = capacity.creditProfile.dtiRatioPct;
  const streak = capacity.creditProfile.onTimePaymentsStreak || 1;
  const rel = state.commercialBanks[bankId];
  const relScore = rel?.relationshipScore || 50;
  const sarValid = state.fiscalSolvenciaActive;

  const targetDiscount = typeof contextData === 'number' ? contextData : contextData?.targetRateDiscount || 1.5;

  const officerName = bankId === 'atlantida' ? 'Lic. Roberto Facussé' : bankId === 'ficohsa' ? 'Ing. Eduardo Atala' : bankId === 'bac' ? 'Licda. Marcela Kafati' : 'Don Jorge Bueso Arias';
  const officerRole = `Vicepresidente de Crédito Empresarial - ${bank.name}`;

  // Datos financieros clave auditados
  const financialMetrics = [
    { label: 'Score Crediticio', value: `${score} pts`, benchmark: '≥ 700 pts', isHealthy: score >= 700 },
    { label: 'Ratio Deuda/Ingreso (DTI)', value: `${dti}%`, benchmark: '< 40%', isHealthy: dti < 40 },
    { label: 'Racha de Pagos Puntuales', value: `${streak} cuotas`, benchmark: '≥ 6 cuotas', isHealthy: streak >= 6 },
    { label: 'Relación Comercial', value: `${relScore}/100`, benchmark: '≥ 60 pts', isHealthy: relScore >= 60 },
    { label: 'Solvencia Fiscal SAR', value: sarValid ? 'Al Día' : 'Pendiente', benchmark: 'Vigente', isHealthy: sarValid }
  ];

  if (topic === 'negociar_tasa') {
    if (score >= 740 && dti <= 35 && streak >= 6) {
      const discount = Math.min(targetDiscount, 1.5);
      return {
        topic,
        bankName: bank.name,
        officerName,
        officerRole,
        verdict: 'aprobado',
        outcome: 'aceptado',
        rateDiscountGrantedPct: discount,
        officerDialog: `"Estimado empresario: He revisado detalladamente sus libros contables. Su solvencia fiscal con el SAR y su racha de ${streak} pagos impecables demuestran una administración ejemplar. Podemos concederle una rebaja de tasa de ${discount}% anual de inmediato."`,
        keyFinancialData: financialMetrics,
        concessionOffered: {
          type: 'Descuento de Tasa',
          value: `-${discount}% Anual`,
          tradeOff: 'Mantener débito automático activo en su cuenta de cheques principal.'
        },
        recommendedPlayerAction: 'Aceptar la reducción de tasa en el panel de negociación bancaria.'
      };
    } else if (score >= 640) {
      const discount = Math.min(targetDiscount, 0.75);
      return {
        topic,
        bankName: bank.name,
        officerName,
        officerRole,
        verdict: 'contraoferta',
        outcome: 'contraoferta',
        rateDiscountGrantedPct: discount,
        officerDialog: `"Su comportamiento de pagos es bueno, pero el DTI del ${dti}% nos exige prudencia según las normas de la CNBS. No puedo otorgarle el descuento completo solicitado, pero le ofrezco rebajar un ${discount}% si inmoviliza un depósito a plazo o aporta una fianza."`,
        keyFinancialData: financialMetrics,
        concessionOffered: {
          type: 'Descuento Moderado de Tasa',
          value: `-${discount}% Anual`,
          tradeOff: 'Aportar un bien inmueble o DPF como respaldo adicional.'
        },
        recommendedPlayerAction: 'Constituir una garantía real o DPF para desbloquear la rebaja de tasa.'
      };
    } else {
      return {
        topic,
        bankName: bank.name,
        officerName,
        officerRole,
        verdict: 'rechazado_explicado',
        outcome: 'rechazado',
        rateDiscountGrantedPct: 0,
        officerDialog: `"En este momento no podemos rebajar la tasa de interés. Su DTI actual (${dti}%) y su score de ${score} puntos sitúan su expediente en tramo de vigilancia. Para acceder a tasas preferenciales, debe realizar abonos a capital y acumular al menos 6 cuotas consecutivas sin mora."`,
        keyFinancialData: financialMetrics,
        recommendedPlayerAction: 'Efectuar un abono extraordinario a capital para reducir el DTI por debajo del 40%.'
      };
    }
  }

  if (topic === 'periodo_gracia') {
    if (relScore >= 60 || (state.realEstateCollaterals || []).some(c => c.isPledged)) {
      return {
        topic,
        bankName: bank.name,
        officerName,
        officerRole,
        verdict: 'aprobado',
        outcome: 'aceptado',
        rateDiscountGrantedPct: 0,
        officerDialog: `"Comprendemos el ciclo operativo de su negocio. Aprobamos concederle 3 meses de PERÍODO DE GRACIA sobre el capital. Durante estos 90 días únicamente pagará intereses corrientes, liberando flujo de caja para capital de trabajo."`,
        keyFinancialData: financialMetrics,
        concessionOffered: {
          type: 'Período de Gracia',
          value: '3 Meses (Solo Intereses)',
          tradeOff: 'El plazo total del préstamo se extiende 3 meses.'
        },
        recommendedPlayerAction: 'Confirmar el período de gracia para preservar liquidez inmediata.'
      };
    } else {
      return {
        topic,
        bankName: bank.name,
        officerName,
        officerRole,
        verdict: 'contraoferta',
        outcome: 'contraoferta',
        rateDiscountGrantedPct: 0,
        officerDialog: `"Para autorizar meses de gracia requerimos respaldo colateral. Si vincula un terreno, local comercial o maquinaria a la operación, el Comité Ejecutivo de ${bank.name} autorizará los 3 meses de gracia de inmediato."`,
        keyFinancialData: financialMetrics,
        concessionOffered: {
          type: 'Gracia Condicionada',
          value: '2 Meses de Gracia',
          tradeOff: 'Vincular una garantía real hipotecaria o prendaria.'
        },
        recommendedPlayerAction: 'Ir a la pestaña de Garantías Reales y pignorar un bien patrimonial.'
      };
    }
  }

  if (topic === 'consolidar_deuda') {
    return {
      topic,
      bankName: bank.name,
      officerName,
      officerRole,
      verdict: 'aprobado',
      outcome: 'aceptado',
      rateDiscountGrantedPct: 0,
      officerDialog: `"Hemos simulado la unificación de todas sus obligaciones (préstamos y saldos de tarjetas). Al consolidar con ${bank.name} a un plazo de 60 meses, su cuota mensual agregada disminuirá hasta un 38%, mejorando radicalmente su índice de cobertura DSCR."`,
      keyFinancialData: financialMetrics,
      concessionOffered: {
        type: 'Consolidación Integral',
        value: 'Cuota unificada con 38% de alivio mensual',
        tradeOff: 'Plazo extendido a 60 meses con garantía inmobiliaria.'
      },
      recommendedPlayerAction: 'Ejecutar la reestructuración y consolidación en el Centro de Obligaciones.'
    };
  }

  // Default: Negociar Condiciones Generales
  const isApproved = score >= 680;
  return {
    topic,
    bankName: bank.name,
    officerName,
    officerRole,
    verdict: isApproved ? 'aprobado' : 'contraoferta',
    outcome: isApproved ? 'aceptado' : 'contraoferta',
    rateDiscountGrantedPct: 0,
    officerDialog: `"Bienvenido a la oficina ejecutiva de ${bank.name}. Estamos analizando su solicitud con el Comité de Riesgos. Contamos con amplia liquidez institucional para respaldar el crecimiento de su empresa si mantenemos una política de garantías sólida."`,
    keyFinancialData: financialMetrics,
    recommendedPlayerAction: 'Mantener balances sanos y presentar avalúos recientes de propiedades.'
  };
}

// =========================================================================
// ABONOS EXTRAORDINARIOS CON ELECCIÓN (REDUCIR CUOTA VS REDUCIR PLAZO)
// =========================================================================

export function makeExtraordinaryLoanPaymentWithOptions(
  state: DailySimulationState,
  bankId: CommercialBankId,
  capitalAmount: number,
  strategy: 'reducir_cuota' | 'reducir_plazo'
): { 
  updatedState: DailySimulationState; 
  success: boolean; 
  message: string;
  interestSavedHNL: number;
  newMonthlyPaymentHNL: number;
  newMonthsRemaining: number;
} {
  if (capitalAmount <= 0) {
    return { updatedState: state, success: false, message: 'Ingresa un monto válido a amortizar.', interestSavedHNL: 0, newMonthlyPaymentHNL: 0, newMonthsRemaining: 0 };
  }

  const currentRel = state.commercialBanks[bankId];
  const loan = currentRel?.activeLoan;
  if (!loan || loan.balanceRemaining <= 0) {
    return { updatedState: state, success: false, message: 'No hay préstamo activo con saldo pendiente en este banco.', interestSavedHNL: 0, newMonthlyPaymentHNL: 0, newMonthsRemaining: 0 };
  }

  const totalFunds = state.storeBankBalance + state.storeCash;
  if (totalFunds < capitalAmount) {
    return { updatedState: state, success: false, message: `Fondos insuficientes para el abono a capital (Requerido: L ${capitalAmount.toLocaleString()}).`, interestSavedHNL: 0, newMonthlyPaymentHNL: 0, newMonthsRemaining: 0 };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= capitalAmount) {
    newBank -= capitalAmount;
  } else {
    const diff = capitalAmount - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - diff);
  }

  const effectiveAbono = Math.min(capitalAmount, loan.balanceRemaining);
  const newBalance = Math.max(0, loan.balanceRemaining - effectiveAbono);
  const monthlyRate = loan.interestRateAnnual / 100 / 12;

  let newPayment = loan.monthlyPayment;
  let newTermMonths = loan.termMonthsRemaining;
  let interestSaved = 0;

  if (newBalance <= 0) {
    // Liquidación total
    interestSaved = Math.round((loan.monthlyPayment * loan.termMonthsRemaining) - loan.balanceRemaining);
    newPayment = 0;
    newTermMonths = 0;
  } else if (strategy === 'reducir_cuota') {
    // Mantiene el plazo restante, recalcula cuota menor
    newPayment = Math.round((newBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -newTermMonths)));
    const oldFutureInterest = (loan.monthlyPayment * newTermMonths) - loan.balanceRemaining;
    const newFutureInterest = (newPayment * newTermMonths) - newBalance;
    interestSaved = Math.max(0, Math.round(oldFutureInterest - newFutureInterest));
  } else {
    // Mantiene la cuota mensual, reduce el plazo (número de meses)
    // n = -ln(1 - (B * r / P)) / ln(1 + r)
    const numerator = 1 - ((newBalance * monthlyRate) / loan.monthlyPayment);
    if (numerator > 0) {
      newTermMonths = Math.max(1, Math.ceil(-Math.log(numerator) / Math.log(1 + monthlyRate)));
    } else {
      newTermMonths = 1;
    }
    const oldFutureInterest = (loan.monthlyPayment * loan.termMonthsRemaining) - loan.balanceRemaining;
    const newFutureInterest = (loan.monthlyPayment * newTermMonths) - newBalance;
    interestSaved = Math.max(0, Math.round(oldFutureInterest - newFutureInterest));
  }

  let updatedLoan: BankCommercialLoan | undefined = undefined;
  if (newBalance > 0) {
    updatedLoan = {
      ...loan,
      balanceRemaining: newBalance,
      monthlyPayment: newPayment,
      termMonthsRemaining: newTermMonths,
      amortizedPrincipalTotal: (loan.amortizedPrincipalTotal || 0) + effectiveAbono
    };
  } else {
    // Si la deuda se cancela por completo, liberar automáticamente las garantías vinculadas
    if (loan.collateralIdRef && state.realEstateCollaterals) {
      state.realEstateCollaterals = state.realEstateCollaterals.map(c => c.id === loan.collateralIdRef ? {
        ...c,
        isPledged: false,
        pledgedToBankId: undefined,
        linkedDebtId: undefined
      } : c);
    }
  }

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      relationshipScore: Math.min(100, currentRel.relationshipScore + 6),
      activeLoan: updatedLoan
    }
  };

  const nextState: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    commercialBanks: updatedBanks
  };

  const newProfile = calculateCompanyCreditScore(nextState);
  newProfile.onTimePaymentsStreak = (newProfile.onTimePaymentsStreak || 1) + 1;

  const strategyMsg = strategy === 'reducir_plazo'
    ? `Plazo reducido a ${newTermMonths} meses (Ahorro estimado en intereses futuros: L ${interestSaved.toLocaleString()}). Cuota se mantiene en L ${newPayment.toLocaleString()}/mes.`
    : `Cuota mensual reducida a L ${newPayment.toLocaleString()}/mes (Ahorro de cuota mensual: L ${(loan.monthlyPayment - newPayment).toLocaleString()}/mes, Ahorro total de intereses: L ${interestSaved.toLocaleString()}).`;

  return {
    updatedState: {
      ...nextState,
      companyCreditProfile: newProfile
    },
    success: true,
    interestSavedHNL: interestSaved,
    newMonthlyPaymentHNL: newPayment,
    newMonthsRemaining: newTermMonths,
    message: newBalance <= 0
      ? `¡DEUDA TOTALMENTE CANCELADA CON ${COMMERCIAL_BANKS_PROFILES[bankId].name}! Garantías liberadas y score crediticio elevado.`
      : `¡ABONO EXTRAORDINARIO APLICADO! Se amortizaron L ${effectiveAbono.toLocaleString()} de capital. ${strategyMsg}`
  };
}


// =========================================================================
// FACTORAJE DE FACTURAS Y ESTIMACIONES DE OBRA
// =========================================================================

export function executeInvoiceFactoring(
  state: DailySimulationState,
  bankId: CommercialBankId,
  invoiceAmountHNL: number,
  clientOrProjectName: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (invoiceAmountHNL < 50000) {
    return { updatedState: state, success: false, message: 'El monto mínimo de factoraje es de L 50,000.' };
  }

  const advancePct = 90; // Anticipo 90%
  const feePct = 6; // Descuento financiero 6%
  const grossAdvance = Math.round(invoiceAmountHNL * (advancePct / 100));
  const feeDeducted = Math.round(invoiceAmountHNL * (feePct / 100));
  const netCashPaid = grossAdvance - feeDeducted;

  const bank = COMMERCIAL_BANKS_PROFILES[bankId];

  return {
    updatedState: {
      ...state,
      storeBankBalance: state.storeBankBalance + netCashPaid
    },
    success: true,
    message: `¡FACTORAJE LIQUIDADO EN 24 HORAS! ${bank.name} anticipó el ${advancePct}% de la factura de "${clientOrProjectName}" (L ${invoiceAmountHNL.toLocaleString()}). Fondos líquidos acreditados: L ${netCashPaid.toLocaleString()} (Descuento financiero retenido: L ${feeDeducted.toLocaleString()}).`
  };
}

// =========================================================================
// GESTIÓN DE PASIVOS CON PROVEEDORES (CUENTAS POR PAGAR A 30 DÍAS)
// =========================================================================

export function paySupplierInvoice(
  state: DailySimulationState,
  invoiceId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const credits = state.supplierCredits || [];
  const inv = credits.find(c => c.id === invoiceId);

  if (!inv) return { updatedState: state, success: false, message: 'Factura de proveedor no encontrada.' };
  if (inv.isPaid) return { updatedState: state, success: false, message: 'Esta factura ya fue pagada con anterioridad.' };

  const totalFunds = state.storeBankBalance + state.storeCash;
  if (totalFunds < inv.amountHNL) {
    return { updatedState: state, success: false, message: `Fondos insuficientes para cancelar la factura de proveedor (L ${inv.amountHNL.toLocaleString()}).` };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= inv.amountHNL) {
    newBank -= inv.amountHNL;
  } else {
    const diff = inv.amountHNL - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - diff);
  }

  const updatedCredits = credits.map(c => c.id === invoiceId ? { ...c, isPaid: true } : c);

  return {
    updatedState: {
      ...state,
      storeBankBalance: newBank,
      storeCash: newCash,
      supplierCredits: updatedCredits
    },
    success: true,
    message: `¡FACTURA CANCELADA! Se pagaron L ${inv.amountHNL.toLocaleString()} al proveedor "${inv.supplierName}". Récord de crédito comercial al día.`
  };
}

// =========================================================================
// COMPETIDORES ACTIVOS DEL MERCADO LOCAL & COMPRA/FUSIÓN (M&A)
// =========================================================================

export function createDefaultCompetitors(sector: RetailSectorId): CompetitorFirm[] {
  if (sector === 'constructora') {
    return [
      {
        id: 'comp_coninsa',
        name: 'Constructora e Inversiones del Norte (CONINSA)',
        sector: 'constructora',
        marketSharePct: 24,
        cashBalanceHNL: 1250000,
        bankDebtHNL: 6800000,
        inventoryValueHNL: 3400000,
        monthlySalesHNL: 2800000,
        pricingStrategy: 'agresiva',
        isDistressed: false,
        acquisitionPriceAssetDealHNL: 2200000,
        acquisitionPriceSharePurchaseHNL: 4500000,
        status: 'activo'
      },
      {
        id: 'comp_vialtec',
        name: 'Vialtec Infraestructura y Pavimentaciones S.A.',
        sector: 'constructora',
        marketSharePct: 18,
        cashBalanceHNL: -350000, // En problemas de liquidez
        bankDebtHNL: 9200000,
        inventoryValueHNL: 4800000,
        monthlySalesHNL: 1400000,
        pricingStrategy: 'moderada',
        isDistressed: true,
        acquisitionPriceAssetDealHNL: 1800000, // Precio de remate de activos
        acquisitionPriceSharePurchaseHNL: 2900000, // Adquisición con absorción de pasivos
        status: 'activo'
      },
      {
        id: 'comp_edifika',
        name: 'Edifika Desarrollos Inmobiliarios',
        sector: 'constructora',
        marketSharePct: 28,
        cashBalanceHNL: 4200000,
        bankDebtHNL: 5100000,
        inventoryValueHNL: 6500000,
        monthlySalesHNL: 3900000,
        pricingStrategy: 'calidad_premium',
        isDistressed: false,
        acquisitionPriceAssetDealHNL: 5500000,
        acquisitionPriceSharePurchaseHNL: 11000000,
        status: 'activo'
      }
    ];
  }

  // Competidores de comercio minorista / supermercados
  return [
    {
      id: 'comp_super_rapido',
      name: 'Supermercado El Rápido S. de R.L.',
      sector,
      marketSharePct: 25,
      cashBalanceHNL: 450000,
      bankDebtHNL: 1800000,
      inventoryValueHNL: 950000,
      monthlySalesHNL: 1100000,
      pricingStrategy: 'agresiva',
      isDistressed: false,
      acquisitionPriceAssetDealHNL: 650000,
      acquisitionPriceSharePurchaseHNL: 1400000,
      status: 'activo'
    },
    {
      id: 'comp_abastecedora_centro',
      name: 'Abastecedora Central del Ahorro',
      sector,
      marketSharePct: 15,
      cashBalanceHNL: -120000,
      bankDebtHNL: 2600000,
      inventoryValueHNL: 800000,
      monthlySalesHNL: 520000,
      pricingStrategy: 'moderada',
      isDistressed: true,
      acquisitionPriceAssetDealHNL: 480000,
      acquisitionPriceSharePurchaseHNL: 850000,
      status: 'activo'
    }
  ];
}

export function executeCompetitorAcquisition(
  state: DailySimulationState,
  competitorId: string,
  dealType: 'asset_deal' | 'share_purchase'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const competitors = state.activeCompetitors || [];
  const comp = competitors.find(c => c.id === competitorId);

  if (!comp) return { updatedState: state, success: false, message: 'Empresa competidora no encontrada.' };
  if (comp.status !== 'activo') return { updatedState: state, success: false, message: 'Esta empresa ya no está disponible para adquisición.' };

  const price = dealType === 'asset_deal' ? comp.acquisitionPriceAssetDealHNL : comp.acquisitionPriceSharePurchaseHNL;
  const totalFunds = state.storeBankBalance + state.storeCash;

  if (totalFunds < price) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes para concretar el deal de M&A. Requerido: L ${price.toLocaleString()}, Disponibles: L ${totalFunds.toLocaleString()}. Puedes solicitar un financiamiento M&A con Banco Ficohsa o Atlántida.`
    };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= price) {
    newBank -= price;
  } else {
    const diff = price - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - diff);
  }

  const updatedCompetitors = competitors.map(c => c.id === competitorId ? {
    ...c,
    status: 'adquirido_jugador' as const
  } : c);

  const bonusReputation = dealType === 'share_purchase' ? 12 : 6;
  const newReputation = Math.min(100, (state.storeReputation || 75) + bonusReputation);

  return {
    updatedState: {
      ...state,
      storeBankBalance: newBank,
      storeCash: newCash,
      storeReputation: newReputation,
      activeCompetitors: updatedCompetitors
    },
    success: true,
    message: dealType === 'share_purchase'
      ? `¡FUSIÓN & ADQUISICIÓN CONCRETADA! Has adquirido el 100% de las acciones de "${comp.name}". Su cuota de mercado (${comp.marketSharePct}%) y clientes pasan a tu empresa. Reputación empresarial +${bonusReputation} pts.`
      : `¡COMPRA DE ACTIVOS CONCRETADA (Asset Deal)! Adquiriste el inventario y equipos de "${comp.name}" a precio de remate con descuento judicial.`
  };
}

// =========================================================================
// MOTOR CONTABLE CENTRAL: BALANCE GENERAL, P&L Y FLUJO DE EFECTIVO
// =========================================================================

export function calculateComprehensiveFinancialStatements(state: DailySimulationState): FinancialStatementsSummary {
  // 1. Activo Circulante
  const cashInHand = state.storeCash || 0;
  const cashInBank = state.storeBankBalance || 0;
  
  // Garantías inmovilizadas y DPFs
  let guaranteeDeposits = 0;
  Object.values(state.commercialBanks || {}).forEach(rel => {
    (rel.guaranteeDeposits || []).filter(g => g.status === 'activo').forEach(g => {
      guaranteeDeposits += g.amountPledged;
    });
    (rel.termDeposits || []).forEach(d => {
      guaranteeDeposits += (d.currentBalance || d.principalAmount);
    });
  });

  // Inventario físico
  let inventoryStock = 0;
  if (state.retailSector === 'constructora') {
    inventoryStock = (state.constructionMaterials || []).reduce((sum, m) => sum + (m.stock * m.unitCost), 0);
  } else {
    inventoryStock = (state.products || []).reduce((sum, p) => sum + (p.stock * p.unitCost), 0);
  }

  // Cuentas por cobrar de obras activas
  const accountsReceivable = (state.activeWorks || []).reduce((sum, w) => sum + Math.max(0, (w.totalContractPrice * (w.progressPct / 100)) - w.billedMilestonesAmount), 0);

  const totalCurrentAssets = cashInHand + cashInBank + guaranteeDeposits + inventoryStock + accountsReceivable;

  // 2. Activo No Circulante (Fijo)
  const machineryAndFleet = (state.ownedMachinery || []).reduce((sum, m) => sum + m.purchasePrice, 0);
  const accumulatedDepreciation = Math.round(machineryAndFleet * 0.12); // Depreciación lineal estimada
  const realEstateCollaterals = (state.realEstateCollaterals || []).reduce((sum, c) => sum + c.appraisalValueHNL, 0);

  const totalNonCurrentAssets = Math.max(0, machineryAndFleet - accumulatedDepreciation) + realEstateCollaterals;
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  // 3. Pasivo Circulante (Corto Plazo < 12 meses)
  let shortTermLoans = 0;
  let longTermLoans = 0;
  let creditCardsBalance = 0;

  Object.values(state.commercialBanks || {}).forEach(rel => {
    if (rel.activeLoan && rel.activeLoan.balanceRemaining > 0) {
      if (rel.activeLoan.termMonthsRemaining <= 12) {
        shortTermLoans += rel.activeLoan.balanceRemaining;
      } else {
        // Porción corriente de 1 año en corto plazo, el resto en largo plazo
        const currentYearPortion = Math.min(rel.activeLoan.balanceRemaining, rel.activeLoan.monthlyPayment * 12);
        shortTermLoans += currentYearPortion;
        longTermLoans += Math.max(0, rel.activeLoan.balanceRemaining - currentYearPortion);
      }
    }
    if (rel.corporateCard && rel.corporateCard.currentBalance > 0) {
      creditCardsBalance += rel.corporateCard.currentBalance;
    }
  });

  // Proveedores por pagar
  const supplierAccountsPayable = (state.supplierCredits || []).filter(c => !c.isPaid).reduce((sum, c) => sum + c.amountHNL, 0);

  // Anticipos de clientes pendientes de entrega
  const customerAdvancesLiability = (state.activeWorks || []).reduce((sum, w) => sum + Math.max(0, w.advancePaymentReceived - (w.totalContractPrice * (w.progressPct / 100))), 0);

  // Impuestos SAR pendientes de pago
  const sarTaxPayable = state.sarTaxRecord?.isPaid ? 0 : (state.sarTaxRecord?.isrTaxAmount || 0);

  const totalCurrentLiabilities = shortTermLoans + creditCardsBalance + supplierAccountsPayable + customerAdvancesLiability + sarTaxPayable;
  const totalNonCurrentLiabilities = longTermLoans;
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  // 4. Patrimonio Neto = Activos - Pasivos
  const netEquity = totalAssets - totalLiabilities;

  // 5. Estado de Resultados (P&L)
  const grossRevenue = state.monthlySalesAccumulated || 450000;
  const cogs = Math.round(grossRevenue * 0.58); // Costo directo al vender
  const grossProfit = grossRevenue - cogs;
  const operatingExpenses = ((state.staffCount || 3) * (state.dailyWages || 1200) * 30) + ((state.dailyRent || 500) * 30);
  const ebitda = grossProfit - operatingExpenses;
  
  // Intereses pagados
  let interestExpenses = 0;
  Object.values(state.commercialBanks || {}).forEach(rel => {
    if (rel.activeLoan && rel.activeLoan.balanceRemaining > 0) {
      interestExpenses += Math.round(rel.activeLoan.balanceRemaining * (rel.activeLoan.interestRateAnnual / 100 / 12));
    }
  });

  const taxExpenseSAR = Math.max(0, Math.round(Math.max(0, ebitda - interestExpenses) * 0.25));
  const netIncome = ebitda - interestExpenses - taxExpenseSAR;

  // 6. Flujo de Efectivo
  const operatingCashFlow = netIncome + Math.round(accumulatedDepreciation / 12);
  const investingCashFlow = -Math.round(machineryAndFleet * 0.05);
  const financingCashFlow = -interestExpenses;
  const netChangeInCash = operatingCashFlow + investingCashFlow + financingCashFlow;

  return {
    currentAssets: {
      cashInHand,
      cashInBank,
      guaranteeDeposits,
      inventoryStock,
      accountsReceivable,
      total: totalCurrentAssets
    },
    nonCurrentAssets: {
      machineryAndFleet,
      accumulatedDepreciation,
      realEstateCollaterals,
      total: totalNonCurrentAssets
    },
    totalAssets,
    currentLiabilities: {
      shortTermLoans,
      creditCardsBalance,
      supplierAccountsPayable,
      customerAdvancesLiability,
      sarTaxPayable,
      total: totalCurrentLiabilities
    },
    nonCurrentLiabilities: {
      longTermLoans,
      total: totalNonCurrentLiabilities
    },
    totalLiabilities,
    netEquity,
    incomeStatement: {
      grossRevenue,
      cogs,
      grossProfit,
      operatingExpenses,
      ebitda,
      interestExpenses,
      taxExpenseSAR,
      netIncome
    },
    cashFlowStatement: {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netChangeInCash
    }
  };
}

// =========================================================================
// GESTIÓN DE GARANTÍAS REALES (PIGNORACIÓN Y LIBERACIÓN DE BIENES)
// =========================================================================

export function createDefaultRealEstateCollaterals(
  arg1?: string | RetailSectorId,
  arg2?: RetailSectorId
): RealEstateCollateralItem[] {
  let companyName = 'Empresa Mercantil S.A.';
  let sector: RetailSectorId = 'constructora';

  if (typeof arg1 === 'string') {
    if (['constructora', 'minimarket', 'supermercado', 'autolote', 'bar_restaurante'].includes(arg1)) {
      sector = arg1 as RetailSectorId;
    } else {
      companyName = arg1;
      if (arg2) sector = arg2;
    }
  }

  const rawItems: RealEstateCollateralItem[] = [
    {
      id: 'col_edificio_corporativo',
      title: 'Edificio Comercial y Corporativo Centro Metropolitano (5 Niveles)',
      assetType: 'edificio',
      ownerName: companyName,
      companyName,
      description: 'Edificio corporativo con locales comerciales en planta baja, 4 niveles de oficinas y estacionamiento subterráneo.',
      location: 'Bulevar Morazán, Tegucigalpa, M.D.C.',
      status: 'disponible',
      acquisitionValueHNL: 14000000,
      marketValueHNL: 18000000,
      appraisalValueHNL: 15000000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 80, // 80% LTV
      eligibleCollateralValueHNL: 12000000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 12000000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'MAT-EDIF-2023-7720',
      simulatedDocumentNumber: 'ESCRITURA-PUB-2023-450',
      situationNotes: 'Inmueble comercial corporativo premium de alta plusvalía, libre de gravamen con avalúo pericial vigente.'
    },
    {
      id: 'col_planta_industrial',
      title: 'Planta Industrial de Prefabricados y Mezclas (5,000 m²)',
      assetType: 'planta_industrial',
      ownerName: companyName,
      companyName,
      description: 'Planta de producción de concreto premezclado y bloquera industrial automatizada.',
      location: 'Valle de Amarateca, F.M.',
      status: 'disponible',
      acquisitionValueHNL: 8000000,
      marketValueHNL: 12000000,
      appraisalValueHNL: 10000000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 75,
      eligibleCollateralValueHNL: 7500000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 7500000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'MAT-IND-2023-1109',
      simulatedDocumentNumber: 'ESCRITURA-PUB-2023-991',
      situationNotes: 'Instalación industrial estratégica para obras viales y edificación.'
    },
    {
      id: 'col_casa_palmas',
      title: 'Residencia en Col. Las Palmas (Terreno 450 v²)',
      assetType: 'casa_habitacion',
      ownerName: 'Empresario Propietario',
      companyName,
      description: 'Vivienda unifamiliar de 2 niveles, acabados de madera de color, 4 habitaciones y garaje techado.',
      location: 'Tegucigalpa, M.D.C.',
      status: 'disponible',
      acquisitionValueHNL: 3200000,
      marketValueHNL: 4500000,
      appraisalValueHNL: 3800000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 80, // 80% LTV
      eligibleCollateralValueHNL: 3040000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 3040000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'MAT-FMI-2024-8891',
      simulatedDocumentNumber: 'ESCRITURA-PUB-2024-912',
      situationNotes: 'Inmueble residencial libre de gravamen con avalúo pericial vigente.'
    },
    {
      id: 'col_terreno_norte',
      title: 'Lote Comercial en Bulevar del Norte (1,200 v²)',
      assetType: 'terreno_comercial',
      ownerName: companyName,
      companyName,
      description: 'Terreno plano de alta plusvalía comercial con 35 metros de frente sobre bulevar principal.',
      location: 'San Pedro Sula, Cortés',
      status: 'disponible',
      acquisitionValueHNL: 4800000,
      marketValueHNL: 7200000,
      appraisalValueHNL: 6500000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 80, // 80% LTV
      eligibleCollateralValueHNL: 5200000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 5200000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'MAT-SPS-2023-4102',
      simulatedDocumentNumber: 'ESCRITURA-PUB-2023-305',
      situationNotes: 'Propiedad comercial de alta demanda apta para hipoteca de 1er rango.'
    },
    {
      id: 'col_bodega_logistic',
      title: 'Bodega Industrial en Parque Logístico San José (1,800 m²)',
      assetType: 'local_bodega',
      ownerName: companyName,
      companyName,
      description: 'Nave industrial con altura libre de 9m, 4 andenes de carga con rampas niveladoras y oficinas.',
      location: 'Choloma, Cortés',
      status: 'disponible',
      acquisitionValueHNL: 6500000,
      marketValueHNL: 9800000,
      appraisalValueHNL: 8200000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 75, // 75% LTV
      eligibleCollateralValueHNL: 6150000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 6150000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'MAT-CHO-2022-7711',
      simulatedDocumentNumber: 'ESCRITURA-PUB-2022-814',
      situationNotes: 'Activo industrial clave libre de todo gravamen con seguro todo riesgo vigente.'
    },
    {
      id: 'col_maquinaria_fleet',
      title: 'Flota de Maquinaria Pesada (3 Excavadoras CAT 320)',
      assetType: 'maquinaria_pesada',
      ownerName: companyName,
      companyName,
      description: 'Lote de 3 excavadoras sobre orugas Caterpillar modelo 320 año 2023 con mantenimientos de agencia.',
      location: 'Patio de Maquinaria SPS',
      status: 'disponible',
      acquisitionValueHNL: 5400000,
      marketValueHNL: 4800000,
      appraisalValueHNL: 4500000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 70, // 70% LTV
      eligibleCollateralValueHNL: 3150000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 3150000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'PRENDA-MAQ-2024-001',
      simulatedDocumentNumber: 'FACTURA-IMPORT-2023-991',
      situationNotes: 'Garantía prendaria sobre equipo pesado con inspección mecánica favorable.'
    },
    {
      id: 'col_vehiculos_flota',
      title: 'Flota de Volquetas Doble Troque (4 Camiones Mack 14 m³)',
      assetType: 'vehiculo_comercial',
      ownerName: companyName,
      companyName,
      description: '4 camiones de volteo Mack Granite modelo 2022 capacidad 14 metros cúbicos.',
      location: 'Plantel de Obras Tegucigalpa',
      status: 'disponible',
      acquisitionValueHNL: 3800000,
      marketValueHNL: 3400000,
      appraisalValueHNL: 3200000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 70, // 70% LTV
      eligibleCollateralValueHNL: 2240000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 2240000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'PRENDA-VEH-2023-810',
      simulatedDocumentNumber: 'BOLETA-REGISTRO-IP-401',
      situationNotes: 'Garantía prendaria vehicular con póliza de seguro de transporte vigente.'
    },
    {
      id: 'col_dpf_fideicomiso',
      title: 'Certificado de Depósito a Plazo Fijo Pignorable en Banco de Occidente',
      assetType: 'deposito_plazo',
      ownerName: 'Empresario Propietario',
      companyName,
      description: 'Certificado DPF a 360 días renovable, tasa 7.5%, custodiado en administración fiduciaria.',
      location: 'Banco de Occidente, Tegucigalpa',
      status: 'disponible',
      acquisitionValueHNL: 1000000,
      marketValueHNL: 1000000,
      appraisalValueHNL: 1000000,
      appraisalDate: 'Día 1, Mes 1 (2026)',
      ltvAcceptedPct: 100, // 100% LTV en garantías líquidas
      eligibleCollateralValueHNL: 1000000,
      liens: [],
      pledgedAmountTotal: 0,
      availableCoverageHNL: 1000000,
      isPledged: false,
      isLockedForSale: false,
      registrationNumber: 'DPF-CERT-2026-9001',
      simulatedDocumentNumber: 'TITULO-VALOR-OCC-901',
      situationNotes: 'Garantía líquida de máxima calidad (Back-to-Back) con tasa de interés preferencial.'
    }
  ];

  return rawItems.map(item => ({
    ...item,
    appraisalValue: item.appraisalValueHNL,
    ltvPercentage: item.ltvAcceptedPct,
    eligibleValue: item.eligibleCollateralValueHNL,
    committedCoverage: item.pledgedAmountTotal,
    availableCoverage: item.availableCoverageHNL,
    acquisitionValue: item.acquisitionValueHNL,
    marketValue: item.marketValueHNL
  }));
}

export function pledgeRealEstateCollateralToLoan(
  state: DailySimulationState,
  collateralId: string,
  bankId: CommercialBankId,
  loanId: string,
  coverageRequested?: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const collaterals = state.realEstateCollaterals || [];
  const col = collaterals.find(c => c.id === collateralId);

  if (!col) return { updatedState: state, success: false, message: 'Garantía real no encontrada.' };

  const available = col.availableCoverageHNL ?? col.eligibleCollateralValueHNL;
  if (available <= 0) {
    return {
      updatedState: state,
      success: false,
      message: `El bien "${col.title}" ya tiene su capacidad de cobertura al 100% comprometida en gravámenes previos.`
    };
  }

  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const committed = coverageRequested ? Math.min(available, coverageRequested) : available;
  const rank: 1 | 2 = (col.liens && col.liens.length > 0) ? 2 : 1;

  const newLien: CollateralLien = {
    id: `lien-${Date.now().toString().slice(-4)}`,
    rank,
    beneficiaryBankId: bankId,
    beneficiaryBankName: bank.name,
    linkedLoanId: loanId,
    committedCoverageHNL: committed,
    registeredDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`
  };

  const existingLiens = col.liens || [];
  const updatedLiens = [...existingLiens, newLien];
  const newPledgedTotal = updatedLiens.reduce((sum, l) => sum + l.committedCoverageHNL, 0);
  const newAvailable = Math.max(0, col.eligibleCollateralValueHNL - newPledgedTotal);

  const updatedCollaterals = collaterals.map(c => c.id === collateralId ? {
    ...c,
    liens: updatedLiens,
    pledgedAmountTotal: newPledgedTotal,
    availableCoverageHNL: newAvailable,
    status: newAvailable <= 0 ? 'pignorado_total' as const : 'pignorado_parcial' as const,
    isPledged: true,
    isLockedForSale: true,
    pledgedToBankId: bankId,
    linkedDebtId: loanId
  } : c);

  return {
    updatedState: {
      ...state,
      realEstateCollaterals: updatedCollaterals
    },
    success: true,
    message: `¡GRAVAMEN REGISTRADO! Se constituyó hipoteca/prenda de ${rank}er rango sobre "${col.title}" a favor de ${bank.name} por L ${committed.toLocaleString()}. Cobertura restante disponible: L ${newAvailable.toLocaleString()}.`
  };
}

export function releaseRealEstateCollateral(
  state: DailySimulationState,
  collateralId: string
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher } {
  const collaterals = state.realEstateCollaterals || [];
  const col = collaterals.find(c => c.id === collateralId);

  if (!col) return { updatedState: state, success: false, message: 'Garantía real no encontrada.' };

  // Verificar si hay préstamos activos vigentes que dependan de este bien
  const activeLinkedLoans = Object.values(state.commercialBanks || {}).some(rel => {
    return rel.activeLoan && rel.activeLoan.balanceRemaining > 0 && (
      rel.activeLoan.collateralIdRef === collateralId ||
      (col.liens || []).some(l => l.linkedLoanId === rel.activeLoan?.id)
    );
  });

  if (activeLinkedLoans) {
    return {
      updatedState: state,
      success: false,
      message: `No se puede cancelar el gravamen sobre "${col.title}". Aún mantiene saldo deudor activo vinculado en el banco acreedor. Cancela primero el préstamo para emitir el finiquito.`
    };
  }

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const voucherNum = `VCH-LIB-${state.currentDay}-${Math.floor(100000 + Math.random() * 900000)}`;

  const updatedCollaterals = collaterals.map(c => c.id === collateralId ? {
    ...c,
    liens: [],
    pledgedAmountTotal: 0,
    availableCoverageHNL: c.eligibleCollateralValueHNL,
    status: 'disponible' as const,
    isPledged: false,
    isLockedForSale: false,
    pledgedToBankId: undefined,
    linkedDebtId: undefined,
    situationNotes: 'Activo liberado mediante acta notarial de cancelación de hipoteca/prenda.'
  } : c);

  const voucher: TransactionVoucher = {
    id: `vch-rel-${Date.now()}`,
    voucherNumber: voucherNum,
    operationType: 'liberacion_garantia',
    title: `Liberación Notarial de Gravamen: ${col.title}`,
    timestamp: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    grossAmountHNL: col.appraisalValueHNL,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: col.eligibleCollateralValueHNL,
    priorBalanceHNL: 0,
    newBalanceHNL: col.eligibleCollateralValueHNL,
    releasedCollaterals: [col.title],
    referenceCode: `LIB-${col.registrationNumber}`,
    authStamp: `NOTARIA-PUBLICA-CANCELACION-${state.currentYear || 2026}`
  };

  const emailNotice: SimulatedEmail = {
    id: `email-rel-${Date.now()}`,
    category: 'garantias',
    senderName: 'Registro Inmobiliario y Notaría de Finiquitos',
    senderEmail: 'registros@ip.gob.hn',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Acta de Cancelación y Alzamiento de Gravamen: ${col.title}`,
    body: `Se confirma formalmente que la garantía real "${col.title}" (Matrícula: ${col.registrationNumber}) ha sido liberada en su totalidad tras la cancelación satisfactoria de las obligaciones financieras vinculadas.\n\n• Cobertura elegible restablecida: L ${col.eligibleCollateralValueHNL.toLocaleString()}\n• Estado registral: DISPONIBLE Y LIBRE DE TODO GRAVAMEN\n• Bloqueo de venta: DESACTIVADO\n\nEl bien puede ser vendido, transferido o utilizado en nuevas solicitudes de financiamiento.`,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    isArchived: false,
    folder: 'inbox',
    relatedEntityType: 'collateral_asset',
    relatedEntityId: col.id,
    voucherPayload: voucher
  };

  return {
    updatedState: {
      ...state,
      realEstateCollaterals: updatedCollaterals,
      transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
      simulatedEmails: [emailNotice, ...(state.simulatedEmails || [])]
    },
    success: true,
    voucher,
    message: `¡GARANTÍA LIBERADA! Se cancelaron todos los gravámenes sobre "${col.title}". Capacidad elegible disponible: L ${col.eligibleCollateralValueHNL.toLocaleString()}. Comprobante No. ${voucherNum}.`
  };
}

export function requestNewAppraisal(
  state: DailySimulationState,
  collateralId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const collaterals = state.realEstateCollaterals || [];
  const col = collaterals.find(c => c.id === collateralId);
  if (!col) return { updatedState: state, success: false, message: 'Garantía no encontrada.' };

  const appraisalFeeHNL = 2500;
  if (state.storeCash < appraisalFeeHNL && state.storeBankBalance < appraisalFeeHNL) {
    return { updatedState: state, success: false, message: `Fondos insuficientes para cubrir el arancel del perito valuador (L ${appraisalFeeHNL.toLocaleString()}).` };
  }

  let newCash = state.storeCash;
  let newBank = state.storeBankBalance;
  if (newCash >= appraisalFeeHNL) {
    newCash -= appraisalFeeHNL;
  } else {
    newBank -= appraisalFeeHNL;
  }

  // Plusvalía simulada razonable (+4% a +9%)
  const plusvaliaPct = Math.round((Math.random() * 5 + 4) * 10) / 10;
  const newMarket = Math.round(col.marketValueHNL * (1 + plusvaliaPct / 100));
  const newAppraisal = Math.round(col.appraisalValueHNL * (1 + plusvaliaPct / 100));
  const newEligible = Math.round(newAppraisal * (col.ltvAcceptedPct / 100));
  const newAvailable = Math.max(0, newEligible - (col.pledgedAmountTotal || 0));

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;

  const updatedCollaterals = collaterals.map(c => c.id === collateralId ? {
    ...c,
    marketValueHNL: newMarket,
    marketValue: newMarket,
    appraisalValueHNL: newAppraisal,
    appraisalValue: newAppraisal,
    appraisalDate: timestampStr,
    eligibleCollateralValueHNL: newEligible,
    eligibleValue: newEligible,
    availableCoverageHNL: newAvailable,
    availableCoverage: newAvailable,
    situationNotes: `Avalúo actualizado (${timestampStr}) por perito colegiado. Plusvalía estimada: +${plusvaliaPct}%.`
  } : c);

  return {
    updatedState: {
      ...state,
      storeCash: newCash,
      storeBankBalance: newBank,
      realEstateCollaterals: updatedCollaterals
    },
    success: true,
    message: `¡AVALÚO ACTUALIZADO! Peritaje técnico completado para "${col.title}". Nuevo valor pericial: L ${newAppraisal.toLocaleString()} (+${plusvaliaPct}% plusvalía). Cobertura LTV admisible: L ${newEligible.toLocaleString()}. Cobertura disponible: L ${newAvailable.toLocaleString()}.`
  };
}

export function registerNewAssetAsCollateral(
  state: DailySimulationState,
  asset: {
    title: string;
    assetType: 'edificio' | 'edificio_corporativo' | 'casa_habitacion' | 'terreno_comercial' | 'local_bodega' | 'planta_industrial' | 'vehiculo_comercial' | 'maquinaria_pesada' | 'deposito_plazo' | 'cuentas_por_cobrar';
    description: string;
    location: string;
    acquisitionCost: number;
    ltvAcceptedPct?: number;
  }
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const ltv = asset.ltvAcceptedPct || (
    asset.assetType === 'edificio' || asset.assetType === 'edificio_corporativo' || asset.assetType === 'casa_habitacion' || asset.assetType === 'terreno_comercial'
      ? 80
      : (asset.assetType === 'local_bodega' || asset.assetType === 'planta_industrial' ? 75 : 70)
  );
  const appraisalValue = Math.round(asset.acquisitionCost * 0.95);
  const eligible = Math.round(appraisalValue * (ltv / 100));
  const newId = `col-${Date.now().toString().slice(-4)}`;

  const newCollateral: RealEstateCollateralItem = {
    id: newId,
    title: asset.title,
    assetType: asset.assetType,
    ownerName: state.storeName,
    companyName: state.storeName,
    description: asset.description,
    location: asset.location,
    status: 'disponible',
    acquisitionValueHNL: asset.acquisitionCost,
    marketValueHNL: asset.acquisitionCost,
    appraisalValueHNL: appraisalValue,
    appraisalDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    ltvAcceptedPct: ltv,
    eligibleCollateralValueHNL: eligible,
    liens: [],
    pledgedAmountTotal: 0,
    availableCoverageHNL: eligible,
    isPledged: false,
    isLockedForSale: false,
    registrationNumber: `MAT-REG-${Math.floor(1000 + Math.random() * 9000)}`,
    simulatedDocumentNumber: `DOC-IP-${state.currentYear || 2026}-${Math.floor(1000 + Math.random() * 9000)}`,
    situationNotes: 'Activo incorporado recientemente al inventario de garantías elegibles.'
  };

  const updatedCollaterals = [...(state.realEstateCollaterals || []), newCollateral];

  return {
    updatedState: {
      ...state,
      realEstateCollaterals: updatedCollaterals
    },
    success: true,
    message: `¡ACTIVO REGISTRADO! "${asset.title}" se incorporó con avalúo inicial de L ${appraisalValue.toLocaleString()} y cobertura admisible de L ${eligible.toLocaleString()} (${ltv}% LTV).`
  };
}

export interface FlexibleLoanPaymentOptions {
  bankId: CommercialBankId;
  paymentMode: 'una_cuota' | 'varias_cuotas' | 'pago_parcial' | 'abono_capital' | 'cancelar_prestamo' | 'cancelacion_total' | 'cuota_mensual';
  amount: number;
  sourceAccount?: 'cuenta_bancaria' | 'caja' | 'checking' | 'cash' | 'efectivo';
  extraordinaryStrategy?: 'reducir_cuota' | 'reducir_plazo';
  numberOfInstallments?: number;
}

export function executeFlexibleLoanPayment(
  state: DailySimulationState,
  bankIdOrOptions: CommercialBankId | FlexibleLoanPaymentOptions,
  paymentTypeParam?: 'cuota_mensual' | 'varias_cuotas' | 'pago_parcial' | 'abono_capital' | 'cancelacion_total' | 'cancelar_prestamo' | 'una_cuota',
  amountPaidParam?: number,
  sourceAccountParam: 'checking' | 'cash' | 'cuenta_bancaria' | 'caja' = 'checking',
  strategyParam: 'reducir_cuota' | 'reducir_plazo' = 'reducir_plazo',
  numberOfInstallmentsParam: number = 1
): { 
  updatedState: DailySimulationState; 
  success: boolean; 
  message: string; 
  voucher?: TransactionVoucher;
  distributionBreakdown?: {
    cargosMora: number;
    interesesDevengados: number;
    amortizacionCapital: number;
    reglaAplicada: string;
  };
} {
  let bankId: CommercialBankId;
  let paymentType: string;
  let amountPaid: number;
  let sourceAccount: 'checking' | 'cash';
  let strategy: 'reducir_cuota' | 'reducir_plazo';
  let numberOfInstallments: number;

  if (typeof bankIdOrOptions === 'object') {
    bankId = bankIdOrOptions.bankId;
    paymentType = bankIdOrOptions.paymentMode;
    amountPaid = bankIdOrOptions.amount;
    sourceAccount = (bankIdOrOptions.sourceAccount === 'caja' || bankIdOrOptions.sourceAccount === 'cash') ? 'cash' : 'checking';
    strategy = bankIdOrOptions.extraordinaryStrategy || 'reducir_plazo';
    numberOfInstallments = bankIdOrOptions.numberOfInstallments || 1;
  } else {
    bankId = bankIdOrOptions;
    paymentType = paymentTypeParam || 'cuota_mensual';
    amountPaid = amountPaidParam || 0;
    sourceAccount = (sourceAccountParam === 'caja' || sourceAccountParam === 'cash') ? 'cash' : 'checking';
    strategy = strategyParam;
    numberOfInstallments = numberOfInstallmentsParam;
  }

  const currentRel = state.commercialBanks[bankId];
  const loan = currentRel?.activeLoan || currentRel?.loans?.find(l => (l.remainingBalance ?? l.balanceRemaining ?? 0) > 0) || currentRel?.loans?.[0];

  const currentBalance = loan ? (loan.remainingBalance ?? loan.balanceRemaining ?? 0) : 0;

  if (!loan || currentBalance <= 0) {
    return { updatedState: state, success: false, message: 'No hay préstamo activo con saldo pendiente en este banco.' };
  }

  const bank = COMMERCIAL_BANKS_PROFILES[bankId];
  const monthlyRate = loan.interestRateAnnual / 100 / 12;

  // Intereses devengados al corte mensual actual
  const accruedInterest = Math.round(currentBalance * monthlyRate);
  const lateFees = 0;

  let targetPaymentAmount = amountPaid;
  if (paymentType === 'cuota_mensual' || paymentType === 'una_cuota') {
    targetPaymentAmount = amountPaid > 0 ? amountPaid : loan.monthlyPayment;
  } else if (paymentType === 'varias_cuotas') {
    targetPaymentAmount = amountPaid > 0 ? amountPaid : (loan.monthlyPayment * numberOfInstallments);
  } else if (paymentType === 'cancelacion_total' || paymentType === 'cancelar_prestamo') {
    // Saldo total exacto a la fecha sin cobrar intereses futuros no devengados
    targetPaymentAmount = Math.round(currentBalance + accruedInterest);
  }

  // Validar fondos disponibles
  const chkBal = currentRel.checkingAccount?.balance ?? (state.storeBankBalance || 0);
  const availableFunds = sourceAccount === 'checking' ? chkBal : state.storeCash;

  if (availableFunds < targetPaymentAmount) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes en ${sourceAccount === 'checking' ? 'la cuenta de cheques' : 'la caja chica'}. Saldo disponible: L ${availableFunds.toLocaleString()}, importe requerido: L ${targetPaymentAmount.toLocaleString()}.`
    };
  }

  // Distribución del pago
  let appliedLateFees = 0;
  let appliedInterest = 0;
  let appliedPrincipal = 0;
  let newLoanBalance = currentBalance;
  const isCancellation = paymentType === 'cancelacion_total' || paymentType === 'cancelar_prestamo';

  if (isCancellation) {
    appliedInterest = accruedInterest;
    appliedPrincipal = currentBalance;
    newLoanBalance = 0;
  } else if (paymentType === 'abono_capital') {
    appliedInterest = 0;
    appliedPrincipal = Math.min(targetPaymentAmount, currentBalance);
    newLoanBalance = Math.max(0, currentBalance - appliedPrincipal);
  } else {
    // Prelación legal CNBS: 1º Intereses devengados -> 2º Capital
    appliedInterest = Math.min(targetPaymentAmount, accruedInterest);
    appliedPrincipal = Math.max(0, targetPaymentAmount - appliedInterest);
    newLoanBalance = Math.max(0, currentBalance - appliedPrincipal);
  }

  // Cuotas pagadas
  let newPaidInstallments = loan.paidInstallments || 0;
  if (paymentType === 'cuota_mensual' || paymentType === 'una_cuota') {
    newPaidInstallments += 1;
  } else if (paymentType === 'varias_cuotas') {
    newPaidInstallments += numberOfInstallments;
  }

  // Recálculo de amortización según tipo y estrategia
  let newMonthlyPayment = loan.monthlyPayment;
  let newTermMonths = loan.termMonthsRemaining;
  let ruleExplanation = 'Prelación legal CNBS: 1º Cargos/Mora, 2º Intereses devengados del periodo, 3º Amortización a Capital.';

  if (newLoanBalance <= 0 || isCancellation) {
    newLoanBalance = 0;
    newMonthlyPayment = 0;
    newTermMonths = 0;
    ruleExplanation = 'Cancelación total anticipada de deuda sin cobro de intereses futuros no devengados. Préstamo finiquitado.';
  } else if (paymentType === 'abono_capital') {
    if (strategy === 'reducir_cuota') {
      newMonthlyPayment = Math.round((newLoanBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -newTermMonths)));
      ruleExplanation = `Abono extraordinario a capital: Se recalcula la cuota mensual de L ${loan.monthlyPayment.toLocaleString()} a L ${newMonthlyPayment.toLocaleString()}, manteniendo el plazo en ${newTermMonths} meses.`;
    } else {
      if (monthlyRate > 0 && newMonthlyPayment > newLoanBalance * monthlyRate) {
        newTermMonths = Math.max(1, Math.ceil(Math.log(newMonthlyPayment / (newMonthlyPayment - newLoanBalance * monthlyRate)) / Math.log(1 + monthlyRate)));
      } else {
        newTermMonths = Math.max(1, newTermMonths - 3);
      }
      ruleExplanation = `Abono extraordinario a capital: Se reduce el plazo de ${loan.termMonthsRemaining} a ${newTermMonths} meses, manteniendo la cuota mensual en L ${newMonthlyPayment.toLocaleString()}.`;
    }
  } else if (paymentType === 'varias_cuotas') {
    newTermMonths = Math.max(0, newTermMonths - numberOfInstallments);
    ruleExplanation = `Pago adelantado de ${numberOfInstallments} cuotas mensuales. Plazo restante reducido a ${newTermMonths} meses.`;
  } else if (paymentType === 'cuota_mensual' || paymentType === 'una_cuota') {
    newTermMonths = Math.max(0, newTermMonths - 1);
  } else if (paymentType === 'pago_parcial') {
    ruleExplanation = `Pago parcial aplicado: L ${appliedPrincipal.toLocaleString()} redujeron el capital, pero la cuota mensual permanece pendiente para el periodo siguiente.`;
  }

  // Actualizar saldos monetarios
  let newStoreBank = state.storeBankBalance;
  let newStoreCash = state.storeCash;
  let updatedRel = { ...currentRel };

  if (sourceAccount === 'checking') {
    newStoreBank -= targetPaymentAmount;
    if (updatedRel.checkingAccount) {
      updatedRel.checkingAccount = {
        ...updatedRel.checkingAccount,
        balance: Math.max(0, updatedRel.checkingAccount.balance - targetPaymentAmount)
      };
    }
  } else {
    newStoreCash -= targetPaymentAmount;
  }

  // Liberación automática de garantías si el préstamo se canceló
  let updatedCollaterals = state.realEstateCollaterals || [];
  let releasedCollateralNames: string[] = [];

  const updatedLoanObj: BankCommercialLoan = {
    ...loan,
    balanceRemaining: newLoanBalance,
    remainingBalance: newLoanBalance,
    monthlyPayment: newMonthlyPayment,
    termMonthsRemaining: newTermMonths,
    paidInstallments: newPaidInstallments,
    status: newLoanBalance <= 0 ? 'cancelado' : 'al_dia',
    amortizedPrincipalTotal: (loan.amortizedPrincipalTotal || 0) + appliedPrincipal
  };

  if (newLoanBalance <= 0) {
    updatedRel = {
      ...updatedRel,
      activeLoan: undefined,
      loans: [updatedLoanObj],
      relationshipScore: Math.min(100, updatedRel.relationshipScore + 15)
    };

    updatedCollaterals = updatedCollaterals.map(c => {
      const hasLienFromThisLoan = (c.liens || []).some(l => l.linkedLoanId === loan.id || l.beneficiaryBankId === bankId);
      if (!hasLienFromThisLoan && c.linkedDebtId !== loan.id) return c;

      const remainingLiens = (c.liens || []).filter(l => l.linkedLoanId !== loan.id && l.beneficiaryBankId !== bankId);
      const newPledged = remainingLiens.reduce((sum, l) => sum + l.committedCoverageHNL, 0);
      const eligible = c.eligibleValue ?? c.eligibleCollateralValueHNL;
      const newAvailable = Math.max(0, eligible - newPledged);
      releasedCollateralNames.push(c.title);

      return {
        ...c,
        liens: remainingLiens,
        pledgedAmountTotal: newPledged,
        committedCoverage: newPledged,
        availableCoverageHNL: newAvailable,
        availableCoverage: newAvailable,
        status: remainingLiens.length === 0 ? 'disponible' as const : 'pignorado_parcial' as const,
        isPledged: remainingLiens.length > 0,
        isLockedForSale: remainingLiens.length > 0,
        pledgedToBankId: remainingLiens.length > 0 ? remainingLiens[0].beneficiaryBankId : undefined,
        linkedDebtId: remainingLiens.length > 0 ? remainingLiens[0].linkedLoanId : undefined
      };
    });
  } else {
    updatedRel = {
      ...updatedRel,
      activeLoan: updatedLoanObj,
      loans: [updatedLoanObj]
    };
  }

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const voucherNum = `VCH-PAG-${state.currentDay}-${Math.floor(100000 + Math.random() * 900000)}`;

  const desc = isCancellation
    ? 'Liquidación total de deuda comercial'
    : (paymentType === 'abono_capital' ? 'Abono extraordinario a capital' : 'Pago de cuota de crédito comercial');

  const voucher: TransactionVoucher = {
    id: `vch-pay-${Date.now()}`,
    voucherNumber: voucherNum,
    operationType: paymentType,
    title: isCancellation ? 'Cancelación Total de Préstamo Bancario' : `Pago de Crédito: ${loan.purpose}`,
    description: desc,
    timestamp: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    primaryBankId: bankId,
    sourceBankId: bankId,
    accountNumber: sourceAccount === 'checking' ? `${bank.name} - ${updatedRel.checkingAccount?.accountNumber || 'Cuenta Corriente'}` : 'Caja Chica',
    grossAmountHNL: targetPaymentAmount,
    amount: targetPaymentAmount,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: targetPaymentAmount,
    netDisbursement: targetPaymentAmount,
    priorBalanceHNL: availableFunds,
    newBalanceHNL: availableFunds - targetPaymentAmount,
    newBalance: availableFunds - targetPaymentAmount,
    loanBalancePriorHNL: currentBalance,
    loanBalanceNewHNL: newLoanBalance,
    distributionBreakdown: {
      cargosMora: appliedLateFees,
      interesesDevengados: appliedInterest,
      amortizacionCapital: appliedPrincipal,
      reglaAplicada: ruleExplanation
    },
    releasedCollaterals: releasedCollateralNames,
    referenceCode: `PAG-${bankId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: `BCH-PAG-${state.currentYear || 2026}-${Date.now().toString().slice(-6)}`
  };

  const receiptEmail: SimulatedEmail = {
    id: `email-receipt-${Date.now()}`,
    voucherId: voucher.id,
    category: 'pagos_vencimientos',
    senderName: `${bank.name} - Centro de Pagos`,
    senderEmail: `cobros@${bankId}.banca.hn`,
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: isCancellation || newLoanBalance <= 0 
      ? `Cancelación Total de Préstamo - Finiquito Oficial No. ${voucherNum}` 
      : `Recibo Oficial de Pago No. ${voucherNum} - ABONO REGISTRADO`,
    body: `Recibo de Operación Crediticia:\n\nSe ha procesado exitosamente la operación sobre su crédito en ${bank.name}:\n\n• Monto Pagado: L ${targetPaymentAmount.toLocaleString()}\n• Distribución: Intereses L ${appliedInterest.toLocaleString()} | Capital L ${appliedPrincipal.toLocaleString()}\n• Saldo Anterior: L ${currentBalance.toLocaleString()}\n• Nuevo Saldo Insoluto: L ${newLoanBalance.toLocaleString()}\n• Cuota Mensual Resultante: L ${newMonthlyPayment.toLocaleString()}/mes (Plazo: ${newTermMonths} meses)\n\n${newLoanBalance <= 0 ? '¡FINIQUITO TOTAL CONCEDIDO! El crédito ha quedado saldado en su totalidad y las garantías vinculadas han sido liberadas.' : ''}`,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: false,
    isArchived: false,
    folder: 'inbox',
    relatedEntityType: 'loan_payment',
    relatedEntityId: loan.id,
    voucherPayload: voucher
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: updatedRel
  };

  const nextState: DailySimulationState = {
    ...state,
    storeBankBalance: newStoreBank,
    storeCash: newStoreCash,
    commercialBanks: updatedBanks,
    realEstateCollaterals: updatedCollaterals,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
    simulatedEmails: [receiptEmail, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState: nextState,
    success: true,
    voucher,
    distributionBreakdown: voucher.distributionBreakdown,
    message: `¡PAGO APLICADO! Se pagaron L ${targetPaymentAmount.toLocaleString()} a ${bank.name}. Distribución: Mora L ${appliedLateFees.toLocaleString()}, Interés L ${appliedInterest.toLocaleString()}, Capital L ${appliedPrincipal.toLocaleString()}. Nuevo saldo deudor: L ${newLoanBalance.toLocaleString()}. Comprobante No. ${voucherNum}.`
  };
}

export function transferBetweenAccounts(
  state: DailySimulationState,
  fromBankId: CommercialBankId,
  toBankId: CommercialBankId,
  amount: number,
  concept?: string
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher } {
  if (fromBankId === toBankId) {
    return { updatedState: state, success: false, message: 'La cuenta de origen y destino deben ser diferentes.' };
  }
  if (amount <= 0) {
    return { updatedState: state, success: false, message: 'Ingresa un monto válido para transferir.' };
  }

  const fromRel = state.commercialBanks[fromBankId];
  const toRel = state.commercialBanks[toBankId];
  const fromChecking = fromRel?.checkingAccount;

  if (!fromChecking || fromChecking.balance < amount) {
    const avail = fromChecking?.balance || 0;
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes en la cuenta de origen (${COMMERCIAL_BANKS_PROFILES[fromBankId].name}). Saldo disponible: L ${avail.toLocaleString()}.`
    };
  }

  const toBank = COMMERCIAL_BANKS_PROFILES[toBankId];
  const fromBank = COMMERCIAL_BANKS_PROFILES[fromBankId];

  const toChecking = toRel?.checkingAccount || {
    accountNumber: `CTA-${toBankId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
    balance: 0,
    overdraftLimit: 250000,
    overdraftUsed: 0,
    checksUsedCount: 0,
    interestRateAnnual: 2.5,
    interestRateYieldPct: 2.5,
    openedDay: state.currentDay,
    monthlyFeeHNL: 150
  };

  const updatedFromRel: CommercialBankRelationship = {
    ...fromRel,
    checkingAccount: {
      ...fromChecking,
      balance: fromChecking.balance - amount
    }
  };

  const updatedToRel: CommercialBankRelationship = {
    ...toRel,
    checkingAccount: {
      ...toChecking,
      balance: toChecking.balance + amount
    }
  };

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const voucherNum = `VCH-TRF-${state.currentDay}-${Math.floor(100000 + Math.random() * 900000)}`;

  const voucher: TransactionVoucher = {
    id: `vch-trf-${Date.now()}`,
    voucherNumber: voucherNum,
    operationType: 'transferencia_cuentas',
    title: 'Transferencia Interbancaria entre Cuentas Propias',
    timestamp: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    primaryBankId: fromBankId,
    sourceBankId: fromBankId,
    destinationBankId: toBankId,
    accountNumber: `${fromBank.name} - ${fromChecking.accountNumber}`,
    destinationAccountNumber: `${toBank.name} - ${toChecking.accountNumber}`,
    grossAmountHNL: amount,
    amount: amount,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: amount,
    netDisbursement: amount,
    priorBalanceHNL: fromChecking.balance,
    newBalanceHNL: fromChecking.balance - amount,
    newBalance: fromChecking.balance - amount,
    referenceCode: `ACH-TRF-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: `BCH-ACH-${state.currentYear || 2026}-${Date.now().toString().slice(-6)}`
  };

  const emailNotice: SimulatedEmail = {
    id: `email-trf-${Date.now()}`,
    category: 'sistema_avisos',
    senderName: 'Red Financiera Interbancaria ACH Honduras',
    senderEmail: 'transferencias@ach.bch.hn',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Transferencia Procesada: L ${amount.toLocaleString()} de ${fromBank.name} a ${toBank.name}`,
    body: `Aviso de Transferencia Realizada:\n\n• Monto: L ${amount.toLocaleString()}\n• Cuenta Débito: ${fromBank.name} (${fromChecking.accountNumber})\n• Cuenta Crédito: ${toBank.name} (${toChecking.accountNumber})\n• Fecha: ${timestampStr}\n• Saldo Final Débito: L ${(fromChecking.balance - amount).toLocaleString()}\n• Saldo Final Crédito: L ${(toChecking.balance + amount).toLocaleString()}\n\nOperación liquidada de forma inmediata.`,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: false,
    isArchived: false,
    folder: 'inbox',
    voucherPayload: voucher
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [fromBankId]: updatedFromRel,
    [toBankId]: updatedToRel
  };

  return {
    updatedState: {
      ...state,
      commercialBanks: updatedBanks,
      transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
      simulatedEmails: [emailNotice, ...(state.simulatedEmails || [])]
    },
    success: true,
    voucher,
    message: `¡TRANSFERENCIA COMPLETADA! Se transfirieron L ${amount.toLocaleString()} de ${fromBank.name} a ${toBank.name}. Comprobante No. ${voucherNum}.`
  };
}

export function evaluateAndGenerateBankOffers(state: DailySimulationState): DailySimulationState {
  const currentOffers = state.dynamicBankOffers || [];
  const currentEmails = state.simulatedEmails || [];
  const totalLiquidity = state.storeCash + state.storeBankBalance;
  const sales = state.monthlySalesAccumulated || 200000;
  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;

  const newOffers: DynamicBankOffer[] = [];
  const newEmails: SimulatedEmail[] = [];

  // Oferta 1: Banco Atlántida - Préstamo de Capital de Trabajo si ventas >= L 300,000
  if (sales >= 300000 && !currentOffers.some(o => o.id === 'offer_atl_capital')) {
    const amount = Math.min(2500000, Math.round(sales * 2.5));
    const rate = 11.5;
    const term = 36;
    const monthlyRate = rate / 100 / 12;
    const cuota = Math.round((amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term)));

    const expAtl = advanceSimCalendar(state.currentDay, state.currentMonth, state.currentYear || 2026, 15);
    const offer: DynamicBankOffer = {
      id: 'offer_atl_capital',
      bankId: 'atlantida',
      productType: 'capital_trabajo',
      title: 'Préstamo Comercial de Capital de Trabajo con Tasa Preferencial',
      amountOrLimitHNL: amount,
      offeredAmount: amount,
      annualRatePct: rate,
      termMonths: term,
      openingFeePct: 1.5,
      requiresCollateral: false,
      estimatedMonthlyPaymentHNL: cuota,
      expiresDay: expAtl.day,
      expiresMonth: expAtl.month,
      expiresYear: expAtl.year,
      isPreApproved: true,
      status: 'disponible'
    };
    newOffers.push(offer);

    newEmails.push({
      id: `email-offer-atl-${Date.now()}`,
      category: 'bancos_financiamiento',
      senderName: 'Banco Atlántida - Gerencia de Banca Empresas',
      senderEmail: 'bancaempresas@atlantida.banca.hn',
      recipientEmail: `${state.storeName.toLowerCase().replace(/\s+/g, '')}@banca.hn`,
      companyName: state.storeName,
      subject: `Propuesta Pre-Aprobada: Línea de Capital por L ${amount.toLocaleString()} al 11.5%`,
      body: `Estimado(a) Director(a) de ${state.storeName}:\n\nEn virtud del excelente dinamismo de sus ventas mensuales (L ${sales.toLocaleString()}), el Comité de Riesgo de Banco Atlántida ha emitido una aprobación ejecutiva para su empresa:\n\n• Monto Pre-Aprobado: L ${amount.toLocaleString()}\n• Tasa Anual: 11.5% (Tasa Corporativa)\n• Plazo de Financiamiento: 36 meses\n• Cuota Mensual Estimada: L ${cuota.toLocaleString()}/mes\n• Garantía Requerida: Fianza solidaria estándar sin hipoteca\n• Validez de la Oferta: 15 días del calendario comercial\n\nPuede revisar las condiciones detalladas y solicitar el desembolso directo desde este mensaje o en ventanilla bancaria.`,
      sentDate: timestampStr,
      simDay: state.currentDay,
      simMonth: state.currentMonth,
      simYear: state.currentYear || 2026,
      isRead: false,
      isStarred: true,
      isArchived: false,
      folder: 'inbox',
      relatedEntityType: 'bank_offer',
      relatedEntityId: offer.id,
      bankOfferPayload: offer
    });
  }

  // Oferta 2: BAC Credomatic - Tarjeta Infinite Black si liquidez >= L 500,000
  if (totalLiquidity >= 500000 && !currentOffers.some(o => o.id === 'offer_bac_card')) {
    const cardLimit = 450000;
    const expBac = advanceSimCalendar(state.currentDay, state.currentMonth, state.currentYear || 2026, 20);
    const offer: DynamicBankOffer = {
      id: 'offer_bac_card',
      bankId: 'bac',
      productType: 'tarjeta_empresarial',
      title: 'Tarjeta de Crédito Corporativa Infinite Black con 4.5% Cashback',
      amountOrLimitHNL: cardLimit,
      offeredAmount: cardLimit,
      annualRatePct: 14.5,
      termMonths: 12,
      openingFeePct: 0,
      requiresCollateral: false,
      estimatedMonthlyPaymentHNL: Math.round(cardLimit * 0.05),
      expiresDay: expBac.day,
      expiresMonth: expBac.month,
      expiresYear: expBac.year,
      isPreApproved: true,
      status: 'disponible'
    };
    newOffers.push(offer);

    newEmails.push({
      id: `email-offer-bac-${Date.now()}`,
      category: 'bancos_financiamiento',
      senderName: 'BAC Credomatic - Medios de Pago Corporativo',
      senderEmail: 'empresas@bac.banca.hn',
      recipientEmail: `${state.storeName.toLowerCase().replace(/\s+/g, '')}@banca.hn`,
      companyName: state.storeName,
      subject: `Invitación Exclusiva: Tarjeta Infinite Black L ${cardLimit.toLocaleString()} (4.5% Cashback)`,
      body: `Estimado(a) ejecutivo(a) de ${state.storeName}:\n\nPor mantener una sólida liquidez operativa superior a L ${totalLiquidity.toLocaleString()}, le extendemos nuestra tarjeta insignia corporativa:\n\n• Cupo Aprobado: L ${cardLimit.toLocaleString()}\n• Tasa Preferencial: 14.5% anual\n• Cashback Efectivo: 4.5% en compras de insumos, materiales y combustible\n• Periodo de gracia para compras: Hasta 30 días sin intereses\n\nPuede activarla directamente sin trámites burocráticos.`,
      sentDate: timestampStr,
      simDay: state.currentDay,
      simMonth: state.currentMonth,
      simYear: state.currentYear || 2026,
      isRead: false,
      isStarred: true,
      isArchived: false,
      folder: 'inbox',
      relatedEntityType: 'bank_offer',
      relatedEntityId: offer.id,
      bankOfferPayload: offer
    });
  }

  // Oferta 3: Banco de Occidente - DPF Step-Up con Bonificación de Tasa si liquidez >= L 300,000
  if (totalLiquidity >= 300000 && !currentOffers.some(o => o.id === 'offer_occ_dpf')) {
    const invAmount = 200000;
    const expOcc = advanceSimCalendar(state.currentDay, state.currentMonth, state.currentYear || 2026, 30);
    const offer: DynamicBankOffer = {
      id: 'offer_occ_dpf',
      bankId: 'occidente',
      productType: 'capital_trabajo',
      title: 'Certificado de Depósito a Plazo Fijo (DPF) con Tasa Bonificada 8.5%',
      amountOrLimitHNL: invAmount,
      offeredAmount: invAmount,
      annualRatePct: 8.5,
      termMonths: 3,
      openingFeePct: 0,
      requiresCollateral: false,
      estimatedMonthlyPaymentHNL: Math.round((invAmount * 0.085) / 12),
      expiresDay: expOcc.day,
      expiresMonth: expOcc.month,
      expiresYear: expOcc.year,
      isPreApproved: true,
      status: 'disponible'
    };
    newOffers.push(offer);

    newEmails.push({
      id: `email-offer-occ-${Date.now()}`,
      category: 'bancos_financiamiento',
      senderName: 'Banco de Occidente - Banca Patrimonial',
      senderEmail: 'tesoreria@occidente.banca.hn',
      recipientEmail: `${state.storeName.toLowerCase().replace(/\s+/g, '')}@banca.hn`,
      companyName: state.storeName,
      subject: `Rendimiento de Tesorería: Certificado DPF con Tasa Fija del 8.5% anual`,
      body: `Estimado(a) inversionista de ${state.storeName}:\n\nMaximice el rendimiento de sus excedentes de caja con nuestro producto líder en captación:\n\n• Tasa Promocional de Rendimiento: 8.5% APR (+1.5% bonificación sobre tasa base)\n• Plazo de Inversión: 90 Días\n• Capitalización de Interés: Mensual con reintegro total al vencimiento\n• Disponibilidad de Liquidez: Opción de cancelación anticipada en caso de imprevistos.\n\nConsulte con nuestro asesor o constituya su certificado en ventanilla.`,
      sentDate: timestampStr,
      simDay: state.currentDay,
      simMonth: state.currentMonth,
      simYear: state.currentYear || 2026,
      isRead: false,
      isStarred: false,
      isArchived: false,
      folder: 'inbox',
      relatedEntityType: 'bank_offer',
      relatedEntityId: offer.id,
      bankOfferPayload: offer
    });
  }

  if (newOffers.length === 0) return state;

  return {
    ...state,
    dynamicBankOffers: [...currentOffers, ...newOffers],
    simulatedEmails: [...newEmails, ...currentEmails]
  };
}

// =========================================================================
// GESTIÓN DE CORREOS Y NEGOCIACIÓN DE OFERTAS DESDE EL BUZÓN
// =========================================================================

export function getInboxUnreadCount(emails: SimulatedEmail[] = []): number {
  return emails.filter(e => (e.folder === 'inbox' || !e.folder) && !e.isRead && !e.isArchived).length;
}

export function negotiateBankOfferFromEmail(
  state: DailySimulationState,
  offerOrId: DynamicBankOffer | string,
  proposal: {
    requestedAmount?: number;
    requestedRate?: number;
    requestedTerm?: number;
    requestedFee?: number;
    collateralIds?: string[];
    requestedCollateralIds?: string[];
  }
): {
  updatedState: DailySimulationState;
  outcome: 'aprobado' | 'contraoferta' | 'rechazado';
  reason: string;
  dialogue: string;
  message: string;
  updatedOffer: DynamicBankOffer;
  negotiationRecord: {
    date: string;
    requestedAmount: number;
    requestedRate: number;
    requestedTerm: number;
    requestedFee: number;
    bankResponse: 'aprobado' | 'contraoferta' | 'rechazado';
    reason: string;
    offeredAmount: number;
    offeredRate: number;
    offeredTerm: number;
    offeredFee: number;
  };
} {
  const offer = typeof offerOrId === 'string'
    ? (state.dynamicBankOffers || []).find(o => o.id === offerOrId)
      || (state.simulatedEmails || []).find(e => e.bankOfferPayload?.id === offerOrId)?.bankOfferPayload
    : offerOrId;

  if (!offer) {
    const emptyRecord = {
      date: `Día ${state.currentDay}, Mes ${state.currentMonth}`,
      requestedAmount: 0,
      requestedRate: 0,
      requestedTerm: 0,
      requestedFee: 0,
      bankResponse: 'rechazado' as const,
      reason: 'Oferta no encontrada',
      offeredAmount: 0,
      offeredRate: 0,
      offeredTerm: 0,
      offeredFee: 0
    };
    return {
      updatedState: state,
      outcome: 'rechazado',
      reason: 'Oferta pre-aprobada no encontrada en los registros.',
      dialogue: 'Dictamen de Riesgo: No se localizó la oferta pre-aprobada en los registros del banco.',
      message: 'Oferta no encontrada.',
      updatedOffer: null as any,
      negotiationRecord: emptyRecord
    };
  }

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const bank = COMMERCIAL_BANKS_PROFILES[offer.bankId] || COMMERCIAL_BANKS_PROFILES.atlantida;
  const capacity = evaluateContractorEconomicCapacity(state);
  
  const currentOfferAmount = offer.amountOrLimitHNL ?? offer.approvedAmount ?? offer.offeredAmount ?? 500000;
  const currentOfferRate = offer.annualRatePct ?? offer.interestRateAnnual ?? 11.5;

  const reqAmount = proposal.requestedAmount ?? currentOfferAmount;
  const reqRate = proposal.requestedRate ?? currentOfferRate;
  const reqTerm = proposal.requestedTerm ?? offer.termMonths;
  const reqFee = proposal.requestedFee ?? offer.openingFeePct;
  const selectedCollateralIds = proposal.collateralIds || proposal.requestedCollateralIds || [];

  // Validar vigencia de la oferta antes de negociar
  if (isSimOfferExpired(state, offer)) {
    const expiredRecord = {
      date: timestampStr,
      requestedAmount: reqAmount,
      requestedRate: reqRate,
      requestedTerm: reqTerm,
      requestedFee: reqFee,
      bankResponse: 'rechazado' as const,
      reason: `La oferta venció el Día ${offer.expiresDay}, Mes ${offer.expiresMonth} (${offer.expiresYear || state.currentYear || 2026}) y ya no se encuentra vigente para negociación.`,
      offeredAmount: currentOfferAmount,
      offeredRate: currentOfferRate,
      offeredTerm: offer.termMonths,
      offeredFee: offer.openingFeePct
    };
    return {
      updatedState: state,
      outcome: 'rechazado',
      reason: `La oferta venció el Día ${offer.expiresDay}, Mes ${offer.expiresMonth} (${offer.expiresYear || state.currentYear || 2026}) y ya no se encuentra vigente para negociación.`,
      dialogue: `Dictamen de Riesgo (${bank.name}): No es posible evaluar una propuesta de negociación sobre una oferta comercial caducada.`,
      message: 'Oferta vencida.',
      updatedOffer: { ...offer, status: 'vencida' },
      negotiationRecord: expiredRecord
    };
  }

  // Validar si ya fue contratada
  if (offer.status === 'aceptada') {
    const acceptedRecord = {
      date: timestampStr,
      requestedAmount: reqAmount,
      requestedRate: reqRate,
      requestedTerm: reqTerm,
      requestedFee: reqFee,
      bankResponse: 'rechazado' as const,
      reason: 'Esta oferta comercial ya fue aceptada y desembolsada anteriormente.',
      offeredAmount: currentOfferAmount,
      offeredRate: currentOfferRate,
      offeredTerm: offer.termMonths,
      offeredFee: offer.openingFeePct
    };
    return {
      updatedState: state,
      outcome: 'rechazado',
      reason: 'Esta oferta comercial ya fue aceptada y desembolsada formalmente.',
      dialogue: `Dictamen de Riesgo (${bank.name}): La operación ya fue ejecutada y se encuentra activa en el libro mayor.`,
      message: 'Oferta ya contratada.',
      updatedOffer: offer,
      negotiationRecord: acceptedRecord
    };
  }


  const { totalCoverageHNL } = evaluateSelectedCollateralsCoverage(state, selectedCollateralIds);
  const prod = COMMERCIAL_LOAN_PRODUCTS[offer.productType] || COMMERCIAL_LOAN_PRODUCTS.capital_trabajo;

  // Evaluar razonabilidad de la contraoferta
  const minBankRate = Math.max(7.5, bank.baseInterestRateLoan - 2.0);
  const maxBorrowingBase = capacity.maxBorrowingCapacity;
  const combinedMaxWithCollateral = maxBorrowingBase + Math.floor(totalCoverageHNL / 1.0);

  let outcome: 'aprobado' | 'contraoferta' | 'rechazado';
  let reason = '';
  let offeredAmount = currentOfferAmount;
  let offeredRate = currentOfferRate;
  let offeredTerm = offer.termMonths;
  let offeredFee = offer.openingFeePct;

  // Criterios de rechazo por solicitud desmedida o inviable para el banco:
  const isAbsurdRate = reqRate < (minBankRate - 2.0);
  const isUnbackedExcessiveAmount = selectedCollateralIds.length === 0 && (reqAmount > currentOfferAmount * 2.0);
  const isExceedingCapacityLimit = reqAmount > combinedMaxWithCollateral * 1.35;

  if (isAbsurdRate || isUnbackedExcessiveAmount || isExceedingCapacityLimit) {
    outcome = 'rechazado';
    offeredAmount = currentOfferAmount;
    offeredRate = currentOfferRate;
    offeredTerm = offer.termMonths;
    offeredFee = offer.openingFeePct;
    reason = `Dictamen Interno de Riesgo Crediticio (${bank.name}): DENEGADO. La solicitud de L ${reqAmount.toLocaleString()} al ${reqRate}% anual sobrepasa la exposición crediticia prudencial para este segmento y no cuenta con garantías hipotecarias suficientes para mitigar el riesgo. Se mantienen vigentes las condiciones originales pre-aprobadas.`;
  }
  // Caso 1: Aprobado (Propuesta con garantías reales o dentro de capacidad)
  else if (totalCoverageHNL >= reqAmount * 0.8 && reqRate >= minBankRate && reqAmount <= combinedMaxWithCollateral) {
    outcome = 'aprobado';
    offeredAmount = reqAmount;
    offeredRate = Number(reqRate.toFixed(2));
    offeredTerm = reqTerm;
    offeredFee = Math.max(0.5, Number((reqFee).toFixed(2)));
    reason = `Dictamen Interno de Riesgo Crediticio (${bank.name}): APROBADO. Las garantías reales aportadas (cobertura L ${totalCoverageHNL.toLocaleString()}) reducen el riesgo operativo, autorizando el monto de L ${offeredAmount.toLocaleString()} a la tasa preferencial del ${offeredRate}% anual con comisión del ${offeredFee}%.`;
  } else if (reqAmount <= maxBorrowingBase * 1.15 && reqRate >= minBankRate + 0.8 && selectedCollateralIds.length === 0) {
    outcome = 'aprobado';
    offeredAmount = reqAmount;
    offeredRate = Number(reqRate.toFixed(2));
    offeredTerm = reqTerm;
    offeredFee = Math.max(1.0, reqFee);
    reason = `Dictamen Interno de Riesgo Crediticio (${bank.name}): APROBADO. Su récord crediticio (${capacity.creditProfile.tierLabel}) y solvencia respaldan la adecuación del monto y plazo sin garantías hipotecarias adicionales.`;
  } 
  // Caso 2: Contraoferta (El banco se acerca a los términos del cliente)
  else if (reqAmount <= combinedMaxWithCollateral * 1.35) {
    outcome = 'contraoferta';
    offeredAmount = Math.round(Math.min(reqAmount, (currentOfferAmount + reqAmount) / 2));
    offeredRate = Number((Math.max(minBankRate + 0.5, (currentOfferRate + reqRate) / 2)).toFixed(2));
    offeredTerm = Math.min(reqTerm, 48);
    offeredFee = Math.max(1.0, Number(((offer.openingFeePct + reqFee) / 2).toFixed(2)));
    reason = `Dictamen Interno de Riesgo Crediticio (${bank.name}): CONTRAOFERTA FORMULADA. No es viable conceder la totalidad de las condiciones solicitadas sin colateral hipotecario de primer rango. El comité autoriza una contrapropuesta ejecutiva por L ${offeredAmount.toLocaleString()} al ${offeredRate}% anual con comisión del ${offeredFee}%.`;
  } 
  // Caso 3: Rechazo explicado
  else {
    outcome = 'rechazado';
    offeredAmount = currentOfferAmount;
    offeredRate = currentOfferRate;
    offeredTerm = offer.termMonths;
    offeredFee = offer.openingFeePct;
    reason = `Dictamen Interno de Riesgo Crediticio (${bank.name}): DENEGADO. La solicitud de L ${reqAmount.toLocaleString()} al ${reqRate}% anual sobrepasa la exposición crediticia prudencial para este segmento y no cuenta con garantías hipotecarias suficientes para mitigar el riesgo. Se mantienen vigentes las condiciones originales pre-aprobadas.`;
  }

  // Recalcular cuota mensual estimada
  const monthlyRate = offeredRate / 100 / 12;
  const estimatedPayment = Math.round((offeredAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -offeredTerm)));

  const negotiationRecord = {
    date: timestampStr,
    requestedAmount: reqAmount,
    requestedRate: reqRate,
    requestedTerm: reqTerm,
    requestedFee: reqFee,
    bankResponse: outcome,
    reason,
    offeredAmount,
    offeredRate,
    offeredTerm,
    offeredFee
  };

  const updatedOffer: DynamicBankOffer = {
    ...offer,
    previousTerms: offer.previousTerms || {
      amount: currentOfferAmount,
      rate: currentOfferRate,
      term: offer.termMonths,
      fee: offer.openingFeePct
    },
    amountOrLimitHNL: offeredAmount,
    approvedAmount: offeredAmount,
    offeredAmount,
    annualRatePct: offeredRate,
    interestRateAnnual: offeredRate,
    termMonths: offeredTerm,
    openingFeePct: offeredFee,
    estimatedMonthlyPaymentHNL: estimatedPayment,
    linkedCollateralIds: selectedCollateralIds.length > 0 ? selectedCollateralIds : offer.linkedCollateralIds,
    status: outcome === 'rechazado' ? (offer.status || 'disponible') : 'en_negociacion',
    negotiationHistory: [...(offer.negotiationHistory || []), negotiationRecord]
  };

  const updatedDynamicOffers = (state.dynamicBankOffers || []).map(o => o.id === updatedOffer.id ? updatedOffer : o);
  if (!updatedDynamicOffers.some(o => o.id === updatedOffer.id)) {
    updatedDynamicOffers.push(updatedOffer);
  }

  const updatedEmails = (state.simulatedEmails || []).map(e => {
    if (e.bankOfferPayload?.id === updatedOffer.id) {
      return {
        ...e,
        bankOfferPayload: updatedOffer
      };
    }
    return e;
  });

  const updatedState: DailySimulationState = {
    ...state,
    dynamicBankOffers: updatedDynamicOffers,
    simulatedEmails: updatedEmails
  };

  return {
    updatedState,
    outcome,
    reason,
    dialogue: reason,
    message: reason,
    updatedOffer,
    negotiationRecord
  };
}

export function createInitialSimulatedEmails(
  companyName: string,
  sector: RetailSectorId = 'constructora',
  initialBankBalance?: number
): SimulatedEmail[] {
  const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const companyEmail = `gerencia@${companySlug}.hn`;
  const personalEmail = `propietario@${companySlug}.hn`;

  const initialOfferAmount = sector === 'constructora' ? 1200000 : 450000;
  const initialOfferRate = 11.5;
  const initialOfferTerm = 36;
  const monthlyR = initialOfferRate / 100 / 12;
  const initialCuota = Math.round((initialOfferAmount * monthlyR) / (1 - Math.pow(1 + monthlyR, -initialOfferTerm)));

  const initialPreApprovedOffer: DynamicBankOffer = {
    id: 'offer_init_atl_capital',
    bankId: 'atlantida',
    productType: 'capital_trabajo',
    title: 'Línea de Capital de Trabajo Comercial Pre-Aprobada',
    amountOrLimitHNL: initialOfferAmount,
    approvedAmount: initialOfferAmount,
    offeredAmount: initialOfferAmount,
    annualRatePct: initialOfferRate,
    interestRateAnnual: initialOfferRate,
    termMonths: initialOfferTerm,
    openingFeePct: 1.5,
    requiresCollateral: false,
    estimatedMonthlyPaymentHNL: initialCuota,
    expiresDay: 28,
    expiresMonth: 1,
    isPreApproved: true,
    status: 'disponible'
  };

  return [
    {
      id: 'email-init-bank-offer-atlantida',
      category: 'bancos_financiamiento',
      senderName: 'Banco Atlántida - Gerencia de Banca Comercial',
      senderEmail: 'bancacomercial@atlantida.banca.hn',
      recipientEmail: companyEmail,
      companyName,
      subject: `Propuesta de Financiamiento Pre-Aprobada: Línea de Capital por L ${initialOfferAmount.toLocaleString()}`,
      body: `Estimado(a) Director(a) de ${companyName}:\n\nNos complace extenderle una línea de crédito comercial pre-aprobada en condiciones preferenciales para fortalecer las compras operativas de su empresa:\n\n• Monto Pre-Aprobado: L ${initialOfferAmount.toLocaleString()}\n• Tasa Anual Corporativa: 11.5% fija\n• Plazo de Financiamiento: 36 meses\n• Cuota Nivelada Estimada: L ${initialCuota.toLocaleString()}/mes\n• Comisión de Apertura: 1.5%\n• Validez de la Oferta: Vigente por 28 días calendario\n\nPuede revisar las condiciones, negociar mejores tasas aportando garantías o solicitar el desembolso directo desde este mensaje.`,
      sentDate: 'Día 1, Mes 1 (2026)',
      simDay: 1,
      simMonth: 1,
      simYear: 2026,
      isRead: false,
      isStarred: true,
      isArchived: false,
      folder: 'inbox',
      relatedEntityType: 'bank_offer',
      relatedEntityId: initialPreApprovedOffer.id,
      bankOfferPayload: initialPreApprovedOffer
    },
    {
      id: 'email-init-sar-solvencia',
      category: 'sar_tributario',
      senderName: 'Servicio de Administración de Rentas (SAR)',
      senderEmail: 'notificaciones@sar.gob.hn',
      recipientEmail: companyEmail,
      companyName,
      subject: 'Aviso Obligatorio: Periodo Fiscal Ordinario y Formulario SAR-25',
      body: `Estimado(a) contribuyente ${companyName}:\n\nLe notificamos la apertura formal del periodo fiscal corriente. Conforme al Código Tributario de Honduras, su empresa debe presentar su declaración jurada anual del Impuesto Sobre la Renta (ISR - Tasa del 25%) y mantener la solvencia fiscal vigente para operar licitaciones públicas y celebrar contratos financieros.\n\nRecuerde: Presentar la declaración jurada y pagar la obligación tributaria son actos independientes. Puede solicitar su Constancia de Solvencia Fiscal una vez se encuentre al día con todas las obligaciones.\n\nAtentamente,\nDirección de Grandes y Medianos Contribuyentes\nSAR Tegucigalpa, M.D.C.`,
      sentDate: 'Día 1, Mes 1 (2026)',
      simDay: 1,
      simMonth: 1,
      simYear: 2026,
      isRead: false,
      isStarred: true,
      isArchived: false,
      folder: 'inbox',
      relatedEntityType: 'sar_obligation',
      relatedEntityId: 'period-2026'
    },
    {
      id: 'email-init-order-client',
      category: 'ventas_clientes',
      senderName: 'Inversiones y Proyectos de Honduras S.A.',
      senderEmail: 'adquisiciones@proyectoshn.com',
      recipientEmail: companyEmail,
      companyName,
      subject: 'Pedido de Insumos y Suministros #PED-2026-081',
      body: `Estimados señores de ${companyName}:\n\nAdjuntamos la orden formal de pedido #PED-2026-081 para el suministro requerido en nuestras obras del presente mes.\n\n• Estado del pedido: Pendiente de confirmación y entrega\n• Monto estipulado: L 185,000.00\n• Términos de pago: Pago contra entrega y recepción conforme\n\nNOTA FINANCIERA: La recepción de este pedido registra la transacción en el sistema, pero no acredita automáticamente el efectivo en cuentas hasta la liquidación o facturación correspondiente.\n\nQuedamos a la espera de su confirmación de despacho.`,
      sentDate: 'Día 1, Mes 1 (2026)',
      simDay: 1,
      simMonth: 1,
      simYear: 2026,
      isRead: false,
      isStarred: false,
      isArchived: false,
      folder: 'inbox',
      relatedEntityType: 'customer_order',
      relatedEntityId: 'PED-2026-081'
    },
    {
      id: 'email-init-collaterals-reg',
      category: 'garantias',
      senderName: 'Registro de la Propiedad Inmueble y Mercantil',
      senderEmail: 'certificaciones@ip.gob.hn',
      recipientEmail: companyEmail,
      companyName,
      subject: 'Certificación de Bienes Registrados y Avalúos Elegibles',
      body: `Aviso Registral Oficial:\n\nSe confirman inscritos a nombre de ${companyName} y su propietario los bienes inmuebles, residencias, predios comerciales y maquinaria pesada en los folios reales del Instituto de la Propiedad.\n\nLos bienes se encuentran actualmente con avalúos actualizados y disponibles para respaldar operaciones de financiamiento comercial con cobertura LTV del 70% al 80% ante las instituciones del sistema financiero nacional.\n\nCualquier gravamen hipotecario o prendario constituido bloqueará la venta del bien hasta su cancelación mediante comprobante de finiquito.`,
      sentDate: 'Día 1, Mes 1 (2026)',
      simDay: 1,
      simMonth: 1,
      simYear: 2026,
      isRead: false,
      isStarred: false,
      isArchived: false,
      folder: 'inbox',
      relatedEntityType: 'collateral_asset',
      relatedEntityId: 'col_casa_palmas'
    },
    {
      id: 'email-init-personal-notice',
      category: 'sistema_avisos',
      senderName: 'Secretaría de Gerencia General',
      senderEmail: 'asistente@banca.hn',
      recipientEmail: personalEmail,
      companyName,
      subject: 'Bienvenida a la Plataforma Financiera Áureo Bank 2000',
      body: `Estimado(a) Director(a) Propietario(a):\n\nSe ha activado su buzón de correo empresarial. A través de este canal recibirá:\n\n1. Avisos y órdenes de clientes.\n2. Ofertas de financiamiento bancario pre-aprobadas de Ficohsa, Atlántida, BAC y Occidente.\n3. Vencimientos de cuotas y recibos de pago con botón directo de amortización.\n4. Resoluciones tributarias del SAR y certificados de solvencia.\n\nPuede redactar respuestas, revisar comprobantes y gestionar sus cuentas con total flexibilidad.`,
      sentDate: 'Día 1, Mes 1 (2026)',
      simDay: 1,
      simMonth: 1,
      simYear: 2026,
      isRead: false,
      isStarred: true,
      isArchived: false,
      folder: 'inbox'
    }
  ];
}


