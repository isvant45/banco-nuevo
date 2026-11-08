// ============================================================================
// MOTOR MACROECONÓMICO: BANCO CENTRAL, CICLOS, ENCAJE, OPEX/CAPEX & RESCATES
// ============================================================================

import { 
  DailySimulationState, 
  CommercialBankId, 
  CommercialLoanType, 
  TransactionVoucher,
  SimulatedEmail
} from './retroSimTypes';
import { 
  IMacroEconomyState, 
  MacroCycleState, 
  IOpexCapexBreakdown, 
  IBusinessCreditScoreReport, 
  ISmartLoanContract, 
  IDueDiligenceDossier, 
  IForeclosureResult 
} from './macroEconomyTypes';
import { calculateCollateralAvailableCoverage, COMMERCIAL_BANKS_PROFILES } from './commercialBanksEngine';

/**
 * Inicializa el estado macroeconómico regulado por el Banco Central
 */
export function createInitialMacroEconomyState(): IMacroEconomyState {
  return {
    cycleState: 'EXPANSION',
    cycleDurationMonths: 6,
    currentCycleMonthElapsed: 1,
    primeRatePct: 6.5, // 6.5% Tasa de Política Monetaria inicial
    inflationRatePct: 4.2, // 4.2% Inflación moderada
    legalReservePct: 20.0, // 20% Encaje Legal Obligatorio en Banco Central
    centralBankBailoutRatePct: 16.5, // Prime Rate (6.5%) + 10.0% punitiva
    activeBailoutDebtHNL: 0,
    centralBankReservesUSD: 8450000000, // $8.45 mil millones USD
    marketShockEvent: null,
    historicalRates: [
      { day: 1, month: 7, year: 2025, primeRatePct: 5.5, inflationRatePct: 3.8, cycleState: 'EXPANSION' },
      { day: 1, month: 8, year: 2025, primeRatePct: 5.75, inflationRatePct: 4.0, cycleState: 'EXPANSION' },
      { day: 1, month: 9, year: 2025, primeRatePct: 6.0, inflationRatePct: 4.1, cycleState: 'EXPANSION' },
      { day: 1, month: 10, year: 2025, primeRatePct: 6.0, inflationRatePct: 4.1, cycleState: 'EXPANSION' },
      { day: 1, month: 11, year: 2025, primeRatePct: 6.25, inflationRatePct: 4.2, cycleState: 'EXPANSION' },
      { day: 1, month: 12, year: 2025, primeRatePct: 6.5, inflationRatePct: 4.2, cycleState: 'EXPANSION' }
    ]
  };
}

/**
 * Calcula el desglose exhaustivo de OPEX vs CAPEX y la pista de liquidez (Cash Runway)
 */
export function calculateOpexCapexBreakdown(state: DailySimulationState): IOpexCapexBreakdown {
  const isConstructora = state.retailSector === 'constructora';
  
  // 1. Nómina mensual (OPEX)
  const monthlyWagesHNL = (state.dailyWages || (isConstructora ? 4800 : 1200)) * 30;

  // 2. Alquiler y servicios fijos (OPEX)
  const monthlyRentHNL = (state.dailyRent || (isConstructora ? 1500 : 500)) * 30;
  const monthlyUtilitiesHNL = Math.round(monthlyRentHNL * 0.28); // Agua, luz trifásica, internet corporativo

  // 3. Costos de sucursales en expansión (si existen en ERP)
  const branchOperatingCostMonthlyHNL = (state.erpCorporateState?.branches || []).reduce((sum, b) => {
    return sum + (b.status === 'OPERATING' ? b.monthlyOperatingCostHNL : 0);
  }, 0);

  // 4. Depreciación mensual de maquinaria e infraestructura (CAPEX a OPEX)
  const totalMachineryValue = (state.ownedMachinery || []).reduce((sum, m) => sum + (m.purchaseCost || m.purchasePrice || 0), 0);
  const totalBranchCapex = (state.erpCorporateState?.branches || []).reduce((sum, b) => sum + b.setupCostHNL, 0);
  const totalCapitalExpenditureHNL = totalMachineryValue + totalBranchCapex;

  // Depreciación lineal contable a 10 años (10% anual / 12 meses)
  const machineryDepreciationMonthlyHNL = Math.round((totalCapitalExpenditureHNL * 0.10) / 12);
  const accumulatedDepreciationHNL = machineryDepreciationMonthlyHNL * Math.max(1, state.currentMonth);

  // Total OPEX mensual
  const totalMonthlyOpexHNL = monthlyWagesHNL + monthlyRentHNL + monthlyUtilitiesHNL + branchOperatingCostMonthlyHNL + machineryDepreciationMonthlyHNL;

  // 5. Evaluación de Pista de Efectivo (Cash Runway)
  const totalLiquidCash = Math.max(0, (state.storeCash || 0) + (state.storeBankBalance || 0));
  const dailyOpexBurnRate = Math.max(1, totalMonthlyOpexHNL / 30);
  const daysOfCashRunway = Math.round(totalLiquidCash / dailyOpexBurnRate);
  const isLiquidityCritical = daysOfCashRunway < 15;

  return {
    monthlyWagesHNL,
    monthlyRentHNL,
    monthlyUtilitiesHNL,
    totalMonthlyOpexHNL,
    machineryDepreciationMonthlyHNL,
    branchOperatingCostMonthlyHNL,
    accumulatedDepreciationHNL,
    totalCapitalExpenditureHNL,
    daysOfCashRunway,
    isLiquidityCritical
  };
}

