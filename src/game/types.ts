/**
 * Tipos de datos para el simulador financiero y bancario Áureo Bank
 * Normativa: Banco Central de Honduras (BCH) y Comisión Nacional de Bancos y Seguros (CNBS)
 */

export type BankingDivisionId = 
  | 'personas' 
  | 'premier' 
  | 'privada' 
  | 'pyme' 
  | 'corporativa' 
  | 'internacional';

export type CompetitorId = 'atlantida' | 'ficohsa' | 'bac' | 'banpais' | 'occidente';

export interface CompetitorBank {
  id: CompetitorId;
  name: string;
  shortName: string;
  brandColor: string;
  marketShare: number; // Porcentaje de cartera nacional
  assets: number; // Lempiras
  depositRateAvg: number; // % anual
  lendingRateAvg: number; // % anual
  reputation: number; // 0 a 100
  specialty: string;
}

export interface BCHIndicators {
  month: number;
  year: number;
  tpmRate: number; // Tasa de Política Monetaria (%)
  interannualInflation: number; // Inflación (%)
  reserveRequirementPct: number; // Encaje legal obligatorio (ej. 12%)
  exchangeRateHNLtoUSD: number; // Lempiras por Dólar (ej. 24.85)
  monthlyFXAuctionVolumeUSD: number; // Volumen subasta BCH
  economicSentiment: 'Crecimiento Sólido' | 'Estable' | 'Presión Inflacionaria' | 'Desaceleración' | 'Crisis de Liquidez';
  lastBulletinTitle: string;
  lastBulletinText: string;
}

export interface OtherBankProduct {
  id: string;
  bankName: 'Banco Ficohsa' | 'Banco Atlántida' | 'BAC Credomatic' | 'Banpaís' | 'Banco de Occidente';
  productType: 'Préstamo Personal' | 'Préstamo Hipotecario' | 'Tarjeta de Crédito' | 'Cuenta de Depósitos / Ahorros';
  balanceHNL: number;
  interestRatePct: number; // Tasa que le cobran o le pagan en el rival
  details: string;
}

export interface IndividualClient {
  id: string;
  cif: string;
  name: string;
  division: BankingDivisionId;
  city: string;
  notes?: string; // Personalización y observaciones ejecutivas
  joinedMonth: number;
  // Cuentas de Depósito
  accountType: 'Cuenta de Ahorro Rendimiento' | 'Cuenta Corriente / Cheques' | 'Cuenta DPF Plazo Fijo' | 'Cuenta Offshore Multidivisa';
  accountBalanceHNL: number;
  // Tarjetas de Crédito
  hasCreditCard: boolean;
  creditCardBrand: 'Visa Clásica' | 'Mastercard Oro' | 'Mastercard Platinum' | 'Visa Infinite / Black' | 'Visa Empresarial' | 'Mastercard Corporativa' | 'Sin Tarjeta';
  creditCardLimitHNL: number;
  creditCardBalanceHNL: number;
  // Préstamos y Financiamiento
  hasLoan: boolean;
  loanType: string;
  loanPrincipalHNL: number;
  loanBalanceHNL: number;
  loanMonthlyPaymentHNL: number;
  loanInterestRateAnnual: number;
  loanMonthsRemaining: number;
  // Cláusula de Pago Garantizado (el cliente nunca pierde un pago)
  guaranteedPayment: boolean;
  // Cartera en Mora y Castigada (NPL)
  pastDueDays: number; // 0 = al día, 30, 60, 90, 180+
  pastDueAmountHNL: number;
  isRestructured?: boolean; // Deuda renegociada
  isSoldToRival?: boolean; // Vendido a banco competidor
  soldToBankName?: string;
  // Buró de Crédito CNBS / Equifax
  equifaxScore: number;
  cnbsCategory: 'I - Normal' | 'II - Especial' | 'III - Subnormal' | 'IV - Dudoso Recaudo' | 'V - Pérdida';
  // Fondo de Pensiones
  pensionFundEnrolled?: boolean;
  pensionFundProfile?: 'Conservador' | 'Moderado' | 'Crecimiento';
  pensionBalanceHNL?: number;
  // Actualización mensual de cuota y amortización obligatoria
  lastMonthlyAmortizationStatus?: 'al_dia' | 'aviso_previo_insuficiencia' | 'renegociado';
  lastAmortizationNotice?: string;
  lastQuotaDeductedHNL?: number;
  // Identificación Fiscal SAR y Cumplimiento AML / Prevención de Fraudes
  rtn?: string; // Registro Tributario Nacional (SAR)
  amlRiskScore?: number; // 0 - 100
  amlStatus?: 'normal' | 'bajo_monitoreo' | 'alerta_pitufeo' | 'congelado_judicial' | 'reportado_uif' | 'congelada_uif' | 'investigada_limpia';
  isFrozen?: boolean;
  frozenReason?: string;
  // Expediente 360°: Productos en la competencia para robo de cartera / atracción
  otherBankProducts: OtherBankProduct[];
}

export interface PensionFund {
  id: string;
  name: string;
  profile: 'Conservador' | 'Moderado' | 'Crecimiento';
  description: string;
  annualReturnMinPct: number;
  annualReturnMaxPct: number;
  currentAnnualReturnPct: number; // Modificable por el jugador
  managementFeePct: number; // Comisión fiduciaria cobrada por Áureo
  totalAUM_HNL: number; // Patrimonio total bajo administración
  affiliateCount: number;
}

export interface PosMerchant {
  id: string;
  merchantName: string;
  businessCategory: 'Supermercado & Abarrotería' | 'Restaurante & Café' | 'Ferretería & Construcción' | 'Farmacia & Salud' | 'Tienda Retail & Moda' | 'Taller & Repuestos';
  city: string;
  physicalPosCount: number;
  virtualPosCount: number;
  hasTapToPay: boolean;
  monthlySalesVolumeHNL: number;
  bankAccountBalanceHNL: number;
  transactionFeePct: number; // e.g. 2.2%
  creditEligible: boolean;
  hasCommercialLoan: boolean;
  commercialLoanAmount: number;
  hasBusinessCard: boolean;
  accountNumber?: string;
  division?: BankingDivisionId;
}

export interface BankDivisionConfig {
  id: BankingDivisionId;
  name: string;
  categoryTag: string;
  description: string;
  clientCount: number;
  totalDeposits: number; // Lempiras captados
  totalLoans: number; // Lempiras colocados
  avgDepositRate: number; // % tasa pasiva que paga Áureo
  avgLendingRate: number; // % tasa activa que cobra Áureo
  feeIncomeMonthly: number; // Ingresos por comisiones del mes
  delinquencyRate: number; // % de mora en esta cartera
  satisfactionScore: number; // 0 - 100
  activeAccountsCount: number;
  activeCardsCount: number;
  customDepositHolders?: number;
  customAvgDepositHNL?: number;
  customLoanBorrowers?: number;
  customAvgLoanHNL?: number;
  specificFeatures: {
    label: string;
    value: string;
    status: 'activo' | 'destacado' | 'disponible';
  }[];
}

