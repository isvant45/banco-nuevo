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

export interface BankCommercialLoan {
  id: string;
  bankId: CommercialBankId;
  principalAmount: number;
  balanceRemaining: number;
  monthlyPayment: number;
  interestRateAnnual: number;
  termMonthsRemaining: number;
  purpose: string;
  loanType?: 'capital_trabajo' | 'vehicular_equipo' | 'reestructurado';
  equipmentModel?: string;
  amortizedPrincipalTotal?: number;
  isRestructured?: boolean;
  originalTermMonths?: number;
  originalMonthlyPayment?: number;
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
  bankId: CommercialBankId;
  brand: string; // ej: "Visa Signature Corporativa"
  tier?: CorporateCardTierId;
  creditLimit: number;
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
  tierBonusPct?: number; // Bonificación de tasa por tramo de capital (+0.5% a +2.2%)
  effectiveRatePct?: number; // Tasa base + bonificación
  termDays: number;
  daysRemaining: number;
  accruedInterest: number;
  currentBalance?: number; // Capital + interés compuesto acumulado
  isEarlyLiquidated?: boolean;
}

export interface CommercialBankRelationship {
  bankId: CommercialBankId;
  relationshipScore: number; // 0 - 100
  checkingAccount?: BankCheckingAccount;
  activeLoan?: BankCommercialLoan;
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
}
