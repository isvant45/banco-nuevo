/**
 * Motor Unificado de la Economía Compartida, Progresión en 4 Bancas,
 * Scoring Explicable y Colaterales Reales (Casas, Carros, Terrenos).
 */

export type BankingSegment = 'personas' | 'pyme' | 'corporativo' | 'privada';

export interface CollateralAsset {
  id: string;
  type: 'inmueble_casa' | 'inmueble_terreno' | 'vehiculo_comercial' | 'vehiculo_lujo' | 'maquinaria_pesada' | 'deposito_garantia';
  title: string;
  ownerName: string;
  appraisalValueHNL: number; // Valor de tasación oficial
  valuationDate: string;
  legalStatus: 'libre_gravamen' | 'gravamen_primer_rango' | 'en_garantia';
  liquidityRating: 'alta' | 'media' | 'baja';
  haircutMarginPct: number; // Descuento de riesgo (ej. 25% para casas, 40% para carros)
  recoverableValueHNL: number; // appraisalValueHNL * (1 - haircutMarginPct)
  pledgedToBankId?: string; // Banco que tiene la garantía
  backingLoanId?: string;
}

export interface ExplainableCreditScore {
  score: number; // 300 - 1000
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  dtiPct: number; // Ratio deuda/ingreso
  dscrRatio: number; // Cobertura servicio deuda
  factors: {
    paymentHistoryScore: { value: number; max: 350; explanation: string };
    debtBurdenDtiScore: { value: number; max: 250; explanation: string };
    cashFlowDscrScore: { value: number; max: 150; explanation: string };
    businessTenureScore: { value: number; max: 100; explanation: string };
    creditUtilizationScore: { value: number; max: 50; explanation: string };
    cnbsRiskScore: { value: number; max: 50; explanation: string };
    auditQualityScore: { value: number; max: 50; explanation: string };
  };
  improvementActions: string[];
  deterioratingActions: string[];
}

export interface RetailProductWithPerishability {
  id: string;
  name: string;
  category: 'perecederos_frescos' | 'lacteos_carnes' | 'granos_basicos' | 'bebidas_snacks' | 'limpieza_hogar';
  currentStock: number;
  costPriceHNL: number;
  sellingPriceHNL: number;
  daysToPerish: number; // 0 = caducado, >0 días restantes
  perishRatePct: number; // Porcentaje de pérdida al vencer
  supplierLeadDays: number;
  supplierMinBatch: number;
}

export interface RealEstateProjectStage {
  stageNumber: number;
  title: string;
  description: string;
  budgetRequiredHNL: number;
  spentSoFarHNL: number;
  disbursedByBankHNL: number;
  inspectionPassed: boolean;
  completionPct: number; // 0 - 100%
}

export interface RealEstateConstructionProject {
  id: string;
  title: string;
  developerCompanyId: string;
  developerCompanyName: string;
  developerEquityInvestedHNL: number;
  landAppraisalValueHNL: number;
  totalApprovedBankFacilityHNL: number;
  totalDisbursedBankHNL: number;
  interestRateAnnual: number;
  totalHousingUnits: number;
  unitsSold: number;
  unitSalePriceHNL: number;
  currentStageIndex: number;
  stages: RealEstateProjectStage[];
  status: 'permisos' | 'en_obra' | 'inspeccion_pendiente' | 'finalizada_ventas' | 'liquidada';
  bankAssignedId: string;
}

export interface VehicleStockUnit {
  id: string;
  model: string;
  make: string;
  year: number;
  condition: 'nuevo' | 'seminuevo_impecable' | 'usado_bueno';
  mileageKm: number;
  acquisitionCostHNL: number;
  listPriceHNL: number;
  monthlyDepreciationHNL: number;
  isPledgedInFloorPlan: boolean;
}

export interface UnifiedEconomyState {
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  playerSegment: BankingSegment;
  playerPersonalNetWorth: number; // Evalúa acceso a Banca Privada (> L 15,000,000)
  
  // Colaterales y propiedades patrimoniales
  playerCollaterals: CollateralAsset[];

