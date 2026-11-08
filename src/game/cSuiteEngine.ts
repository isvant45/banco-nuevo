import { 
  DailySimulationState, 
  CSuiteExecutiveId, 
  CSuiteExecutiveConfig,
  SimulatedEmail
} from './retroSimTypes';

/**
 * Catálogo Oficial de Ejecutivos C-Level Estratégicos (RRHH)
 */
export const CSUITE_CATALOG: Record<CSuiteExecutiveId, CSuiteExecutiveConfig> = {
  CFO: {
    id: 'CFO',
    name: 'Lic. Claudia Moncada (CFO)',
    title: 'Directora Financiera Corporativa',
    salaryMonthlyHNL: 25000,
    icon: '📊',
    badge: 'Finanzas & Impuestos',
    buffCode: 'cfo_optimizations',
    description: 'Especialista en estructuración contable, flujos de tesorería y optimización de solvencia bancaria.',
    perks: [
      'Proyecciones Financieras: Modela los próximos 3 meses de flujo de caja y alerta quiebras antes de que ocurran.',
      'Optimización Tributaria: Reduce la tasa efectiva de ISR del 25% al 15% mediante deducciones legítimas.',
      'Prestigio Bancario: Suma +50 puntos directos al Credit Score empresarial ante los bancos comerciales.'
    ]
  },
  ABOGADO: {
    id: 'ABOGADO',
    name: 'Abg. Roberto Valladares (General Counsel)',
    title: 'Director Jurídico & Asuntos Regulatorios',
    salaryMonthlyHNL: 20000,
    icon: '⚖️',
    badge: 'Escudo Legal & UIF',
    buffCode: 'legal_shield',
    description: 'Litigante mercantil experto en auditorías tributarias del SAR y defensas de cumplimiento de la UIF.',
    perks: [
      'Escudo Regulatorio: Reduce multas y recargos del SAR y de la UIF a la mitad (-50%).',
      'Defensa en Auditorías Federales: 50% de probabilidad de ganar el juicio o anular sanciones de la UIF.',
      'Aceleración de Garantías: Protege el patrimonio familiar y mitiga embargos coactivos bancarios.'
    ]
  },
  COO: {
    id: 'COO',
    name: 'Ing. Fernando Zaldívar (COO)',
    title: 'Director de Operaciones & Cadena de Suministro',
    salaryMonthlyHNL: 22000,
    icon: '⚙️',
    badge: 'Operaciones & Compras',
    buffCode: 'supply_efficiency',
    description: 'Ingeniero industrial enfocado en negociación masiva de insumos, cuadrillas y cero desperdicios.',
    perks: [
      'Descuento en Proveedores: -10% de reducción en el costo de compra de materias primas e inventario (COGS).',
      'Eficiencia Operativa: Incrementa la productividad de cuadrillas y minimiza mermas de almacén.',
      'Eliminación de Cuellos de Botella: Agiliza la ejecución de obras y reposición de góndolas.'
    ]
  },
  CMO: {
    id: 'CMO',
    name: 'Licda. Marcela Faraj (CMO)',
    title: 'Directora de Marketing & Expansión Comercial',
    salaryMonthlyHNL: 18000,
    icon: '📢',
    badge: 'Ventas & Clientes',
    buffCode: 'market_share_expansion',
    description: 'Estratega de adquisición de clientes, campañas publicitarias y posicionamiento de marca en el mercado.',
    perks: [
      'Tráfico de Clientes: Aumenta el flujo peatonal y pedidos comerciales en +25%.',
      'Cuota de Mercado: Protege a la empresa frente a competidores agresivos y robos de clientela.',
      'Reputación Corporativa: Bonificación sostenida de reputación de marca mes a mes.'
    ]
  }
};

/**
 * Contrata a un ejecutivo C-Level
 */
