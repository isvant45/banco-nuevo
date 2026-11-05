import { 
  DailySimulationState, 
  ConstructionMaterial, 
  ConstructionMaterialId, 
  ConstructionMaterialOrder, 
  ConstructionTender, 
  ActiveConstructionWork,
  SarTaxAuditRecord,
  ConstructionRivalBid
} from './retroSimTypes';

/**
 * Catálogo Oficial de Materiales Pesados para Constructora
 */
export const DEFAULT_CONSTRUCTION_MATERIALS: ConstructionMaterial[] = [
  {
    id: 'cemento_gris',
    name: 'Cemento Portland Gris (Bolsa 42.5kg)',
    unit: 'Bolsa (42.5kg)',
    icon: '🧱',
    stock: 450,
    unitCost: 240, // L 240 por bolsa
    minStockWarning: 80,
    supplierLeadDays: 1
  },
  {
    id: 'varilla_acero',
    name: 'Varilla de Acero Corrugado Grado 40/60',
    unit: 'Quintal (100 lbs)',
    icon: '⛓️',
    stock: 90,
    unitCost: 1150, // L 1,150 por quintal
    minStockWarning: 25,
    supplierLeadDays: 2
  },
  {
    id: 'bloque_concreto',
    name: 'Bloques de Concreto Estructural 6 pulg',
    unit: 'Millar (1,000 uds)',
    icon: '🧱',
    stock: 25,
    unitCost: 14500, // L 14,500 por millar (L 14.50 por bloque)
    minStockWarning: 5,
    supplierLeadDays: 2
  },
  {
    id: 'tabla_encofrado',
    name: 'Tablas de Pino Rústico para Encofrado 1x12x10',
    unit: 'Docena (12 tablas)',
    icon: '🪵',
    stock: 40,
    unitCost: 1850, // L 1,850 por docena
    minStockWarning: 12,
    supplierLeadDays: 1
  },
  {
    id: 'arena_grava',
    name: 'Arena y Grava Clasificada de Río',
    unit: 'Metro Cúbico (m³)',
    icon: '🏖️',
    stock: 140,
    unitCost: 420, // L 420 por m³
    minStockWarning: 35,
    supplierLeadDays: 1
  },
  {
    id: 'maquinaria_pesada',
    name: 'Horas de Renta Retroexcavadora / Volqueta',
    unit: 'Horas Máquina',
    icon: '🚜',
    stock: 65,
    unitCost: 950, // L 950 por hora operativa
    minStockWarning: 15,
    supplierLeadDays: 1
  }
];

/**
 * Registro de Auditoría Anual del SAR (Impuesto Sobre la Renta 25% y Solvencia Fiscal)
 */
export const DEFAULT_INITIAL_SAR_RECORD: SarTaxAuditRecord = {
  taxYear: 2025,
  grossRevenues: 4500000,
  deductibleMaterialsExpenses: 2200000,
  deductiblePayrollExpenses: 950000,
  deductibleOtherCosts: 250000,
  netTaxableIncome: 1100000, // 4.5M - 3.4M = 1.1M
  taxRatePct: 25,
  isrTaxAmount: 275000, // 25% de 1.1M
  isPaid: true,
  auditStatus: 'aprobada_conforme',
  solvenciaFiscalIssued: true,
  solvenciaExpirationYear: 2026,
  auditNotes: [
    'Declaración Jurada Anual de ISR ejercicio 2025 liquidada al 100%.',
    'Auditoría SAR: Se verificaron facturas con CAI y retenciones laborales del 12.5%.',
    'Certificado de Solvencia Fiscal Oficial Emitido. Habilitado para licitar con el Estado.'
  ]
};

/**
 * Constructoras Rivales en el Mercado Hondureño
 */
export const RIVAL_CONTRACTORS = [
  { name: 'Constructora William & Molina', baseReputation: 88, aggressiveness: 0.95 },
  { name: 'SERMACO Infraestructura Vial', baseReputation: 85, aggressiveness: 0.98 },
  { name: 'Santos & Asociados S. de R.L.', baseReputation: 82, aggressiveness: 1.02 },
  { name: 'Pavimentos Continental de Honduras', baseReputation: 78, aggressiveness: 0.92 }
];