  // Supermercado y Tiendas Minoristas
  supermarketStock: RetailProductWithPerishability[];
  monthlySpoilageLossesHNL: number;
  supermarketDailyRevenueHNL: number;
  retailStoresCount: number;

  // Constructoras e Inmobiliarias
  activeConstructionProjects: RealEstateConstructionProject[];

  // Autolotes y Concesionarias
  dealershipFleet: VehicleStockUnit[];
  dealershipCashBalanceHNL: number;

  // Score Crediticio Explicable
  creditScore: ExplainableCreditScore;
}

/**
 * Evalúa el segmento bancario en base a la progresión empresarial y personal
 */
export function evaluateBankingSegment(
  monthlySales: number,
  storesCount: number,
  personalNetWorth: number
): {
  businessSegment: 'personas' | 'pyme' | 'corporativo';
  hasPrivateBanking: boolean;
  explanation: string;
} {
  const hasPrivateBanking = personalNetWorth >= 15000000;

  let businessSegment: 'personas' | 'pyme' | 'corporativo' = 'personas';
  let explanation = '';

  if (monthlySales >= 3500000 || storesCount >= 4) {
    businessSegment = 'corporativo';
    explanation = 'Califica a Banca Corporativa por superar L 3.5M en ventas mensuales o contar con cadena comercial nacional.';
  } else if (monthlySales >= 250000 && storesCount >= 1) {
    businessSegment = 'pyme';
    explanation = 'Califica a Banca Pyme por volumen comercial superior a L 250K y formalidad de local en expansión.';
  } else {
    businessSegment = 'personas';
    explanation = 'Atendido en Banca de Personas como comerciante individual o pequeña tienda inicial.';
  }

  if (hasPrivateBanking) {
    explanation += ' Adicionalmente, cuenta con acceso exclusivo a BANCA PRIVADA por patrimonio personal > L 15M.';
  }

  return { businessSegment, hasPrivateBanking, explanation };
}

/**
 * Calcula el Score Crediticio Explicable en 7 dimensiones cuantitativas
 */
