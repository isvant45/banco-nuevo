/**
 * Tipos de datos para la simulación retro inspirada en Bank 2000 y el módulo de gestión empresarial aislada.
 */

export type RetailSectorId = 'minimarket' | 'bar_restaurante' | 'constructora' | 'supermercado' | 'autolote';

export type RetroRoleMode = 'empresario' | 'banquero' | 'grupo_empresarial';

export interface RetailProduct {
  id: string;
  name: string;
  category: string;
  icon: string;
  stock: number;
  unitCost: number; // Costo de compra al mayorista
  sellingPrice: number; // Precio de venta al público en estantería
  supplierDeliveryDays: number; // Días que tarda un pedido
  minOrderUnits: number;
  dailyDemandBase: number;
  spoilageRatePct: number; // Merma
}

export interface SupplierOrder {
  id: string;
  productId: string;
  productName: string;
  units: number;
  unitCost: number;
  totalCost: number;
  daysRemaining: number;
  orderDate: string;
}

export interface RetailCustomerWalkIn {
  id: string;
  name: string;
  avatar: string;
  customerType: 'Estudiante' | 'Trabajador' | 'Familia' | 'Empresario' | 'Turista';
  patience: number; // 0 a 100
  budget: number;
  cart: {
    productId: string;
    productName: string;
    units: number;
    unitPrice: number;
    inStock: boolean;
  }[];
  isServed: boolean;
  leftWithoutBuying: boolean;
  leaveReason?: string;
}

export interface SalesReceipt {
  id: string;
  time: string;
  day: number;
  customerName: string;
  itemsCount: number;
  subtotal: number;
  tax: number;
  total: number;
  totalAmount?: number; // Alias de conveniencia
  costOfGoods: number;
  paymentMethod: 'efectivo' | 'tarjeta';
}

export interface RealEstateAsset {
  type: 'Casa de Habitación' | 'Apartamento' | 'Terreno Comercial' | 'Local / Bodega';
  description: string;
  location: string;
  appraisedValue: number;
}

export interface VehicleAsset {
  makeModel: string;
  year: number;
  plateNumber: string;
  commercialValue: number;
}

export interface BankerDocketApplicant {
  id: string;
  dossierNumber: string;
  applicantName: string;
  avatar: string;
  age: number;
  city: string;
  occupation: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  existingDebts: number;
  creditScore: number; // 300 - 850 (Equifax)
  cnbsCategory: 'I - Normal' | 'II - Especial' | 'III - Subnormal' | 'IV - Dudoso Recaudo' | 'V - Pérdida';
  requestType: 'Prestamo Personal' | 'Credito Vehiculo' | 'Hipoteca Vivienda' | 'Credito Comercial Pyme' | 'Tarjeta Oro' | 'Cuenta Corriente';
  requestedAmount: number;
  proposedInterestRate: number; // % anual
  termMonths: number;
  purpose: string;
  decisionStatus: 'pendiente' | 'aprobado' | 'rechazado';
  stampedAt?: string;
  adjustedAmount?: number;
  adjustedRate?: number;
  
  // Patrimonio Real y Garantías para elevar monto o mejorar tasa
  realEstateAssets: RealEstateAsset[];
  vehicleAssets: VehicleAsset[];
  totalCollateralValue: number;
  collateralCoveragePct: number; // (totalCollateral / requestedAmount) * 100
  rateDiscountApplied: number;
  amountBonusApplied: number;

  riskEvaluation: {
    dtiRatioPct: number; // Ratio cuota / ingreso
    lossProbabilityPct: number;
    recommendedDecision: 'aprobar' | 'revisar' | 'rechazar';
  };
}

export interface SmartBankFacility {
  id: string;
  title: string;
  productType: 'prestamo_capital' | 'tarjeta_corporativa' | 'linea_sobregiro';
  amount: number;
  interestRateAnnual: number;
  monthlyPayment: number;
  termMonths: number;
  status: 'disponible' | 'activo' | 'pagado';
  balanceRemaining: number;
  minMonthlySalesRequired: number;
  description: string;
}

// ----------------------------------------------------
// Módulo de Construcción & Licitaciones
// ----------------------------------------------------

export type ConstructionMaterialId = 
  | 'cemento_gris'
  | 'varilla_acero'
  | 'bloque_concreto'
  | 'tabla_encofrado'
  | 'arena_grava'
  | 'maquinaria_pesada';

