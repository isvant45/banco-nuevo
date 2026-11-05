import { BankerDocketApplicant, DailySimulationState, RealEstateAsset, VehicleAsset } from './retroSimTypes';

const FIRST_NAMES = [
  'Carlos', 'Sofía', 'Mario', 'Elena', 'Jorge', 'Lucía', 'Roberto', 'Ana', 'Fernando', 'Valeria',
  'David', 'Claudia', 'Ricardo', 'Beatriz', 'Héctor', 'Mariana', 'Esteban', 'Paola', 'Alejandro', 'Karla'
];

const LAST_NAMES = [
  'Rodríguez', 'Hernández', 'Flores', 'García', 'Martínez', 'López', 'Zelaya', 'Vásquez', 'Castillo', 'Mejía',
  'Pineda', 'Sánchez', 'Reyes', 'Torres', 'Cruz', 'Álvarez', 'Gómez', 'Ramos', 'Morales', 'Paz'
];

const OCCUPATIONS = [
  'Docente Universitario', 'Ingeniero de Software', 'Contador Público', 'Comerciante Minorista',
  'Médico General', 'Abogado Corporativo', 'Técnico Mecánico', 'Enfermera Especialista',
  'Chef Ejecutivo', 'Arquitecto Independiente', 'Empresario de Transporte', 'Administrador de Ventas'
];

const CITIES = ['Tegucigalpa', 'San Pedro Sula', 'La Ceiba', 'Choloma', 'Comayagua', 'Roatán'];

const REAL_ESTATE_SAMPLES = [
  { type: 'Casa de Habitación' as const, description: 'Vivienda unifamiliar 2 niveles en Res. El Trapiche', location: 'Tegucigalpa', minVal: 1800000, maxVal: 3200000 },
  { type: 'Casa de Habitación' as const, description: 'Residencia en Circuito Cerrado Los Álamos', location: 'San Pedro Sula', minVal: 1400000, maxVal: 2500000 },
  { type: 'Apartamento' as const, description: 'Condominio Torre Panorama piso 8', location: 'San Pedro Sula', minVal: 1100000, maxVal: 2200000 },
  { type: 'Terreno Comercial' as const, description: 'Lote plano 850v2 frente a boulevard principal', location: 'Choloma / San Pedro Sula', minVal: 750000, maxVal: 1600000 },
  { type: 'Local / Bodega' as const, description: 'Bodega comercial 200m2 en zona industrial', location: 'La Ceiba', minVal: 900000, maxVal: 1900000 }
];

const VEHICLE_SAMPLES = [
  { makeModel: 'Toyota Hilux 4x4 Doble Cabina', year: 2024, minVal: 680000, maxVal: 850000 },
  { makeModel: 'Honda CR-V Touring Automática', year: 2023, minVal: 520000, maxVal: 640000 },
  { makeModel: 'Toyota Corolla Cross Híbrido', year: 2023, minVal: 480000, maxVal: 580000 },
  { makeModel: 'Isuzu D-Max Turbo Diésel', year: 2022, minVal: 450000, maxVal: 560000 },
  { makeModel: 'Nissan Frontier PRO-4X', year: 2023, minVal: 550000, maxVal: 710000 },
  { makeModel: 'Kia Sportage EX 2.0', year: 2022, minVal: 380000, maxVal: 460000 },
  { makeModel: 'Hyundai Elantra GLS', year: 2021, minVal: 260000, maxVal: 330000 }
];