export function hireExecutive(
  state: DailySimulationState,
  executiveId: CSuiteExecutiveId
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentStaff = state.cSuiteStaff || [];
  if (currentStaff.includes(executiveId)) {
    return { updatedState: state, success: false, message: 'Este ejecutivo ya forma parte de tu directiva corporativa.' };
  }

  const config = CSUITE_CATALOG[executiveId];
  const availableLiquidity = (state.storeBankBalance || 0) + (state.storeCash || 0);

  if (availableLiquidity < config.salaryMonthlyHNL) {
    return {
      updatedState: state,
      success: false,
      message: `Liquidez insuficiente para contratar a ${config.title}. Requiere al menos L ${config.salaryMonthlyHNL.toLocaleString()} de respaldo salarial.`
    };
  }

  const updatedStaff = [...currentStaff, executiveId];

  // Si contrata al CFO, recalcular Credit Score con buff de +50
  let updatedCreditProfile = state.companyCreditProfile ? { ...state.companyCreditProfile } : undefined;
  if (executiveId === 'CFO' && updatedCreditProfile) {
    updatedCreditProfile.score = Math.min(850, updatedCreditProfile.score + 50);
  }

  const email: SimulatedEmail = {
    id: `email_hire_${Date.now()}`,
    category: 'sistema_avisos',
    senderName: config.name,
    senderEmail: `${executiveId.toLowerCase()}@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Confirmación de Incorporación: ${config.title}`,
    body: `Estimada Dirección General:\n\nEs un honor asumir el cargo de ${config.title} en ${state.storeName}.\n\nMis habilidades y beneficios estratégicos ya han sido activados en el sistema corporativo:\n${config.perks.map(p => `• ${p}`).join('\n')}\n\nSalario mensual acordado: L ${config.salaryMonthlyHNL.toLocaleString()}.\n\n¡Trabajaremos incansablemente para llevar a la compañía a su máximo valor de mercado!`,
    sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    statusTag: 'Resuelto'
  };

  const updatedState: DailySimulationState = {
    ...state,
    cSuiteStaff: updatedStaff,
    companyCreditProfile: updatedCreditProfile,
    simulatedEmails: [email, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState,
    success: true,
    message: `¡${config.title} contratado(a) con éxito! Se activaron sus beneficios estratégicos.`
  };
}

/**
 * Despide a un ejecutivo C-Level
 */
export function fireExecutive(
  state: DailySimulationState,
  executiveId: CSuiteExecutiveId
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentStaff = state.cSuiteStaff || [];
  if (!currentStaff.includes(executiveId)) {
    return { updatedState: state, success: false, message: 'El ejecutivo no se encuentra contratado actualmente.' };
  }

  const config = CSUITE_CATALOG[executiveId];
  const updatedStaff = currentStaff.filter(id => id !== executiveId);

  // Si despidió al CFO, retirar el buff de +50 puntos de score
  let updatedCreditProfile = state.companyCreditProfile ? { ...state.companyCreditProfile } : undefined;
  if (executiveId === 'CFO' && updatedCreditProfile) {
    updatedCreditProfile.score = Math.max(300, updatedCreditProfile.score - 50);
  }

  const updatedState: DailySimulationState = {
    ...state,
    cSuiteStaff: updatedStaff,
    companyCreditProfile: updatedCreditProfile
  };

  return {
    updatedState,
    success: true,
    message: `Has desvinculado a ${config.title}. Sus beneficios y salario han cesado.`
  };
}

/**
 * Proyecciones Financieras a 3 Turnos (Buff pasivo del CFO)
 */
export function calculateThreeTurnProjections(state: DailySimulationState): {
  isUnlocked: boolean;
  projections: {
    turnLabel: string;
    month: number;
    year: number;
    estimatedRevenueHNL: number;
    estimatedOpexHNL: number;
    debtObligationsHNL: number;
    netCashFlowHNL: number;
    projectedEndingCashHNL: number;
    bankruptcyRisk: 'BAJO' | 'MODERADO' | 'CRÍTICO' | 'INMINENTE';
    projectedSalesHNL: number;
    projectedExpensesHNL: number;
    projectedNetProfitHNL: number;
    projectedCashRunwayHNL: number;
    riskLevel: string;
  }[];
  runwayMonths: number;
  estimatedRunwayMonths: number;
  currentMonthlyBurnRateHNL: number;
  cfoAdvice: string;
} {
  const hasCfo = Boolean(state.cSuiteStaff && state.cSuiteStaff.includes('CFO'));
  if (!hasCfo) {
    return {
      isUnlocked: false,
      projections: [],
      runwayMonths: 0,
      estimatedRunwayMonths: 0,
      currentMonthlyBurnRateHNL: 0,
      cfoAdvice: 'Contrata un Director Financiero (CFO) para desbloquear proyecciones financieras a 3 turnos y anticipar quiebras.'
    };
  }

  const currentCashAndBank = (state.storeCash || 0) + (state.storeBankBalance || 0);
  const baseMonthlyRevenue = Math.max(80000, state.monthlySalesAccumulated || 150000);
  const staffWagesMonthly = (state.dailyWages || 1200) * 30;
  const rentMonthly = (state.dailyRent || 500) * 30;
  const csuiteSalaries = (state.cSuiteStaff || []).reduce((acc, id) => acc + CSUITE_CATALOG[id].salaryMonthlyHNL, 0);
  const baseMonthlyOpex = staffWagesMonthly + rentMonthly + csuiteSalaries;

  // Cuotas de deuda
  let monthlyDebt = 0;
  if (state.commercialBanks) {
    for (const bId of Object.keys(state.commercialBanks)) {
      const rel = state.commercialBanks[bId as keyof typeof state.commercialBanks];
      if (rel?.activeLoan) {
        monthlyDebt += rel.activeLoan.monthlyPayment || 0;
      }
    }
  }
  const npcDebtMonthly = (state.npcLoans || []).reduce((acc, l) => acc + (l.monthlyQuota || 0), 0);
  const totalMonthlyDebt = monthlyDebt + npcDebtMonthly;

  let simulatedCash = currentCashAndBank;
  const projections = [];
  const startMonth = state.currentMonth || 1;
  const startYear = state.currentYear || 2026;

  for (let i = 1; i <= 3; i++) {
    const pMonth = ((startMonth + i - 1) % 12) + 1;
    const pYear = startYear + Math.floor((startMonth + i - 1) / 12);

    // Variación estocástica ligera del mercado
    const revMultiplier = 1.0 + (i === 1 ? 0.02 : i === 2 ? 0.05 : 0.08);
    const estRev = Math.round(baseMonthlyRevenue * revMultiplier);
    const estOpex = Math.round(baseMonthlyOpex * 1.02);
    const netFlow = estRev - estOpex - totalMonthlyDebt;
    simulatedCash += netFlow;

    let risk: 'BAJO' | 'MODERADO' | 'CRÍTICO' | 'INMINENTE' = 'BAJO';
    if (simulatedCash < 0) {
      risk = 'INMINENTE';
    } else if (simulatedCash < totalMonthlyDebt * 1.5) {
      risk = 'CRÍTICO';
    } else if (simulatedCash < baseMonthlyOpex) {
      risk = 'MODERADO';
    }

    const riskLevel = risk === 'INMINENTE' ? 'critico_quiebra' : risk === 'CRÍTICO' ? 'critico_quiebra' : risk === 'MODERADO' ? 'moderado' : 'seguro';

    projections.push({
      turnLabel: `Mes +${i} (${pMonth}/${pYear})`,
      month: pMonth,
      year: pYear,
      estimatedRevenueHNL: estRev,
      estimatedOpexHNL: estOpex,
      debtObligationsHNL: totalMonthlyDebt,
      netCashFlowHNL: netFlow,
      projectedEndingCashHNL: Math.round(simulatedCash),
      bankruptcyRisk: risk,
      // Propiedades adicionales
      projectedSalesHNL: estRev,
      projectedExpensesHNL: estOpex,
      projectedNetProfitHNL: netFlow,
      projectedCashRunwayHNL: Math.round(simulatedCash),
      riskLevel
    });
  }

  // Cash Runway
  const burnRate = Math.max(1, baseMonthlyOpex + totalMonthlyDebt - baseMonthlyRevenue);
  const runwayMonths = baseMonthlyRevenue >= (baseMonthlyOpex + totalMonthlyDebt)
    ? 999 
    : Number((currentCashAndBank / burnRate).toFixed(1));

  let cfoAdvice = 'Flujo de caja saludable. Se recomienda reinvertir en inventario o maquinaria para maximizar la valuación.';
  if (runwayMonths < 2) {
    cfoAdvice = '⚠️ ALERTA DE RIESGO: La empresa entrará en déficit de caja en menos de 60 días. Urge emitir acciones a un Venture Capital o solicitar crédito de capital de trabajo.';
  } else if (runwayMonths < 4) {
    cfoAdvice = 'Liquidez ajustada. Modera las compras de inventario y evita adquisiciones de activos no esenciales.';
  }

  return {
    isUnlocked: true,
    projections,
    runwayMonths,
    estimatedRunwayMonths: runwayMonths,
    currentMonthlyBurnRateHNL: burnRate,
    cfoAdvice
  };
}

/**
 * Pago mensual de la nómina de ejecutivos C-Level:
 * Si la empresa no tiene fondos, renuncian por impago
 */
export function processMonthlyCSuitePayroll(
  state: DailySimulationState
): { updatedState: DailySimulationState; totalPayrollPaidHNL: number; totalPayrollPaid: number; resignedStaff: CSuiteExecutiveId[]; message: string } {
  const staff = state.cSuiteStaff || [];
  if (staff.length === 0) {
    return { updatedState: state, totalPayrollPaidHNL: 0, totalPayrollPaid: 0, resignedStaff: [], message: 'No hay personal C-Suite en planilla.' };
  }

  const totalPayroll = staff.reduce((acc, id) => acc + CSUITE_CATALOG[id].salaryMonthlyHNL, 0);
  const availableLiquidity = (state.storeBankBalance || 0) + (state.storeCash || 0);

  if (availableLiquidity < totalPayroll) {
    // Fondos insuficientes: el staff renuncia por impago
    const resignedStaff = [...staff];
    const email: SimulatedEmail = {
      id: `email_resignation_${Date.now()}`,
      category: 'sistema_avisos',
      senderName: 'Departamento de Recursos Humanos',
      senderEmail: 'rrhh@aureobank.com',
      recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
      companyName: state.storeName,
      subject: '⚠️ RENUNCIA MASIVA: Impago de Nómina Directiva C-Suite',
      body: `Estimada Dirección General:\n\nDebido a la falta de liquidez para cubrir la nómina mensual directiva de L ${totalPayroll.toLocaleString()}, los siguientes ejecutivos han presentado su renuncia inmediata:\n\n${resignedStaff.map(id => `• ${CSUITE_CATALOG[id].title}`).join('\n')}\n\nTodos los beneficios estratégicos, escudos legales y optimizaciones tributarias han sido desactivados.`,
      sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
      simDay: state.currentDay,
      simMonth: state.currentMonth,
      simYear: state.currentYear || 2026,
      isRead: false,
      isStarred: true,
      folder: 'inbox',
      statusTag: 'Vencido'
    };

    let updatedCreditProfile = state.companyCreditProfile ? { ...state.companyCreditProfile } : undefined;
    if (staff.includes('CFO') && updatedCreditProfile) {
      updatedCreditProfile.score = Math.max(300, updatedCreditProfile.score - 50);
    }

    const updatedState: DailySimulationState = {
      ...state,
      cSuiteStaff: [],
      companyCreditProfile: updatedCreditProfile,
      simulatedEmails: [email, ...(state.simulatedEmails || [])]
    };

    return {
      updatedState,
      totalPayrollPaidHNL: 0,
      totalPayrollPaid: 0,
      resignedStaff,
      message: '⚠️ ¡Nómina C-Suite impaga! Tus ejecutivos estratégicos han renunciado y perdiste sus beneficios.'
    };
  }

  // Descontar nómina
  let newBank = state.storeBankBalance || 0;
  let newCash = state.storeCash || 0;
  if (newBank >= totalPayroll) {
    newBank -= totalPayroll;
  } else {
    const remainder = totalPayroll - newBank;
    newBank = 0;
    newCash -= remainder;
  }

  const updatedPayrollHistory = [
    ...(state.cSuitePayrollHistory || []),
    {
      month: state.currentMonth || 1,
      amountPaidHNL: totalPayroll,
      executives: [...staff]
    }
  ];

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    cSuitePayrollHistory: updatedPayrollHistory
  };

  return {
    updatedState,
    totalPayrollPaidHNL: totalPayroll,
    totalPayrollPaid: totalPayroll,
    resignedStaff: [],
    message: `Nómina C-Suite de L ${totalPayroll.toLocaleString()} cancelada puntualmente.`
  };
}