export interface ConstructionMaterial {
  id: ConstructionMaterialId;
  name: string;
  unit: string; // 'Bolsa (42.5kg)', 'Quintal (100 lbs)', 'Millar (1,000 uds)', 'Docena (12 uds)', 'Metro Cúbico (m³)', 'Hora Máquina'
  icon: string;
  stock: number;
  unitCost: number; // Costo por unidad HNL
  minStockWarning: number;
  supplierLeadDays: number;
}

export interface ConstructionMaterialOrder {
  id: string;
  materialId: ConstructionMaterialId;
  materialName: string;
  units: number;
  unitCost: number;
  totalCost: number;
  daysRemaining: number;
  orderDate: string;
}

export interface ConstructionRivalBid {
  contractorName: string;
  offeredPrice: number;
  offeredDays: number;
  reputationScore: number;
}

export interface ConstructionTender {
  id: string;
  title: string;
  category: 'obra_publica' | 'obra_privada';
  projectType: 'casa_residencial' | 'edificio_corporativo' | 'puente_vial' | 'nave_industrial' | 'pavimentacion_urbana';
  clientName: string; // ej: "SIT - Secretaría de Infraestructura", "Inversiones del Valle S.A.", "Alcaldía del Distrito Central"
  location: string;
  referenceBudget: number; // Presupuesto oficial base HNL
  durationDays: number; // Plazo oficial
  requiredWorkersPerDay: number; // Hombres / Cuadrilla diaria requerida para cumplir el plazo
  requiredMaterials: Record<ConstructionMaterialId, number>;
  requiresSarSolvencia: boolean; // Requisito legal obligatorio en obras públicas
  technicalReputationReq: number; // Mínimo 0-100
  advancePaymentPct: number; // Anticipo (ej: 20%)
  
  status: 'convocatoria_abierta' | 'adjudicada_jugador' | 'adjudicada_rival' | 'desierta';
  playerBid?: {
    offeredPrice: number;
    offeredDays: number;
    submittedDay: number;
  };
  rivalBids: ConstructionRivalBid[];
  winningBidder?: string;
  awardedPrice?: number;
}

export interface ActiveConstructionWork {
  id: string;
  tenderId: string;
  title: string;
  clientName: string;
  category: 'obra_publica' | 'obra_privada';
  totalContractPrice: number;
  advancePaymentReceived: number;
  billedMilestonesAmount: number;
  progressPct: number; // 0 - 100%
  daysRemaining: number;
  totalDaysEstimated: number;
  requiredWorkersPerDay: number; // Hombres / Cuadrilla mínima diaria
  laborEfficiencyPct: number; // Eficiencia según cuadrilla activa (0 - 150%)
  requiredMaterialsTotal: Record<ConstructionMaterialId, number>;
  materialsConsumed: Record<ConstructionMaterialId, number>;
  dailyMaterialNeeds: Record<ConstructionMaterialId, number>;
  isHaltedForMissingMaterials: boolean;
  missingMaterialsList: string[];
  delayFinesAccumulated: number;
  status: 'en_ejecucion' | 'completada' | 'penalizada';
  milestonesPaid: number; // 1, 2, 3 o 4
}

// ----------------------------------------------------
// Módulo de 4 Bancos Comerciales Competidores
// ----------------------------------------------------

export type CommercialBankId = 'ficohsa' | 'atlantida' | 'bac' | 'occidente';

export interface CommercialBankProfile {
  id: CommercialBankId;
  name: string;
  shortName: string;
  logo: string;
  tagline: string;
  colorHex: string;
  baseInterestRateLoan: number; // % anual
  baseDpfRate: number; // % pasiva
  creditCardFeeAnnual: number;
  minMonthlySalesForCredit: number;
}

export interface CompanyCreditProfile {
  score: number; // 300 - 850
  tier: 'AAA_EXCELENTE' | 'AA_MUY_BUENO' | 'A_BUENO' | 'B_ACEPTABLE' | 'C_EN_RIESGO';
  tierLabel: string;
  onTimePaymentsStreak: number;
  lastBiweeklyReviewDay: number;
  totalCreditLimit: number;
  creditUtilizationPct: number;
  autoLimitIncreaseUnlocked: boolean;
  rateDiscountPct: number;
  dtiRatioPct: number;
}