export interface CreditApplication {
  id: string;
  applicantName: string;
  division: BankingDivisionId;
  productType: 'Préstamo Personal' | 'Préstamo de Vivienda' | 'Préstamo Vehículo' | 'Capital de Trabajo PYME' | 'Línea Revolvente PYME' | 'Deducción por Planilla' | 'Préstamo Sindicado Corp' | 'Factoring Comercial';
  requestedAmount: number; // Lempiras
  termMonths: number;
  proposedRate: number;
  monthlyIncome: number;
  monthlyObligations: number;
  calculatedDTI: number; // Cuota total / Ingreso (%)
  cnbsCategory: 'I - Normal' | 'II - Especial' | 'III - Subnormal' | 'IV - Dudoso Recaudo' | 'V - Pérdida';
  equifaxScore: number; // 300 - 999
  collateralType: 'Sin Garantía' | 'Garantía Solidaria' | 'Prenda Vehicular' | 'Hipoteca Inmobiliaria' | 'Retención Salarial' | 'Cesión de Facturas Aceptadas';
  collateralValue: number;
  location: string;
  riskVerdict: 'Bajo Riesgo' | 'Riesgo Moderado' | 'Alto Riesgo';
  reasonText: string;
  // Autonomía del Oficial de Crédito vs Comité Directivo (L. 21M+)
  officerNote?: string; // Análisis y dictamen técnico del oficial
  officerRecommendation?: 'Favorable (Aprobación Sugerida)' | 'Desfavorable (Riesgo Excesivo)' | 'Condicionado a Aval';
  officerCanAutoApprove?: boolean; // True si monto <= 20,000,000 HNL
  requiresExecutiveBoardApproval?: boolean; // True si monto >= 21,000,000 HNL
  officerDecisionStatus?: 'Pendiente' | 'Aprobado Automático Oficial' | 'Rechazado Oficial' | 'Enviado a Comité';
}

export interface ClearingHouseStats {
  achIncomingTransfers: number;
  achOutgoingTransfers: number;
  achFeePerTransfer: number; // Lempiras cobrados al cliente (ej. L. 20)
  achNetClearingPosition: number; // Saldo neto ante BCH (+/- Lempiras)
  interbankChecksProcessed: number;
  checkRejectionRate: number; // %
  clearingFeeIncome: number; // Lempiras acumulados mes
}

export interface CorporatePayrollAgreement {
  id: string;
  companyName: string;
  industry: string;
  employeeCount: number;
  monthlyPayrollVolume: number; // Lempiras totales de salarios
  feePerEmployee: number; // Comisión pagada por la empresa por dispersión (ej. L. 18)
  averageSalary: number;
  eligiblePayrollLoansCount: number;
  status: 'Activo' | 'En Negociación' | 'Perdido';
  monthsWithBank: number;
  isAutoRenewed: boolean;
  loyaltyBonusPct: number;
  // Cuenta obligatoria aperturada en Áureo Bank
  linkedDivision: BankingDivisionId; // e.g. 'corporativa' o 'pyme'
  bankAccountBalanceHNL: number; // Saldo retenido en la cuenta de la empresa
  accountNumber: string; // Número de cuenta institucional
}

export interface SwiftTransaction {
  id: string;
  direction: 'Saliente' | 'Entrante';
  counterpartyBank: string; // Banco corresponsal global
  counterpartyCountry: string;
  currency: 'USD' | 'EUR' | 'CHF' | 'GBP';
  amountFX: number;
  clientName: string;
  purpose: string;
  feeUSD: number;
  settlementStatus: 'Liquidado' | 'En Validación AML' | 'Enviado';
  complianceCheck: 'Aprobado OFAC/BCH' | 'Revisión Manual';
}

export interface FamilyRemittanceChannel {
  name: 'Western Union' | 'MoneyGram' | 'Ria Envíos' | 'Ventanilla Áureo Express';
  monthlyVolumeUSD: number;
  remittancesCount: number;
  feePerRemittanceUSD: number;
  directAccountDepositPct: number; // % que va directo a cuentas de ahorro
}

export interface TreasuryAsset {
  id: string;
  type: 'Bono Soberano BCH' | 'Letra de Regulación BCH' | 'Acción Bursátil' | 'Reserva Divisas USD';
  title: string;
  principalHNL: number;
  interestRateAnnual: number;
  maturityMonthsRemaining: number;
  currentYieldAnnual: number;
  liquidityTier: 'Alta' | 'Media' | 'Baja';
}

export interface SecondaryMarketSecurity {
  id: string;
  name: string;
  category: 'Bono Soberano BCH / SEFIN' | 'Bono Corporativo Bancario' | 'Bono Corporativo Empresa' | 'Acción Ordinaria';
  issuer: string;
  issuerBadgeColor: string;
  annualYieldOrDividendPct: number; // Tasa cupón anual o rendimiento por dividendos
  pricePerUnitHNL: number;
  unitType: 'Bono' | 'Acción';
  ownedUnits: number; // Cantidad en posesión de Áureo Bank
  totalInvestedHNL: number; // Capital invertido
  riskRating: 'AAA' | 'AA+' | 'AA' | 'A+' | 'BBB';
  description: string;
  priceHistory?: number[];
  priceChangeMonthPct?: number;
}

export interface StaffRole {
  id: string;
  title: string;
  category: 'Comercial' | 'Riesgo y Análisis' | 'Operaciones y Ventanilla' | 'Cumplimiento Legal AML';
  count: number;
  monthlySalaryPerPerson: number;
  efficiencyBonus: number;
  benefitDescription: string;
}

export interface BoardDirector {
  id: string;
  name: string;
  title: 'Presidente Ejecutivo' | 'Director de Riesgo Crediticio' | 'Director de Finanzas y Tesorería' | 'Director de Banca Comercial' | 'Director de Cumplimiento AML' | 'Director de Canales y Tecnología';
  loyalty: number; // 0 - 100
  annualBonusHNL: number;
  passivePerk: string;
  avatarSeed: string;
}

export interface BranchLocation {
  id: string;
  cityName: string;
  zone: string;
  tier: 'Sucursal Principal' | 'Agencia Completa' | 'Ventanilla Ágil' | 'Kiosko Digital';
  isOpen: boolean;
  costToOpen: number;
  monthlyOpex: number;
  capturedDepositsM: number;
  loansDisbursedM: number;
  staffAssigned: number;
}

export interface CreditRiskCategoryBreakdown {
  category: 'I - Normal' | 'II - Especial' | 'III - Subnormal' | 'IV - Dudoso Recaudo' | 'V - Pérdida';
  daysOverdue: string;
  provisionPct: number;
  balanceHNL: number;
  clientCount: number;
  provisionRequiredHNL: number;
}