/**
 * Algoritmo matemático de Calificación Crediticia (Credit Score: 300 - 850)
 * Evalúa en tiempo real:
 * - Historial de puntualidad de pagos (40%)
 * - Ratio Deuda / Ingresos Brutos (DTI) (35%)
 * - Respaldo patrimonial y garantías reales libres de gravamen (15%)
 * - Antigüedad y reputación comercial (10%)
 */
export function calculateBusinessCreditScore(state: DailySimulationState): IBusinessCreditScoreReport {
  // 1. Ingresos brutos mensuales estimados
  const receiptsSales = (state.dailyReceipts || []).reduce((sum, r) => sum + (r.totalHNL ?? 0), 0) * 30;
  const monthlySales = state.monthlySalesAccumulated > 0 ? state.monthlySalesAccumulated : (receiptsSales > 0 ? receiptsSales : 180000);

  // 2. Carga mensual total de pasivos (servicio de deuda)
  const commercialDebtMonthly = Object.values(state.commercialBanks || {}).reduce((sum, b) => {
    return sum + (b.activeLoan ? b.activeLoan.monthlyPayment : 0);
  }, 0);
  const cardDebtMonthly = Object.values(state.commercialBanks || {}).reduce((sum, b) => {
    return sum + (b.corporateCard ? (b.corporateCard.minPaymentMonthly || 0) : 0);
  }, 0);
  const totalMonthlyDebtService = commercialDebtMonthly + cardDebtMonthly;

  // Ratio DTI (Debt-to-Income)
  const dtiRatioPct = monthlySales > 0 ? Number(((totalMonthlyDebtService / monthlySales) * 100).toFixed(1)) : 100;

  // Componente 1: Historial de Pagos (Puntaje base 70, bonificado por cumplimiento y castigado por moras)
  let paymentHistoryScore = 75;
  const hasDelinquentLoans = Object.values(state.commercialBanks || {}).some(b => b.activeLoan && (b.activeLoan as any).isOverdue);
  if (hasDelinquentLoans) paymentHistoryScore -= 45;
  if ((state.transactionVouchers || []).length > 5) paymentHistoryScore += 15;
  paymentHistoryScore = Math.min(100, Math.max(10, paymentHistoryScore));

  // Componente 2: Exposición al Endeudamiento (DTI)
  let debtExposureScore = 100;
  if (dtiRatioPct > 50) debtExposureScore = Math.max(15, 100 - (dtiRatioPct - 50) * 2.5);
  else if (dtiRatioPct > 35) debtExposureScore = 80;
  else if (dtiRatioPct > 20) debtExposureScore = 90;

  // Componente 3: Solvencia Patrimonial (Garantías libres de gravamen)
  const totalAvailableCollateral = (state.realEstateCollaterals || []).reduce((sum, c) => {
    return sum + (!c.isPledged ? calculateCollateralAvailableCoverage(c) : 0);
  }, 0);
  let collateralSolvencyScore = 50;
  if (totalAvailableCollateral >= 20000000) collateralSolvencyScore = 100;
  else if (totalAvailableCollateral >= 10000000) collateralSolvencyScore = 85;
  else if (totalAvailableCollateral >= 5000000) collateralSolvencyScore = 70;

  // Componente 4: Antigüedad y Reputación Comercial
  const reputation = state.storeReputation || 75;
  const businessTenureScore = Math.min(100, Math.max(40, reputation + (state.currentMonth * 2)));

  // Ponderación final (Escala 300 - 850)
  const weightedPercentage = (
    paymentHistoryScore * 0.40 +
    debtExposureScore * 0.35 +
    collateralSolvencyScore * 0.15 +
    businessTenureScore * 0.10
  );

  const rawScore = Math.round(300 + (weightedPercentage / 100) * 550);
  const score = Math.min(850, Math.max(300, rawScore));

  // Clasificación de Tiers y Descuento en Tasa de Interés
  let tier: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C' | 'D' = 'BBB';
  let rateDiscountPct = 0;
  let statusDescription = 'Perfil crediticio estándar con capacidad de servicio de deuda verificada.';

  if (score >= 800) {
    tier = 'AAA';
    rateDiscountPct = -2.5;
    statusDescription = 'Perfil Grado de Inversión Prime. Acceso prioritario a tasas preferenciales de banca corporativa.';
  } else if (score >= 750) {
    tier = 'AA';
    rateDiscountPct = -1.75;
    statusDescription = 'Excelente solvencia financiera y bajo apalancamiento relativo. Califica para líneas de capital preferentes.';
  } else if (score >= 700) {
    tier = 'A';
    rateDiscountPct = -1.0;
    statusDescription = 'Solvencia financiera sólida. Capacidad de endeudamiento saludable.';
  } else if (score >= 650) {
    tier = 'BBB';
    rateDiscountPct = 0.0;
    statusDescription = 'Riesgo moderado aceptable. Condiciones de mercado estándar.';
  } else if (score >= 600) {
    tier = 'BB';
    rateDiscountPct = 1.5;
    statusDescription = 'Apalancamiento elevado. Se requieren garantías reales con aforo del 80% para aprobación.';
  } else if (score >= 550) {
    tier = 'B';
    rateDiscountPct = 3.0;
    statusDescription = 'Perfil de riesgo sensible. Requiere comité de crédito y sobretasa preventiva.';
  } else if (score >= 450) {
    tier = 'C';
    rateDiscountPct = 5.0;
    statusDescription = 'Alto riesgo crediticio. Capacidad de pago bajo estrés de liquidez.';
  } else {
    tier = 'D';
    rateDiscountPct = 7.5;
    statusDescription = 'Perfil no sujeto a crédito limpio. Operaciones estrictamente pignoradas al 120%.';
  }

  return {
    score,
    tier,
    dtiRatioPct,
    paymentHistoryScore,
    debtExposureScore,
    collateralSolvencyScore,
    businessTenureScore,
    rateDiscountPct,
    statusDescription
  };
}

