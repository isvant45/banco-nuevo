import { 
  DailySimulationState, 
  CommercialBankId, 
  CommercialBankProfile, 
  CommercialBankRelationship,
  BankCommercialLoan,
  BankCorporateCreditCard,
  BankCheckingAccount,
  BankGuaranteeDeposit,
  BankTermDeposit,
  CompanyCreditProfile,
  OwnedMachineryUnit,
  MachineryCategory
} from './retroSimTypes';

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
        brand: 'Visa Signature Corporativa Atlántida',
        creditLimit: 300000,
        currentBalance: 0,
        interestRateAnnual: 24.0,
        minPaymentMonthly: 0,
        cashbackPct: 1.5
      },
      guaranteeDeposits: [],
      termDeposits: []
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
      termDeposits: []
    },
    bac: {
      bankId: 'bac',
      relationshipScore: 55,
      guaranteeDeposits: [],
      termDeposits: []
    },
    occidente: {
      bankId: 'occidente',
      relationshipScore: 50,
      guaranteeDeposits: [],
      termDeposits: []
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
  const monthlySales = Math.max(state.monthlySalesAccumulated || 0, 350000);

  // Multiplicador de crédito según Score Crediticio (hasta +30% de capacidad si es excelente)
  const scoreMultiplier = creditProfile.score >= 780 ? 1.3 : creditProfile.score >= 710 ? 1.15 : creditProfile.score >= 640 ? 1.0 : 0.8;
  const baseBorrowing = Math.round((monthlySales * 4.8 + machineryFleetValue * 0.5 + activeContractsValue * 0.3) * scoreMultiplier);
  const maxBorrowing = Math.max(500000, baseBorrowing);
  const maxCard = Math.round(monthlySales * 0.35 * scoreMultiplier);

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
 * Solicitud de Tarjeta de Crédito Corporativa
 */
export function requestCorporateCard(
  state: DailySimulationState,
  bankId: CommercialBankId,
  requestedLimit: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const capacity = evaluateContractorEconomicCapacity(state);
  const bankOffer = capacity.offersByBank[bankId];

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

  const cardBrand = bankId === 'bac' 
    ? 'Mastercard Black Corporativa BAC'
    : bankId === 'ficohsa'
    ? 'Visa Infinite Empresarial Ficohsa'
    : bankId === 'atlantida'
    ? 'Visa Signature Corporativa Atlántida'
    : 'Visa Business Occidente';

  const newCard: BankCorporateCreditCard = {
    cardId: `card-${bankId}-${Date.now().toString().slice(-4)}`,
    bankId,
    brand: cardBrand,
    creditLimit: requestedLimit,
    currentBalance: 0,
    interestRateAnnual: 22.0,
    minPaymentMonthly: 0
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
    message: `¡Tarjeta Corporativa emitida por ${COMMERCIAL_BANKS_PROFILES[bankId].name}! Límite asignado: L ${requestedLimit.toLocaleString()}. Utilízala para compras imprevistas de materiales o repuestos.`
  };
}

/**
 * Constitución de Depósito en Garantía (Fianza de Licitación o Cumplimiento de Contrato)
 */
export function pledgeBankGuarantee(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amountHNL: number,
  purpose: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  if (state.storeBankBalance < amountHNL) {
    return {
      updatedState: state,
      success: false,
      message: 'Fondos insuficientes en banco para inmovilizar en garantía.'
    };
  }

  const currentRel = state.commercialBanks[bankId];
  const newDeposit: BankGuaranteeDeposit = {
    id: `fianza-${Date.now().toString().slice(-4)}`,
    bankId,
    amountPledged: amountHNL,
    purpose: purpose || 'Fianza de Cumplimiento de Contrato Público (SIT / SEFIN)',
    status: 'activo'
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
    message: `Depósito en garantía por L ${amountHNL.toLocaleString()} constituido en ${COMMERCIAL_BANKS_PROFILES[bankId].name}. Fianza emitida para respaldo de licitaciones públicas.`
  };
}

/**
 * Liberación de Depósito en Garantía
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
      storeBankBalance: state.storeBankBalance + dep.amountPledged,
      commercialBanks: updatedBanks
    },
    success: true,
    message: `Fianza liberada exitosamente. Se reintegraron L ${dep.amountPledged.toLocaleString()} a tu cuenta bancaria.`
  };
}

/**
 * Apertura de Depósito a Plazo Fijo (DPF)
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

  const newDpf: BankTermDeposit = {
    id: `dpf-${bankId}-${Date.now().toString().slice(-4)}`,
    bankId,
    principalAmount: amountHNL,
    annualRatePct: bank.baseDpfRate,
    termDays,
    daysRemaining: termDays,
    accruedInterest: 0
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
    message: `¡Certificado DPF constituido en ${bank.name}! Capital: L ${amountHNL.toLocaleString()} al ${bank.baseDpfRate}% anual a ${termDays} días.`
  };
}

/**
 * Pago o Abono a Préstamo Bancario
 */
export function payCommercialLoan(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amount: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const loan = currentRel?.activeLoan;
  if (!loan) return { updatedState: state, success: false, message: 'No hay préstamo activo con este banco.' };

  const totalFunds = state.storeBankBalance + state.storeCash;
  if (totalFunds < amount) {
    return { updatedState: state, success: false, message: 'Fondos insuficientes para pagar la cuota.' };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= amount) {
    newBank -= amount;
  } else {
    const rem = amount - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - rem);
  }

  const newBalance = Math.max(0, loan.balanceRemaining - amount);
  const updatedLoan = newBalance <= 0 ? undefined : {
    ...loan,
    balanceRemaining: newBalance,
    termMonthsRemaining: Math.max(0, loan.termMonthsRemaining - 1)
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
      storeBankBalance: newBank,
      storeCash: newCash,
      commercialBanks: updatedBanks
    },
    success: true,
    message: newBalance <= 0 
      ? `¡Préstamo con ${COMMERCIAL_BANKS_PROFILES[bankId].name} cancelado en su totalidad!`
      : `Abono de L ${amount.toLocaleString()} procesado. Saldo restante: L ${newBalance.toLocaleString()}.`
  };
}

/**
 * Pago o Abono a Tarjeta de Crédito Corporativa
 */
export function payCorporateCreditCard(
  state: DailySimulationState,
  bankId: CommercialBankId,
  amount: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentRel = state.commercialBanks[bankId];
  const card = currentRel?.corporateCard;
  if (!card) return { updatedState: state, success: false, message: 'No dispones de tarjeta con este banco.' };

  const available = state.storeBankBalance + state.storeCash;
  if (available < amount) {
    return { updatedState: state, success: false, message: 'Fondos insuficientes para pagar la tarjeta.' };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= amount) {
    newBank -= amount;
  } else {
    const rem = amount - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - rem);
  }

  const newCardBalance = Math.max(0, card.currentBalance - amount);
  const updatedBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...currentRel,
      corporateCard: {
        ...card,
        currentBalance: newCardBalance,
        minPaymentMonthly: Math.round(newCardBalance * 0.05)
      }
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
    message: `Pago de L ${amount.toLocaleString()} a la tarjeta corporativa procesado. Saldo actual: L ${newCardBalance.toLocaleString()}.`
  };
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