/**
 * Ruleta Rusa Financiera:
 * Aceptar dinero sucio de un inversor fantasma / fondos ilícitos
 */
export function injectDirtyMoneyClandestine(
  state: DailySimulationState,
  amountHNL: number = 200000,
  suspicionIncrease: number = 35,
  destination: 'cash' | 'bank' = 'cash'
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentSuspicion = state.uifSuspicionScore ?? (state.uifAudit?.suspicionScore || 0);
  const newSuspicion = Math.min(100, currentSuspicion + suspicionIncrease);

  const isCash = destination === 'cash';
  const newCash = isCash ? (state.storeCash || 0) + amountHNL : (state.storeCash || 0);
  const newBank = !isCash ? (state.storeBankBalance || 0) + amountHNL : (state.storeBankBalance || 0);
  const dirtyTotal = (state.uifAudit?.dirtyMoneyInjectedTotalHNL || 0) + amountHNL;

  const email: SimulatedEmail = {
    id: `email_dirty_${Date.now()}`,
    category: 'sistema_avisos',
    senderName: 'Inversor Anónimo (Canal Privado)',
    senderEmail: 'privado@shadow-capital.ch',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Depósito Clandestino Acreditado: L ${amountHNL.toLocaleString()}`,
    body: `El dinero acordado (L ${amountHNL.toLocaleString()}) ha sido transferido en efectivo a tu circuito de tesorería sin declaraciones previas.\n\nADVERTENCIA: Tu nivel de sospecha ante la Unidad de Inteligencia Financiera (UIF) ha ascendido a ${newSuspicion}%. Si ocurre una auditoría federal, necesitarás un Abogado Corporativo para evitar el decomiso.`,
    sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    statusTag: 'Pendiente'
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: newCash,
    storeBankBalance: newBank,
    uifSuspicionScore: newSuspicion,
    uifAudit: {
      suspicionScore: newSuspicion,
      underAudit: false,
      finesPaidTotalHNL: state.uifAudit?.finesPaidTotalHNL || 0,
      dirtyMoneyInjectedTotalHNL: dirtyTotal
    },
    simulatedEmails: [email, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState,
    success: true,
    message: `⚠️ Dinero clandestino acreditado (+L ${amountHNL.toLocaleString()}). Sospecha UIF subió al ${newSuspicion}%.`
  };
}

/**
 * Evaluación de Auditoría Federal de la UIF al Fin de Turno / Mes
 */
export function processUifTurnAudit(
  state: DailySimulationState
): { updatedState: DailySimulationState; auditTriggered: boolean; savedByLawyer: boolean; fineAmountHNL: number; message?: string } {
  const uif = state.uifAudit;
  if (!uif || uif.suspicionScore < 15) {
    return { updatedState: state, auditTriggered: false, savedByLawyer: false, fineAmountHNL: 0 };
  }

  // Probabilidad basada en el nivel de sospecha (ej. 35% de sospecha = ~25% de probabilidad)
  const auditProbability = (uif.suspicionScore * 0.7) / 100;
  const roll = Math.random();

  if (roll > auditProbability) {
    // Se reduce ligeramente la sospecha si no hubo auditoría este turno (-5%)
    return {
      updatedState: {
        ...state,
        uifAudit: {
          ...uif,
          suspicionScore: Math.max(0, uif.suspicionScore - 5)
        }
      },
      auditTriggered: false,
      savedByLawyer: false,
      fineAmountHNL: 0
    };
  }

  // ¡Auditoría Federal Disparada!
  const hasLawyer = Boolean(state.cSuiteStaff && state.cSuiteStaff.includes('ABOGADO'));
  let savedByLawyer = false;

  if (hasLawyer) {
    // 50% de probabilidad de que el abogado gane el litigio o soborne la auditoría
    savedByLawyer = Math.random() < 0.50;
  }

  if (savedByLawyer) {
    const lawyerEmail: SimulatedEmail = {
      id: `email_uif_defense_${Date.now()}`,
      category: 'sistema_avisos',
      senderName: 'Abg. Roberto Valladares (General Counsel)',
      senderEmail: 'legal@aureobank.com',
      recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
      companyName: state.storeName,
      subject: '🛡️ ¡CASO GANADO! Auditoría Federal de la UIF Desestimada',
      body: `Estimada Dirección General:\n\nLa Comisión Nacional de Bancos y la UIF abrieron un expediente de investigación por sospecha de lavado de activos.\n\nGracias a mi intervención legal inmediata, encontramos vacíos en el acta de inspección y logramos la desestimación total del caso sin sanciones pecuniarias.\n\nSospecha restablecida a cero.`,
      sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
      simDay: state.currentDay,
      simMonth: state.currentMonth,
      simYear: state.currentYear || 2026,
      isRead: false,
      isStarred: true,
      folder: 'inbox',
      statusTag: 'Resuelto'
    };

    return {
      updatedState: {
        ...state,
        uifAudit: {
          ...uif,
          suspicionScore: 0,
          underAudit: false,
          lastAuditResult: 'salvado_por_abogado'
        },
        simulatedEmails: [lawyerEmail, ...(state.simulatedEmails || [])]
      },
      auditTriggered: true,
      savedByLawyer: true,
      fineAmountHNL: 0,
      message: '🛡️ ¡Tu Abogado Corporativo ganó el juicio ante la UIF y evitó la clausura y las multas!'
    };
  }

  // Sanción y Multa Federal
  // Base: 50% del total de dinero sucio inyectado o L 150,000
  let fineBase = Math.max(150000, Math.round((uif.dirtyMoneyInjectedTotalHNL || 200000) * 0.60));
  if (hasLawyer) {
    // El abogado al menos reduce la multa a la mitad si no logró anularla
    fineBase = Math.round(fineBase * 0.50);
  }

  let newBank = Math.max(0, (state.storeBankBalance || 0) - fineBase);
  let newCash = state.storeCash || 0;
  if ((state.storeBankBalance || 0) < fineBase) {
    const rem = fineBase - (state.storeBankBalance || 0);
    newBank = 0;
    newCash = Math.max(0, newCash - rem);
  }

  const sanctionEmail: SimulatedEmail = {
    id: `email_uif_fine_${Date.now()}`,
    category: 'sistema_avisos',
    senderName: 'Unidad de Inteligencia Financiera (UIF / CNBS)',
    senderEmail: 'sanciones@cnbs.gob.hn',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `🚨 SANCIÓN COACTIVA: Resolución Sancionatoria UIF por L ${fineBase.toLocaleString()}`,
    body: `RESOLUCIÓN SANCIONATORIA DE LA UNIDAD DE INTELIGENCIA FINANCIERA (UIF):\n\nSe ha comprobado el ingreso de fondos no justificados al circuito financiero de ${state.storeName}.\n\n• Multa Pecuniaria Ejecutada: L ${fineBase.toLocaleString()}\n• Estado de la Empresa: BAJO VIGILANCIA ESPECIAL REGULATORIA\n\nEl débito ha sido ejecutado de sus cuentas bancarias conforme a la Ley Contra el Lavado de Activos de Honduras.`,
    sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    statusTag: 'Vencido'
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    uifAudit: {
      suspicionScore: 10,
      underAudit: false,
      lastAuditResult: 'sancionado',
      finesPaidTotalHNL: (uif.finesPaidTotalHNL || 0) + fineBase,
      dirtyMoneyInjectedTotalHNL: 0
    },
    simulatedEmails: [sanctionEmail, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState,
    auditTriggered: true,
    savedByLawyer: false,
    fineAmountHNL: fineBase,
    message: `🚨 SANCIÓN FEDERAL UIF: La comisión descubrió los fondos ilícitos. Multa de L ${fineBase.toLocaleString()} debitada.`
  };
}