/**
 * Genera el Dossier de Auditoría Crediticia (Due Diligence) para el rol de Banquero
 */
export function generateDueDiligenceDossier(
  state: DailySimulationState,
  requestedAmountHNL: number,
  bankId: CommercialBankId,
  requestedTermMonths: number = 36,
  loanPurpose: string = 'Expansión de Capacidad Operativa y Flujo de Trabajo',
  collateralId?: string
): IDueDiligenceDossier {
  const opexReport = calculateOpexCapexBreakdown(state);
  const scoreReport = calculateBusinessCreditScore(state);

  const receiptsSales = (state.dailyReceipts || []).reduce((sum, r) => sum + (r.totalHNL ?? 0), 0) * 30;
  const grossMonthlySalesHNL = state.monthlySalesAccumulated > 0 ? state.monthlySalesAccumulated : (receiptsSales > 0 ? receiptsSales : 350000);
  const netOperatingCashFlowHNL = Math.max(0, grossMonthlySalesHNL - opexReport.totalMonthlyOpexHNL);

  const bankRel = state.commercialBanks[bankId];
  const existingDebtMonthlyHNL = (bankRel?.activeLoan?.monthlyPayment || 0);
  const liquidReservesHNL = (state.storeBankBalance || 0) + (state.storeCash || 0);

  const collateral = collateralId ? (state.realEstateCollaterals || []).find(c => c.id === collateralId) : undefined;

  let riskClassification: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO' = 'MODERADO';
  let recommendedDecision: 'APROBAR' | 'CONDICIONAR_GARANTIA' | 'RECHAZAR' = 'APROBAR';

  if (scoreReport.score >= 720 && netOperatingCashFlowHNL > (requestedAmountHNL / requestedTermMonths) * 1.5) {
    riskClassification = 'BAJO';
    recommendedDecision = 'APROBAR';
  } else if (scoreReport.score >= 620 || (collateral && collateral.appraisalValueHNL >= requestedAmountHNL * 0.8)) {
    riskClassification = 'MODERADO';
    recommendedDecision = collateral ? 'APROBAR' : 'CONDICIONAR_GARANTIA';
  } else if (scoreReport.score >= 500) {
    riskClassification = 'ALTO';
    recommendedDecision = 'CONDICIONAR_GARANTIA';
  } else {
    riskClassification = 'CRITICO';
    recommendedDecision = 'RECHAZAR';
  }

  const analystSummary = riskClassification === 'BAJO'
    ? `Solicitante solvente con Credit Score ${scoreReport.score} (${scoreReport.tier}) y DTI del ${scoreReport.dtiRatioPct}%. El flujo operativo mensual (L ${netOperatingCashFlowHNL.toLocaleString()}) cubre holgadamente la cuota estimada.`
    : riskClassification === 'MODERADO'
    ? `Riesgo moderado. El solicitante genera flujo operativo, pero se recomienda respaldo de garantía real o ajuste de plazo.`
    : `Riesgo elevado. DTI elevado o bajo flujo de caja libre. Aprobación no aconsejada sin colateral hipotecario de primer orden.`;

  return {
    dossierId: `DOSSIER-${Date.now().toString().slice(-6)}`,
    companyName: state.storeName,
    sectorName: state.retailSector === 'constructora' ? 'Sector Construcción e Infraestructura' : 'Comercio Minorista & Retail',
    creditScore: scoreReport.score,
    scoreTier: scoreReport.tier,
    dtiRatioPct: scoreReport.dtiRatioPct,
    grossMonthlySalesHNL,
    monthlyOpexHNL: opexReport.totalMonthlyOpexHNL,
    netOperatingCashFlowHNL,
    liquidReservesHNL,
    existingDebtMonthlyHNL,
    requestedAmountHNL,
    requestedTermMonths,
    loanPurpose,
    collateralTitle: collateral?.title,
    collateralAppraisalHNL: collateral?.appraisalValueHNL,
    riskClassification,
    recommendedDecision,
    analystSummary
  };
}