/**
 * Generador de Convocatorias y Licitaciones Públicas y Privadas
 */
export function generateInitialTenders(currentDay: number = 1): ConstructionTender[] {
  return [
    {
      id: `lic-pub-sit-${currentDay}-01`,
      title: 'Construcción de Puente Vehicular Río Blanco (2 Carriles)',
      category: 'obra_publica',
      projectType: 'puente_vial',
      clientName: 'SIT - Secretaría de Infraestructura y Transporte (SEFIN)',
      location: 'San Pedro Sula - Bulevar del Norte',
      referenceBudget: 6800000,
      durationDays: 75,
      requiredWorkersPerDay: 22, // 22 obreros e ingenieros diarios
      requiredMaterials: {
        cemento_gris: 650,
        varilla_acero: 280,
        bloque_concreto: 15,
        tabla_encofrado: 80,
        arena_grava: 320,
        maquinaria_pesada: 120
      },
      requiresSarSolvencia: true, // Obligatorio por Ley de Contratación del Estado
      technicalReputationReq: 70,
      advancePaymentPct: 20, // 20% anticipo al firmar contrato
      status: 'convocatoria_abierta',
      rivalBids: []
    },
    {
      id: `lic-priv-corp-${currentDay}-02`,
      title: 'Edificio Corporativo Torre San Pedro (5 Niveles)',
      category: 'obra_privada',
      projectType: 'edificio_corporativo',
      clientName: 'Inversiones Los Robles S.A.',
      location: 'Colonia Los Álamos, San Pedro Sula',
      referenceBudget: 4500000,
      durationDays: 60,
      requiredWorkersPerDay: 18,
      requiredMaterials: {
        cemento_gris: 420,
        varilla_acero: 190,
        bloque_concreto: 35,
        tabla_encofrado: 60,
        arena_grava: 210,
        maquinaria_pesada: 80
      },
      requiresSarSolvencia: false,
      technicalReputationReq: 65,
      advancePaymentPct: 25,
      status: 'convocatoria_abierta',
      rivalBids: []
    },
    {
      id: `lic-priv-residencial-${currentDay}-03`,
      title: 'Residencial Las Colinas - Complejo de 8 Casas Unifamiliares',
      category: 'obra_privada',
      projectType: 'casa_residencial',
      clientName: 'Desarrollos Urbanos del Norte S.A.',
      location: 'Sector Armenta, San Pedro Sula',
      referenceBudget: 2800000,
      durationDays: 45,
      requiredWorkersPerDay: 14,
      requiredMaterials: {
        cemento_gris: 280,
        varilla_acero: 110,
        bloque_concreto: 45,
        tabla_encofrado: 40,
        arena_grava: 160,
        maquinaria_pesada: 50
      },
      requiresSarSolvencia: false,
      technicalReputationReq: 60,
      advancePaymentPct: 20,
      status: 'convocatoria_abierta',
      rivalBids: []
    },
    {
      id: `lic-pub-alcaldia-${currentDay}-04`,
      title: 'Pavimentación con Concreto Hidráulico de Vía Colectora (1.2 km)',
      category: 'obra_publica',
      projectType: 'pavimentacion_urbana',
      clientName: 'Alcaldía Municipal del Distrito Central',
      location: 'Tegucigalpa M.D.C.',
      referenceBudget: 3900000,
      durationDays: 50,
      requiredWorkersPerDay: 16,
      requiredMaterials: {
        cemento_gris: 520,
        varilla_acero: 130,
        bloque_concreto: 8,
        tabla_encofrado: 55,
        arena_grava: 290,
        maquinaria_pesada: 90
      },
      requiresSarSolvencia: true, // Obligatorio SAR
      technicalReputationReq: 68,
      advancePaymentPct: 20,
      status: 'convocatoria_abierta',
      rivalBids: []
    },
    {
      id: `lic-priv-nave-${currentDay}-05`,
      title: 'Nave Industrial y Muelle de Carga para Zona Franca',
      category: 'obra_privada',
      projectType: 'nave_industrial',
      clientName: 'Parque Industrial Zip Choloma',
      location: 'Choloma, Cortés',
      referenceBudget: 1950000,
      durationDays: 35,
      requiredWorkersPerDay: 12,
      requiredMaterials: {
        cemento_gris: 180,
        varilla_acero: 85,
        bloque_concreto: 22,
        tabla_encofrado: 30,
        arena_grava: 120,
        maquinaria_pesada: 40
      },
      requiresSarSolvencia: false,
      technicalReputationReq: 55,
      advancePaymentPct: 30,
      status: 'convocatoria_abierta',
      rivalBids: []
    }
  ];
}