export function evaluateApplicantRisk(
  monthlyIncome: number,
  existingDebts: number,
  requestedAmount: number,
  proposedRate: number,
  termMonths: number,
  creditScore: number
): BankerDocketApplicant['riskEvaluation'] {
  const monthlyRate = (proposedRate / 100) / 12;
  const estimatedQuota = monthlyRate > 0 
    ? (requestedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
    : requestedAmount / termMonths;

  const totalMonthlyCommitments = existingDebts + estimatedQuota;
  const dtiRatioPct = Math.round((totalMonthlyCommitments / Math.max(1, monthlyIncome)) * 100);

  const scoreFactor = (850 - creditScore) / 550;
  const dtiFactor = Math.min(1.5, dtiRatioPct / 40);
  const lossProbabilityPct = Math.min(95, Math.max(3, Math.round((scoreFactor * 0.5 + dtiFactor * 0.5) * 45)));

  let recommendedDecision: 'aprobar' | 'revisar' | 'rechazar' = 'aprobar';
  if (dtiRatioPct > 55 || creditScore < 560 || lossProbabilityPct > 40) {
    recommendedDecision = 'rechazar';
  } else if (dtiRatioPct > 40 || creditScore < 640 || lossProbabilityPct > 22) {
    recommendedDecision = 'revisar';
  }

  return {
    dtiRatioPct,
    lossProbabilityPct,
    recommendedDecision
  };
}

export function generateDailyBankApplicants(count: number, day: number, month: number): BankerDocketApplicant[] {
  const applicants: BankerDocketApplicant[] = [];

  const REQUEST_TYPES: BankerDocketApplicant['requestType'][] = [
    'Prestamo Personal', 'Credito Vehiculo', 'Hipoteca Vivienda', 'Credito Comercial Pyme', 'Tarjeta Oro', 'Cuenta Corriente'
  ];

  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;
    const age = 23 + Math.floor(Math.random() * 45);
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const occupation = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
    const requestType = REQUEST_TYPES[Math.floor(Math.random() * REQUEST_TYPES.length)];

    let monthlyIncome = 18000 + Math.floor(Math.random() * 55000);
    const monthlyExpenses = Math.round(monthlyIncome * (0.35 + Math.random() * 0.3));
    const existingDebts = Math.round(monthlyIncome * (Math.random() > 0.4 ? (0.05 + Math.random() * 0.25) : 0));
    const creditScore = 480 + Math.floor(Math.random() * 340);

    let cnbsCat: BankerDocketApplicant['cnbsCategory'] = 'I - Normal';
    if (creditScore < 530) cnbsCat = 'V - Pérdida';
    else if (creditScore < 590) cnbsCat = 'IV - Dudoso Recaudo';
    else if (creditScore < 660) cnbsCat = 'III - Subnormal';
    else if (creditScore < 720) cnbsCat = 'II - Especial';

    let requestedAmount = 25000;
    let proposedInterestRate = 18.5;
    let termMonths = 24;
    let purpose = 'Consolidación de pasivos y mejoras del hogar';

    switch (requestType) {
      case 'Prestamo Personal':
        requestedAmount = 15000 + Math.floor(Math.random() * 80000);
        proposedInterestRate = 19.5;
        termMonths = 12 + Math.floor(Math.random() * 36);
        purpose = 'Gastos médicos y remodelación';
        break;
      case 'Credito Vehiculo':
        requestedAmount = 120000 + Math.floor(Math.random() * 280000);
        proposedInterestRate = 14.0;
        termMonths = 48 + Math.floor(Math.random() * 24);
        purpose = 'Compra de vehículo familiar modelo reciente';
        break;
      case 'Hipoteca Vivienda':
        requestedAmount = 600000 + Math.floor(Math.random() * 1200000);
        monthlyIncome = Math.max(45000, monthlyIncome * 1.5);
        proposedInterestRate = 10.5;
        termMonths = 180 + Math.floor(Math.random() * 120);
        purpose = 'Adquisición de primera vivienda en circuito cerrado';
        break;
      case 'Credito Comercial Pyme':
        requestedAmount = 150000 + Math.floor(Math.random() * 450000);
        proposedInterestRate = 16.0;
        termMonths = 36 + Math.floor(Math.random() * 24);
        purpose = 'Capital de trabajo para compra de inventario mayorista';
        break;
      case 'Tarjeta Oro':
        requestedAmount = 25000 + Math.floor(Math.random() * 45000);
        proposedInterestRate = 32.0;
        termMonths = 12;
        purpose = 'Línea de crédito rotativo para consumo personal';
        break;
      case 'Cuenta Corriente':
        requestedAmount = 5000 + Math.floor(Math.random() * 30000);
        proposedInterestRate = 2.0;
        termMonths = 1;
        purpose = 'Apertura de cuenta para pagos y cobros de nómina';
        break;
    }

    // Generar Patrimonio Real y Garantías del solicitante (Casas, Terrenos, Carros)
    const realEstateAssets: RealEstateAsset[] = [];
    const vehicleAssets: VehicleAsset[] = [];

    // 60% de probabilidad de tener un bien inmueble
    if (Math.random() > 0.4 || requestType === 'Hipoteca Vivienda' || requestType === 'Credito Comercial Pyme') {
      const reSample = REAL_ESTATE_SAMPLES[Math.floor(Math.random() * REAL_ESTATE_SAMPLES.length)];
      const appraisedVal = reSample.minVal + Math.floor(Math.random() * (reSample.maxVal - reSample.minVal));
      realEstateAssets.push({
        type: reSample.type,
        description: reSample.description,
        location: reSample.location,
        appraisedValue: appraisedVal
      });
    }

    // 70% de probabilidad de tener vehículo propio
    if (Math.random() > 0.3 || requestType === 'Credito Vehiculo') {
      const vehSample = VEHICLE_SAMPLES[Math.floor(Math.random() * VEHICLE_SAMPLES.length)];
      const commVal = vehSample.minVal + Math.floor(Math.random() * (vehSample.maxVal - vehSample.minVal));
      vehicleAssets.push({
        makeModel: vehSample.makeModel,
        year: vehSample.year,
        plateNumber: `HAG-${Math.floor(1000 + Math.random() * 8999)}`,
        commercialValue: commVal
      });
    }

    const totalCollateralValue = 
      realEstateAssets.reduce((sum, a) => sum + a.appraisedValue, 0) +
      vehicleAssets.reduce((sum, v) => sum + v.commercialValue, 0);

    const collateralCoveragePct = requestedAmount > 0 
      ? Math.round((totalCollateralValue / requestedAmount) * 100)
      : 0;

    const risk = evaluateApplicantRisk(
      monthlyIncome,
      existingDebts,
      requestedAmount,
      proposedInterestRate,
      termMonths,
      creditScore
    );

    const dossierNum = `EXP-${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-${(i + 1).toString().padStart(3, '0')}`;
    const avatarSeed = `user-${(i + day * 7) % 20 + 1}`;

    applicants.push({
      id: `docket-${Date.now()}-${i}-${Math.random()}`,
      dossierNumber: dossierNum,
      applicantName: fullName,
      avatar: avatarSeed,
      age,
      city,
      occupation,
      monthlyIncome,
      monthlyExpenses,
      existingDebts,
      creditScore,
      cnbsCategory: cnbsCat,
      requestType,
      requestedAmount,
      proposedInterestRate,
      termMonths,
      purpose,
      decisionStatus: 'pendiente',
      realEstateAssets,
      vehicleAssets,
      totalCollateralValue,
      collateralCoveragePct,
      rateDiscountApplied: 0,
      amountBonusApplied: 0,
      riskEvaluation: risk
    });
  }

  return applicants;
}

