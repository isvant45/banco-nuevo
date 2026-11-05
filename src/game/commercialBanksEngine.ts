import { 
  DailySimulationState, 
  CommercialBankId, 
  CommercialBankProfile, 
  CommercialBankRelationship,
  BankCommercialLoan,
  BankCorporateCreditCard,
  BankCheckingAccount,
  BankGuaranteeDeposit,
  BankTermDeposit
} from './retroSimTypes';

/**
 * Perfiles Institucionales de los 4 Bancos Comerciales Competidores de Honduras
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
 * Inicializador del ecosistema de 4 bancos para la empresa
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
        checksUsedCount: 3
      },
      corporateCard: {
        cardId: 'card-atl-01',
        bankId: 'atlantida',
        brand: 'Visa Signature Corporativa Atlántida',
        creditLimit: 300000,
        currentBalance: 0,
        interestRateAnnual: 24.0,
        minPaymentMonthly: 0
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
        checksUsedCount: 1
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
  offersByBank: Record<CommercialBankId, {
    maxLoanHNL: number;
    recommendedRatePct: number;
    maxCardHNL: number;
    approvedChecking: boolean;
  }>;
} {
  const totalLiquidity = state.storeCash + state.storeBankBalance;
  const machineryFleetValue = (state.ownedMachinery || []).reduce((sum, m) => sum + m.purchasePrice, 0);
  const activeContractsValue = (state.activeWorks || []).reduce((sum, w) => sum + (w.totalContractPrice - w.billedMilestonesAmount), 0);
  const monthlySales = Math.max(state.monthlySalesAccumulated || 0, 350000);

  // Capacidad de endeudamiento: 40% de facturación anual + 50% de valor de maquinaria + 30% de contratos activos
  const baseBorrowing = Math.round(monthlySales * 4.8 + machineryFleetValue * 0.5 + activeContractsValue * 0.3);
  const maxBorrowing = Math.max(500000, baseBorrowing);
  const maxCard = Math.round(monthlySales * 0.35);

  let rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'B' = 'BBB';
  if (state.fiscalSolvenciaActive && state.storeReputation >= 85 && totalLiquidity >= 1000000) {
    rating = 'AAA';
  } else if (state.fiscalSolvenciaActive && state.storeReputation >= 75) {
    rating = 'AA';
  } else if (state.fiscalSolvenciaActive) {
    rating = 'A';
  }

  // Ofertas diferenciadas por cada uno de los 4 bancos competidores
  const offersByBank: Record<CommercialBankId, any> = {
    ficohsa: {
      maxLoanHNL: Math.round(maxBorrowing * 1.15), // Ficohsa presta más volumen corporativo
      recommendedRatePct: rating === 'AAA' ? 10.5 : rating === 'AA' ? 11.5 : 12.5,
      maxCardHNL: Math.round(maxCard * 1.25),
      approvedChecking: true
    },
    atlantida: {
      maxLoanHNL: Math.round(maxBorrowing * 1.10),
      recommendedRatePct: rating === 'AAA' ? 10.0 : rating === 'AA' ? 11.0 : 11.8,
      maxCardHNL: Math.round(maxCard * 1.10),
      approvedChecking: true
    },
    bac: {
      maxLoanHNL: Math.round(maxBorrowing * 0.95),
      recommendedRatePct: rating === 'AAA' ? 11.0 : rating === 'AA' ? 12.0 : 13.0,
      maxCardHNL: Math.round(maxCard * 1.50), // BAC da las tarjetas con mayor límite
      approvedChecking: true
    },
    occidente: {
      maxLoanHNL: Math.round(maxBorrowing * 1.05),
      recommendedRatePct: rating === 'AAA' ? 9.5 : rating === 'AA' ? 10.2 : 10.9, // Occidente tiene la tasa más barata
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