export interface BankFinancialStatements {
  // Balance General (Lempiras)
  cashAndBCHReserves: number;
  requiredReserveAmount: number; // Encaje legal (12% de depósitos)
  loanPortfolioCurrent: number; // Cartera al día
  loanPortfolioPastDue: number; // Cartera en mora (>90 días)
  loanLossProvisions: number; // Provisiones anticíclicas
  treasuryBondsBCH: number; // Inversiones en títulos del BCH
  secondarySecuritiesValueHNL: number; // Portafolio de mercado secundario (bonos rivales y acciones)
  fxReservesUSDValueInHNL: number; // Posición de cambio en Dólares
  fixedAssetsBranches: number; // Inmuebles, sucursales y tecnología
  totalAssets: number;

  depositsPublicTotal: number; // Depósitos totales de las 6 bancas
  interbankBorrowingBCH: number; // Préstamos del BCH si falta encaje
  otherLiabilities: number;
  totalLiabilities: number;

  capitalStock: number; // Capital social pagado
  retainedEarnings: number; // Utilidades retenidas
  currentMonthProfit: number; // Utilidad del mes actual
  totalEquity: number;

  // Ratios Regulatorios CNBS
  capitalAdequacyRatioCAR: number; // CAR % (Mínimo CNBS: 10.0%)
  liquidityCoverageRatioLCR: number; // ILR % (Mínimo: 100%)
  delinquencyRatioNPL: number; // Cartera en mora / Cartera total (Objetivo < 3%)
  returnOnEquityROE: number; // Utilidad anualizada / Patrimonio

  // Estado de Resultados del Mes (Lempiras)
  interestIncomeLoans: number;
  interestIncomeTreasury: number;
  interestIncomeSecurities: number; // Cupones y dividendos mercado secundario
  totalFinancialIncome: number;

  interestExpenseDeposits: number;
  interestExpenseInterbank: number;
  totalFinancialExpense: number;

  netInterestMargin: number; // Margen financiero bruto

  feeIncomeClearingACH: number;
  feeIncomePayrollServices: number;
  feeIncomeSwiftAndFX: number;
  feeIncomeRemittances: number;
  feeIncomeCardsAndPOS: number;
  feeIncomePensionFunds: number; // Comisiones por administración de pensiones
  totalFeeIncome: number;

  // Propiedades complementarias de Core Bancario
  nonInterestFeeIncomeMonthly?: number;
  treasurySecuritiesBCH?: number;
  netInterestIncomeMonthly?: number;

  staffSalariesExpense: number;
  branchesOpexExpense: number;
  technologyAndMarketingExpense: number;
  totalOperatingExpense: number;

  creditProvisionExpense: number;
  incomeBeforeTax: number;
  incomeTaxISR: number; // 25% ISR
  netIncome: number;
}

export interface GameEventNotification {
  id: string;
  month: number;
  year: number;
  type: 'bch_policy' | 'market_war' | 'regulatory_cnbs' | 'swift_alert' | 'corporate_deal' | 'segment_upgrade' | 'npl_sale' | 'regulatory_alert' | 'board_decision';
  title: string;
  message: string;
  impactSummary: string;
}

export interface InterbankPortfolioOffer {
  id: string;
  sellerBankId: CompetitorId | 'aureo';
  sellerBankName: string;
  targetBankId?: CompetitorId | 'aureo';
  portfolioType: 'activos_creditos' | 'pasivos_depositos';
  name: string;
  faceValueHNL: number;
  offerPriceHNL: number;
  discountOrPremiumPct: number;
  averageRatePct: number;
  riskRating: 'Bajo (A+)' | 'Moderado (BBB)' | 'Alto (B)' | 'Distressed (Mora Recaudable)';
  clientCount: number;
  termMonthsAvg: number;
  description: string;
  status: 'disponible' | 'comprado' | 'vendido';
}

export interface DynamicAlert {
  id: string;
  severity: 'critica' | 'advertencia' | 'informativa';
  category: 'liquidez' | 'credito' | 'regulatorio_cnbs' | 'mercado_bursatil' | 'operaciones' | 'swift';
  title: string;
  message: string;
  timestampMonth: number;
  targetTab?: string;
  isRead?: boolean;
}

export interface ExpertOpinion {
  id: string;
  author: string;
  role: string;
  organization: string;
  headline: string;
  summary: string;
  sentiment: 'Favorable / Crecimiento' | 'Alerta de Riesgo' | 'Oportunidad Estratégica' | 'Neutral Cauteloso';
  recommendedAction: string;
  month: number;
}

export interface TenInnovationsState {
  // 1. Mesa de Divisas (FX Trading & Subastas BCH)
  fxDesk: {
    openPositionUSD: number;
    bchAuctionBiddedUSD: number;
    bchAuctionWonUSD: number;
    fxSpreadIncomeMonthly: number;
  };
  // 2. Auditorías Sorpresa CNBS
  cnbsAudits: {
    lastAuditResult: string;
    complianceRating: number; // 0-100
    requiredProvisionCorrection: number;
    isAuditedThisPeriod: boolean;
  };
  // 3. Mesa de Dinero Interbancario (Call / Overnight)
  interbankCallMoney: {
    lentAmountHNL: number;
    borrowedAmountHNL: number;
    callRatePct: number;
  };
  // 4. Calificación de Riesgo Internacional (Fitch / Moody's)
  internationalRating: {
    agency: 'Fitch Ratings' | "Moody's" | 'Standard & Poor\'s';
    currentRating: string;
    outlook: 'Estable' | 'Positiva' | 'Negativa';
    fundingCostDiscountPct: number;
  };
  // 5. Centro de Negociación y Condonación de Deudas
  debtWorkouts: {
    totalRestructuredAmountHNL: number;
    totalSoldToRivalsAmountHNL: number;
    recoveredCapitalHNL: number;
  };
  // 6. Adopción de Banca Digital & App Móvil
  digitalBanking: {
    appUsersCount: number;
    mobileAdoptionPct: number;
    costSavingsMonthlyHNL: number;
  };
  // 7. Alianzas de Remesas Familiares
  remittanceAlliances: {
    directDepositBonusPct: number;
    monthlyCapturedRemittanceDepositsHNL: number;
  };
  // 8. Pruebas de Estrés (Stress Testing CNBS)
  stressTesting: {
    lastScenarioRun: string;
    simulatedCAR: number;
    simulatedLCR: number;
    capitalGapHNL: number;
  };
  // 9. Mega-Créditos Sindicados de Infraestructura
  syndicatedMegaLoans: {
    participatedProjectsCount: number;
    activeSyndicatedExposureHNL: number;
  };
  // 10. Subastas M&A de Bancos en Liquidación
  distressedAssetAuctions: {
    activeAuctionsCount: number;
    acquiredBranchesCount: number;
  };
}

export interface BchRepoOperation {
  id: string;
  type: 'repo_bch_liquidez' | 'repo_inversion';
  counterparty: 'Banco Central de Honduras (BCH)' | 'Banco Ficohsa' | 'Banco Atlántida' | 'BAC Credomatic' | 'Banpaís' | 'Banco de Occidente';
  termDays: 7 | 14 | 28;
  amountHNL: number;
  interestRatePct: number;
  monthsRemaining: number;
  collateralAsset: string;
  status: 'activo' | 'vencido' | 'liquidado';
}