export type CommercialLoanType = 
  | 'capital_trabajo'
  | 'linea_revolvente'
  | 'credito_inventario'
  | 'credito_maquinaria'
  | 'credito_vehicular'
  | 'vehicular_equipo'
  | 'financiamiento_inmobiliario'
  | 'construccion_avances'
  | 'adquisicion_competidores'
  | 'tarjeta_empresarial'
  | 'credito_proveedores'
  | 'leasing_financiero'
  | 'factoraje_facturas'
  | 'credito_empresarial'
  | 'reestructurado';

export interface BankCommercialLoan {
  id: string;
  bankId: CommercialBankId;
  principalAmount: number;
  balanceRemaining: number;
  monthlyPayment: number;
  interestRateAnnual: number;
  termMonthsRemaining: number;
  purpose: string;
  loanType?: CommercialLoanType;
  equipmentModel?: string;
  amortizedPrincipalTotal?: number;
  isRestructured?: boolean;
  originalTermMonths?: number;
  originalMonthlyPayment?: number;
  gracePeriodMonthsRemaining?: number;
  collateralIdRef?: string;
  revolvingLimit?: number;
  revolvingDrawn?: number;
  leasingBuyoutOptionHNL?: number;
  factoredInvoiceAmount?: number;
  factoringDiscountPct?: number;
  // Aliases de conveniencia y compatibilidad
  remainingBalance?: number;
  paidInstallments?: number;
  status?: 'activo' | 'al_dia' | 'en_mora' | 'cancelado' | 'reestructurado';
}

export type CorporateCardTierId = 'business_standard' | 'corporate_gold' | 'infinite_black';

export interface CorporateCardTierConfig {
  tierId: CorporateCardTierId;
  name: string;
  badge: string;
  colorHex: string;
  cashbackPct: number;
  interestRateAnnual: number;
  minMonthlySales: number;
  annualFeeHNL: number;
  pointsMultiplier: number; // Puntos por cada L 100 de compra
  perks: string[];
}

export interface CorporateCardRewardItem {
  id: string;
  title: string;
  pointsCost: number;
  category: 'combustible' | 'mantenimiento' | 'impuestos' | 'cashback_directo';
  benefitValueHNL: number;
  description: string;
}

export interface BankCorporateCreditCard {
  cardId: string;
  cardNumber?: string; // Alias para display formateado
  bankId: CommercialBankId;
  brand: string; // ej: "Visa Signature Corporativa"
  tier?: CorporateCardTierId;
  creditLimit: number;
  availableCredit?: number; // Alias de conveniencia
  currentBalance: number;
  interestRateAnnual: number;
  minPaymentMonthly: number;
  lastLimitIncreaseDay?: number;
  limitIncreasesCount?: number;
  cashbackPct?: number;
  rewardPoints?: number;
  pointsAccumulatedTotal?: number;
}

export interface BankCheckingAccount {
  accountNumber: string;
  balance: number;
  overdraftLimit: number;
  overdraftUsed: number;
  checksUsedCount: number;
  interestRateAnnual?: number; // Tasa pasiva de rendimiento anual negociada
  interestRateYieldPct?: number;
  openedDay?: number;
  monthlyFeeHNL?: number;
}

export interface BankGuaranteeDeposit {
  id: string;
  bankId: CommercialBankId;
  amountPledged: number; // Monto inmovilizado
  tenderIdRef?: string;
  purpose: string; // "Fianza de Cumplimiento de Contrato"
  status: 'activo' | 'liberado';
  annualRatePct?: number; // Rendimiento pasivo anual (3.5% - 4.5%)
  accruedInterest?: number; // Interés ganado acumulado
  createdDay?: number;
  releasedDay?: number;
}

export interface BankTermDeposit {
  id: string;
  bankId: CommercialBankId;
  principalAmount: number;
  annualRatePct: number;
  interestRateAnnual?: number; // Alias de conveniencia
  tierBonusPct?: number; // Bonificación de tasa por tramo de capital (+0.5% a +2.2%)
  effectiveRatePct?: number; // Tasa base + bonificación
  termDays: number;
  daysRemaining: number;
  maturesDay?: number; // Alias día de vencimiento
  accruedInterest: number;
  currentBalance?: number; // Capital + interés compuesto acumulado
  isEarlyLiquidated?: boolean;
}