export function calculateExplainableCreditScore(
  monthlySales: number,
  currentDebt: number,
  monthlyDebtPayment: number,
  unpaidPastDueDays: number,
  hasAuditedBooks: boolean,
  collateralsValue: number
): ExplainableCreditScore {
  const monthlyCashFlow = Math.max(1000, monthlySales * 0.22); // Margen operativo 22%
  const dti = monthlySales > 0 ? Math.round((currentDebt / (monthlySales * 12)) * 100) : 100;
  const dscr = monthlyDebtPayment > 0 ? +(monthlyCashFlow / monthlyDebtPayment).toFixed(2) : 5.0;

  // 1. Historial de Pagos (0 a 350 pts)
  let paymentPts = 350;
  let paymentText = 'Pagos puntuales sin atrasos registrados.';
  if (unpaidPastDueDays > 90) {
    paymentPts = 70;
    paymentText = 'Morosidad grave superior a 90 días castiga severamente el puntaje.';
  } else if (unpaidPastDueDays > 30) {
    paymentPts = 180;
    paymentText = 'Atrasos recientes de más de 30 días deterioran el score.';
  } else if (unpaidPastDueDays > 0) {
    paymentPts = 280;
    paymentText = 'Atraso menor detectado en el último período.';
  }

  // 2. Nivel de Endeudamiento DTI (0 a 250 pts)
  let dtiPts = 250;
  let dtiText = `DTI saludable del ${dti}% (óptimo menor al 30%).`;
  if (dti > 60) {
    dtiPts = 60;
    dtiText = `DTI elevado del ${dti}% indica sobreendeudamiento.`;
  } else if (dti > 40) {
    dtiPts = 160;
    dtiText = `DTI moderado del ${dti}%.`;
  }

  // 3. Flujo de Caja Disponible DSCR (0 a 150 pts)
  let dscrPts = 150;
  let dscrText = `Excelente cobertura de cuotas DSCR de ${dscr}x.`;
  if (dscr < 1.1) {
    dscrPts = 30;
    dscrText = `Flujo de caja ajustado (${dscr}x), riesgo de iliquidez.`;
  } else if (dscr < 1.5) {
    dscrPts = 95;
    dscrText = `Flujo operativo adecuado (${dscr}x).`;
  }

  // 4. Antigüedad y Solvencia (0 a 100 pts)
  const tenurePts = 85;
  const tenureText = 'Empresa con operaciones formales y solvencia fiscal SAR.';

  // 5. Utilización de Líneas (0 a 50 pts)
  const utilPts = 45;
  const utilText = 'Manejo prudente de tarjetas y sobregiros.';

  // 6. Récord CNBS (0 a 50 pts)
  const cnbsPts = unpaidPastDueDays === 0 ? 50 : 20;
  const cnbsText = unpaidPastDueDays === 0 ? 'Categoría I - Normal ante CNBS.' : 'Categoría bajo vigilancia CNBS.';

  // 7. Auditoría y Libros (0 a 50 pts)
  const auditPts = hasAuditedBooks ? 50 : 25;
  const auditText = hasAuditedBooks ? 'Estados financieros auditados por contador público.' : 'Registros contables internos sin dictamen externo.';

  const totalScore = Math.min(1000, Math.max(300, paymentPts + dtiPts + dscrPts + tenurePts + utilPts + cnbsPts + auditPts));

  let rating: ExplainableCreditScore['rating'] = 'BBB';
  if (totalScore >= 900) rating = 'AAA';
  else if (totalScore >= 820) rating = 'AA';
  else if (totalScore >= 740) rating = 'A';
  else if (totalScore >= 660) rating = 'BBB';
  else if (totalScore >= 580) rating = 'BB';
  else if (totalScore >= 500) rating = 'B';
  else rating = 'CCC';

  return {
    score: totalScore,
    rating,
    dtiPct: dti,
    dscrRatio: dscr,
    factors: {
      paymentHistoryScore: { value: paymentPts, max: 350, explanation: paymentText },
      debtBurdenDtiScore: { value: dtiPts, max: 250, explanation: dtiText },
      cashFlowDscrScore: { value: dscrPts, max: 150, explanation: dscrText },
      businessTenureScore: { value: tenurePts, max: 100, explanation: tenureText },
      creditUtilizationScore: { value: utilPts, max: 50, explanation: utilText },
      cnbsRiskScore: { value: cnbsPts, max: 50, explanation: cnbsText },
      auditQualityScore: { value: auditPts, max: 50, explanation: auditText }
    },
    improvementActions: [
      'Abonar capital a préstamos comerciales para reducir el DTI por debajo del 30%.',
      'Constituir avalúo formal sobre bienes inmuebles para mejorar respaldo colateral.',
      'Mantener pagos automáticos antes de la fecha límite para maximizar los 350 pts de historial.'
    ],
    deterioratingActions: [
      'Girar cheques sin fondos suficientes o sobrepasar líneas de crédito.',
      'Tomar nuevos créditos simultáneos sin incrementar la facturación mensual.'
    ]
  };
}

/**
 * Simulación de Perecederos y Caducidad en Supermercado
 */
export function simulateSupermarketDay(
  stock: RetailProductWithPerishability[],
  customerFootfall: number
): {
  updatedStock: RetailProductWithPerishability[];
  salesRevenueHNL: number;
  spoilageCostHNL: number;
  unitsSold: number;
  unitsSpoiled: number;
} {
  let salesRevenueHNL = 0;
  let spoilageCostHNL = 0;
  let unitsSold = 0;
  let unitsSpoiled = 0;

  const updatedStock = stock.map(item => {
    // 1. Venta según demanda y stock
    const maxDemand = Math.round((customerFootfall * 0.4) * (item.category === 'granos_basicos' ? 1.5 : 1.0));
    const sold = Math.min(item.currentStock, Math.max(0, Math.floor(Math.random() * maxDemand) + 5));
    const remAfterSale = item.currentStock - sold;

    salesRevenueHNL += sold * item.sellingPriceHNL;
    unitsSold += sold;

    // 2. Envejecimiento y caducidad para perecederos
    let newDaysToPerish = item.daysToPerish - 1;
    let finalStock = remAfterSale;

    if (newDaysToPerish <= 0 && (item.category === 'perecederos_frescos' || item.category === 'lacteos_carnes')) {
      const spoiled = Math.round(remAfterSale * (item.perishRatePct / 100));
      spoilageCostHNL += spoiled * item.costPriceHNL;
      unitsSpoiled += spoiled;
      finalStock = remAfterSale - spoiled;
      newDaysToPerish = 5; // Reemplazo de lote
    }

    return {
      ...item,
      currentStock: finalStock,
      daysToPerish: Math.max(1, newDaysToPerish)
    };
  });

  return {
    updatedStock,
    salesRevenueHNL,
    spoilageCostHNL,
    unitsSold,
    unitsSpoiled
  };
}