/**
 * Presentación de Oferta en Sobre Cerrado y Apertura de Plicas frente a Rivales
 */
export function submitConstructionBid(
  state: DailySimulationState,
  tenderId: string,
  offeredPrice: number,
  offeredDays: number
): {
  updatedState: DailySimulationState;
  won: boolean;
  message: string;
  winningBidder?: string;
  awardedPrice?: number;
} {
  const tender = state.availableTenders.find(t => t.id === tenderId);
  if (!tender) {
    return { updatedState: state, won: false, message: 'La licitación no existe o ya expiró.' };
  }

  if (tender.status !== 'convocatoria_abierta') {
    return { updatedState: state, won: false, message: 'Esta licitación ya fue adjudicada o cerrada.' };
  }

  // 1. Verificación legal de Solvencia Fiscal del SAR para obras del gobierno
  if (tender.requiresSarSolvencia && !state.fiscalSolvenciaActive) {
    const updatedTenders = state.availableTenders.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          status: 'desierta' as const,
          playerBid: { offeredPrice, offeredDays, submittedDay: state.currentDay }
        };
      }
      return t;
    });

    return {
      updatedState: {
        ...state,
        availableTenders: updatedTenders
      },
      won: false,
      message: '⛔ DESCALIFICACIÓN LEGAL: La Ley de Contratación del Estado exige tener la Solvencia Fiscal del SAR vigente. Acude a la ventana de SAR y liquida tu declaración anual.'
    };
  }

  // 2. Simulación de ofertas de contratistas rivales
  const rivalBids: ConstructionRivalBid[] = RIVAL_CONTRACTORS.map(rival => {
    // Variación de precio en torno al presupuesto base (±12%)
    const priceVariance = (0.90 + Math.random() * 0.18) * rival.aggressiveness;
    const rivalPrice = Math.round(tender.referenceBudget * priceVariance);
    
    // Variación de plazo
    const dayVariance = Math.round(tender.durationDays * (0.95 + Math.random() * 0.15));
    
    return {
      contractorName: rival.name,
      offeredPrice: rivalPrice,
      offeredDays: Math.max(15, dayVariance),
      reputationScore: rival.baseReputation
    };
  });

  // 3. Evaluación de plicas (Precio 50%, Plazo 25%, Reputación 25%)
  const playerReputation = state.storeReputation;
  
  // Función para calificar cada oferta
  const scoreBid = (price: number, days: number, rep: number) => {
    // Precio más bajo respecto al presupuesto de referencia da más puntos
    const priceRatio = tender.referenceBudget / Math.max(1, price);
    const priceScore = Math.min(100, priceRatio * 50);
    
    // Plazo menor da más puntos
    const daysRatio = tender.durationDays / Math.max(1, days);
    const daysScore = Math.min(100, daysRatio * 25);
    
    // Reputación
    const repScore = (rep / 100) * 25;

    return priceScore + daysScore + repScore;
  };

  const playerScore = scoreBid(offeredPrice, offeredDays, playerReputation);

  let bestScore = playerScore;
  let winner = state.storeName;
  let winningPrice = offeredPrice;
  let playerWon = true;

  for (const rival of rivalBids) {
    const rivalScore = scoreBid(rival.offeredPrice, rival.offeredDays, rival.reputationScore);
    if (rivalScore > bestScore) {
      bestScore = rivalScore;
      winner = rival.contractorName;
      winningPrice = rival.offeredPrice;
      playerWon = false;
    }
  }

  // 4. Procesar Adjudicación
  if (playerWon) {
    const advanceCash = Math.round(offeredPrice * (tender.advancePaymentPct / 100));

    // Crear obra en ejecución
    const newWork: ActiveConstructionWork = {
      id: `obra-${tender.id}`,
      tenderId: tender.id,
      title: tender.title,
      clientName: tender.clientName,
      category: tender.category,
      totalContractPrice: offeredPrice,
      advancePaymentReceived: advanceCash,
      billedMilestonesAmount: advanceCash,
      progressPct: 0,
      daysRemaining: offeredDays,
      totalDaysEstimated: offeredDays,
      requiredWorkersPerDay: tender.requiredWorkersPerDay || 15,
      laborEfficiencyPct: Math.min(150, Math.round((state.staffCount / (tender.requiredWorkersPerDay || 15)) * 100)),
      requiredMaterialsTotal: { ...tender.requiredMaterials },
      materialsConsumed: {
        cemento_gris: 0,
        varilla_acero: 0,
        bloque_concreto: 0,
        tabla_encofrado: 0,
        arena_grava: 0,
        maquinaria_pesada: 0
      },
      dailyMaterialNeeds: {
        cemento_gris: Math.ceil(tender.requiredMaterials.cemento_gris / offeredDays),
        varilla_acero: Math.ceil(tender.requiredMaterials.varilla_acero / offeredDays),
        bloque_concreto: Math.ceil(tender.requiredMaterials.bloque_concreto / offeredDays),
        tabla_encofrado: Math.ceil(tender.requiredMaterials.tabla_encofrado / offeredDays),
        arena_grava: Math.ceil(tender.requiredMaterials.arena_grava / offeredDays),
        maquinaria_pesada: Math.ceil(tender.requiredMaterials.maquinaria_pesada / offeredDays)
      },
      isHaltedForMissingMaterials: false,
      missingMaterialsList: [],
      delayFinesAccumulated: 0,
      status: 'en_ejecucion',
      milestonesPaid: 0
    };

    const updatedTenders = state.availableTenders.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          status: 'adjudicada_jugador' as const,
          playerBid: { offeredPrice, offeredDays, submittedDay: state.currentDay },
          rivalBids,
          winningBidder: state.storeName,
          awardedPrice: offeredPrice
        };
      }
      return t;
    });

    const newBankBalance = state.storeBankBalance + advanceCash;
    const newMonthlySales = (state.monthlySalesAccumulated || 0) + advanceCash;
    const newReputation = Math.min(100, state.storeReputation + 2);

    return {
      updatedState: {
        ...state,
        availableTenders: updatedTenders,
        activeWorks: [newWork, ...state.activeWorks],
        storeBankBalance: newBankBalance,
        monthlySalesAccumulated: newMonthlySales,
        storeReputation: newReputation
      },
      won: true,
      message: `¡LICITACIÓN ADJUDICADA A TU CONSTRUCTORA! Ganaste con una oferta de L ${offeredPrice.toLocaleString()}. Has recibido el anticipo del ${tender.advancePaymentPct}% (+L ${advanceCash.toLocaleString()}) en tu cuenta bancaria.`,
      winningBidder: state.storeName,
      awardedPrice: offeredPrice
    };
  } else {
    const updatedTenders = state.availableTenders.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          status: 'adjudicada_rival' as const,
          playerBid: { offeredPrice, offeredDays, submittedDay: state.currentDay },
          rivalBids,
          winningBidder: winner,
          awardedPrice: winningPrice
        };
      }
      return t;
    });

    return {
      updatedState: {
        ...state,
        availableTenders: updatedTenders
      },
      won: false,
      message: `Plicas abiertas: La licitación fue adjudicada al contratista rival "${winner}" con una oferta de L ${winningPrice.toLocaleString()}. Ajusta tus costos y reputación para la siguiente mesa.`,
      winningBidder: winner,
      awardedPrice: winningPrice
    };
  }
}