export interface CommercialBankRelationship {
  bankId: CommercialBankId;
  relationshipScore: number; // 0 - 100
  checkingAccount?: BankCheckingAccount;
  activeLoan?: BankCommercialLoan;
  loans?: BankCommercialLoan[];
  corporateCard?: BankCorporateCreditCard;
  guaranteeDeposits: BankGuaranteeDeposit[];
  termDeposits: BankTermDeposit[];
  negotiatedRateDiscount?: number;
}

// ----------------------------------------------------
// Módulo de Maquinaria, Vehículos Comerciales & Flota (1 a 5 Estrellas)
// ----------------------------------------------------

export type MachineryCategory = 
  // Constructora
  | 'volqueta_14m3'
  | 'retroexcavadora_4x4'
  | 'camion_mixer'
  | 'grua_torre'
  | 'motoniveladora'
  // Supermercado / Minimarket
  | 'camion_refrigerado_3t'
  | 'furgon_reparto'
  | 'camara_frigorifica_industrial'
  | 'montacargas_electrico'
  // Bar / Restaurante / Comida
  | 'flota_motos_delivery'
  | 'van_utilitaria_reparto'
  | 'horno_convector_industrial'
  | 'linea_refrigeracion_acero';

export interface MachineryDealer {
  id: string;
  name: string;
  city: string;
  ratingStars: 1 | 2 | 3 | 4 | 5;
  tagline: string;
  reputationDiscountPct: number;
  applicableSectors?: RetailSectorId[];
  catalog: {
    id: string;
    modelName: string;
    category: MachineryCategory;
    icon: string;
    ratingStars: 1 | 2 | 3 | 4 | 5;
    priceHNL: number;
    hourlyFuelCost: number; // Costo por hora operativa siendo dueño vs alquilado
    description: string;
    applicableSectors?: RetailSectorId[];
  }[];
}

export interface OwnedMachineryUnit {
  id: string;
  dealerId: string;
  dealerName: string;
  modelName: string;
  category: MachineryCategory;
  icon: string;
  ratingStars: 1 | 2 | 3 | 4 | 5;
  purchasePrice: number;
  conditionPct: number;
  totalHoursWorked: number;
  hourlyFuelCost: number;
  financedWithBank?: CommercialBankId;
}

// ----------------------------------------------------
// Módulo de Licitación de Materiales con Fabricantes (1 a 5 Estrellas)
// ----------------------------------------------------

export interface MaterialManufacturerQuote {
  id: string;
  manufacturerName: string;
  materialId: ConstructionMaterialId;
  ratingStars: 1 | 2 | 3 | 4 | 5;
  unitCost: number;
  discountPct: number; // Descuento por licitación
  minBatchUnits: number;
  deliveryDays: number;
  qualityBadge: string;
}

// ----------------------------------------------------
// Módulo de Auditoría Tributaria Anual SAR (Honduras)
// ----------------------------------------------------

export interface SarTaxAuditRecord {
  taxYear: number;
  grossRevenues: number; // Ingresos brutos por cobro de estimaciones de obra y ventas
  deductibleMaterialsExpenses: number; // Facturas con CAI de compra de materiales
  deductiblePayrollExpenses: number; // Planilla laboral con retenciones
  deductibleOtherCosts: number; // Alquileres, combustible y depreciación
  netTaxableIncome: number; // Base Imponible (Renta Neta Gravable)
  taxRatePct: number; // 25% ISR en Honduras
  isrTaxAmount: number; // Impuesto Sobre la Renta calculado
  pendingTaxDue?: number;
  isFiled?: boolean;
  isPaid: boolean;
  auditStatus: 'pendiente' | 'aprobada_conforme' | 'reparos_auditados';
  solvenciaFiscalIssued: boolean;
  solvenciaExpirationYear: number;
  auditNotes: string[];
}

export interface DailySimulationState {
  currentDay: number; // 1 - 30
  currentMonth: number;
  currentYear: number;
  dailyHour: number; // 9 a 18
  isDayClosed: boolean;
  roleMode: RetroRoleMode; // 3 etapas completamente separadas
  lastClosingSummary: {
    revenue: number;
    cogs: number;
    operatingCosts: number;
    netProfit: number;
    events: string[];
  } | null;