/**
 * Ejecución Judicial de Garantía Hipotecaria / Prendaria (Embargo Bancario)
 * Liquida el bien colateral en subasta al 60% de su valor comercial para restituir liquidez al banco.
 */
export function executeForeclosureAndLiquidation(
  state: DailySimulationState,
  bankId: CommercialBankId,
  collateralId: string,
  debtOutstandingHNL: number
): {
  updatedState: DailySimulationState;
  foreclosure: IForeclosureResult;
  success: boolean;
  message: string;
} {
  const collaterals = state.realEstateCollaterals || [];
  const colIndex = collaterals.findIndex(c => c.id === collateralId);

  if (colIndex === -1) {
    throw new Error('La garantía especificada para el embargo no existe en el registro patrimonial.');
  }

  const targetCol = collaterals[colIndex];
  const originalAppraisalHNL = targetCol.appraisalValueHNL || targetCol.acquisitionValueHNL || 1000000;
  
  // Regla Bancaria: Liquidación forzosa en subasta al 60% del valor de avalúo
  const liquidationDiscountPct = 60.0;
  const liquidatedValueHNL = Math.round(originalAppraisalHNL * (liquidationDiscountPct / 100));

  const recoveredFundsHNL = Math.min(debtOutstandingHNL, liquidatedValueHNL);
  const surplusReturnedToDebtorHNL = Math.max(0, liquidatedValueHNL - debtOutstandingHNL);
  const unrecoveredDeficitHNL = Math.max(0, debtOutstandingHNL - liquidatedValueHNL);

  const executionVoucherId = `VOUCHER-EMBARGO-${Date.now().toString().slice(-6)}`;
  const dateStr = `Día ${state.currentDay}, Mes ${state.currentMonth}, Año ${state.currentYear || 2026}`;

  const foreclosure: IForeclosureResult = {
    loanId: `LOAN-EXEC-${Date.now().toString().slice(-4)}`,
    debtorName: state.storeName,
    bankId,
    collateralId: targetCol.id,
    collateralTitle: targetCol.title,
    originalAppraisalHNL,
    liquidationDiscountPct,
    liquidatedValueHNL,
    debtOutstandingHNL,
    recoveredFundsHNL,
    surplusReturnedToDebtorHNL,
    unrecoveredDeficitHNL,
    dateStr,
    executionVoucherId
  };

  // 1. Marcar garantía como ejecutada/confiscada
  const updatedCollaterals = collaterals.map(c => {
    if (c.id === collateralId) {
      return {
        ...c,
        status: 'ejecutado' as any,
        isPledged: false,
        isLockedForSale: true,
        situationNotes: `BIEN EMBARGADO Y SUBASTADO: Liquidado judicialmente al 60% (L ${liquidatedValueHNL.toLocaleString()}) por el banco para resarcimiento de deuda.`
      };
    }
    return c;
  });

  // 2. Acreditar fondos recuperados a la bóveda del Banquero
  const newVaultCash = state.bankerVaultCash + recoveredFundsHNL;

  // 3. Devolver excedente al empresario si la liquidación superó la deuda
  const newStoreBank = surplusReturnedToDebtorHNL > 0 ? (state.storeBankBalance || 0) + surplusReturnedToDebtorHNL : state.storeBankBalance;

  // 4. Cancelar el préstamo del banco si existía
  const bankRel = state.commercialBanks[bankId];
  const updatedCommercialBanks = {
    ...state.commercialBanks,
    [bankId]: {
      ...bankRel,
      activeLoan: undefined // Deuda saldada vía dación en pago forzosa
    }
  };

  // 5. Emitir comprobante oficial
  const voucher: TransactionVoucher = {
    id: `vch-embargo-${Date.now()}`,
    voucherNumber: executionVoucherId,
    operationType: 'embargo_garantia_judicial',
    title: `Ejecución y Remate de Garantía: ${targetCol.title}`,
    timestamp: dateStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    grossAmountHNL: liquidatedValueHNL,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: recoveredFundsHNL,
    priorBalanceHNL: debtOutstandingHNL,
    newBalanceHNL: unrecoveredDeficitHNL,
    referenceCode: `SENTENCIA-JUZGADO-${Date.now().toString().slice(-4)}`,
    authStamp: `CNBS-EMBARGO-${Date.now().toString().slice(-6)}`,
    notes: `Remate judicial ejecutado. Avalúo original: L ${originalAppraisalHNL.toLocaleString()}. Liquidación al 60%: L ${liquidatedValueHNL.toLocaleString()}. Deuda cancelada: L ${recoveredFundsHNL.toLocaleString()}.${surplusReturnedToDebtorHNL > 0 ? ` Excedente devuelto: L ${surplusReturnedToDebtorHNL.toLocaleString()}.` : ''}`,
    disclaimer: 'Comprobante Judicial de Remate Forzoso y Liquidación de Cartera en Mora'
  };

  const updatedState: DailySimulationState = {
    ...state,
    bankerVaultCash: newVaultCash,
    storeBankBalance: newStoreBank,
    realEstateCollaterals: updatedCollaterals,
    commercialBanks: updatedCommercialBanks,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])]
  };

  return {
    updatedState,
    foreclosure,
    success: true,
    message: `¡EJECUCIÓN JUDICIAL COMPLETADA! Se confiscó y subastó "${targetCol.title}" al 60% de tasación (L ${liquidatedValueHNL.toLocaleString()}). Se recuperaron L ${recoveredFundsHNL.toLocaleString()} para la bóveda bancaria.`
  };
}