export interface FxForwardContract {
  id: string;
  clientName: string;
  companyName: string;
  direction: 'venta_usd_a_cliente' | 'compra_usd_a_cliente';
  amountUSD: number;
  agreedRateHNL: number;
  marketRateAtAgreementHNL: number;
  termDays: 30 | 60 | 90 | 180;
  monthsRemaining: number;
  premiumFeeHNL: number;
  status: 'activo' | 'liquidado' | 'cancelado';
}

export interface YieldCurvePoint {
  termLabel: string; // '7 días', '28 días', '91 días', '182 días', '364 días'
  termDays: number;
  bchYieldPct: number;
  previousYieldPct: number;
  trend: 'alza' | 'estable' | 'baja';
}

export interface MonthlyClosingSummary {
  month: number;
  year: number;
  monthLabel: string;
  // Cuotas y Préstamos
  loansProcessedCount: number;
  loansFullyPaidCount: number;
  loansPartialOrOverdueCount: number;
  totalAmortizationCollectedHNL: number;
  totalInterestCollectedHNL: number;
  delinquentClientsNotices: {
    clientId: string;
    clientName: string;
    division: BankingDivisionId;
    loanType: string;
    monthlyPaymentHNL: number;
    accountBalanceHNL: number;
    shortfallHNL: number;
    pastDueDays: number;
    cnbsCategory: string;
    suggestedAction: 'reestructurar_plazo' | 'quita_interes' | 'dacion_garantia';
  }[];
  // Indexación de Tasas por TPM
  tpmOldPct: number;
  tpmNewPct: number;
  tpmDeltaPct: number;
  indexedDivisionsSummary: {
    divisionId: BankingDivisionId;
    divisionName: string;
    oldLendingRate: number;
    newLendingRate: number;
    oldDepositRate: number;
    newDepositRate: number;
  }[];
  // Ajustes de Límites de Crédito
  limitsIncreasedCount: number;
  limitsReducedCount: number;
  totalLimitExpansionHNL: number;
  // Intereses Pasivos Capitalizados
  totalDepositInterestCapitalizedHNL: number;
  // Cumplimiento de Encaje Legal BCH
  requiredReserveHNL: number;
  actualReserveHNL: number;
  reserveSurplusOrDeficitHNL: number;
  isReserveCompliant: boolean;
  bchPenaltyIncurredHNL: number;
  // Ratios Regulatorios
  carPct: number;
  lcrPct: number;
  nsfrPct: number;
}

export interface BchMoneyDeskState {
  cashInBchCurrentAccountHNL: number;
  requiredReserveHNL: number;
  reserveSurplusOrDeficitHNL: number;
  isCompliant: boolean;
  emergencyRepoActive: boolean;
  activeRepos: BchRepoOperation[];
  yieldCurve: YieldCurvePoint[];
  dailyInterbankCallOffers: {
    bankId: CompetitorId;
    bankName: string;
    offeredRatePct: number;
    availableAmountHNL: number;
    direction: 'ofrece_liquidez' | 'demanda_liquidez';
  }[];
}

export interface AureoProgramItem {
  id: string;
  number: number;
  pillar: 'retail' | 'pyme' | 'agro' | 'corporativo' | 'tesoreria_regulacion';
  name: string;
  tagline: string;
  status: 'activo' | 'optimizado' | 'en_expansion';
  monthlyVolumeHNL: number;
  monthlyNetIncomeHNL: number;
  participantsCount: number;
  keyMetricLabel: string;
  keyMetricValue: string;
  description: string;
}

export interface AureoProgramsState {
  programs: AureoProgramItem[];
  remesasQrTransactions: {
    id: string;
    senderCountry: 'Estados Unidos' | 'España' | 'Canadá' | 'México';
    beneficiaryName: string;
    amountUSD: number;
    amountHNL: number;
    exchangeRateUsed: number;
    qrPinCode: string;
    status: 'Cobrado' | 'Acreditado_Cuenta' | 'Pendiente_Cajero';
  }[];
  rewardsSystem: {
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    exchangeRatePerPointHNL: number;
    activeEnrolledCardholders: number;
  };
  microSavingsHuchas: {
    totalEnrolledClients: number;
    totalAccumulatedHNL: number;
    annualYieldPct: number;
    roundingThreshold: 10 | 50;
  };
  salaryAdvanceLedger: {
    totalAdvancesDisbursedHNL: number;
    activeAdvancesCount: number;
    flatFeePct: number;
    repaymentRatePct: number;
  };
  insuranceProtege: {
    enrolledPoliciesCount: number;
    monthlyPremiumHNL: number;
    claimsPaidThisYearHNL: number;
    lossRatioPct: number;
  };
  pymeRevolvingLines: {
    totalApprovedLimitHNL: number;
    totalDrawnBalanceHNL: number;
    annualInterestRatePct: number;
    activePymesCount: number;
  };
  mujerEmprendeProgram: {
    enrolledBusinessesCount: number;
    totalPortfolioHNL: number;
    fohdeGuaranteeCoveragePct: number;
    subsidizedRatePct: number;
  };
  smartPosAdvances: {
    participatingMerchantsCount: number;
    advancedSalesVolumeHNL: number;
    discountFeePct: number;
  };
  escrowCustodyAccounts: {
    activeEscrowsCount: number;
    fundsInCustodyHNL: number;
    annualCustodyFeePct: number;
  };
  agroCosechaSegura: {
    coveredFincasCount: number;
    seasonalFinancingHNL: number;
    harvestCollectionMonth: number;
    climateInsuranceActive: boolean;
  };
  ecoCreditoVerde: {
    financedProjectsCount: number;
    totalGreenPortfolioHNL: number;
    bcieSubsidyYieldPct: number;
    co2TonsAvoided: number;
  };
  bonoPrendaCafeAgd: {
    storedBagsQuintales: number;
    warrantValueHNL: number;
    pawnLoanDisbursedHNL: number;
    internationalPriceUSD: number;
  };
  factoringConfirming: {
    discountedInvoicesCount: number;
    outstandingFactoringHNL: number;
    avgDiscountRatePct: number;
    defaultRatePct: number;
  };
  tradeLettersOfCredit: {
    issuedLettersCount: number;
    totalGuaranteedAmountUSD: number;
    commissionRatePct: number;
  };
  fxCorporateDesk: {
    activeSpotVolumeMonthlyUSD: number;
    hedgedVolumeUSD: number;
    monthlySpreadEarningsHNL: number;
  };
  realEstateTrusts: {
    activeTrustsCount: number;
    managedAssetsHNL: number;
    fiduciaryCommissionMonthlyHNL: number;
  };
  stepUpDpfTranches: {
    id: string;
    clientName: string;
    principalHNL: number;
    currentMonthInTerm: number;
    currentRatePct: number;
    nextQuarterRatePct: number;
  }[];
  interbankReposOverview: {
    overnightVolumeHNL: number;
    weightedAverageRepoRatePct: number;
    collateralCoverageRatio: number;
  };
  cnbsRiskScoringEngine: {
    evaluatedPortfoliosCount: number;
    portfolioWeightedRiskPct: number;
    requiredProvisionHNL: number;
    currentProvisionCoveragePct: number;
  };
  uifCompliancePortal: {
    declarations10kFiledCount: number;
    suspiciousRosReportsGenerated: number;
    complianceAuditScorePct: number;
    lastInspectionDateLabel: string;
  };
}