  // Modalidad Empresario (100% Tienda / Bar / Construcción)
  retailSector: RetailSectorId;
  storeName: string;
  storeCash: number; // Dinero físico en caja / tesorería
  storeBankBalance: number; // En cuenta comercial externa
  storeReputation: number; // 0 - 100
  storeCleanliness: number;
  products: RetailProduct[];
  supplierOrders: SupplierOrder[];
  walkInQueue: RetailCustomerWalkIn[];
  dailyReceipts: SalesReceipt[];
  staffCount: number;
  dailyWages: number;
  dailyRent: number;
  monthlySalesAccumulated: number;

  // Banco Inteligente Externo para la Empresa (Opcional / Legado)
  smartBankOffers?: SmartBankFacility[];
  smartBankCreditRating?: 'AAA' | 'AA' | 'A' | 'BBB' | 'B';

  // Modalidad Específica: Constructora & Obras de Infraestructura
  constructionMaterials: ConstructionMaterial[];
  constructionOrders: ConstructionMaterialOrder[];
  availableTenders: ConstructionTender[];
  activeWorks: ActiveConstructionWork[];
  completedWorksHistory: {
    id: string;
    title: string;
    clientName: string;
    contractPrice: number;
    completionDay: number;
    profitEarned: number;
    penaltiesDeducted: number;
  }[];

  // Ecosistema de Bancos Comerciales & Servicios Financieros
  commercialBanks: Record<CommercialBankId, CommercialBankRelationship>;
  companyCreditProfile?: CompanyCreditProfile;
  creditNotifications?: {
    id: string;
    day: number;
    message: string;
    type: 'aumento_limite' | 'cuota_pagada' | 'alerta_mora' | 'descuento_tasa';
    date: string;
  }[];
  
  // Flota de Maquinaria Pesada & Concesionarias (1 a 5 Estrellas)
  ownedMachinery: OwnedMachineryUnit[];
  machineryDealers: MachineryDealer[];

  // Licitaciones de Materiales con Fabricantes (1 a 5 Estrellas)
  materialManufacturerQuotes: MaterialManufacturerQuote[];

  // Cumplimiento Tributario Anual del SAR (25% ISR y Solvencia Fiscal)
  sarTaxRecord: SarTaxAuditRecord;
  fiscalSolvenciaActive: boolean;

  // Modalidad Banquero (100% Estilo Bank 2000)
  bankerVaultCash: number; // Dinero físico en la bóveda
  bankerBchReserve: number; // Encaje legal en BCH
  bankerTotalDeposits: number; // Total depósitos del público
  bankerDepositRatePct: number; // Tasa pasiva (%)
  bankerMonthlyFee: number; // Comisión mantenimiento
  bankerAtmFee: number; // Comisión cajero
  bankerReputation: number; // Confianza pública (0-100)
  bankerRunRiskPct: number; // Riesgo corrida (0-100)
  docketQueue: BankerDocketApplicant[];
  activeLoansCount: number;
  totalLoanPortfolio: number;
  delinquentLoansCount: number;
  processedDocketsToday: number;
  approvedAmountToday: number;
  rejectedCountToday: number;

  // Historial de auditoría
  dailyHistory: {
    day: number;
    month: number;
    revenue: number;
    expenses: number;
    netProfit: number;
    summary: string;
  }[];

  // Cumplimiento Tributario Detallado (SAR)
  fiscalPeriods?: SarFiscalPeriodRecord[];

  // Ofertas Bancarias Dinámicas & Comprobantes Oficiales
  dynamicBankOffers?: DynamicBankOffer[];
  transactionVouchers?: TransactionVoucher[];

  // Correo Empresarial Simulado Dentro del Juego
  simulatedEmails?: SimulatedEmail[];

  // Garantías Reales Registradas (Casas, Terrenos, Locales, Maquinaria, etc.)
  realEstateCollaterals?: RealEstateCollateralItem[];

  // Centro de Obligaciones y Pasivos
  supplierCredits?: SupplierCreditItem[];
  autoDebitEnabled?: boolean;

  // Competidores Activos del Mercado Local (M&A)
  activeCompetitors?: CompetitorFirm[];
}