/**
 * Crea y formaliza una propuesta de Smart Contract de Financiamiento
 */
export function createSmartLoanContract(
  state: DailySimulationState,
  params: {
    bankId: CommercialBankId;
    principalAmountHNL: number;
    interestRateAnnual: number;
    termMonths: number;
    gracePeriodMonths: number;
    collateralId?: string;
  }
): ISmartLoanContract {
  const bankName = COMMERCIAL_BANKS_PROFILES[params.bankId]?.name || params.bankId.toUpperCase();
  const collateral = params.collateralId ? (state.realEstateCollaterals || []).find(c => c.id === params.collateralId) : undefined;

  const monthlyRate = params.interestRateAnnual / 100 / 12;
  const amortizationTerm = Math.max(1, params.termMonths - params.gracePeriodMonths);

  // Cuota mensual regular post periodo de gracia
  const monthlyPaymentHNL = monthlyRate > 0
    ? Math.round((params.principalAmountHNL * (monthlyRate * Math.pow(1 + monthlyRate, amortizationTerm))) / (Math.pow(1 + monthlyRate, amortizationTerm) - 1))
    : Math.round(params.principalAmountHNL / amortizationTerm);

  // Cuota reducida durante periodo de gracia (solo paga intereses corrientes)
  const monthlyInterestDuringGraceHNL = Math.round(params.principalAmountHNL * monthlyRate);

  const contractId = `CTR-SMART-${Date.now().toString().slice(-6)}`;

  return {
    contractId,
    bankId: params.bankId,
    bankName,
    borrowerName: state.storeName,
    productType: 'capital_trabajo',
    productName: 'Crédito Corporativo Estructurado (Smart Contract)',
    principalAmountHNL: params.principalAmountHNL,
    interestRateAnnual: params.interestRateAnnual,
    termMonths: params.termMonths,
    gracePeriodMonths: params.gracePeriodMonths,
    collateralId: collateral?.id,
    collateralTitle: collateral?.title,
    collateralAppraisalHNL: collateral?.appraisalValueHNL,
    collateralCoveragePct: collateral ? (collateral.ltvAcceptedPct || 80) : 0,
    openingFeePct: 1.5,
    monthlyPaymentHNL,
    monthlyInterestDuringGraceHNL,
    status: 'NEGOCIANDO',
    createdDay: state.currentDay,
    createdMonth: state.currentMonth,
    createdYear: state.currentYear || 2026,
    notes: `Contrato inteligente bilateral. Periodo de gracia: ${params.gracePeriodMonths} mes(es) al L ${monthlyInterestDuringGraceHNL.toLocaleString()}/mes. Cuota posterior: L ${monthlyPaymentHNL.toLocaleString()}/mes.`
  };
}

/**
 * Ejecuta y firma bilateralmente el Smart Contract de crédito, desembolsando los fondos
 */