export interface GameState {
  bankName: string;
  gameMonth: number; // 1 = Enero 2026, 2 = Febrero 2026...
  bch: BCHIndicators;
  financials: BankFinancialStatements;
  competitors: CompetitorBank[];
  divisions: Record<BankingDivisionId, BankDivisionConfig>;
  clients: IndividualClient[]; // Lista completa de clientes individuales por banca
  pensionFunds: PensionFund[]; // Fondos de Pensiones y Cesantías
  posMerchants: PosMerchant[]; // Red de Adquirencia POS PYME
  pendingApplications: CreditApplication[];
  clearingHouse: ClearingHouseStats;
  payrollAgreements: CorporatePayrollAgreement[];
  swiftTransactions: SwiftTransaction[];
  remittanceChannels: FamilyRemittanceChannel[];
  treasuryHoldings: TreasuryAsset[];
  secondarySecurities: SecondaryMarketSecurity[]; // Bonos y Acciones mercado secundario
  staff: StaffRole[];
  board: BoardDirector[];
  branches: BranchLocation[];
  historyMonthlyProfits: { monthLabel: string; profit: number; assets: number; car: number }[];
  notifications: GameEventNotification[];
  marketingAggressiveness: 'Moderada' | 'Agresiva (Guerra de Tasas)' | 'Ultra Agresiva (Robo de Cartera)' | 'Prudente Conservadora';
  digitalTechLevel: number; // 1 a 5
  // Asesores de crédito y capacidad de aprobación mensual (12 a 50 transacciones por asesor)
  advisorMonthlyLimitPerAdvisor: number; // Default 25
  advisorApprovalsUsedThisMonth: number;
  // Nuevas propiedades institucionales
  interbankOffers: InterbankPortfolioOffer[];
  dynamicAlerts: DynamicAlert[];
  expertOpinions: ExpertOpinion[];
  innovations: TenInnovationsState;
  // Mesa de Dinero BCH, Forwards y Cierre Mensual Obligatorio
  bchMoneyDesk: BchMoneyDeskState;
  fxForwards: FxForwardContract[];
  lastMonthlyClosingSummary?: MonthlyClosingSummary;
  // Suite de 20 Características, Programas e Innovaciones Bancarias
  bankingPrograms20: AureoProgramsState;
  // Centro de Operaciones Avanzadas: 24 Características en 4 Ejes Estratégicos
  advancedOperations: AdvancedOperationsState;
  // Gobierno Corporativo: Ranking Histórico de Dividendos (10 Años Fiscales 2017-2026)
  dividendGovernance: DividendGovernanceState;
  // Sandbox Central de Configuración Financiera, Fiscal y Scoring en Tiempo Real
  financialSandbox: FinancialSandboxConfig;
  // Suite de 24 Mejoras Estratégicas y Recomendaciones Institucionales
  strategicImprovements: StrategicImprovementsState;
  // Centro Global de Prevención de Fraudes, Lavado de Dinero (AML/CFT) y Reportes UIF
  amlCompliance: AmlComplianceState;
  // Motor de Dilemas Ejecutivos, Éticos y Crisis de Junta Directiva
  executiveDilemmas: ExecutiveDilemmasState;
  // Autonomía Delegada para Asesores de Crédito (hasta L. 50M) y Timer Automático
  advisorAutoApprovalThresholdHNL?: number;
  autoTimerActive?: boolean;
  autoTimerIntervalSeconds?: number;
  // Core Bancario Institucional (Honduras & Centroamérica)
  termDeposits?: TermDepositCertificate[];
  backToBackFacilities?: BackToBackFacility[];
  demandAccounts?: DemandDepositAccount[];
  achTransactions?: AchTransferTransaction[];
  payrollBatches?: CorporatePayrollBatch[];
  lettersOfCredit?: TradeFinanceLetterOfCredit[];
}

// ------------------------------------------------------------------------------------
// CORE BANCARIO INSTITUCIONAL: DPF, BACK-TO-BACK, CUENTAS VISTA & COMERCIO EXTERIOR
// ------------------------------------------------------------------------------------

export interface TermDepositCertificate {
  id: string; // ej. DPF-2026-001
  cif: string;
  clientName: string;
  division: BankingDivisionId;
  principalHNL: number;
  interestRateAnnualPct: number; // Tasa pasiva anual ej. 8.5%
  termDays: number; // 30, 60, 90, 180, 360, 720
  startMonth: number;
  startYear: number;
  maturityMonth: number;
  maturityYear: number;
  status: 'vigente' | 'vencido' | 'pignorado' | 'cancelado' | 'ejecutado';
  isPledged: boolean; // Pignorado en garantía líquida Back-to-Back
  pledgedToFacilityId?: string; // ID del crédito o tarjeta que respalda
  accumulatedGrossInterestHNL: number;
  accumulatedSarTaxWithheldHNL: number; // 10% retención fiscal SAR
  netInterestPaidHNL: number;
  couponPaymentFrequency: 'mensual' | 'al_vencimiento';
  autoRenew: boolean;
}

export interface BackToBackFacility {
  id: string; // ej. B2B-CR-2026-001 o B2B-TC-2026-001
  type: 'prestamo_garantizado' | 'tarjeta_garantizada';
  clientName: string;
  clientCif: string;
  division: BankingDivisionId;
  dpfCertificateId: string;
  dpfPrincipalHNL: number;
  dpfInterestRatePct: number;
  coverageRatioPct: number; // 80% a 95%
  approvedAmountHNL: number; // Monto desembolsado o cupo de tarjeta
  outstandingBalanceHNL: number; // Saldo actual adeudado
  spreadRatePct: number; // Margen del banco (+3.0% a +4.0%)
  effectiveInterestRatePct: number; // dpfRate + spreadRate
  termMonths: number;
  monthlyQuotaHNL: number; // Cuota francesa mensual
  disbursementFeeHNL: number; // 0.5% flat (mínimo L. 500)
  monthlyDebtorInsuranceHNL: number; // L. 6.50 por millar de saldo
  riskWeightingRwaPct: 0; // 0% RWA bajo normativa CNBS
  requiredProvisionHNL: 0; // L. 0.00 provisiones de riesgo
  status: 'vigente' | 'cancelado' | 'ejecutado';
  pastDueDays: number;
  originationMonth: number;
  lastPaymentMonth?: number;
}