export function boostLoanAmountWithCollateral(docket: BankerDocketApplicant): BankerDocketApplicant {
  if (docket.totalCollateralValue <= 0) return docket;
  const bonus = Math.round(docket.requestedAmount * 0.35); // +35% de ampliación respaldada
  const newAdjusted = (docket.adjustedAmount || docket.requestedAmount) + bonus;

  return {
    ...docket,
    adjustedAmount: newAdjusted,
    amountBonusApplied: (docket.amountBonusApplied || 0) + bonus
  };
}

export function discountInterestRateWithCollateral(docket: BankerDocketApplicant): BankerDocketApplicant {
  if (docket.totalCollateralValue <= 0) return docket;
  const discount = 2.5; // -2.5% de tasa preferencial por menor riesgo
  const currentRate = docket.adjustedRate || docket.proposedInterestRate;
  const newAdjustedRate = Math.max(7.5, Number((currentRate - discount).toFixed(1)));

  return {
    ...docket,
    adjustedRate: newAdjustedRate,
    rateDiscountApplied: (docket.rateDiscountApplied || 0) + discount
  };
}

export function stampDocket(
  docket: BankerDocketApplicant,
  decision: 'aprobado' | 'rechazado',
  adjustedAmount?: number,
  adjustedRate?: number
): BankerDocketApplicant {
  return {
    ...docket,
    decisionStatus: decision,
    stampedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    adjustedAmount: adjustedAmount !== undefined ? adjustedAmount : docket.requestedAmount,
    adjustedRate: adjustedRate !== undefined ? adjustedRate : docket.proposedInterestRate
  };
}