/**
 * Pedido de Materiales Pesados para el Almacén de Obra
 */
export function orderConstructionMaterial(
  state: DailySimulationState,
  materialId: ConstructionMaterialId,
  units: number
): {
  updatedState: DailySimulationState;
  order: ConstructionMaterialOrder | null;
  error?: string;
} {
  const mat = state.constructionMaterials.find(m => m.id === materialId);
  if (!mat) return { updatedState: state, order: null, error: 'Material no encontrado.' };

  const totalCost = units * mat.unitCost;
  const availableLiquidity = state.storeCash + state.storeBankBalance;

  if (availableLiquidity < totalCost) {
    return {
      updatedState: state,
      order: null,
      error: `Fondos insuficientes. Se requieren L ${totalCost.toLocaleString()} (disponible en caja/banco: L ${availableLiquidity.toLocaleString()}). Solicita un préstamo en Banco Aliado si necesitas capital.`
    };
  }

  // Descontar preferentemente de cuenta bancaria, luego caja
  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;

  if (newBank >= totalCost) {
    newBank -= totalCost;
  } else {
    const remainder = totalCost - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - remainder);
  }

  const newOrder: ConstructionMaterialOrder = {
    id: `ord-mat-${Date.now().toString().slice(-4)}`,
    materialId,
    materialName: mat.name,
    units,
    unitCost: mat.unitCost,
    totalCost,
    daysRemaining: mat.supplierLeadDays,
    orderDate: `Día ${state.currentDay}, Mes ${state.currentMonth}`
  };

  // Registrar como gasto deducible para el SAR
  const updatedSar: SarTaxAuditRecord = {
    ...state.sarTaxRecord,
    deductibleMaterialsExpenses: state.sarTaxRecord.deductibleMaterialsExpenses + totalCost
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: newBank,
      storeCash: newCash,
      constructionOrders: [...state.constructionOrders, newOrder],
      sarTaxRecord: updatedSar
    },
    order: newOrder
  };
}