export interface DemandDepositAccount {
  id: string;
  accountNumber: string;
  clientName: string;
  clientCif: string;
  division: BankingDivisionId;
  type: 'cuenta_corriente' | 'ahorro_rendimiento';
  currency: 'HNL' | 'USD';
  availableBalanceHNL: number;
  transitBalanceHNL: number; // Saldo en compensación de cheques
  interestRateAnnualPct: number; // Rendimiento pasivo anual
  overdraftLimitHNL: number; // Límite de sobregiro contratado
  overdraftUsedHNL: number;
  checksIssuedCount: number;
  checksBouncedCount: number; // Rechazados por insuficiencia de fondos
  achTransfersCount: number;
  status: 'activa' | 'bloqueada' | 'embargada';
  openedMonth: number;
}

export interface AchTransferTransaction {
  id: string; // ACH-2026-XXXXX
  sourceAccountNumber: string;
  sourceClientName: string;
  destinationBank: 'Banco Atlántida' | 'Banco Ficohsa' | 'BAC Credomatic' | 'Banpaís' | 'Banco de Occidente' | 'Davivienda' | 'Promerica';
  destinationAccount: string;
  recipientName: string;
  amountHNL: number;
  commissionFeeHNL: number; // Tarifa fija regulada L. 20.00
  referenceNote: string;
  status: 'liquidada' | 'en_proceso' | 'rechazada';
  timestamp: number;
  month: number;
}

export interface CorporatePayrollBatch {
  id: string;
  companyName: string;
  companyAccountNumber: string;
  employeeCount: number;
  totalPayrollAmountHNL: number;
  feePerEmployeeHNL: number; // L. 18.00 a L. 22.00
  totalFeeCollectedHNL: number;
  status: 'procesada' | 'en_revision';
  processedMonth: number;
}

export interface TradeFinanceLetterOfCredit {
  id: string;
  applicantName: string; // Empresa importadora
  beneficiaryName: string; // Exportador extranjero
  issuingBank: string;
  advisingBank: 'Citibank N.A. New York' | 'JPMorgan Chase' | 'Bank of America';
  amountUSD: number;
  amountHNL: number;
  commissionRatePct: number; // 0.75% trimestral
  commissionCollectedHNL: number;
  expiryMonths: number;
  goodsDescription: string;
  status: 'emitida_confirmada' | 'embarque_recibido' | 'liquidada';
  monthIssued: number;
}

export interface BranchDepartment {
  id: string;
  name: string;
  capitalCity: string;
  activeBranches: number;
  totalEmployees: number;
  depositsCollectedHNL: number;
  loansDisbursedHNL: number;
  monthlyOperatingCostHNL: number;
  expansionCostHNL: number;
  status: 'Operativa' | 'Planificada' | 'Cerrada';
}

export interface AtmUnit {
  id: string;
  location: string;
  type: 'Multifunción Smart' | 'Básico Dispensador';
  cashVaultHNL: number;
  maxCapacityHNL: number;
  monthlyTransactions: number;
  monthlyFeeIncomeHNL: number;
  maintenanceCostHNL: number;
  uptimePct: number;
}

export interface BankingAgentPoint {
  id: string;
  businessName: string;
  department: string;
  monthlyVolumeHNL: number;
  commissionSharedHNL: number;
  activeServices: string[];
}

export interface SubordinatedBondEmission {
  id: string;
  seriesName: string;
  faceValueHNL: number;
  couponRateAnnualPct: number;
  tenorYears: number;
  tierCategory: 'Tier 2 Complementario' | 'Bono Sostenible Verde';
  status: 'En Circulación' | 'Redimido' | 'Estructuración';
  monthsElapsed: number;
}

export interface FxAuctionBid {
  id: string;
  bidDate: string;
  requestedUSD: number;
  offeredExchangeRate: number;
  allocatedUSD: number;
  status: 'Adjudicado' | 'Parcial' | 'No Asignado';
}

export interface SovereignHolding {
  id: string;
  securityType: 'Letra BCH (LRM)' | 'Bono Soberano SEFIN' | 'Certificado de Absorción';
  principalHNL: number;
  yieldPct: number;
  termMonthsRemaining: number;
  liquidCollateralRatio: number;
}

export interface MultilateralCreditLine {
  id: string;
  institution: 'BCIE' | 'BID Invest' | 'IFC Banco Mundial';
  totalFacilityUSD: number;
  drawnUSD: number;
  spreadOverSofrPct: number;
  dedicatedSector: 'Energía Renovable' | 'Pymes Exportadoras' | 'Infraestructura Vial';
}

export interface MutualFundTier {
  id: string;
  fundName: string;
  aumHNL: number;
  navPerShareHNL: number;
  investorCount: number;
  managementFeePct: number;
  targetAssetAllocation: string;
}

export interface CorporateTrustContract {
  id: string;
  trustName: string;
  settlorClientName: string;
  fiduciaryAssetsHNL: number;
  trustType: 'Garantía Crediticia' | 'Administración Inmobiliaria' | 'Pago de Infraestructura';
  monthlyFiduciaryFeeHNL: number;
  activeBeneficiariesCount: number;
}

export interface MicroInsuranceProduct {
  id: string;
  productName: string;
  monthlyPremiumHNL: number;
  activePolicies: number;
  totalCoveragePerClaimHNL: number;
  monthlyLossRatioPct: number;
  underwriterPartner: string;
}

export interface StressSimulationResult {
  scenarioId: 'devaluacion_hnl' | 'sequia_el_nino' | 'shock_tpm_bch' | 'crisis_liquidez_retiros';
  scenarioName: string;
  simulatedCAR: number;
  simulatedLCR: number;
  provAdditionalHNL: number;
  capitalShortfallHNL: number;
  cnbsRegulatoryNotice: string;
  executedAtMonth: number;
}

export interface AdvancedOperationsState {
  departmentBranches: BranchDepartment[];
  atmFleet: AtmUnit[];
  bankingAgents: BankingAgentPoint[];
  armoredTransportFleet: {
    armoredTrucksCount: number;
    monthlyRouteCostHNL: number;
    cashInTransitInsuredHNL: number;
    riskIncidentsCount: number;
  };
  driveThruLanesCount: number;
  privateLoungesCount: number;

  subordinatedBonds: SubordinatedBondEmission[];
  fxBchBids: FxAuctionBid[];
  sovereignHoldings: SovereignHolding[];
  multilateralLines: MultilateralCreditLine[];
  mutualFunds: MutualFundTier[];
  overnightInterbankPositions: {
    lentOvernightHNL: number;
    borrowedOvernightHNL: number;
    weightedRatePct: number;
  };

  lastStressTest?: StressSimulationResult;
  ifrs9ProvisionsLedger: {
    stage1NormalHNL: number;
    stage2WatchlistHNL: number;
    stage3ImpairedHNL: number;
    totalExpectedLossHNL: number;
    coverageRatioPct: number;
  };
  cyberSecurityCenter: {
    ddosBlockedAttacksCount: number;
    suspiciousTxBlockedCount: number;
    pciDssComplianceScorePct: number;
    securityFirewallTier: 1 | 2 | 3 | 4;
  };
  amlCompliancePortal: {
    transactionsOver10kScreened: number;
    pepsAlertsTriggered: number;
    uifReportsSubmitted: number;
    complianceClearanceRatePct: number;
  };
  executiveAlcoMetrics: {
    netInterestMarginNIM: number;
    costOfFundsPct: number;
    efficiencyRatioCIR: number;
    returnOnEquityROE: number;
    returnOnAssetsROA: number;
  };
  alcoInterestRateForecast: {
    recommendedActiveRatePct: number;
    recommendedPassiveRatePct: number;
    expectedNIMImprovementBps: number;
  };

