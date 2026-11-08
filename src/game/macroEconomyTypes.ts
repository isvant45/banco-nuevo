// ============================================================================
// TIPOS E INTERFACES DEL MOTOR MACROECONÓMICO, BANCO CENTRAL Y SMART CONTRACTS
// ============================================================================

import { CommercialBankId, CommercialLoanType } from './retroSimTypes';

export type MacroCycleState = 'EXPANSION' | 'ESTANCAMIENTO' | 'RECESION' | 'CRISIS';

export interface IMacroRateHistoryEntry {
  day: number;
  month: number;
  year: number;
  primeRatePct: number;
  inflationRatePct: number;
  cycleState: MacroCycleState;
}

export interface IMacroEconomyState {
  cycleState: MacroCycleState;
  cycleDurationMonths: number;
  currentCycleMonthElapsed: number;
  primeRatePct: number; // Tasa de Política Monetaria (TPM) / Referencia (2.0% - 15.0%)
  inflationRatePct: number; // Inflación interanual (ej: 4.5%)
  legalReservePct: number; // Encaje legal obligatorio del Banco Central (20.0%)
  centralBankBailoutRatePct: number; // Tasa punitiva de rescate (Prime + 10.0%)
  activeBailoutDebtHNL: number; // Deuda por inyección de liquidez de rescate
  centralBankReservesUSD: number; // Reservas internacionales
  marketShockEvent: {
    title: string;
    description: string;
    costImpactPct: number; // Variación en insumos/OPEX (ej: +20%)
    salesImpactPct: number; // Variación en demanda (ej: -30%)
    depositWithdrawalRiskPct: number; // Aumento de retiro de ahorristas (ej: +35%)
    activeDaysRemaining: number;
  } | null;
  historicalRates: IMacroRateHistoryEntry[];
}

export interface IOpexCapexBreakdown {
  monthlyWagesHNL: number;
  monthlyRentHNL: number;
  monthlyUtilitiesHNL: number;
  totalMonthlyOpexHNL: number;
  machineryDepreciationMonthlyHNL: number;
  branchOperatingCostMonthlyHNL: number;
  accumulatedDepreciationHNL: number;
  totalCapitalExpenditureHNL: number; // CAPEX total invertido
  daysOfCashRunway: number; // Días que cubren las reservas de efectivo actuales
  isLiquidityCritical: boolean; // Alerta roja si reservas < 15 días de OPEX
}

export interface IBusinessCreditScoreReport {
  score: number; // 300 a 850
  tier: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C' | 'D';
  dtiRatioPct: number; // Ratio Deuda / Ingreso Mensual (Debt to Income)
  paymentHistoryScore: number; // 0 - 100
  debtExposureScore: number; // 0 - 100
  collateralSolvencyScore: number; // 0 - 100
  businessTenureScore: number; // 0 - 100
  rateDiscountPct: number; // Descuento o recargo sobre tasa estándar (ej: -2.5% para AAA)
  statusDescription: string;
}

export interface ISmartLoanContract {
  contractId: string;
  bankId: CommercialBankId;
  bankName: string;
  borrowerName: string;
  productType: CommercialLoanType;
  productName: string;
  principalAmountHNL: number;
  interestRateAnnual: number;
  termMonths: number;
  gracePeriodMonths: number; // Meses de solo pago de intereses (sin amortizar capital)
  collateralId?: string;
  collateralTitle?: string;
  collateralAppraisalHNL?: number;
  collateralCoveragePct?: number; // Ej: 80%
  openingFeePct: number;
  monthlyPaymentHNL: number;
  monthlyInterestDuringGraceHNL: number;
  status: 'NEGOCIANDO' | 'FIRMADO' | 'RECHAZADO' | 'CANCELADO';
  createdDay: number;
  createdMonth: number;
  createdYear: number;
  notes: string;
}

export interface IDueDiligenceDossier {
  dossierId: string;
  companyName: string;
  sectorName: string;
  creditScore: number;
  scoreTier: string;
  dtiRatioPct: number;
  grossMonthlySalesHNL: number;
  monthlyOpexHNL: number;
  netOperatingCashFlowHNL: number;
  liquidReservesHNL: number;
  existingDebtMonthlyHNL: number;
  requestedAmountHNL: number;
  requestedTermMonths: number;
  loanPurpose: string;
  collateralTitle?: string;
  collateralAppraisalHNL?: number;
  riskClassification: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO';
  recommendedDecision: 'APROBAR' | 'CONDICIONAR_GARANTIA' | 'RECHAZAR';
  analystSummary: string;
}

export interface IForeclosureResult {
  loanId: string;
  debtorName: string;
  bankId: CommercialBankId;
  collateralId: string;
  collateralTitle: string;
  originalAppraisalHNL: number;
  liquidationDiscountPct: number; // 60% del valor de tasación en remate forzoso
  liquidatedValueHNL: number; // 60% del avalúo
  debtOutstandingHNL: number;
  recoveredFundsHNL: number; // Depositado en bóveda del banco
  surplusReturnedToDebtorHNL: number; // Si el remate supera la deuda
  unrecoveredDeficitHNL: number; // Pérdida si la deuda supera el remate
  dateStr: string;
  executionVoucherId: string;
}