export type CollateralAssetType = 
  | 'casa_habitacion' 
  | 'terreno_comercial' 
  | 'local_bodega' 
  | 'planta_industrial'
  | 'vehiculo_comercial' 
  | 'maquinaria_pesada' 
  | 'deposito_plazo' 
  | 'cuentas_por_cobrar';

export type CollateralStatus = 'disponible' | 'pignorado_parcial' | 'pignorado_total';

export interface CollateralLien {
  id: string;
  rank: 1 | 2; // 1er o 2do rango
  priorityRank?: 1 | 2;
  beneficiaryBankId: CommercialBankId;
  beneficiaryBankName: string;
  linkedLoanId: string;
  committedCoverageHNL: number;
  registeredDate: string;
}

export interface RealEstateCollateralItem {
  id: string;
  title: string;
  assetType: CollateralAssetType;
  ownerName: string;
  companyName: string;
  description: string;
  location: string;
  status: CollateralStatus;
  acquisitionValueHNL: number;
  acquisitionValue?: number;
  marketValueHNL: number;
  marketValue?: number;
  appraisalValueHNL: number; // Valor de avalúo oficial
  appraisalValue?: number;
  appraisalDate: string;
  ltvAcceptedPct: number; // Porcentaje aceptado de cobertura (ej: 75% u 80%)
  ltvPercentage?: number;
  eligibleCollateralValueHNL: number; // Avalúo * % LTV
  eligibleValue?: number;
  committedCoverage?: number;
  availableCoverage?: number;
  liens: CollateralLien[];
  pledgedAmountTotal: number;
  availableCoverageHNL: number;
  isPledged: boolean;
  isLockedForSale: boolean;
  registrationNumber: string;
  simulatedDocumentNumber: string;
  situationNotes: string;
  // Compatibilidad hacia atrás
  pledgedToBankId?: CommercialBankId;
  linkedDebtId?: string;
}

export type VoucherOperationType = 
  | 'desembolso_prestamo'
  | 'pago_cuota'
  | 'pago_parcial'
  | 'abono_capital'
  | 'cancelacion_total'
  | 'retiro_caja'
  | 'deposito_cuenta'
  | 'transferencia_cuentas'
  | 'pago_impuesto_sar'
  | 'liberacion_garantia';

export interface TransactionVoucher {
  id: string;
  voucherNumber: string;
  operationType: VoucherOperationType | string;
  title: string;
  timestamp: string;
  simDay: number;
  simMonth: number;
  simYear: number;
  companyName: string;
  primaryBankId?: CommercialBankId;
  sourceBankId?: CommercialBankId;
  destinationBankId?: CommercialBankId;
  accountNumber?: string;
  destinationAccountNumber?: string;
  grossAmountHNL: number;
  amount?: number;
  deductionsHNL: number;
  openingFeeDeduction?: number;
  netDisbursedOrPaidHNL: number;
  netDisbursement?: number;
  deductionsBreakdown?: {
    concept: string;
    amountHNL: number;
  }[];
  priorBalanceHNL: number;
  newBalanceHNL: number;
  newBalance?: number;
  loanBalancePriorHNL?: number;
  loanBalanceNewHNL?: number;
  distributionBreakdown?: {
    cargosMora: number;
    interesesDevengados: number;
    amortizacionCapital: number;
    reglaAplicada: string;
  };
  releasedCollaterals?: string[];
  referenceCode: string;
  authStamp: string;
  notes?: string;
  description?: string;
}

export type EmailCategory = 
  | 'ventas_clientes'
  | 'bancos_financiamiento'
  | 'pagos_vencimientos'
  | 'proveedores'
  | 'sar_tributario'
  | 'garantias'
  | 'proyectos'
  | 'competidores_adquisiciones'
  | 'sistema_avisos';

export interface DynamicBankOffer {
  id: string;
  bankId: CommercialBankId;
  productType: CommercialLoanType;
  title: string;
  amountOrLimitHNL: number;
  offeredAmount?: number;
  annualRatePct: number;
  termMonths: number;
  openingFeePct: number;
  requiresCollateral: boolean;
  estimatedMonthlyPaymentHNL: number;
  expiresDay: number;
  expiresMonth: number;
  isPreApproved: boolean;
  status: 'vigente' | 'negociando' | 'aceptada' | 'rechazada' | 'expirada' | 'disponible';
  negotiatedRateDiscountPct?: number;
}