  corporateCashManagement: {
    corporateClientsEnrolled: number;
    monthlyPayrollDispersalsHNL: number;
    supplierPaymentsProcessedHNL: number;
    feeGeneratedHNL: number;
  };
  fiduciaryTrustContracts: CorporateTrustContract[];
  microInsurancePortfolio: MicroInsuranceProduct[];
  clientChurnPredictor: {
    overallNPSScore: number;
    highRiskChurnClientsCount: number;
    automatedRetentionRetentionRatePct: number;
    activeLoyaltyCampaignsCount: number;
  };
  digitalInstantLoans: {
    disbursedThisMonthCount: number;
    totalDisbursedHNL: number;
    averageApprovalTimeMinutes: number;
    badRatePct: number;
  };
  shareholdersPortal: {
    sharesOutstanding: number;
    bookValuePerShareHNL: number;
    declaredDividendPerShareHNL: number;
    retainedEarningsRatioPct: number;
  };
}

// ------------------------------------------------------------------------------------
// GOBIERNO CORPORATIVO: RANKING HISTÓRICO DE DIVIDENDOS (10 AÑOS FISCALES 2017-2026)
// ------------------------------------------------------------------------------------

export interface FiscalYearDividendRecord {
  fiscalYear: number; // 2017 to 2026
  netIncomeAuditHNL: number; // Utilidad Neta Auditada CNBS
  dividendCashDistributedHNL: number; // Dividendos en efectivo desembolsados
  retainedTier1HNL: number; // Utilidades retenidas para Capital Primario Tier 1
  payoutRatioPct: number; // % distribuido en dividendos
  sharesCount: number; // Acciones en circulación (10,000,000)
  dividendPerShareHNL: number; // Dividendo por Acción (DPS) en Lempiras
  bookValuePerShareHNL: number; // Valor en Libros por Acción
  dividendYieldPct: number; // Rendimiento por dividendo (%)
  carClosingPct: number; // Índice de Adecuación de Capital (CAR) al cierre
  governanceAuditorOpinion: 'Favorable sin Salvedades' | 'Con Énfasis Normativo';
  rankingPosition: number; // 1 a 10 por monto distribuido
}

export interface DividendGovernanceState {
  historical10Years: FiscalYearDividendRecord[];
  currentYearPolicy2026: {
    targetPayoutPct: number; // Ej. 50%
    proposedCashDividendHNL: number;
    retainedCapitalTier1HNL: number;
    expectedCarImpactPct: number;
    asambleaScheduledMonth: number; // Mes 4 (Abril)
    asambleaStatus: 'Pendiente de Convocatoria' | 'Aprobada por Junta Directiva' | 'Ratificada por Asamblea';
  };
  totalHistoricalDividendsHNL: number;
  avgHistoricalPayoutPct: number;
  accumulatedTier1RetainedHNL: number;
}

// ------------------------------------------------------------------------------------
// SANDBOX CENTRAL DE CONFIGURACIÓN FINANCIERA, FISCAL Y SCORING EN TIEMPO REAL
// ------------------------------------------------------------------------------------

export interface FinancialSandboxConfig {
  macro: {
    tpmRatePct: number; // 3.0% - 12.0% (TPM Banco Central de Honduras)
    interannualInflationPct: number; // 2.0% - 14.0%
    exchangeRateUsdHnl: number; // 20.00 - 32.00 Lempiras por Dólar
    reserveReqPct: number; // 8.0% - 18.0% (Encaje legal requerido BCH)
  };
  fiscalSar: {
    isrRatePct: number; // 25.0% Impuesto Sobre la Renta Bancario
    aportacionSolidariaPct: number; // 5.0% Ley de Aportación Solidaria
    dividendWithholdingTaxPct: number; // 10.0% Retención en la fuente por dividendos
    maxDeductibleProvisionPct: number; // Deducción fiscal máxima de provisiones CNBS
  };
  bankAlco: {
    targetIntermediationSpreadPct: number; // Spread objetivo Margen Activo - Pasivo
    cirEfficiencyTargetPct: number; // Meta Coeficiente de Eficiencia Operativa CIR
    minTier1CarBufferPct: number; // Margen de seguridad patrimonial voluntario
  };
  creditScoringCnbs: {
    paymentHistoryWeightPct: number; // Ponderación de historial crediticio (30% - 50%)
    maxDtiAllowedPct: number; // Relación Deuda a Ingreso máxima permitida (30% - 55%)
    maxLtvCoveragePct: number; // LTV máximo en garantías reales (50% - 90%)
    minBureauScoreThreshold: number; // Umbral de score buró Equifax/TransUnion (500 - 750)
    categoryVArrearsDaysTrigger: number; // Días de mora para categoría V - Pérdida
  };
  lastAppliedTimestamp: number;
  realtimeReactivityActive: boolean;
}

// ------------------------------------------------------------------------------------
// SUITE DE 24 MEJORAS ESTRATÉGICAS Y RECOMENDACIONES INSTITUCIONALES
// ------------------------------------------------------------------------------------

export type StrategicImprovementPillar = 
  | 'digital_inclusion' // Eje A: Transformación Digital, Ciberseguridad e Inclusión
  | 'prudential_cnbs'   // Eje B: Cumplimiento Prudencial CNBS, Régimen SAR y Basilea III
  | 'treasury_esg';     // Eje C: Tesorería Avanzada, Finanzas Verdes (ESG) y Retención

export type StrategicImprovementStatus = 'active' | 'inactive' | 'locked';

export type StrategicActivationMode = 'formal_board' | 'sandbox_instant' | 'milestone_unlocked' | 'milestone_unlock';

export interface StrategicImprovementItem {
  id: string;
  number: number; // 1 a 24
  title: string;
  pillar: StrategicImprovementPillar;
  description: string;
  technicalDetails: string;
  regulatoryReference: string; // Ej. 'BCH Circular 04/2026', 'CNBS Res. 284/2003', 'SAR Ley Solidaria'
  capexCostHNL: number; // Inversión inicial en Lempiras
  monthlyOpexHNL: number; // Costo operativo mensual
  monthlyProfitBoostHNL: number; // Retorno mensual estimado en ingresos/ahorro
  carImpactBps: number; // Impacto en Solvencia CAR en puntos básicos (ej. 25 bps = +0.25%)
  depositGrowthBoostPct: number; // Impulso a captación de depósitos
  loanQualityImprovementPct: number; // Reducción de mora crediticia
  status: StrategicImprovementStatus;
  activationMode: StrategicActivationMode;
  activatedAtMonth?: number;
  unlockMilestone: {
    description: string;
    metricType: 'totalAssets' | 'car' | 'corporateClients' | 'gameMonth' | 'depositVolume' | 'clientsCount' | 'nplRatio';
    targetValue: number;
    currentValue: number;
    isAchieved: boolean;
  };
}