export function calculateBankRunRisk(
  vaultCash: number,
  totalDeposits: number,
  reputation: number,
  depositRate: number
): number {
  if (totalDeposits <= 0) return 0;
  const coverageRatio = (vaultCash / totalDeposits) * 100;
  let risk = 0;

  if (coverageRatio < 8) {
    risk += 45;
  } else if (coverageRatio < 14) {
    risk += 25;
  } else if (coverageRatio < 20) {
    risk += 10;
  }

  if (reputation < 50) {
    risk += (50 - reputation) * 0.8;
  }

  if (depositRate < 3.0) {
    risk += 12;
  }

  return Math.min(100, Math.max(1, Math.round(risk)));
}

export function advanceBankDay(state: DailySimulationState): DailySimulationState {
  const nextDay = state.currentDay + 1;
  const isMonthEnd = nextDay > 30;
  const effectiveDay = isMonthEnd ? 1 : nextDay;
  const effectiveMonth = isMonthEnd ? (state.currentMonth === 12 ? 1 : state.currentMonth + 1) : state.currentMonth;
  const effectiveYear = isMonthEnd && state.currentMonth === 12 ? state.currentYear + 1 : state.currentYear;

  const dailyLoanInterestIncome = Math.round((state.totalLoanPortfolio * 0.16) / 360);
  const dailyDepositInterestExpense = Math.round((state.bankerTotalDeposits * (state.bankerDepositRatePct / 100)) / 360);
  const dailyBranchOverhead = 14500;
  const dailyFeesCollected = Math.round((state.bankerMonthlyFee * 240) / 30) + (state.bankerAtmFee * 35);

  const dailyRevenue = dailyLoanInterestIncome + dailyFeesCollected;
  const dailyExpenses = dailyDepositInterestExpense + dailyBranchOverhead;
  const dailyNet = dailyRevenue - dailyExpenses;

  const newVaultCash = Math.max(50000, state.bankerVaultCash + dailyNet);
  const newRunRisk = calculateBankRunRisk(newVaultCash, state.bankerTotalDeposits, state.bankerReputation, state.bankerDepositRatePct);

  const newQueue = generateDailyBankApplicants(5 + Math.floor(Math.random() * 4), effectiveDay, effectiveMonth);

  const eventSummary = [
    `Intereses devengados por cartera crediticia: +L ${dailyLoanInterestIncome.toLocaleString()}`,
    `Comisiones de servicio y ATM: +L ${dailyFeesCollected.toLocaleString()}`,
    `Costo de intereses a depositantes: -L ${dailyDepositInterestExpense.toLocaleString()}`,
    `Gastos operativos de sucursales: -L ${dailyBranchOverhead.toLocaleString()}`
  ];

  if (state.approvedAmountToday > 0) {
    eventSummary.push(`Desembolsos aprobados en jornada anterior: L ${state.approvedAmountToday.toLocaleString()}`);
  }

  const updatedHistory = [
    {
      day: state.currentDay,
      month: state.currentMonth,
      revenue: dailyRevenue,
      expenses: dailyExpenses,
      netProfit: dailyNet,
      summary: `Día ${state.currentDay}: Resultado neto L ${dailyNet.toLocaleString()} · ${state.processedDocketsToday} expedientes atendidos.`
    },
    ...state.dailyHistory.slice(0, 29)
  ];

  return {
    ...state,
    currentDay: effectiveDay,
    currentMonth: effectiveMonth,
    currentYear: effectiveYear,
    dailyHour: 9,
    isDayClosed: false,
    bankerVaultCash: newVaultCash,
    bankerRunRiskPct: newRunRisk,
    docketQueue: newQueue,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,
    dailyHistory: updatedHistory,
    lastClosingSummary: {
      revenue: dailyRevenue,
      cogs: 0,
      operatingCosts: dailyExpenses,
      netProfit: dailyNet,
      events: eventSummary
    }
  };
}