/**
 * Avance Diario de Obras, Consumo de Materiales y Estimaciones de Cobro
 */
export function advanceConstructionDay(state: DailySimulationState): DailySimulationState {
  let materials = state.constructionMaterials.map(m => ({ ...m }));
  let orders = [...state.constructionOrders];
  let works = [...state.activeWorks];
  let completedHistory = [...state.completedWorksHistory];
  let bankBalance = state.storeBankBalance;
  let cashBalance = state.storeCash;
  let reputation = state.storeReputation;
  let totalBilledToday = 0;
  let totalDelayFinesToday = 0;
  const dailyEvents: string[] = [];

  // 1. Recepción de Pedidos de Materiales
  const remainingOrders: ConstructionMaterialOrder[] = [];
  for (const ord of orders) {
    const updatedDays = ord.daysRemaining - 1;
    if (updatedDays <= 0) {
      // Entregar al almacén
      materials = materials.map(m => {
        if (m.id === ord.materialId) {
          return { ...m, stock: m.stock + ord.units };
        }
        return m;
      });
      dailyEvents.push(`🚚 Llegó cargamento al almacén: +${ord.units.toLocaleString()} ${ord.materialName}`);
    } else {
      remainingOrders.push({ ...ord, daysRemaining: updatedDays });
    }
  }

  // 2. Ejecución Diaria de Obras Activas
  const remainingWorks: ActiveConstructionWork[] = [];
  for (const work of works) {
    let isHalted = false;
    const missing: string[] = [];

    // Validar stock de materiales para la jornada de hoy
    for (const [matId, needed] of Object.entries(work.dailyMaterialNeeds) as [ConstructionMaterialId, number][]) {
      const stockItem = materials.find(m => m.id === matId);
      if (!stockItem || stockItem.stock < needed) {
        isHalted = true;
        missing.push(`${stockItem?.name || matId} (Requiere ${needed}, Stock: ${stockItem?.stock || 0})`);
      }
    }

    if (isHalted) {
      // Obra detenida por falta de insumos: multa contractual diaria
      const delayFine = 4500;
      totalDelayFinesToday += delayFine;
      reputation = Math.max(20, reputation - 1);
      dailyEvents.push(`⚠️ OBRA PARALIZADA (${work.title}): Falta de materiales. Multa de L ${delayFine.toLocaleString()} aplicada.`);

      remainingWorks.push({
        ...work,
        isHaltedForMissingMaterials: true,
        missingMaterialsList: missing,
        delayFinesAccumulated: work.delayFinesAccumulated + delayFine
      });
    } else {
      // Consumir materiales requeridos hoy
      for (const [matId, needed] of Object.entries(work.dailyMaterialNeeds) as [ConstructionMaterialId, number][]) {
        materials = materials.map(m => {
          if (m.id === matId) {
            return { ...m, stock: Math.max(0, m.stock - needed) };
          }
          return m;
        });
      }

      // Eficiencia de Cuadrilla Obrera (Hombres / Día requeridos)
      const requiredWorkers = work.requiredWorkersPerDay || 15;
      const availableWorkers = Math.max(1, state.staffCount);
      const workforceRatio = Math.min(1.25, Math.max(0.25, availableWorkers / requiredWorkers));
      const laborEffPct = Math.round(workforceRatio * 100);

      if (workforceRatio < 0.75) {
        dailyEvents.push(`⚠️ Cuadrilla insuficiente (${work.title}): Avance al ${laborEffPct}% de velocidad (requiere ${requiredWorkers} hombres/día, tienes ${availableWorkers}).`);
      }

      // Verificación de Maquinaria Propia en Flota
      const hasOwnedExcavator = (state.ownedMachinery || []).some(m => m.category === 'retroexcavadora_4x4' || m.category === 'volqueta_14m3');
      if (hasOwnedExcavator && work.dailyMaterialNeeds.maquinaria_pesada > 0) {
        dailyEvents.push(`🚜 Ahorro operativo por flota propia: Se utilizaron volquetas/retroexcavadoras de la empresa en ${work.title}.`);
      }

      // Avanzar porcentaje de ejecución modulado por cuadrilla
      const baseProgressDelta = 100 / Math.max(1, work.totalDaysEstimated);
      const progressDelta = baseProgressDelta * workforceRatio;
      const newProgress = Math.min(100, work.progressPct + progressDelta);
      const daysLeft = Math.max(0, work.daysRemaining - 1);

      // Cobro de Estimaciones de Obra por Hitos (25%, 50%, 75%, 100%)
      let newMilestones = work.milestonesPaid;
      let milestonePayout = 0;

      if (newProgress >= 25 && work.milestonesPaid < 1) {
        milestonePayout = Math.round(work.totalContractPrice * 0.20);
        newMilestones = 1;
        dailyEvents.push(`💰 Estimación No. 1 Cobrada (${work.title}): Avance 25% completado (+L ${milestonePayout.toLocaleString()}).`);
      } else if (newProgress >= 50 && work.milestonesPaid < 2) {
        milestonePayout = Math.round(work.totalContractPrice * 0.25);
        newMilestones = 2;
        dailyEvents.push(`💰 Estimación No. 2 Cobrada (${work.title}): Avance 50% completado (+L ${milestonePayout.toLocaleString()}).`);
      } else if (newProgress >= 75 && work.milestonesPaid < 3) {
        milestonePayout = Math.round(work.totalContractPrice * 0.25);
        newMilestones = 3;
        dailyEvents.push(`💰 Estimación No. 3 Cobrada (${work.title}): Avance 75% completado (+L ${milestonePayout.toLocaleString()}).`);
      }

      if (milestonePayout > 0) {
        bankBalance += milestonePayout;
        totalBilledToday += milestonePayout;
      }

      // Verificación de finiquito y entrega de obra
      if (newProgress >= 100) {
        // Finiquito y devolución de retención de garantía (10% final)
        const finalRetention = Math.round(work.totalContractPrice * 0.10);
        bankBalance += finalRetention;
        totalBilledToday += finalRetention;
        reputation = Math.min(100, reputation + 4);

        dailyEvents.push(`🏆 ¡OBRA ENTREGADA CON ÉXITO! (${work.title}). Finiquito y liquidación final recibida (+L ${finalRetention.toLocaleString()}).`);

        completedHistory.push({
          id: work.id,
          title: work.title,
          clientName: work.clientName,
          contractPrice: work.totalContractPrice,
          completionDay: state.currentDay,
          profitEarned: work.totalContractPrice - work.delayFinesAccumulated,
          penaltiesDeducted: work.delayFinesAccumulated
        });
      } else {
        remainingWorks.push({
          ...work,
          progressPct: newProgress,
          daysRemaining: daysLeft,
          laborEfficiencyPct: laborEffPct,
          milestonesPaid: newMilestones,
          billedMilestonesAmount: work.billedMilestonesAmount + milestonePayout,
          isHaltedForMissingMaterials: false,
          missingMaterialsList: []
        });
      }
    }
  }

  // 3. Salarios de cuadrilla de obreros e ingenieros (Planilla diaria)
  const staffWages = state.dailyWages;
  if (cashBalance >= staffWages) {
    cashBalance -= staffWages;
  } else {
    bankBalance = Math.max(0, bankBalance - staffWages);
  }

  // 4. Actualizar estado y registrar en auditoría SAR
  const updatedRevenues = (state.sarTaxRecord.grossRevenues || 0) + totalBilledToday;
  const updatedPayroll = (state.sarTaxRecord.deductiblePayrollExpenses || 0) + staffWages;
  const netIncome = Math.max(0, updatedRevenues - state.sarTaxRecord.deductibleMaterialsExpenses - updatedPayroll - state.sarTaxRecord.deductibleOtherCosts);
  const isrDue = Math.round(netIncome * 0.25);

  const updatedSar: SarTaxAuditRecord = {
    ...state.sarTaxRecord,
    grossRevenues: updatedRevenues,
    deductiblePayrollExpenses: updatedPayroll,
    netTaxableIncome: netIncome,
    isrTaxAmount: isrDue
  };

  const nextDay = state.currentDay >= 30 ? 1 : state.currentDay + 1;
  const nextMonth = state.currentDay >= 30 ? (state.currentMonth >= 12 ? 1 : state.currentMonth + 1) : state.currentMonth;
  const nextYear = state.currentDay >= 30 && state.currentMonth >= 12 ? state.currentYear + 1 : state.currentYear;

  // Reponer licitaciones si quedan pocas
  let tenders = [...state.availableTenders];
  const openTendersCount = tenders.filter(t => t.status === 'convocatoria_abierta').length;
  if (openTendersCount <= 2) {
    const newBatch = generateInitialTenders(nextDay);
    tenders = [...tenders, ...newBatch.slice(0, 3)];
  }

  return {
    ...state,
    currentDay: nextDay,
    currentMonth: nextMonth,
    currentYear: nextYear,
    isDayClosed: false,
    storeCash: cashBalance,
    storeBankBalance: bankBalance,
    storeReputation: reputation,
    constructionMaterials: materials,
    constructionOrders: remainingOrders,
    activeWorks: remainingWorks,
    completedWorksHistory: completedHistory,
    availableTenders: tenders,
    sarTaxRecord: updatedSar,
    monthlySalesAccumulated: (state.monthlySalesAccumulated || 0) + totalBilledToday,
    lastClosingSummary: {
      revenue: totalBilledToday,
      cogs: 0,
      operatingCosts: staffWages + totalDelayFinesToday,
      netProfit: totalBilledToday - (staffWages + totalDelayFinesToday),
      events: dailyEvents.length > 0 ? dailyEvents : ['Jornada operativa de construcción regular. Obras en progreso.']
    }
  };
}

