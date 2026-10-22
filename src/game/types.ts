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
  type: 'bch_policy' | 'market_war' | 'regulatory_cnbs' | 'swift_alert' | 'corporate_deal' | 'segment_upgrade' | 'npl_sale';
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
}