/**
 * Catálogo Inicial de Productos con Caducidad para Supermercado
 */
export const DEFAULT_SUPERMARKET_CATALOG: RetailProductWithPerishability[] = [
  {
    id: 'prod_fresco_01',
    name: 'Frutas & Verduras Frescas del Valle',
    category: 'perecederos_frescos',
    currentStock: 350,
    costPriceHNL: 18,
    sellingPriceHNL: 32,
    daysToPerish: 4,
    perishRatePct: 40,
    supplierLeadDays: 1,
    supplierMinBatch: 100
  },
  {
    id: 'prod_lacteo_02',
    name: 'Leche Entera y Quesos Artesanales',
    category: 'lacteos_carnes',
    currentStock: 280,
    costPriceHNL: 26,
    sellingPriceHNL: 42,
    daysToPerish: 7,
    perishRatePct: 30,
    supplierLeadDays: 2,
    supplierMinBatch: 80
  },
  {
    id: 'prod_granos_03',
    name: 'Arroz Blanco y Frijol Rojo Selección',
    category: 'granos_basicos',
    currentStock: 1200,
    costPriceHNL: 14,
    sellingPriceHNL: 22,
    daysToPerish: 180,
    perishRatePct: 2,
    supplierLeadDays: 3,
    supplierMinBatch: 250
  },
  {
    id: 'prod_bebidas_04',
    name: 'Jugos Naturales & Café Tostado',
    category: 'bebidas_snacks',
    currentStock: 650,
    costPriceHNL: 28,
    sellingPriceHNL: 50,
    daysToPerish: 45,
    perishRatePct: 5,
    supplierLeadDays: 2,
    supplierMinBatch: 120
  },
  {
    id: 'prod_limpieza_05',
    name: 'Detergente Industrial & Desinfectante',
    category: 'limpieza_hogar',
    currentStock: 500,
    costPriceHNL: 45,
    sellingPriceHNL: 75,
    daysToPerish: 365,
    perishRatePct: 1,
    supplierLeadDays: 4,
    supplierMinBatch: 150
  }
];

/**
 * Catálogo Inicial de Garantías Reales y Colateral
 */
export const DEFAULT_INITIAL_COLLATERALS: CollateralAsset[] = [
  {
    id: 'col_casa_01',
    type: 'inmueble_casa',
    title: 'Residencia Familiar en Col. Bella Vista',
    ownerName: 'Director Ejecutivo',
    appraisalValueHNL: 4200000,
    valuationDate: '15/01/2026',
    legalStatus: 'libre_gravamen',
    liquidityRating: 'alta',
    haircutMarginPct: 0.25, // Margen de castigo 25% (LTV 75%)
    recoverableValueHNL: 3150000
  },
  {
    id: 'col_terreno_02',
    type: 'inmueble_terreno',
    title: 'Lote Comercial en Bulevar del Norte (1,200 v²)',
    ownerName: 'Corporación Comercial',
    appraisalValueHNL: 6500000,
    valuationDate: '10/02/2026',
    legalStatus: 'libre_gravamen',
    liquidityRating: 'media',
    haircutMarginPct: 0.35,
    recoverableValueHNL: 4225000
  },
  {
    id: 'col_camion_03',
    type: 'vehiculo_comercial',
    title: 'Camión Isuzu Forward 12 Toneladas (2024)',
    ownerName: 'Corporación Comercial',
    appraisalValueHNL: 1100000,
    valuationDate: '05/01/2026',
    legalStatus: 'libre_gravamen',
    liquidityRating: 'alta',
    haircutMarginPct: 0.40,
    recoverableValueHNL: 660000
  }
];