/**
 * Pago y Liquidación Oficial del Impuesto Sobre la Renta (SAR - Tasa 25%)
 * Otorga el Certificado Oficial de Solvencia Fiscal SAR
 */
export function paySarTaxReturn(state: DailySimulationState): {
  updatedState: DailySimulationState;
  success: boolean;
  message: string;
} {
  const isrToPay = state.sarTaxRecord.isrTaxAmount;
  const availableFunds = state.storeBankBalance + state.storeCash;

  if (availableFunds < isrToPay) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos insuficientes para pagar el ISR del SAR. Se requieren L ${isrToPay.toLocaleString()} (disponible: L ${availableFunds.toLocaleString()}). Gestiona un préstamo en el Banco Aliado.`
    };
  }

  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;

  if (newBank >= isrToPay) {
    newBank -= isrToPay;
  } else {
    const rem = isrToPay - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - rem);
  }

  const updatedSar: SarTaxAuditRecord = {
    ...state.sarTaxRecord,
    isPaid: true,
    auditStatus: 'aprobada_conforme',
    solvenciaFiscalIssued: true,
    solvenciaExpirationYear: state.currentYear + 1,
    auditNotes: [
      `Declaración Jurada de ISR correspondiente al ejercicio fiscal ${state.currentYear} pagada conforme.`,
      `Liquidado monto de L ${isrToPay.toLocaleString()} a favor de la Tesorería General de la República (SAR / SEFIN).`,
      `CONSTANCIA DE SOLVENCIA FISCAL OFICIAL VIGENTE hasta Diciembre ${state.currentYear + 1}. Habilitado para licitar en obras públicas del Estado.`
    ]
  };

  return {
    updatedState: {
      ...state,
      storeBankBalance: newBank,
      storeCash: newCash,
      sarTaxRecord: updatedSar,
      fiscalSolvenciaActive: true,
      storeReputation: Math.min(100, state.storeReputation + 5)
    },
    success: true,
    message: `¡ISR LIQUIDADO ANTE EL SAR! Pago de L ${isrToPay.toLocaleString()} procesado. Se emitió tu Certificado de Solvencia Fiscal Oficial. Tu empresa ahora puede participar en todas las licitaciones públicas de infraestructura del gobierno.`
  };
}

/**
 * Salto de tiempo multi-día: 1 Día, 15 Días (Quincena) o 1 Mes (30 Días)
 * Simula el paso del tiempo acumulativo, eventos, liquidaciones y refresco dinámico de licitaciones
 */
export function advanceConstructionDays(
  state: DailySimulationState, 
  daysCount: number
): {
  updatedState: DailySimulationState;
  daysProcessed: number;
  totalBilled: number;
  eventsLog: string[];
} {
  let currentState = state;
  let accumulatedBilled = 0;
  const allEvents: string[] = [];

  for (let i = 0; i < daysCount; i++) {
    const nextDayState = advanceConstructionDay(currentState);
    if (nextDayState.lastClosingSummary) {
      accumulatedBilled += nextDayState.lastClosingSummary.revenue;
      if (nextDayState.lastClosingSummary.events.length > 0) {
        allEvents.push(...nextDayState.lastClosingSummary.events);
      }
    }
    currentState = nextDayState;
  }

  // Refrescar convocatorias de licitación cada quincena o mes
  if (daysCount >= 15) {
    const freshTenders = generateInitialTenders(currentState.currentDay);
    const existingIds = new Set(currentState.availableTenders.map(t => t.id));
    const newUniqueTenders = freshTenders.filter(t => !existingIds.has(t.id));

    currentState = {
      ...currentState,
      availableTenders: [...newUniqueTenders.slice(0, 3), ...currentState.availableTenders.filter(t => t.status === 'convocatoria_abierta').slice(0, 4)]
    };
  }

  return {
    updatedState: {
      ...currentState,
      lastClosingSummary: {
        revenue: accumulatedBilled,
        cogs: 0,
        operatingCosts: currentState.dailyWages * daysCount,
        netProfit: accumulatedBilled - (currentState.dailyWages * daysCount),
        events: allEvents.length > 0 ? allEvents.slice(0, 8) : [`Período de ${daysCount} días completado exitosamente.`]
      }
    },
    daysProcessed: daysCount,
    totalBilled: accumulatedBilled,
    eventsLog: allEvents
  };
}