export interface StrategicImprovementsState {
  items: StrategicImprovementItem[];
  activeFilter: 'all' | StrategicImprovementPillar;
  interactionMode: StrategicActivationMode;
  totalCapexInvestedHNL: number;
  totalMonthlyOpexHNL: number;
  totalMonthlyProfitBoostHNL: number;
}

// ------------------------------------------------------------------------------------
// CENTRO GLOBAL DE PREVENCIÓN DE FRAUDES Y LAVADO DE DINERO (AML / CFT / PLD / UIF)
// ------------------------------------------------------------------------------------

export type AmlAlertSeverity = 'critica' | 'alta' | 'media' | 'informativa';
export type AmlAlertType = 
  | 'pitufeo_structuring'
  | 'pitufeo_fraccionamiento'
  | 'ofac_onu_match'
  | 'lista_ofac_sancionados'
  | 'pep_high_risk'
  | 'politicamente_expuesto'
  | 'rapid_movement'
  | 'origen_injustificado'
  | 'shell_company'
  | 'empresa_fachada_shell'
  | 'card_fraud_cloning'
  | 'clonacion_tarjeta_pos';

export type AmlInvestigationStatus = 
  | 'abierta' 
  | 'en_analisis' 
  | 'congelada' 
  | 'cuenta_congelada'
  | 'archivada_justificada' 
  | 'reportada_uif'
  | 'remitida_uif'
  | 'detectada'
  | 'bajo_investigacion';

export interface AmlTransactionAlert {
  id: string;
  clientId: string;
  clientName: string;
  clientRtn: string;
  division: BankingDivisionId;
  type: AmlAlertType;
  severity: AmlAlertSeverity;
  amountHNL: number;
  amountUSD: number;
  originCountry: string;
  destinationCountry: string;
  description: string;
  detectedMonth: number;
  riskScore: number; // 0 - 100
  status: AmlInvestigationStatus;
  evidenceNotes: string[];
  isAccountFrozen: boolean;
  uifReportId?: string;
  clearedByOfficer?: string;

  // Campos amigables y alias para consola ejecutiva
  ticketCode?: string;
  clientRtnOrId?: string;
  alertType?: AmlAlertType;
  involvedAmountHNL?: number;
  detectedAtMonth?: number;
  triggerHeuristic?: string;
  recommendedAction?: string;
  assignedInvestigator?: string;
  uifReportFiled?: boolean;
}

export interface UifReportDossier {
  reportId: string; // ROS-UIF-2026-XXXX
  filingMonth: number;
  alertId: string;
  clientId: string;
  clientName: string;
  clientRtn: string;
  suspicionSummary: string;
  totalFlaggedAmountHNL: number;
  legalBasis: string; // Ley Especial Contra el Lavado de Activos Decreto 144-2014
  uifCaseStatus: 'Enviado a UIF/CNBS' | 'En Investigación Fiscal' | 'Bloqueo Judicial Ratificado';
  submissionTimestamp: number;

  // Campos adicionales y alias de expediente
  id?: string;
  expedienteNumber?: string;
  clientRtnOrId?: string;
  typology?: AmlAlertType;
  filingDate?: string;
  gameMonth?: number;
  involvedAmountHNL?: number;
  legalBasisArticles?: string[];
  complianceOfficerSignature?: string;
  status?: string;
  uifAcknowledgmentReceipt?: string;

  // Resolución y ciclo temporal de 1 a 2 meses
  monthsUntilResolution?: number; // 1 o 2 meses para resolución
  rulingOutcome?: 'Decomiso OABI' | 'Desestimado por Justificación' | 'Sanción Ratificada' | 'Pendiente';
  rulingDetails?: string;
  rulingMonth?: number;
}

export interface AmlComplianceState {
  alerts: AmlTransactionAlert[];
  uifReports: UifReportDossier[];
  totalScreenedTransactionsMonth: number;
  totalSuspiciousVolumeHNL: number;
  frozenAccountsCount: number;
  totalFrozenFundsHNL: number;
  ofacMatchesBlockedCount: number;
  autoStructuringRulesActive: boolean;
  pepStrictMonitoringActive: boolean;
  riskThresholdScore: number; // e.g. 70

  // Alias y métricas ejecutivas complementarias
  complianceAuditRatingScore?: number;
  transactionAlerts?: AmlTransactionAlert[];
  lastScanMonth?: number;
  totalResolvedUifCasesCount?: number;
  totalForfeitedToOabiHNL?: number;
  historicalUifReports?: UifReportDossier[];
  monthlyScreenedTransactionsCount?: number;
  suspiciousActivityVolumeHNL?: number;
  frozenFundsTotalHNL?: number;
  uifReportsFiledCount?: number;
}

// ------------------------------------------------------------------------------------
// MOTOR DE DILEMAS EJECUTIVOS, ÉTICOS Y CRISIS DE JUNTA DIRECTIVA
// ------------------------------------------------------------------------------------

export type DilemmaCategory = 
  | 'lavado_de_dinero' 
  | 'presion_politica' 
  | 'crisis_reputacional' 
  | 'fraude_interno' 
  | 'esg_medioambiente' 
  | 'auditoria_cnbs';

export type DilemmaStatus = 'pendiente' | 'resuelto' | 'expirado';

export interface DilemmaOption {
  id: string;
  title: string;
  description: string;
  consequencesSummary: string;
  impactFinancials: {
    cashDeltaHNL: number;
    profitDeltaHNL: number;
    equityDeltaHNL: number;
    carDeltaBps: number;
    cnbsFineHNL?: number;
  };
  impactCompliance: {
    complianceScoreDelta: number; // -30 a +30
    reputationScoreDelta: number; // -30 a +30
    cnbsAuditRiskLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Sanción Inminente';
    cnbsFineHNL?: number;
  };
  directorsVotesApprovalPct: number; // Ej. 80% del Directorio a favor
}

export interface ExecutiveDilemma {
  id: string;
  number: number;
  month: number;
  category: DilemmaCategory;
  title: string;
  dilemmaSummary: string;
  detailedContext: string;
  stakeholders: string[]; // e.g. ['Comisión Nacional de Bancos y Seguros', 'Clientes Ahorrantes', 'Junta Directiva']
  regulatoryArticle: string;
  urgency: 'Urgente' | 'Alta' | 'Ordinaria';
  options: DilemmaOption[];
  status: DilemmaStatus;
  selectedOptionId?: string;
  chosenOptionId?: string;
  resolutionNote?: string;
  resolvedAtMonth?: number;
}

export interface ExecutiveDilemmasState {
  dilemmas: ExecutiveDilemma[];
  activeDilemmaId: string | null;
  resolvedDilemmasCount: number;
  accumulatedFinesHNL: number;
  publicReputationScore: number; // 0 a 100
  complianceTrustScore: number; // 0 a 100
  crisisActive: boolean;
  crisisScenarioTitle?: string;
  crisisDetails?: string;
}