export function signSmartLoanContract(
  state: DailySimulationState,
  contract: ISmartLoanContract
): {
  updatedState: DailySimulationState;
  success: boolean;
  message: string;
} {
  const bankRel = state.commercialBanks[contract.bankId];
  if (!bankRel) {
    return { updatedState: state, success: false, message: 'Entidad bancaria no válida para el contrato.' };
  }

  const openingFeeHNL = Math.round(contract.principalAmountHNL * (contract.openingFeePct / 100));
  const netDisbursedHNL = contract.principalAmountHNL - openingFeeHNL;

  // Actualizar colateral pignorado si aplica
  let updatedCollaterals = state.realEstateCollaterals || [];
  if (contract.collateralId) {
    updatedCollaterals = updatedCollaterals.map(c => {
      if (c.id === contract.collateralId) {
        return {
          ...c,
          isPledged: true,
          pledgedAmountTotal: (c.pledgedAmountTotal || 0) + contract.principalAmountHNL
        };
      }
      return c;
    });
  }

  // Crear crédito activo en el banco
  const activeLoan = {
    loanId: contract.contractId,
    loanType: contract.productType,
    loanName: contract.productName,
    principalAmount: contract.principalAmountHNL,
    balanceRemaining: contract.principalAmountHNL,
    interestRateAnnual: contract.interestRateAnnual,
    termMonths: contract.termMonths,
    monthsPaid: 0,
    monthlyPayment: contract.monthlyPaymentHNL,
    disbursementDay: state.currentDay,
    openingFeeHNL,
    collateralPledged: contract.collateralTitle || 'Garantía Fiduciaria',
    gracePeriodRemainingMonths: contract.gracePeriodMonths
  };

  const updatedBankRel = {
    ...bankRel,
    activeLoan
  };

  const updatedBanks = {
    ...state.commercialBanks,
    [contract.bankId]: updatedBankRel
  };

  // Acreditar neto desembolsado a la cuenta corriente del empresario
  const newStoreBank = (state.storeBankBalance || 0) + netDisbursedHNL;

  // Registrar voucher oficial
  const voucherNum = `VOUCHER-SMART-${Date.now().toString().slice(-6)}`;
  const dateStr = `Día ${state.currentDay}, Mes ${state.currentMonth}, Año ${state.currentYear || 2026}`;

  const voucher: TransactionVoucher = {
    id: `vch-smart-${Date.now()}`,
    voucherNumber: voucherNum,
    operationType: 'desembolso_prestamo',
    title: `Desembolso Smart Contract: ${contract.bankName}`,
    timestamp: dateStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    grossAmountHNL: contract.principalAmountHNL,
    deductionsHNL: openingFeeHNL,
    netDisbursedOrPaidHNL: netDisbursedHNL,
    priorBalanceHNL: state.storeBankBalance || 0,
    newBalanceHNL: newStoreBank,
    referenceCode: contract.contractId,
    authStamp: `SMART-SIG-${Date.now().toString().slice(-4)}`,
    notes: `Contrato firmado bilateralmente. Tasa: ${contract.interestRateAnnual}% anual. Periodo de gracia: ${contract.gracePeriodMonths} meses. Cuota mensual pactada: L ${contract.monthlyPaymentHNL.toLocaleString()}.`,
    disclaimer: 'Comprobante Oficial de Desembolso Bajo Contrato Inteligente Bilateral'
  };

  // Correo de confirmación
  const emailNotif: SimulatedEmail = {
    id: `em-smart-${Date.now()}`,
    dateDay: state.currentDay,
    dateMonth: state.currentMonth,
    dateYear: state.currentYear || 2026,
    sender: `${contract.bankName} - Mesa de Crédito`,
    senderEmail: `creditos@${contract.bankId}.hn`,
    recipient: state.storeName,
    recipientEmail: 'gerencia@empresa.hn',
    subject: `📜 Smart Contract Formalizado: Desembolso de L ${netDisbursedHNL.toLocaleString()}`,
    category: 'bancos_financiamiento',
    snippet: `Se ha firmado exitosamente el contrato de crédito ${contract.contractId}.`,
    body: `Estimada Gerencia:\n\nHemos completado la suscripción bilateral del Smart Contract ${contract.contractId}.\n\nCondiciones pactadas:\n- Monto aprobado: L ${contract.principalAmountHNL.toLocaleString()}\n- Tasa de interés pactada: ${contract.interestRateAnnual}% anual\n- Periodo de gracia: ${contract.gracePeriodMonths} meses\n- Cuota mensual: L ${contract.monthlyPaymentHNL.toLocaleString()}\n- Deducción por comisión de apertura (1.5%): -L ${openingFeeHNL.toLocaleString()}\n- Neto acreditado a su cuenta corriente: L ${netDisbursedHNL.toLocaleString()}.\n\n¡Los fondos ya están disponibles para su uso inmediato!`,
    isRead: false,
    isStarred: true,
    status: 'informativo'
  };

  const updatedContracts: ISmartLoanContract[] = [
    { ...contract, status: 'FIRMADO' },
    ...(state.smartContracts || []).filter(c => c.contractId !== contract.contractId)
  ];

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: newStoreBank,
    commercialBanks: updatedBanks,
    realEstateCollaterals: updatedCollaterals,
    smartContracts: updatedContracts,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
    simulatedEmails: [emailNotif, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState,
    success: true,
    message: `¡CONTRATO INTELIGENTE FIRMADO Y DESEMBOLSADO! Se acreditaron L ${netDisbursedHNL.toLocaleString()} a la cuenta corriente tras deducir la comisión de apertura.`
  };
}