export interface SimulatedEmail {
  id: string;
  category: EmailCategory;
  senderName?: string;
  sender?: string; // Alias de remitente
  senderEmail: string;
  recipientEmail?: string;
  recipient?: string; // Alias de destinatario
  companyName?: string;
  subject: string;
  body: string;
  sentDate?: string;
  simDay?: number;
  simMonth?: number;
  simYear?: number;
  dateDay?: number; // Alias día
  dateMonth?: number; // Alias mes
  dateYear?: number; // Alias año
  snippet?: string; // Resumen breve
  status?: string; // Estado de la notificación
  isRead: boolean;
  isStarred: boolean;
  isArchived?: boolean;
  folder?: 'inbox' | 'starred' | 'sent' | 'archive';
  relatedEntityType?: 'loan_payment' | 'bank_offer' | 'customer_order' | 'supplier_invoice' | 'sar_obligation' | 'collateral_asset' | 'daily_summary';
  relatedEntityId?: string;
  voucherId?: string;
  bankOfferPayload?: DynamicBankOffer;
  paymentNoticePayload?: {
    targetType: 'loan' | 'sar' | 'supplier';
    bankId?: CommercialBankId;
    dueDay: number;
    amountDueHNL: number;
    penaltyHNL?: number;
    interestHNL?: number;
    principalHNL?: number;
  };
  voucherPayload?: TransactionVoucher;
  actionRequired?: boolean;
  statusTag?: 'Pendiente' | 'Resuelto' | 'Pre-Aprobado' | 'Vencido';
  isReplied?: boolean;
}

export interface SarFiscalPeriodRecord {
  fiscalYear: number;
  periodName: string;
  grossRevenueHNL: number;
  allowableDeductionsHNL: number;
  taxableNetIncomeHNL: number;
  calculatedTaxAmount: number; // 25% ISR
  isDeclared: boolean;
  declaredDate?: string;
  declarationFormNumber?: string;
  isPaid: boolean;
  paidDate?: string;
  paidAmountHNL: number;
  paymentReceiptNumber?: string;
  paymentVoucherId?: string;
  solvenciaIssued: boolean;
  solvenciaNumber?: string;
  solvenciaExpiryDate?: string;
}

export interface SupplierCreditItem {
  id: string;
  supplierName: string;
  concept: string;
  invoiceNumber: string;
  amountHNL: number;
  issuedDay: number;
  dueDay: number;
  isPaid: boolean;
  earlyDiscountPct: number;
  latePenaltyDailyPct: number;
}

export interface CompetitorFirm {
  id: string;
  name: string;
  sector: RetailSectorId;
  marketSharePct: number;
  cashBalanceHNL: number;
  bankDebtHNL: number;
  inventoryValueHNL: number;
  monthlySalesHNL: number;
  pricingStrategy: 'agresiva' | 'moderada' | 'calidad_premium';
  isDistressed: boolean;
  acquisitionPriceAssetDealHNL: number;
  acquisitionPriceSharePurchaseHNL: number;
  status: 'activo' | 'adquirido_jugador' | 'en_quiebra';
}

export interface FinancialStatementsSummary {
  // Balance General
  currentAssets: {
    cashInHand: number;
    cashInBank: number;
    guaranteeDeposits: number;
    inventoryStock: number;
    accountsReceivable: number;
    total: number;
  };
  nonCurrentAssets: {
    machineryAndFleet: number;
    accumulatedDepreciation: number;
    realEstateCollaterals: number;
    total: number;
  };
  totalAssets: number;

  currentLiabilities: {
    shortTermLoans: number;
    creditCardsBalance: number;
    supplierAccountsPayable: number;
    customerAdvancesLiability: number;
    sarTaxPayable: number;
    total: number;
  };
  nonCurrentLiabilities: {
    longTermLoans: number;
    total: number;
  };
  totalLiabilities: number;

  netEquity: number; // Activos - Pasivos (comprobación contable)

  // Estado de Resultados
  incomeStatement: {
    grossRevenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number; // Salarios, alquiler, insumos
    ebitda: number;
    interestExpenses: number; // Intereses a bancos
    taxExpenseSAR: number; // 25% ISR
    netIncome: number;
  };

  // Flujo de Efectivo
  cashFlowStatement: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netChangeInCash: number;
  };
}