/**
 * Proyecto Inmobiliario de Ejemplo (8 Fases y Desembolsos)
 */
export const DEFAULT_INITIAL_CONSTRUCTION_PROJECT: RealEstateConstructionProject = {
  id: 'proj_residencial_los_alpes',
  title: 'Condominios Residenciales Los Alpes (36 Unidades)',
  developerCompanyId: 'ent-001',
  developerCompanyName: 'Constructora Metropolitana',
  developerEquityInvestedHNL: 5500000,
  landAppraisalValueHNL: 8000000,
  totalApprovedBankFacilityHNL: 18000000,
  totalDisbursedBankHNL: 4500000,
  interestRateAnnual: 11.5,
  totalHousingUnits: 36,
  unitsSold: 8,
  unitSalePriceHNL: 1650000,
  currentStageIndex: 2,
  status: 'en_obra',
  bankAssignedId: 'atlantida',
  stages: [
    {
      stageNumber: 1,
      title: 'Aporte de Terreno y Movimiento de Tierra',
      description: 'Topografía, terrazas y excavaciones iniciales de cimentación.',
      budgetRequiredHNL: 3000000,
      spentSoFarHNL: 3000000,
      disbursedByBankHNL: 2000000,
      inspectionPassed: true,
      completionPct: 100
    },
    {
      stageNumber: 2,
      title: 'Cimentación Profunda y Muros de Contención',
      description: 'Zapatas de concreto armado, pedestales y muros perimetrales.',
      budgetRequiredHNL: 4500000,
      spentSoFarHNL: 4200000,
      disbursedByBankHNL: 2500000,
      inspectionPassed: true,
      completionPct: 90
    },
    {
      stageNumber: 3,
      title: 'Estructura Principal y Losas (Obra Gris)',
      description: 'Columnas de concreto armado, losas postensadas y ductería eléctrica.',
      budgetRequiredHNL: 5000000,
      spentSoFarHNL: 1800000,
      disbursedByBankHNL: 0,
      inspectionPassed: false,
      completionPct: 35
    },
    {
      stageNumber: 4,
      title: 'Instalaciones Hidrosanitarias y Redes',
      description: 'Tuberías de presión, red contra incendios y acometidas de gas.',
      budgetRequiredHNL: 3000000,
      spentSoFarHNL: 0,
      disbursedByBankHNL: 0,
      inspectionPassed: false,
      completionPct: 0
    },
    {
      stageNumber: 5,
      title: 'Acabados, Pisos de Porcelanato y Ventanería',
      description: 'Revestimientos interiores, puertas termoacústicas y pintura.',
      budgetRequiredHNL: 2500000,
      spentSoFarHNL: 0,
      disbursedByBankHNL: 0,
      inspectionPassed: false,
      completionPct: 0
    }
  ]
};

/**
 * Inventario de Autolote y Concesionaria
 */
export const DEFAULT_DEALERSHIP_STOCK: VehicleStockUnit[] = [
  {
    id: 'veh_hilux_2025',
    make: 'Toyota',
    model: 'Hilux 4x4 Doble Cabina 2.8 Turbo Diésel',
    year: 2025,
    condition: 'nuevo',
    mileageKm: 15,
    acquisitionCostHNL: 1150000,
    listPriceHNL: 1380000,
    monthlyDepreciationHNL: 8000,
    isPledgedInFloorPlan: true
  },
  {
    id: 'veh_isuzu_dmax',
    make: 'Isuzu',
    model: 'D-Max LS High Grade 4x4',
    year: 2024,
    condition: 'seminuevo_impecable',
    mileageKm: 18500,
    acquisitionCostHNL: 850000,
    listPriceHNL: 1020000,
    monthlyDepreciationHNL: 12000,
    isPledgedInFloorPlan: false
  },
  {
    id: 'veh_corolla_cross',
    make: 'Toyota',
    model: 'Corolla Cross Híbrida XEI',
    year: 2023,
    condition: 'usado_bueno',
    mileageKm: 42000,
    acquisitionCostHNL: 620000,
    listPriceHNL: 760000,
    monthlyDepreciationHNL: 14000,
    isPledgedInFloorPlan: false
  }
];