/**
 * Avance mensual del ciclo macroeconómico por el Banco Central
 * - Ajusta la Tasa Prime entre 2% y 15% según inflación y ciclo.
 * - Simula transiciones entre Expansión, Estancamiento, Recesión y Crisis.
 * - Monitorea la posición de encaje legal obligatorio (20%) y liquidez del Banquero.
 * - Inyecta rescate automático a tasa punitiva (Prime + 10%) si hay quiebra técnica de liquidez.
 */
export function advanceMacroEconomyMonth(state: DailySimulationState): DailySimulationState {
  const currentMacro = state.macroEconomyState || createInitialMacroEconomyState();
  let cycleState = currentMacro.cycleState;
  let elapsed = currentMacro.currentCycleMonthElapsed + 1;
  let duration = currentMacro.cycleDurationMonths;

  // 1. Transición de Ciclo Económico
  if (elapsed >= duration) {
    elapsed = 1;
    if (cycleState === 'EXPANSION') {
      cycleState = Math.random() > 0.4 ? 'ESTANCAMIENTO' : 'EXPANSION';
      duration = Math.floor(4 + Math.random() * 4);
    } else if (cycleState === 'ESTANCAMIENTO') {
      cycleState = Math.random() > 0.5 ? 'RECESION' : 'EXPANSION';
      duration = Math.floor(3 + Math.random() * 4);
    } else if (cycleState === 'RECESION') {
      cycleState = Math.random() > 0.6 ? 'CRISIS' : 'ESTANCAMIENTO';
      duration = Math.floor(3 + Math.random() * 3);
    } else if (cycleState === 'CRISIS') {
      cycleState = 'RECESION';
      duration = Math.floor(3 + Math.random() * 3);
    }
  }

  // 2. Dinámica de Tasa Prime (TPM) e Inflación según el ciclo
  let inflationRate = currentMacro.inflationRatePct;
  let primeRate = currentMacro.primeRatePct;

  if (cycleState === 'EXPANSION') {
    inflationRate = Math.min(9.5, Number((inflationRate + 0.35).toFixed(2)));
    // El Banco Central sube la tasa para enfriar presiones inflacionarias
    primeRate = Math.min(15.0, Number((primeRate + 0.25).toFixed(2)));
  } else if (cycleState === 'ESTANCAMIENTO') {
    inflationRate = Math.max(3.0, Number((inflationRate - 0.15).toFixed(2)));
    primeRate = Math.max(4.0, Number((primeRate - 0.10).toFixed(2)));
  } else if (cycleState === 'RECESION') {
    inflationRate = Math.max(1.5, Number((inflationRate - 0.40).toFixed(2)));
    // El Banco Central baja tasas para estimular la inversión y consumo
    primeRate = Math.max(2.5, Number((primeRate - 0.50).toFixed(2)));
  } else if (cycleState === 'CRISIS') {
    inflationRate = Math.max(1.0, Number((inflationRate - 0.60).toFixed(2)));
    primeRate = 2.0; // Tasa mínima de estímulo extremo de emergencia
  }

  const bailoutRate = Number((primeRate + 10.0).toFixed(2));

  // 3. Shock de mercado aleatorio periódico
  let marketShock = currentMacro.marketShockEvent;
  if (marketShock) {
    const remainingDays = marketShock.activeDaysRemaining - 30;
    if (remainingDays <= 0) {
      marketShock = null;
    } else {
      marketShock = { ...marketShock, activeDaysRemaining: remainingDays };
    }
  } else if (Math.random() < 0.25) {
    // Generar nuevo shock de mercado
    const shocks = [
      {
        title: 'Shock Petrolero & Alza de Fletes Internacionales',
        description: 'El precio del barril sube en los mercados globales, encareciendo combustibles, materiales y OPEX en un 20%.',
        costImpactPct: 20,
        salesImpactPct: -5,
        depositWithdrawalRiskPct: 15,
        activeDaysRemaining: 60
      },
      {
        title: 'Contracción del Consumo por Incertidumbre Financiera',
        description: 'Los hogares reducen compras no esenciales. Las ventas del comercio disminuyen un 25% y se incrementa el retiro de ahorros.',
        costImpactPct: 0,
        salesImpactPct: -25,
        depositWithdrawalRiskPct: 30,
        activeDaysRemaining: 45
      },
      {
        title: 'Auge Exportador & Dinamismo Económico',
        description: 'Incremento en remesas y exportaciones agroindustriales reactivan el mercado interno, aumentando ventas en un 20%.',
        costImpactPct: 5,
        salesImpactPct: 20,
        depositWithdrawalRiskPct: -15,
        activeDaysRemaining: 60
      }
    ];
    marketShock = shocks[Math.floor(Math.random() * shocks.length)];
  }

  // 4. Mecánica del Banquero: Verificación de Encaje Legal (20%) y Liquidez
  const requiredReserve = Math.round(state.bankerTotalDeposits * (currentMacro.legalReservePct / 100));
  let vaultCash = state.bankerVaultCash;
  let activeBailoutDebt = currentMacro.activeBailoutDebtHNL;
  let simulatedEmails = state.simulatedEmails || [];

  // Pánico bancario (Bank Run) en Crisis o Recesión
  let depositLoss = 0;
  if (cycleState === 'CRISIS') {
    depositLoss = Math.round(state.bankerTotalDeposits * 0.15); // Retiro masivo del 15%
  } else if (cycleState === 'RECESION') {
    depositLoss = Math.round(state.bankerTotalDeposits * 0.05); // Retiro del 5%
  }
  if (marketShock && marketShock.depositWithdrawalRiskPct > 0) {
    depositLoss += Math.round(state.bankerTotalDeposits * (marketShock.depositWithdrawalRiskPct / 100 * 0.1));
  }

  const newTotalDeposits = Math.max(100000, state.bankerTotalDeposits - depositLoss);
  vaultCash -= depositLoss;

  // Si la bóveda no tiene suficiente para cubrir el encaje o entra en saldo negativo:
  // INYECCIÓN DE CAPITAL DE RESCATE AUTOMÁTICA DEL BANCO CENTRAL A TASA PUNITIVA
  if (vaultCash < 0 || vaultCash < (requiredReserve * 0.25)) {
    const bailoutAmount = Math.max(500000, Math.abs(vaultCash) + Math.round(requiredReserve * 0.5));
    vaultCash += bailoutAmount;
    activeBailoutDebt += bailoutAmount;

    // Interés punitivo cargado mensualmente
    const punitiveInterest = Math.round(activeBailoutDebt * (bailoutRate / 100 / 12));
    vaultCash -= punitiveInterest;

    const emailBailout: SimulatedEmail = {
      id: `em-bailout-${Date.now()}`,
      dateDay: state.currentDay,
      dateMonth: state.currentMonth,
      dateYear: state.currentYear || 2026,
      sender: 'Banco Central - Ventanilla de Descuento de Liquidez',
      senderEmail: 'regulacion@bch.hn',
      recipient: state.storeName,
      recipientEmail: 'presidencia@banco.hn',
      subject: `🚨 ALERTA: Rescate de Liquidez de Emergencia Activado (+L ${bailoutAmount.toLocaleString()})`,
      category: 'sistema_avisos',
      snippet: `Inyección de capital punitivo activada a tasa punitiva del ${bailoutRate}% anual.`,
      body: `Estimada Dirección General:\n\nAnte el estrés severo de liquidez e incumplimiento del encaje legal obligatorio (20%), el Banco Central ha procedido a inyectar un Crédito de Salvamento de Emergencia por valor de L ${bailoutAmount.toLocaleString()}.\n\nCondiciones Punitivas:\n- Tasa de Rescate: ${bailoutRate}% anual (Tasa Prime ${primeRate}% + 10.0% de penalización).\n- Deuda de rescate acumulada: L ${activeBailoutDebt.toLocaleString()}.\n- Cargo por intereses de liquidez de este mes: -L ${punitiveInterest.toLocaleString()}.\n\nSe le instruye a restringir la originación de nuevos créditos de alto riesgo y restablecer las reservas de bóveda a la brevedad.`,
      isRead: false,
      isStarred: true,
      status: 'urgente'
    };
    simulatedEmails = [emailBailout, ...simulatedEmails];
  }

  // 5. Historial de tasas
  const newHistoryEntry = {
    day: state.currentDay,
    month: state.currentMonth,
    year: state.currentYear || 2026,
    primeRatePct: primeRate,
    inflationRatePct: inflationRate,
    cycleState
  };
  const updatedHistory = [newHistoryEntry, ...(currentMacro.historicalRates || []).slice(0, 11)];

  const updatedMacro: IMacroEconomyState = {
    ...currentMacro,
    cycleState,
    cycleDurationMonths: duration,
    currentCycleMonthElapsed: elapsed,
    primeRatePct: primeRate,
    inflationRatePct: inflationRate,
    centralBankBailoutRatePct: bailoutRate,
    activeBailoutDebtHNL: activeBailoutDebt,
    marketShockEvent: marketShock,
    historicalRates: updatedHistory
  };

  return {
    ...state,
    bankerVaultCash: vaultCash,
    bankerTotalDeposits: newTotalDeposits,
    bankerBchReserve: requiredReserve,
    macroEconomyState: updatedMacro,
    simulatedEmails
  };
}
