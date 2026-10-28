import { 
  GameState, 
  CreditApplication, 
  GameEventNotification,
  BankFinancialStatements,
  BankingDivisionId,
  BankDivisionConfig,
  CreditRiskCategoryBreakdown,
  IndividualClient,
  CorporatePayrollAgreement,
  PosMerchant,
  PensionFund,
  SecondaryMarketSecurity,
  InterbankPortfolioOffer,
  DynamicAlert,
  ExpertOpinion,
  TenInnovationsState,
  CompetitorId,
  SwiftTransaction,
  BchMoneyDeskState,
  FxForwardContract,
  YieldCurvePoint,
  MonthlyClosingSummary,
  BchRepoOperation,
  AureoProgramsState,
  AureoProgramItem,
  AdvancedOperationsState,
  BranchDepartment,
  AtmUnit,
  SubordinatedBondEmission,
  FxAuctionBid,
  SovereignHolding,
  MultilateralCreditLine,
  MutualFundTier,
  CorporateTrustContract,
  MicroInsuranceProduct,
  StressSimulationResult,
  FiscalYearDividendRecord,
  DividendGovernanceState,
  FinancialSandboxConfig,
  StrategicImprovementPillar,
  StrategicImprovementStatus,
  StrategicActivationMode,
  StrategicImprovementItem,
  StrategicImprovementsState,
  AmlComplianceState,
  AmlTransactionAlert,
  AmlAlertSeverity,
  AmlAlertType,
  AmlInvestigationStatus,
  UifReportDossier,
  ExecutiveDilemmasState,
  ExecutiveDilemma,
  DilemmaCategory,
  DilemmaStatus,
  DilemmaOption,
  TermDepositCertificate,
  BackToBackFacility,
  DemandDepositAccount,
  AchTransferTransaction,
  CorporatePayrollBatch,
  TradeFinanceLetterOfCredit
} from './types';
import { 
  INITIAL_BANKING_PROGRAMS_20, 
  INITIAL_ADVANCED_OPERATIONS,
  INITIAL_DIVIDEND_GOVERNANCE,
  INITIAL_FINANCIAL_SANDBOX,
  INITIAL_STRATEGIC_IMPROVEMENTS,
  INITIAL_AML_COMPLIANCE,
  INITIAL_EXECUTIVE_DILEMMAS
} from './initialState';

// Nombres y apellidos hondureños realistas para generación de expedientes y prospectos
const HN_FIRST_NAMES = ['Carlos', 'Ana', 'José', 'Suyapa', 'Roberto', 'María', 'Luis', 'Daniela', 'Rigoberto', 'Xiomara', 'Mario', 'Gissel', 'Edgar', 'Brenda', 'Héctor', 'Karla', 'Mauricio', 'Miriam'];
const HN_LAST_NAMES = ['Mejía', 'Ávila', 'Flores', 'Hernández', 'Martínez', 'López', 'Castillo', 'Zelaya', 'Pineda', 'García', 'Reyes', 'Moncada', 'Vásquez', 'Cruz', 'Maldonado', 'Bueso', 'Facussé'];
const HN_CITIES = ['San Pedro Sula', 'Tegucigalpa', 'Choloma', 'La Ceiba', 'Comayagua', 'Choluteca', 'Roatán', 'El Progreso', 'Siguatepeque'];
const HN_COMPANIES = [
  'Inversiones Caracol S.A.', 'Transportes del Atlántico', 'Distribuidora Lempira', 
  'Constructora Morazán', 'Agropecuaria Guayape', 'Laboratorios Médicos del Norte',
  'Repuestos y Motores Cortés', 'Comercializadora Maya', 'Textiles Villanueva S. de R.L.',
  'Grupo Harinero del Valle', 'Lácteos Hondureños S.A.', 'Embotelladora San Pedro',
  'Cafés Finos de Marcala S.A.', 'Logística & Cargas de Puerto Cortés'
];

export function formatHNL(amount: number): string {
  return 'L. ' + (amount || 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatUSD(amount: number): string {
  return '$ ' + (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatPct(val: number): string {
  return (val || 0).toFixed(2) + '%';
}

export function getMonthName(monthIndex: number, startYear: number = 2026): { name: string; year: number; fullLabel: string } {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const yearOffset = Math.floor((monthIndex - 1) / 12);
  const mIdx = (monthIndex - 1) % 12;
  const currentYear = startYear + yearOffset;
  const name = months[mIdx];
  return { name, year: currentYear, fullLabel: `${name} ${currentYear}` };
}

/**
 * Evalúa y ejecuta la migración o promoción automática de segmento de un cliente
 * según su saldo de depósitos o patrimonio en Lempiras:
 * - < 250,000 -> Banca Personas
 * - >= 250,000 y < 1,200,000 -> Banca Premier / Banca+
 * - >= 1,200,000 -> Banca Privada & Fiduciaria
 */
export function evaluateClientDivisionUpgrade(
  client: IndividualClient, 
  newBalance: number
): { upgradedDivision: BankingDivisionId; wasUpgraded: boolean; message?: string } {
  // Solo se evalúan promociones automáticas en bancas individuales (personas, premier, privada)
  if (client.division === 'pyme' || client.division === 'corporativa' || client.division === 'internacional') {
    return { upgradedDivision: client.division, wasUpgraded: false };
  }

  let targetDiv: BankingDivisionId = 'personas';
  if (newBalance >= 1200000) {
    targetDiv = 'privada';
  } else if (newBalance >= 250000) {
    targetDiv = 'premier';
  } else {
    targetDiv = 'personas';
  }

  if (targetDiv !== client.division) {
    const divNames: Record<BankingDivisionId, string> = {
      personas: 'Banca Personas (Retail)',
      premier: 'Banca Premier / Banca+',
      privada: 'Banca Privada y Fiduciaria',
      pyme: 'Banca Comercial PYME',
      corporativa: 'Banca Corporativa',
      internacional: 'Banca Internacional'
    };
    const message = `¡Cliente reclasificado automáticamente! ${client.name} ha pasado de ${divNames[client.division]} a ${divNames[targetDiv]} con un saldo acumulado de ${formatHNL(newBalance)}.`;
    return { upgradedDivision: targetDiv, wasUpgraded: true, message };
  }

  return { upgradedDivision: client.division, wasUpgraded: false };
}

/**
 * Calcula la matriz de riesgo crediticio según normativa de la CNBS de Honduras.
 */
export function calculateCreditRiskMatrix(state: GameState): CreditRiskCategoryBreakdown[] {
  // Clientes individuales en mora del estado
  const activeClients = state.clients.filter(c => !c.isSoldToRival);
  
  const cat1Clients = activeClients.filter(c => c.cnbsCategory === 'I - Normal');
  const cat2Clients = activeClients.filter(c => c.cnbsCategory === 'II - Especial');
  const cat3Clients = activeClients.filter(c => c.cnbsCategory === 'III - Subnormal');
  const cat4Clients = activeClients.filter(c => c.cnbsCategory === 'IV - Dudoso Recaudo');
  const cat5Clients = activeClients.filter(c => c.cnbsCategory === 'V - Pérdida');

  const cat1Overdue = cat1Clients.reduce((acc, c) => acc + (c.pastDueAmountHNL || 0), 0) || 12450000;
  const cat2Overdue = cat2Clients.reduce((acc, c) => acc + (c.pastDueAmountHNL || 0), 0) || 14800000;
  const cat3Overdue = cat3Clients.reduce((acc, c) => acc + (c.pastDueAmountHNL || 0), 0) || 11250000;
  const cat4Overdue = cat4Clients.reduce((acc, c) => acc + (c.pastDueAmountHNL || 0), 0) || 9450000;
  const cat5Overdue = cat5Clients.reduce((acc, c) => acc + (c.pastDueAmountHNL || 0), 0) || 7344191;

  const currentHealthy = Math.max(0, (state.financials.loanPortfolioCurrent || 1995000000) - cat1Overdue);

  return [
    {
      category: 'I - Normal',
      daysOverdue: '0 a 30 días de atraso',
      provisionPct: 1.0,
      balanceHNL: currentHealthy + cat1Overdue,
      clientCount: cat1Clients.length + 18450,
      provisionRequiredHNL: Math.round((currentHealthy + cat1Overdue) * 0.01)
    },
    {
      category: 'II - Especial',
      daysOverdue: '31 a 60 días de atraso',
      provisionPct: 5.0,
      balanceHNL: cat2Overdue,
      clientCount: cat2Clients.length + 1420,
      provisionRequiredHNL: Math.round(cat2Overdue * 0.05)
    },
    {
      category: 'III - Subnormal',
      daysOverdue: '61 a 90 días de atraso',
      provisionPct: 20.0,
      balanceHNL: cat3Overdue,
      clientCount: cat3Clients.length + 450,
      provisionRequiredHNL: Math.round(cat3Overdue * 0.20)
    },
    {
      category: 'IV - Dudoso Recaudo',
      daysOverdue: '91 a 180 días de atraso',
      provisionPct: 50.0,
      balanceHNL: cat4Overdue,
      clientCount: cat4Clients.length + 180,
      provisionRequiredHNL: Math.round(cat4Overdue * 0.50)
    },
    {
      category: 'V - Pérdida',
      daysOverdue: 'Más de 180 días de atraso',
      provisionPct: 100.0,
      balanceHNL: cat5Overdue,
      clientCount: cat5Clients.length + 65,
      provisionRequiredHNL: cat5Overdue
    }
  ];
}

/**
 * Avanza el turno un mes completo.
 * Ejecuta el ciclo contable del banco, simulación macroeconómica BCH,
 * actualización de cuentas, cuotas de préstamos, tarjetas, mora/NPL,
 * comercios POS, fondos de pensiones, convenios de planilla,
 * cupones y dividendos del mercado secundario, y reinicio de asesores de crédito.
 */
export function advanceGameMonth(state: GameState): GameState {
  const nextMonth = state.gameMonth + 1;
  const { name: currentMonthName, year: currentYear, fullLabel } = getMonthName(nextMonth);

  // 1. Simulación Macroeconómica del BCH
  let newInflation = state.bch.interannualInflation;
  let newTPM = state.bch.tpmRate;
  let newExchangeRate = +(state.bch.exchangeRateHNLtoUSD + 0.02 + Math.random() * 0.03).toFixed(2);
  let sentiment = state.bch.economicSentiment;
  let bulletinTitle = '';
  let bulletinText = '';

  // Eventos cíclicos hondureños
  const isCatorceavo = (nextMonth % 12 === 6); // Junio: pago de catorceavo
  const isAguinaldo = (nextMonth % 12 === 0);  // Diciembre: aguinaldo

  const randEvent = Math.random();
  if (randEvent < 0.25) {
    newInflation = +(newInflation + 0.15 + Math.random() * 0.2).toFixed(2);
    if (newInflation > 5.5 && newTPM < 6.25) {
      newTPM = +(newTPM + 0.25).toFixed(2);
      bulletinTitle = `BCH eleva la TPM a ${newTPM}% ante presiones inflacionarias`;
      bulletinText = `En sesión ordinaria, el Directorio del BCH ajustó la Tasa de Política Monetaria al alza para mitigar presiones en los precios al consumidor y anclar las expectativas del mercado.`;
      sentiment = 'Presión Inflacionaria';
    } else {
      bulletinTitle = `Reporte de Inflación BCH: ${newInflation}% interanual`;
      bulletinText = `El Índice de Precios al Consumidor experimentó una variación mensual impulsada por alimentos y transporte. El BCH mantiene monitoreo constante.`;
      sentiment = 'Estable';
    }
  } else if (randEvent > 0.85) {
    newInflation = +(Math.max(3.8, newInflation - 0.2)).toFixed(2);
    bulletinTitle = `Inflación desciende a ${newInflation}%. Estabilidad macroeconómica`;
    bulletinText = `El Banco Central destaca la estabilidad en el tipo de cambio y la moderación en los precios de importación de combustibles y materias primas.`;
    sentiment = 'Crecimiento Sólido';
  } else {
    bulletinTitle = `Boletín Monetario BCH - ${fullLabel}`;
    bulletinText = `Las condiciones de liquidez del sistema bancario nacional se mantienen ordenadas. La subasta de divisas operó con normalidad atendiendo la demanda del sector productivo.`;
  }

  if (isCatorceavo) {
    bulletinTitle = `Junio: Derrame económico por Catorceavo Mes`;
    bulletinText = `El sistema financiero experimenta un pico en retiros de efectivo y un fuerte repunte en transferencias ACH y consumo en comercios afiliados POS.`;
  } else if (isAguinaldo) {
    bulletinTitle = `Diciembre: Alto circulante por Aguinaldos y Fiestas Navideñas`;
    bulletinText = `Mayor flujo de remesas familiares desde el exterior y máxima actividad comercial en las principales ciudades del país.`;
  }

  // 2. Modificadores de la Junta Directiva y Personal
  const riskDirector = state.board.find(d => d.id === 'dir_riesgo');
  const riskDirectorBonus = riskDirector ? 0.35 : 0;
  const treasuryDirector = state.board.find(d => d.id === 'dir_tesoreria');
  const treasuryBoost = treasuryDirector ? 0.005 : 0;
  const commercialDirector = state.board.find(d => d.id === 'dir_comercial');
  const commercialBoost = commercialDirector ? 1.15 : 1.0;

  const creditOfficers = state.staff.find(s => s.id === 'oficiales_credito')?.count || 20;
  const riskAnalysts = state.staff.find(s => s.id === 'analistas_riesgo')?.count || 6;

  // 3. Elasticidad de tasas y migración global de cartera frente a competidores
  const avgCompetitorDepositRate = state.competitors.reduce((acc, c) => acc + c.depositRateAvg, 0) / state.competitors.length;
  const avgCompetitorLendingRate = state.competitors.reduce((acc, c) => acc + c.lendingRateAvg, 0) / state.competitors.length;

  const updatedDivisions = { ...state.divisions };
  let totalNewDeposits = 0;
  let totalNewLoans = 0;
  let totalInterestIncomeLoans = 0;
  let totalInterestExpenseDeposits = 0;
  let totalCardsPOSFees = 0;

  let marketStealMultiplier = 1.0;
  if (state.marketingAggressiveness === 'Agresiva (Guerra de Tasas)') marketStealMultiplier = 1.35;
  if (state.marketingAggressiveness === 'Ultra Agresiva (Robo de Cartera)') marketStealMultiplier = 1.85;
  if (state.marketingAggressiveness === 'Prudente Conservadora') marketStealMultiplier = 0.75;

  // 3. Indexación dinámica por TPM del BCH y elasticidad frente a competidores
  const tpmDelta = +(newTPM - state.bch.tpmRate).toFixed(2);
  const indexedDivisionsSummary: MonthlyClosingSummary['indexedDivisionsSummary'] = [];

  (Object.keys(updatedDivisions) as BankingDivisionId[]).forEach(divId => {
    const div = { ...updatedDivisions[divId] };
    const oldLending = div.avgLendingRate;
    const oldDeposit = div.avgDepositRate;

    // Si varió la TPM del BCH, indexar tasas activas y pasivas con pass-through institucional
    if (tpmDelta !== 0) {
      div.avgLendingRate = +(Math.max(10.0, Math.min(32.0, div.avgLendingRate + tpmDelta * 0.85))).toFixed(2);
      div.avgDepositRate = +(Math.max(2.5, Math.min(12.0, div.avgDepositRate + tpmDelta * 0.60))).toFixed(2);
      indexedDivisionsSummary.push({
        divisionId: divId,
        divisionName: div.name,
        oldLendingRate: oldLending,
        newLendingRate: div.avgLendingRate,
        oldDepositRate: oldDeposit,
        newDepositRate: div.avgDepositRate
      });
    }

    const monthlyLendingRate = (div.avgLendingRate / 100) / 12;
    const monthlyDepositRate = (div.avgDepositRate / 100) / 12;

    const interestIncome = div.totalLoans * monthlyLendingRate;
    const interestExpense = div.totalDeposits * monthlyDepositRate;
    totalInterestIncomeLoans += interestIncome;
    totalInterestExpenseDeposits += interestExpense;

    const rateDiffDeposit = div.avgDepositRate - avgCompetitorDepositRate;
    let depositGrowthFactor = 1.006;
    if (rateDiffDeposit > 0) {
      depositGrowthFactor += (rateDiffDeposit * 0.012) * marketStealMultiplier * commercialBoost;
    } else {
      depositGrowthFactor -= (Math.abs(rateDiffDeposit) * 0.008);
    }
    div.totalDeposits = Math.round(div.totalDeposits * Math.max(0.98, depositGrowthFactor));

    const rateDiffLending = avgCompetitorLendingRate - div.avgLendingRate;
    let loanGrowthFactor = 1.004;
    if (rateDiffLending > 0) {
      loanGrowthFactor += (rateDiffLending * 0.008) * (creditOfficers / 20);
    }
    div.totalLoans = Math.round(div.totalLoans * Math.max(0.985, loanGrowthFactor));

    let baseMora = div.delinquencyRate;
    const moraReduction = (riskAnalysts * 0.04) + riskDirectorBonus;
    baseMora = Math.max(0.2, +(baseMora - (moraReduction * 0.05) + (Math.random() * 0.08 - 0.04)).toFixed(2));
    div.delinquencyRate = baseMora;

    if (divId === 'personas') {
      totalCardsPOSFees += div.activeCardsCount * 45;
    } else if (divId === 'pyme') {
      totalCardsPOSFees += div.activeAccountsCount * 180;
    } else if (divId === 'corporativa') {
      totalCardsPOSFees += div.clientCount * 2800;
    }

    totalNewDeposits += div.totalDeposits;
    totalNewLoans += div.totalLoans;
    updatedDivisions[divId] = div;
  });

  // 4. Actualización Mensual Individual Obligatoria de Clientes
  // (Cuotas con Débito Flexible, Capitalización de Rendimientos, Ajuste de Límites por Mora/Score y Promoción Automática)
  let loansProcessedCount = 0;
  let loansFullyPaidCount = 0;
  let loansPartialOrOverdueCount = 0;
  let totalAmortizationCollectedHNL = 0;
  let totalInterestCollectedHNL = 0;
  let limitsIncreasedCount = 0;
  let limitsReducedCount = 0;
  let totalLimitExpansionHNL = 0;
  let totalDepositInterestCapitalizedHNL = 0;
  const delinquentClientsNotices: MonthlyClosingSummary['delinquentClientsNotices'] = [];

  const upgradeNotifs: GameEventNotification[] = [];
  const updatedClients: IndividualClient[] = state.clients.map(client => {
    // Si el cliente fue vendido a un banco competidor, ya no opera en Áureo
    if (client.isSoldToRival) {
      return client;
    }

    const divConfig = updatedDivisions[client.division] || updatedDivisions.personas;
    const monthlyDepositRate = (divConfig.avgDepositRate / 100) / 12;

    // A. Rendimiento de cuenta bancaria e intereses capitalizados
    const interestEarned = Math.round(client.accountBalanceHNL * monthlyDepositRate);
    totalDepositInterestCapitalizedHNL += interestEarned;
    let newBalance = client.accountBalanceHNL + interestEarned;
    // Flujo regular de salarios o depósitos del mes
    const regularInflow = Math.round(client.accountBalanceHNL * (0.005 + Math.random() * 0.015));
    newBalance += regularInflow;

    // B. Préstamos y Financiamiento: Indexación de Tasa y Débito Flexible de Cuotas
    let loanBal = client.loanBalanceHNL;
    let monthsRem = client.loanMonthsRemaining;
    let pastDays = client.pastDueDays;
    let pastAmt = client.pastDueAmountHNL;
    let cnbs = client.cnbsCategory;
    let loanRate = client.loanInterestRateAnnual;
    let monthlyPay = client.loanMonthlyPaymentHNL;
    let lastAmortStatus: 'al_dia' | 'aviso_previo_insuficiencia' | 'renegociado' = 'al_dia';
    let lastAmortNotice = '';
    let lastQuotaDeducted = 0;

    if (client.hasLoan && monthsRem > 0 && loanBal > 0) {
      loansProcessedCount++;
      // Indexación de tasa del préstamo si cambió la TPM del BCH
      if (tpmDelta !== 0) {
        loanRate = +(Math.max(8.0, Math.min(34.0, loanRate + tpmDelta * 0.85))).toFixed(2);
        const rMonthly = (loanRate / 100) / 12;
        monthlyPay = Math.round((loanBal * rMonthly) / (1 - Math.pow(1 + rMonthly, -monthsRem)));
      }

      const paymentDue = monthlyPay;
      const canPayInFull = client.guaranteedPayment || newBalance >= paymentDue;

      if (canPayInFull) {
        // Débito completo exitoso
        if (!client.guaranteedPayment) {
          newBalance = Math.max(0, newBalance - paymentDue);
        }
        const monthlyInterest = Math.round(loanBal * ((loanRate / 100) / 12));
        const capitalAmortization = Math.min(loanBal, Math.max(1, paymentDue - monthlyInterest));

        totalAmortizationCollectedHNL += capitalAmortization;
        totalInterestCollectedHNL += monthlyInterest;
        loanBal = Math.max(0, loanBal - capitalAmortization);
        monthsRem = Math.max(0, monthsRem - 1);
        pastDays = 0;
        pastAmt = 0;
        cnbs = 'I - Normal';
        lastAmortStatus = 'al_dia';
        lastQuotaDeducted = paymentDue;
        lastAmortNotice = `Cuota debitada exitosamente por ${formatHNL(paymentDue)}. Préstamo al día.`;

        // Si canceló la totalidad de la deuda
        if (loanBal <= 0 || monthsRem <= 0) {
          loanBal = 0;
          monthsRem = 0;
          loansFullyPaidCount++;
          lastAmortNotice = `¡Préstamo cancelado en su totalidad! Saldo en L. 0.00.`;
        }
      } else {
        // Débito flexible con aviso previo y renegociación sugerida
        loansPartialOrOverdueCount++;
        const partialDebit = Math.max(0, newBalance - 100); // Se debita lo disponible dejando L. 100 de cortesía
        newBalance = newBalance - partialDebit;
        const shortfall = paymentDue - partialDebit;

        totalAmortizationCollectedHNL += Math.round(partialDebit * 0.5);
        totalInterestCollectedHNL += Math.round(partialDebit * 0.5);
        pastAmt += shortfall;
        pastDays += 30;

        // Clasificación de Riesgo según CNBS
        if (pastDays >= 180) {
          cnbs = 'V - Pérdida';
        } else if (pastDays >= 90) {
          cnbs = 'IV - Dudoso Recaudo';
        } else if (pastDays >= 60) {
          cnbs = 'III - Subnormal';
        } else {
          cnbs = 'II - Especial';
        }

        lastAmortStatus = 'aviso_previo_insuficiencia';
        lastQuotaDeducted = partialDebit;
        const suggestedAction: 'reestructurar_plazo' | 'quita_interes' | 'dacion_garantia' = 
          pastDays >= 90 ? 'dacion_garantia' : (pastDays >= 60 ? 'reestructurar_plazo' : 'quita_interes');

        lastAmortNotice = `Aviso Previo: Insuficiencia de fondos. Se aplicó débito flexible de ${formatHNL(partialDebit)}, cuota pendiente: ${formatHNL(shortfall)} (${pastDays} días mora - Cat. CNBS ${cnbs.split(' - ')[0]}). Sugerencia: renegociar deuda.`;

        delinquentClientsNotices.push({
          clientId: client.id,
          clientName: client.name,
          division: client.division,
          loanType: client.loanType,
          monthlyPaymentHNL: paymentDue,
          accountBalanceHNL: newBalance,
          shortfallHNL: shortfall,
          pastDueDays: pastDays,
          cnbsCategory: cnbs,
          suggestedAction
        });
      }
    }

    // C. Tarjeta de Crédito: Consumos, Pagos y Ajuste Dinámico de Límites
    let cardBal = client.creditCardBalanceHNL;
    let cardLimit = client.creditCardLimitHNL;

    if (client.hasCreditCard) {
      if (cardBal > 0) {
        const minPay = Math.round(cardBal * 0.2);
        if (client.guaranteedPayment || newBalance >= minPay) {
          if (!client.guaranteedPayment) {
            newBalance = Math.max(0, newBalance - minPay);
          }
          cardBal = Math.max(0, cardBal - minPay);
        } else {
          // Interés moratorio rotativo
          cardBal = Math.round(cardBal * (1 + 0.32 / 12));
        }
      }

      // Consumo regular si dispone de límite libre
      if (cardLimit > cardBal) {
        const newCharge = Math.round((cardLimit - cardBal) * (0.05 + Math.random() * 0.1));
        cardBal += newCharge;
      }

      // Ajuste Dinámico de Límites Crediticios cada Mes
      if (pastDays === 0 && client.equifaxScore >= 700) {
        // Cliente puntual con buen score: incremento automático prudente (+8%)
        const expansion = Math.round(cardLimit * 0.08);
        cardLimit += expansion;
        limitsIncreasedCount++;
        totalLimitExpansionHNL += expansion;
      } else if (pastDays >= 30) {
        // Cliente con mora: congelamiento y reducción preventiva del límite disponible si pasa de 60 días
        if (pastDays >= 60) {
          const reducedLimit = Math.max(cardBal, Math.round(cardLimit * 0.85));
          if (reducedLimit < cardLimit) {
            cardLimit = reducedLimit;
            limitsReducedCount++;
          }
        }
      }
    }

    // D. Rendimiento en fondo de pensiones si está afiliado
    let pensionBal = client.pensionBalanceHNL || 0;
    if (client.pensionFundEnrolled) {
      const fund = state.pensionFunds.find(f => f.profile === (client.pensionFundProfile || 'Conservador')) || state.pensionFunds[0];
      const monthlyFundYield = (fund.currentAnnualReturnPct / 100) / 12;
      pensionBal = Math.round(pensionBal * (1 + monthlyFundYield) + 1500); // Aporte mensual
    }

    // E. Evaluación de Promoción Automática de Segmento (ej. de L. 45,000 a L. 1,000,000)
    let assignedDivision = client.division;
    const upgradeCheck = evaluateClientDivisionUpgrade(client, newBalance);
    if (upgradeCheck.wasUpgraded) {
      assignedDivision = upgradeCheck.upgradedDivision;
      upgradeNotifs.push({
        id: `upg-${client.id}-${nextMonth}`,
        month: nextMonth,
        year: currentYear,
        type: 'segment_upgrade',
        title: `Promoción Automática: ${client.name}`,
        message: upgradeCheck.message || '',
        impactSummary: `Nuevo Segmento: ${assignedDivision.toUpperCase()} · Saldo: ${formatHNL(newBalance)}`
      });
    }

    return {
      ...client,
      division: assignedDivision,
      accountBalanceHNL: newBalance,
      hasLoan: loanBal > 0,
      loanBalanceHNL: loanBal,
      loanMonthlyPaymentHNL: monthlyPay,
      loanInterestRateAnnual: loanRate,
      loanMonthsRemaining: monthsRem,
      pastDueDays: pastDays,
      pastDueAmountHNL: pastAmt,
      cnbsCategory: cnbs,
      creditCardLimitHNL: cardLimit,
      creditCardBalanceHNL: cardBal,
      pensionBalanceHNL: pensionBal,
      lastMonthlyAmortizationStatus: lastAmortStatus,
      lastAmortizationNotice: lastAmortNotice,
      lastQuotaDeductedHNL: lastQuotaDeducted
    };
  });

  // 5. Adquirencia Comercial POS PYME
  let posAcquiringFeeIncome = 0;
  const seasonalFactor = isAguinaldo || isCatorceavo ? 1.25 : 1.0;
  const updatedMerchants: PosMerchant[] = state.posMerchants.map(merchant => {
    const variation = (1 + (Math.random() * 0.1 - 0.04)) * seasonalFactor;
    const newSales = Math.round(merchant.monthlySalesVolumeHNL * variation);
    const fee = Math.round(newSales * (merchant.transactionFeePct / 100));
    posAcquiringFeeIncome += fee;

    // Si tiene más de L. 1.2M en ventas mensuales, es apto para crédito comercial
    const eligible = newSales >= 1200000 && merchant.bankAccountBalanceHNL >= 250000;

    return {
      ...merchant,
      monthlySalesVolumeHNL: newSales,
      bankAccountBalanceHNL: merchant.bankAccountBalanceHNL + Math.round(newSales * 0.08),
      creditEligible: eligible
    };
  });

  // 6. Fondos de Pensiones y Cesantías
  let pensionFeeIncome = 0;
  const updatedPensionFunds: PensionFund[] = state.pensionFunds.map(fund => {
    const monthlyFee = Math.round(fund.totalAUM_HNL * (fund.managementFeePct / 100 / 12));
    pensionFeeIncome += monthlyFee;
    const aumGrowth = Math.round(fund.totalAUM_HNL * (1 + (fund.currentAnnualReturnPct / 100 / 12) + 0.005));

    return {
      ...fund,
      totalAUM_HNL: aumGrowth,
      affiliateCount: fund.affiliateCount + Math.floor(Math.random() * 45 + 10)
    };
  });

  // 7. Convenios de Planilla y Renovación Automática a los 6 Meses
  let payrollFeeIncome = 0;
  let autoRenewedCompanyName = '';
  const updatedPayrollAgreements: CorporatePayrollAgreement[] = state.payrollAgreements.map(agreement => {
    if (agreement.status === 'Activo') {
      const newMonths = agreement.monthsWithBank + 1;
      let isRenewed = agreement.isAutoRenewed;
      let bonusPct = agreement.loyaltyBonusPct;

      // Cumplimiento de 6 meses -> Renovación automática
      if (newMonths >= 6 && !isRenewed) {
        isRenewed = true;
        bonusPct = 5;
        autoRenewedCompanyName = agreement.companyName;
      }

      payrollFeeIncome += agreement.employeeCount * agreement.feePerEmployee;
      return {
        ...agreement,
        monthsWithBank: newMonths,
        isAutoRenewed: isRenewed,
        loyaltyBonusPct: bonusPct
      };
    }
    return agreement;
  });

  // Cada 3 meses aparece una nueva empresa hondureña interesada en planilla
  if (nextMonth % 3 === 0) {
    const candidateName = HN_COMPANIES[Math.floor(Math.random() * HN_COMPANIES.length)];
    if (!updatedPayrollAgreements.some(a => a.companyName === candidateName)) {
      const empCount = Math.floor(220 + Math.random() * 800);
      updatedPayrollAgreements.push({
        id: `pay-prospect-${nextMonth}`,
        companyName: candidateName,
        industry: 'Sector Agroindustrial y Logística',
        employeeCount: empCount,
        monthlyPayrollVolume: empCount * 18500,
        feePerEmployee: 18,
        averageSalary: 18500,
        eligiblePayrollLoansCount: Math.round(empCount * 0.25),
        status: 'En Negociación',
        monthsWithBank: 0,
        isAutoRenewed: false,
        loyaltyBonusPct: 0,
        linkedDivision: 'corporativa',
        bankAccountBalanceHNL: 4500000,
        accountNumber: `CTA-CORP-0501-${Math.floor(1000 + Math.random() * 9000)}-01`
      });
    }
  }

  // 8. Cámara de Compensación Electrónica (CCE / ACH)
  const achTransfers = state.clearingHouse.achOutgoingTransfers + Math.round((Math.random() * 4000 - 2000));
  const achFeeIncome = achTransfers * state.clearingHouse.achFeePerTransfer;
  const updatedClearing: typeof state.clearingHouse = {
    ...state.clearingHouse,
    achOutgoingTransfers: achTransfers,
    achIncomingTransfers: achTransfers + Math.round((Math.random() * 3000 - 1500)),
    clearingFeeIncome: achFeeIncome,
    achNetClearingPosition: Math.round(1500000 + (Math.random() * 1000000 - 500000))
  };

  // 9. Remesas Familiares
  let totalRemittancesHNL = 0;
  state.remittanceChannels.forEach(channel => {
    totalRemittancesHNL += channel.remittancesCount * (channel.feePerRemittanceUSD * newExchangeRate * 0.35);
  });

  // 10. SWIFT y Red Internacional Ampliada (8 Corresponsales Globales)
  const swiftCorrespondents = [
    { bank: 'JPMorgan Chase (Nueva York)', country: 'Estados Unidos', curr: 'USD' as const },
    { bank: 'Citibank (Nueva York)', country: 'Estados Unidos', curr: 'USD' as const },
    { bank: 'UBS (Zúrich)', country: 'Suiza', curr: 'CHF' as const },
    { bank: 'Santander (Madrid)', country: 'España / Zona Euro', curr: 'EUR' as const },
    { bank: 'Barclays Bank (Londres)', country: 'Reino Unido', curr: 'GBP' as const },
    { bank: 'ICBC (Shanghái)', country: 'China', curr: 'USD' as const },
    { bank: 'Deutsche Bank (Fráncfort)', country: 'Alemania / Zona Euro', curr: 'EUR' as const },
    { bank: 'Mizuho Bank (Tokio)', country: 'Japón', curr: 'USD' as const }
  ];
  const swiftPurposes = [
    'Exportación de Café Especial (Marcala / Copán)',
    'Importación de Maquinaria Agroindustrial',
    'Pago de Fletes y Logística Marítima (Puerto Cortés)',
    'Compra de Turbinas de Energía Renovable',
    'Insumos Médicos Hospitalarios (Europa)',
    'Materia Prima Textil e Hilos (Asia)'
  ];
  const randomCorr = swiftCorrespondents[Math.floor(Math.random() * swiftCorrespondents.length)];
  const updatedSwiftTransactions: SwiftTransaction[] = [
    {
      id: `SW-${nextMonth}-${Math.floor(1000 + Math.random() * 9000)}`,
      direction: Math.random() > 0.45 ? 'Entrante' : 'Saliente',
      counterpartyBank: randomCorr.bank,
      counterpartyCountry: randomCorr.country,
      currency: randomCorr.curr,
      amountFX: Math.floor(120000 + Math.random() * 380000),
      clientName: HN_COMPANIES[Math.floor(Math.random() * HN_COMPANIES.length)],
      purpose: swiftPurposes[Math.floor(Math.random() * swiftPurposes.length)],
      feeUSD: 55,
      settlementStatus: 'Liquidado',
      complianceCheck: 'Aprobado OFAC/BCH'
    },
    ...(state.swiftTransactions || []).slice(0, 5)
  ];
  const swiftFeeIncomeHNL = updatedSwiftTransactions.length * (55 * newExchangeRate);

  // 11. Tesorería y Títulos BCH
  let treasuryIncome = 0;
  const updatedTreasury = state.treasuryHoldings.map(asset => {
    const monthlyYield = (asset.currentYieldAnnual / 100 + treasuryBoost) / 12;
    treasuryIncome += asset.principalHNL * monthlyYield;
    return {
      ...asset,
      maturityMonthsRemaining: Math.max(1, asset.maturityMonthsRemaining - 1)
    };
  });

  // 12. Mercado Secundario de Valores y Acciones Hondureñas (Mercado dinámico y fluctuante)
  let securitiesIncomeMonthly = 0;
  let totalSecuritiesPortfolioHNL = 0;
  const updatedSecurities: SecondaryMarketSecurity[] = (state.secondarySecurities || []).map(sec => {
    let newPrice = sec.pricePerUnitHNL;
    if (sec.unitType === 'Acción') {
      const change = 1 + (Math.random() * 0.05 - 0.024);
      newPrice = Math.max(10, Math.round(sec.pricePerUnitHNL * change));
    } else {
      const change = 1 + (Math.random() * 0.018 - 0.008);
      newPrice = Math.max(1000, Math.round(sec.pricePerUnitHNL * change));
    }

    const priceHist = sec.priceHistory && sec.priceHistory.length > 0 ? sec.priceHistory : [sec.pricePerUnitHNL];
    const newPriceHistory = [...priceHist.slice(-8), newPrice];
    const priceChangePct = +(((newPrice - sec.pricePerUnitHNL) / sec.pricePerUnitHNL) * 100).toFixed(2);

    if (sec.ownedUnits > 0) {
      const invested = sec.ownedUnits * newPrice;
      totalSecuritiesPortfolioHNL += invested;
      const monthlyReturn = invested * (sec.annualYieldOrDividendPct / 100 / 12);
      securitiesIncomeMonthly += monthlyReturn;
    }

    return {
      ...sec,
      pricePerUnitHNL: newPrice,
      totalInvestedHNL: sec.ownedUnits * newPrice,
      priceHistory: newPriceHistory,
      priceChangeMonthPct: priceChangePct
    };
  });

  // 13. Gastos Operativos (OPEX)
  let staffExpense = 0;
  state.staff.forEach(s => {
    staffExpense += s.count * s.monthlySalaryPerPerson;
  });
  state.board.forEach(b => {
    staffExpense += (b.annualBonusHNL / 12);
  });

  let branchesExpense = 0;
  state.branches.forEach(b => {
    if (b.isOpen) branchesExpense += b.monthlyOpex;
  });

  const techMarketingExpense = (state.digitalTechLevel * 280000) + 
    (state.marketingAggressiveness === 'Ultra Agresiva (Robo de Cartera)' ? 850000 : 
     state.marketingAggressiveness === 'Agresiva (Guerra de Tasas)' ? 500000 : 250000);

  const totalOpex = staffExpense + branchesExpense + techMarketingExpense;

  // 14. Provisiones Crediticias (Norma CNBS)
  const averageMora = (updatedDivisions.personas.delinquencyRate + updatedDivisions.pyme.delinquencyRate) / 2;
  const pastDuePortfolio = totalNewLoans * (averageMora / 100);
  const provisionExpense = Math.round(pastDuePortfolio * 0.035);

  // 15. Resultado del Mes
  const totalFinancialIncome = Math.round(totalInterestIncomeLoans + treasuryIncome + securitiesIncomeMonthly);
  const totalFinancialExpense = Math.round(totalInterestExpenseDeposits);
  const netInterestMargin = totalFinancialIncome - totalFinancialExpense;

  const totalFeeIncome = Math.round(
    achFeeIncome + 
    payrollFeeIncome + 
    swiftFeeIncomeHNL + 
    totalRemittancesHNL + 
    totalCardsPOSFees + 
    posAcquiringFeeIncome + 
    pensionFeeIncome
  );

  const incomeBeforeTax = netInterestMargin + totalFeeIncome - totalOpex - provisionExpense;
  const taxISR = incomeBeforeTax > 0 ? Math.round(incomeBeforeTax * 0.25) : 0;
  const netIncome = incomeBeforeTax - taxISR;

  // 16. Actualización de Balance General y Ratios CNBS
  const requiredReserves = Math.round(totalNewDeposits * (state.bch.reserveRequirementPct / 100));
  let cashAndBCH = state.financials.cashAndBCHReserves + netIncome + (totalNewDeposits - state.financials.depositsPublicTotal) - (totalNewLoans - state.financials.loanPortfolioCurrent) + Math.round(securitiesIncomeMonthly);
  
  let interbankBCHBorrowing = 0;
  if (cashAndBCH < requiredReserves) {
    interbankBCHBorrowing = requiredReserves - cashAndBCH + 15000000;
    cashAndBCH += interbankBCHBorrowing;
  }

  const currentCapital = state.financials.capitalStock;
  const newRetained = state.financials.retainedEarnings + Math.max(0, netIncome);
  const totalEquity = currentCapital + newRetained;

  const fixedAssets = state.branches.filter(b => b.isOpen).length * 36000000;
  const totalAssets = cashAndBCH + totalNewLoans - provisionExpense + state.financials.treasuryBondsBCH + totalSecuritiesPortfolioHNL + state.financials.fxReservesUSDValueInHNL + fixedAssets;

  const riskWeightedAssets = (totalNewLoans * 0.95) + (state.financials.treasuryBondsBCH * 0.1) + (totalSecuritiesPortfolioHNL * 0.2) + (fixedAssets * 1.0);
  const newCAR = +((totalEquity / riskWeightedAssets) * 100).toFixed(2);
  const newLCR = +((cashAndBCH / (totalNewDeposits * 0.15)) * 100).toFixed(1);
  const newNPL = +((pastDuePortfolio / totalNewLoans) * 100).toFixed(2);
  const roeAnnualized = +(((netIncome * 12) / totalEquity) * 100).toFixed(1);

  const updatedFinancials: BankFinancialStatements = {
    cashAndBCHReserves: cashAndBCH,
    requiredReserveAmount: requiredReserves,
    loanPortfolioCurrent: totalNewLoans - Math.round(pastDuePortfolio),
    loanPortfolioPastDue: Math.round(pastDuePortfolio),
    loanLossProvisions: state.financials.loanLossProvisions + provisionExpense,
    treasuryBondsBCH: state.financials.treasuryBondsBCH,
    secondarySecuritiesValueHNL: totalSecuritiesPortfolioHNL,
    fxReservesUSDValueInHNL: Math.round(state.financials.fxReservesUSDValueInHNL * (newExchangeRate / state.bch.exchangeRateHNLtoUSD)),
    fixedAssetsBranches: fixedAssets,
    totalAssets: totalAssets,

    depositsPublicTotal: totalNewDeposits,
    interbankBorrowingBCH: interbankBCHBorrowing,
    otherLiabilities: state.financials.otherLiabilities,
    totalLiabilities: totalNewDeposits + interbankBCHBorrowing + state.financials.otherLiabilities,

    capitalStock: currentCapital,
    retainedEarnings: newRetained,
    currentMonthProfit: netIncome,
    totalEquity: totalEquity,

    capitalAdequacyRatioCAR: newCAR,
    liquidityCoverageRatioLCR: newLCR,
    delinquencyRatioNPL: newNPL,
    returnOnEquityROE: roeAnnualized,

    interestIncomeLoans: Math.round(totalInterestIncomeLoans),
    interestIncomeTreasury: Math.round(treasuryIncome),
    interestIncomeSecurities: Math.round(securitiesIncomeMonthly),
    totalFinancialIncome: totalFinancialIncome,

    interestExpenseDeposits: Math.round(totalInterestExpenseDeposits),
    interestExpenseInterbank: interbankBCHBorrowing > 0 ? Math.round(interbankBCHBorrowing * ((newTPM + 4) / 100 / 12)) : 0,
    totalFinancialExpense: totalFinancialExpense,

    netInterestMargin: netInterestMargin,

    feeIncomeClearingACH: Math.round(achFeeIncome),
    feeIncomePayrollServices: Math.round(payrollFeeIncome),
    feeIncomeSwiftAndFX: Math.round(swiftFeeIncomeHNL),
    feeIncomeRemittances: Math.round(totalRemittancesHNL),
    feeIncomeCardsAndPOS: Math.round(totalCardsPOSFees + posAcquiringFeeIncome),
    feeIncomePensionFunds: Math.round(pensionFeeIncome),
    totalFeeIncome: totalFeeIncome,

    staffSalariesExpense: Math.round(staffExpense),
    branchesOpexExpense: Math.round(branchesExpense),
    technologyAndMarketingExpense: Math.round(techMarketingExpense),
    totalOperatingExpense: Math.round(totalOpex),

    creditProvisionExpense: provisionExpense,
    incomeBeforeTax: Math.round(incomeBeforeTax),
    incomeTaxISR: taxISR,
    netIncome: Math.round(netIncome)
  };

  const updatedCompetitors = state.competitors.map(c => {
    let delta = 0;
    if (state.marketingAggressiveness === 'Ultra Agresiva (Robo de Cartera)') {
      delta = -0.15;
    } else if (state.marketingAggressiveness === 'Agresiva (Guerra de Tasas)') {
      delta = -0.08;
    }
    return {
      ...c,
      marketShare: +(Math.max(8.0, c.marketShare + delta)).toFixed(2)
    };
  });

  const newApplications: CreditApplication[] = generateMonthlyApplications(nextMonth);

  const notifs: GameEventNotification[] = [...upgradeNotifs];
  if (autoRenewedCompanyName) {
    notifs.push({
      id: `notif-renew-${nextMonth}-${Date.now()}`,
      month: nextMonth,
      year: currentYear,
      type: 'corporate_deal',
      title: `Renovación Automática de Planilla: ${autoRenewedCompanyName}`,
      message: `La empresa cumplió 6 meses operando su nómina con Áureo Bank. El convenio se renovó automáticamente con un bono de permanencia del 5%.`,
      impactSummary: 'Fidelización empresarial consolidada.'
    });
  }

  notifs.push({
    id: `notif-${nextMonth}-${Date.now()}`,
    month: nextMonth,
    year: currentYear,
    type: 'bch_policy',
    title: bulletinTitle,
    message: bulletinText,
    impactSummary: `Utilidad neta: ${formatHNL(netIncome)} · CAR CNBS: ${newCAR}%`
  });

  // Generación de Alertas Dinámicas Mensuales
  const updatedAlerts: DynamicAlert[] = [
    ...(cashAndBCH < requiredReserves ? [{
      id: `alert-encaje-${nextMonth}`,
      severity: 'critica' as const,
      category: 'liquidez' as const,
      title: 'Déficit de Encaje Legal ante BCH',
      message: `Las reservas en caja cayeron por debajo del encaje mínimo exigido de ${formatHNL(requiredReserves)}. Se activó préstamo interbancario de liquidez.`,
      timestampMonth: nextMonth,
      targetTab: 'overview',
      isRead: false
    }] : []),
    ...(newApplications.some(a => a.requestedAmount > 20000000) ? [{
      id: `alert-corp-credit-${nextMonth}`,
      severity: 'informativa' as const,
      category: 'credito' as const,
      title: 'Crédito Mayor a L. 20M en Bandeja Ejecutiva',
      message: 'Una empresa corporativa ha solicitado financiamiento superior a 20 millones. Requiere dictamen del Comité y Presidencia.',
      timestampMonth: nextMonth,
      targetTab: 'origination',
      isRead: false
    }] : []),
    {
      id: `alert-mora-${nextMonth}`,
      severity: pastDuePortfolio > 40000000 ? 'advertencia' as const : 'informativa' as const,
      category: 'credito' as const,
      title: `Cartera en Mora CNBS: ${formatHNL(pastDuePortfolio)}`,
      message: `El índice de morosidad se ubica en ${newNPL}%. Puedes negociar quitas con deudores o vender carteras a competidores.`,
      timestampMonth: nextMonth,
      targetTab: 'credit_risk',
      isRead: false
    },
    ...(state.dynamicAlerts || []).slice(0, 4)
  ];

  // Generación de Opiniones de Expertos Mensuales
  const updatedExpertOpinions: ExpertOpinion[] = [
    {
      id: `exp-${nextMonth}-1`,
      author: 'Dr. Hugo Noé Pino',
      role: 'Ex-Presidente del BCH y Doctor en Economía',
      organization: 'Colegio Hondureño de Economistas (CHE)',
      headline: `Evaluación Macroeconómica - Mes ${nextMonth} (${fullLabel})`,
      summary: `Con la inflación en ${newInflation}% y la TPM en ${newTPM}%, la política monetaria hondureña busca equilibrar el crédito productivo. El banco debe mantener disciplina en sus tasas pasivas.`,
      sentiment: newInflation > 5.2 ? 'Alerta de Riesgo' : 'Favorable / Crecimiento',
      recommendedAction: 'Supervisar el costo de depósitos a plazo fijo y el encaje legal en el BCH.',
      month: nextMonth
    },
    {
      id: `exp-${nextMonth}-2`,
      author: 'Lic. José Luis Moncada',
      role: 'Ex-Comisionado Presidente de la CNBS',
      organization: 'Consultoría Financiera Internacional',
      headline: `Supervisión Bancaria y Provisiones Anticíclicas`,
      summary: `El coeficiente CAR de Áureo Bank se ubica en ${newCAR}%. Cumple holgadamente con el 10.0% regulatorio. Se recomienda seguir saneando la cartera vencida para no inmovilizar capital.`,
      sentiment: newCAR >= 12.0 ? 'Favorable / Crecimiento' : 'Neutral Cauteloso',
      recommendedAction: 'Mantener la renegociación de deudas en mora (Categorías I a V) o subastarlas en el mercado interbancario.',
      month: nextMonth
    },
    ...(state.expertOpinions || []).slice(0, 2)
  ];

  // Actualización de Módulos de Innovación
  const updatedInnovations: TenInnovationsState = {
    ...(state.innovations || {
      fxDesk: { openPositionUSD: 7450000, bchAuctionBiddedUSD: 2500000, bchAuctionWonUSD: 2000000, fxSpreadIncomeMonthly: 850000 },
      cnbsAudits: { lastAuditResult: 'Favorable', complianceRating: 94, requiredProvisionCorrection: 0, isAuditedThisPeriod: false },
      interbankCallMoney: { lentAmountHNL: 0, borrowedAmountHNL: 0, callRatePct: 6.25 },
      internationalRating: { agency: 'Fitch Ratings', currentRating: 'AAA (hnd)', outlook: 'Estable', fundingCostDiscountPct: 0.40 },
      debtWorkouts: { totalRestructuredAmountHNL: 0, totalSoldToRivalsAmountHNL: 0, recoveredCapitalHNL: 0 },
      digitalBanking: { appUsersCount: 42500, mobileAdoptionPct: 68.5, costSavingsMonthlyHNL: 420000 },
      remittanceAlliances: { directDepositBonusPct: 2.0, monthlyCapturedRemittanceDepositsHNL: 18500000 },
      stressTesting: { lastScenarioRun: 'Línea Base', simulatedCAR: 14.8, simulatedLCR: 130.0, capitalGapHNL: 0 },
      syndicatedMegaLoans: { participatedProjectsCount: 1, activeSyndicatedExposureHNL: 25000000 },
      distressedAssetAuctions: { activeAuctionsCount: 2, acquiredBranchesCount: 0 }
    }),
    digitalBanking: {
      appUsersCount: (state.innovations?.digitalBanking?.appUsersCount || 42500) + Math.floor(450 + Math.random() * 300),
      mobileAdoptionPct: +Math.min(92, (state.innovations?.digitalBanking?.mobileAdoptionPct || 68.5) + 0.4).toFixed(1),
      costSavingsMonthlyHNL: (state.innovations?.digitalBanking?.costSavingsMonthlyHNL || 420000) + 15000
    },
    fxDesk: {
      ...(state.innovations?.fxDesk || { openPositionUSD: 7450000, bchAuctionBiddedUSD: 2500000, bchAuctionWonUSD: 2000000, fxSpreadIncomeMonthly: 850000 }),
      fxSpreadIncomeMonthly: Math.round(750000 + Math.random() * 300000)
    }
  };

  // 13. Mesa de Dinero BCH, Encaje Legal y Forwards Cambiarios
  const requiredReserveHNL = Math.round(totalNewDeposits * (state.bch.reserveRequirementPct / 100));
  const previousBchCash = state.bchMoneyDesk?.cashInBchCurrentAccountHNL || 345000000;
  const depositDelta = totalNewDeposits - (state.financials.depositsPublicTotal || 2340000000);
  const updatedBchCash = Math.max(0, Math.round(previousBchCash + depositDelta * 0.15 + (Math.random() * 4000000 - 2000000)));

  const reserveSurplusOrDeficit = updatedBchCash - requiredReserveHNL;
  const isReserveCompliant = reserveSurplusOrDeficit >= 0;
  let bchPenaltyIncurred = 0;
  let emergencyRepoActive = false;

  if (!isReserveCompliant) {
    emergencyRepoActive = true;
    bchPenaltyIncurred = Math.round(Math.abs(reserveSurplusOrDeficit) * 0.0075);
  }

  // Curva de Rendimientos Soberana BCH
  const updatedYieldCurve: YieldCurvePoint[] = (state.bchMoneyDesk?.yieldCurve || [
    { termLabel: '7 días', termDays: 7, bchYieldPct: 5.75, previousYieldPct: 5.75, trend: 'estable' },
    { termLabel: '28 días', termDays: 28, bchYieldPct: 5.95, previousYieldPct: 5.90, trend: 'alza' },
    { termLabel: '91 días', termDays: 91, bchYieldPct: 6.30, previousYieldPct: 6.25, trend: 'alza' },
    { termLabel: '182 días', termDays: 182, bchYieldPct: 6.85, previousYieldPct: 6.80, trend: 'alza' },
    { termLabel: '364 días', termDays: 364, bchYieldPct: 7.45, previousYieldPct: 7.40, trend: 'alza' }
  ]).map(p => {
    const oldYield = p.bchYieldPct;
    const newYield = +(p.bchYieldPct + tpmDelta * 0.9 + (Math.random() * 0.04 - 0.02)).toFixed(2);
    return {
      ...p,
      bchYieldPct: newYield,
      previousYieldPct: oldYield,
      trend: newYield > oldYield ? 'alza' as const : (newYield < oldYield ? 'baja' as const : 'estable' as const)
    };
  });

  // Repos activos y contratos forward
  const updatedActiveRepos: BchRepoOperation[] = (state.bchMoneyDesk?.activeRepos || []).map(r => ({
    ...r,
    monthsRemaining: Math.max(0, r.monthsRemaining - 1),
    status: r.monthsRemaining <= 1 ? 'liquidado' as const : 'activo' as const
  }));

  const updatedFxForwards: FxForwardContract[] = (state.fxForwards || []).map(f => ({
    ...f,
    monthsRemaining: Math.max(0, f.monthsRemaining - 1),
    status: f.monthsRemaining <= 1 ? 'liquidado' as const : 'activo' as const
  }));

  const updatedBchMoneyDesk: BchMoneyDeskState = {
    cashInBchCurrentAccountHNL: updatedBchCash,
    requiredReserveHNL,
    reserveSurplusOrDeficitHNL: reserveSurplusOrDeficit,
    isCompliant: isReserveCompliant,
    emergencyRepoActive,
    activeRepos: updatedActiveRepos,
    yieldCurve: updatedYieldCurve,
    dailyInterbankCallOffers: state.bchMoneyDesk?.dailyInterbankCallOffers || []
  };

  const monthlyClosingSummary: MonthlyClosingSummary = {
    month: nextMonth,
    year: currentYear,
    monthLabel: fullLabel,
    loansProcessedCount,
    loansFullyPaidCount,
    loansPartialOrOverdueCount,
    totalAmortizationCollectedHNL,
    totalInterestCollectedHNL,
    delinquentClientsNotices,
    tpmOldPct: state.bch.tpmRate,
    tpmNewPct: newTPM,
    tpmDeltaPct: tpmDelta,
    indexedDivisionsSummary,
    limitsIncreasedCount,
    limitsReducedCount,
    totalLimitExpansionHNL,
    totalDepositInterestCapitalizedHNL,
    requiredReserveHNL,
    actualReserveHNL: updatedBchCash,
    reserveSurplusOrDeficitHNL: reserveSurplusOrDeficit,
    isReserveCompliant,
    bchPenaltyIncurredHNL: bchPenaltyIncurred,
    carPct: newCAR,
    lcrPct: newLCR,
    nsfrPct: 118.5
  };

  // 14. Suite de 20 Características, Programas e Innovaciones Bancarias
  const { updatedPrograms: newBankingPrograms20 } = advanceBankingPrograms20(state, nextMonth, tpmDelta, newExchangeRate);

  // 15. Centro de Operaciones Avanzadas (24 Características en 4 Ejes Estratégicos)
  const { updatedOperations: newAdvancedOperations } = advanceAdvancedOperationsMonth(state, nextMonth, tpmDelta, newExchangeRate);

  // 16. Hub Estratégico de 24 Mejoras Institucionales (3 Pilares, ROI y Desbloqueos)
  const { updatedImprovements: newStrategicImprovements } = advanceStrategicImprovementsMonth(state, nextMonth, totalAssets, newCAR, newNPL);

  // 17. Centro Global de Prevención de Fraudes, Lavado de Dinero (AML/CFT) y Alertas Heurísticas
  const newAmlCompliance = advanceAmlComplianceMonth(state, nextMonth);

  // 18. Motor de Dilemas Ejecutivos, Éticos y Crisis de Junta Directiva
  const newExecutiveDilemmas = advanceExecutiveDilemmasMonth(state, nextMonth);

  return {
    ...state,
    gameMonth: nextMonth,
    bch: {
      ...state.bch,
      month: nextMonth,
      year: currentYear,
      interannualInflation: newInflation,
      tpmRate: newTPM,
      exchangeRateHNLtoUSD: newExchangeRate,
      economicSentiment: sentiment,
      lastBulletinTitle: bulletinTitle,
      lastBulletinText: bulletinText
    },
    financials: updatedFinancials,
    divisions: updatedDivisions,
    clients: updatedClients,
    posMerchants: updatedMerchants,
    pensionFunds: updatedPensionFunds,
    payrollAgreements: updatedPayrollAgreements,
    clearingHouse: updatedClearing,
    swiftTransactions: updatedSwiftTransactions,
    treasuryHoldings: updatedTreasury,
    secondarySecurities: updatedSecurities,
    competitors: updatedCompetitors,
    pendingApplications: [...newApplications, ...state.pendingApplications.slice(0, 3)],
    notifications: [...notifs, ...state.notifications.slice(0, 8)],
    historyMonthlyProfits: [
      ...state.historyMonthlyProfits,
      {
        monthLabel: fullLabel,
        profit: netIncome,
        assets: totalAssets,
        car: newCAR
      }
    ].slice(-12),
    // Reiniciar aprobaciones del mes para asesores de crédito
    advisorApprovalsUsedThisMonth: 0,
    interbankOffers: state.interbankOffers || [],
    dynamicAlerts: updatedAlerts,
    expertOpinions: updatedExpertOpinions,
    innovations: updatedInnovations,
    bchMoneyDesk: updatedBchMoneyDesk,
    fxForwards: updatedFxForwards,
    lastMonthlyClosingSummary: monthlyClosingSummary,
    bankingPrograms20: newBankingPrograms20,
    advancedOperations: newAdvancedOperations,
    strategicImprovements: newStrategicImprovements,
    amlCompliance: newAmlCompliance,
    executiveDilemmas: newExecutiveDilemmas
  };
}

/**
 * Genera nuevas solicitudes crediticias realistas para la bandeja de originación
 */
export function generateMonthlyApplications(month: number): CreditApplication[] {
  const products: CreditApplication['productType'][] = [
    'Préstamo Personal',
    'Capital de Trabajo PYME',
    'Préstamo de Vivienda',
    'Deducción por Planilla',
    'Línea Revolvente PYME',
    'Factoring Comercial',
    'Préstamo Sindicado Corp'
  ];

  const divisionMap: Record<CreditApplication['productType'], BankingDivisionId> = {
    'Préstamo Personal': 'personas',
    'Préstamo de Vivienda': 'premier',
    'Préstamo Vehículo': 'personas',
    'Capital de Trabajo PYME': 'pyme',
    'Línea Revolvente PYME': 'pyme',
    'Deducción por Planilla': 'personas',
    'Préstamo Sindicado Corp': 'corporativa',
    'Factoring Comercial': 'corporativa'
  };

  return [0, 1, 2, 3].map((_, idx) => {
    const isCompany = Math.random() > 0.55;
    const name = isCompany 
      ? HN_COMPANIES[Math.floor(Math.random() * HN_COMPANIES.length)]
      : `${HN_FIRST_NAMES[Math.floor(Math.random() * HN_FIRST_NAMES.length)]} ${HN_LAST_NAMES[Math.floor(Math.random() * HN_LAST_NAMES.length)]}`;
    
    const prod = products[Math.floor(Math.random() * products.length)];
    const division = divisionMap[prod] || 'personas';
    const city = HN_CITIES[Math.floor(Math.random() * HN_CITIES.length)];

    let amount = 85000;
    let income = 22000;
    let rate = 22.0;
    let term = 36;
    let score = Math.floor(580 + Math.random() * 320);

    if (prod === 'Préstamo de Vivienda') {
      amount = Math.floor(1800000 + Math.random() * 2000000);
      income = Math.floor(85000 + Math.random() * 65000);
      rate = 11.5;
      term = 180;
    } else if (prod === 'Capital de Trabajo PYME') {
      amount = Math.floor(400000 + Math.random() * 1200000);
      income = Math.floor(180000 + Math.random() * 250000);
      rate = 18.5;
      term = 24;
    } else if (prod === 'Préstamo Sindicado Corp' || prod === 'Factoring Comercial') {
      amount = Math.floor(12000000 + Math.random() * 25000000);
      income = Math.floor(4500000 + Math.random() * 8000000);
      rate = 13.0;
      term = 48;
      score = Math.floor(820 + Math.random() * 120);
    } else if (prod === 'Deducción por Planilla') {
      amount = Math.floor(45000 + Math.random() * 90000);
      income = Math.floor(16000 + Math.random() * 18000);
      rate = 19.5;
      term = 36;
      score = Math.floor(640 + Math.random() * 220);
    }

    const monthlyPmt = (amount * (rate / 100 / 12)) / (1 - Math.pow(1 + (rate / 100 / 12), -term));
    const obligations = Math.floor(income * (0.15 + Math.random() * 0.25));
    const dti = +(((monthlyPmt + obligations) / income) * 100).toFixed(1);

    let cnbsCat: CreditApplication['cnbsCategory'] = 'I - Normal';
    let riskVerdict: CreditApplication['riskVerdict'] = 'Bajo Riesgo';
    let collateral: CreditApplication['collateralType'] = 'Garantía Solidaria';

    if (score < 600 || dti > 55) {
      cnbsCat = 'III - Subnormal';
      riskVerdict = 'Alto Riesgo';
      collateral = 'Sin Garantía';
    } else if (score < 680 || dti > 42) {
      cnbsCat = 'II - Especial';
      riskVerdict = 'Riesgo Moderado';
      collateral = prod.includes('PYME') ? 'Prenda Vehicular' : 'Garantía Solidaria';
    } else {
      cnbsCat = 'I - Normal';
      riskVerdict = 'Bajo Riesgo';
      collateral = prod.includes('Vivienda') ? 'Hipoteca Inmobiliaria' : prod.includes('Planilla') ? 'Retención Salarial' : 'Garantía Solidaria';
    }

    const isOverLimit = amount > 20000000;
    const isOfficerFavorable = score >= 650 && dti <= 45 && cnbsCat === 'I - Normal';

    const officerRecommendation = isOfficerFavorable 
      ? 'Favorable (Aprobación Sugerida)' 
      : score < 580 || dti > 60 
        ? 'Desfavorable (Riesgo Excesivo)' 
        : 'Condicionado a Aval';

    const officerNote = isOverLimit
      ? `NOTA DEL OFICIAL DE CRÉDITO: Solicitud de ${formatHNL(amount)} excede la autonomía técnica de 20 millones de lempiras. Requiere dictamen superior. Calificación en buró: ${score} pts, DTI: ${dti}%, garantía: ${collateral}. Se eleva a decisión directa de Presidencia y Comité Ejecutivo.`
      : isOfficerFavorable
        ? `Oficial de Crédito dictamina viabilidad financiera favorable bajo límite autónomo de 20 millones. Apto para aprobación automática.`
        : `Oficial de Crédito dictamina observación técnica (DTI ${dti}% / Scoring ${score}). Se recomienda aval solidario o rechazo.`;

    return {
      id: `SOL-${month}-${100 + idx}`,
      applicantName: name,
      division,
      productType: prod,
      requestedAmount: amount,
      termMonths: term,
      proposedRate: rate,
      monthlyIncome: income,
      monthlyObligations: obligations,
      calculatedDTI: dti,
      cnbsCategory: cnbsCat,
      equifaxScore: score,
      collateralType: collateral,
      collateralValue: collateral === 'Hipoteca Inmobiliaria' ? Math.round(amount * 1.4) : collateral === 'Sin Garantía' ? 0 : amount,
      location: city,
      riskVerdict,
      reasonText: isCompany 
        ? `Empresa radicada en ${city}. Solicitud para expansión operativa. Buró crediticio con categoría ${cnbsCat}.`
        : `Cliente solicita ${prod} en ${city}. DTI calculado en ${dti}%. Verificado por oficiales de negocios.`,
      officerNote,
      officerRecommendation,
      officerCanAutoApprove: !isOverLimit,
      requiresExecutiveBoardApproval: isOverLimit,
      officerDecisionStatus: isOverLimit ? 'Enviado a Comité' : 'Pendiente'
    };
  });
}

/**
 * Negocia la deuda de un cliente en mora (Categorías I a V)
 */
export function negotiateClientDebt(
  state: GameState,
  clientId: string,
  negotiationType: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago'
): { updatedState: GameState; successMessage: string } {
  const client = state.clients.find(c => c.id === clientId);
  if (!client) return { updatedState: state, successMessage: 'Cliente no encontrado' };

  let cashDelta = 0;
  let successMessage = '';
  const oldPastDue = client.pastDueAmountHNL || 0;

  const updatedClients = state.clients.map(c => {
    if (c.id !== clientId) return c;

    if (negotiationType === 'reestructurar_quitas') {
      const tokenPayment = Math.round(oldPastDue * 0.25);
      cashDelta += tokenPayment;
      successMessage = `Convenio de reestructuración exitoso con ${c.name}. Se condonó el 40% de recargos moratorios, el deudor abonó ${formatHNL(tokenPayment)} y vuelve a Categoría I - Normal con pago garantizado.`;
      return {
        ...c,
        cnbsCategory: 'I - Normal' as const,
        pastDueDays: 0,
        pastDueAmountHNL: 0,
        guaranteedPayment: true,
        loanMonthsRemaining: (c.loanMonthsRemaining || 24) + 12,
        notes: `${c.notes || ''} [Reestructurado en mes ${state.gameMonth}: condonación parcial y reactivación a Cat I]`,
        isRestructured: true
      };
    } else if (negotiationType === 'ampliar_plazo') {
      successMessage = `Ampliación de plazo pactada con ${c.name}. Plazo extendido en 24 meses y cuota reducida un 35%. Se reclasifica a Categoría II - Especial en seguimiento activo.`;
      return {
        ...c,
        cnbsCategory: 'II - Especial' as const,
        pastDueDays: 0,
        pastDueAmountHNL: 0,
        loanMonthsRemaining: (c.loanMonthsRemaining || 12) + 24,
        loanMonthlyPaymentHNL: Math.round(c.loanMonthlyPaymentHNL * 0.65),
        notes: `${c.notes || ''} [Ampliación de plazo pactada en mes ${state.gameMonth}]`,
        isRestructured: true
      };
    } else {
      const recoveryAmount = Math.round((c.loanBalanceHNL || oldPastDue) * 0.75);
      cashDelta += recoveryAmount;
      successMessage = `Dación en pago completada con ${c.name}. Se adjudicó la garantía recuperando ${formatHNL(recoveryAmount)} de capital de inmediato.`;
      return {
        ...c,
        hasLoan: false,
        loanBalanceHNL: 0,
        loanPrincipalHNL: 0,
        loanMonthlyPaymentHNL: 0,
        loanMonthsRemaining: 0,
        pastDueDays: 0,
        pastDueAmountHNL: 0,
        cnbsCategory: 'I - Normal' as const,
        notes: `${c.notes || ''} [Finiquitado por dación en pago en mes ${state.gameMonth}]`
      };
    }
  });

  const updatedFinancials = {
    ...state.financials,
    cashAndBCHReserves: state.financials.cashAndBCHReserves + cashDelta,
    loanPortfolioPastDue: Math.max(0, state.financials.loanPortfolioPastDue - oldPastDue),
    loanLossProvisions: Math.max(0, state.financials.loanLossProvisions - Math.round(oldPastDue * 0.3))
  };

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      financials: updatedFinancials,
      innovations: {
        ...state.innovations,
        debtWorkouts: {
          ...state.innovations.debtWorkouts,
          totalRestructuredAmountHNL: state.innovations.debtWorkouts.totalRestructuredAmountHNL + oldPastDue,
          recoveredCapitalHNL: state.innovations.debtWorkouts.recoveredCapitalHNL + cashDelta
        }
      }
    },
    successMessage
  };
}

/**
 * Vende la cartera en mora de un cliente a un banco competidor
 */
export function sellClientDebtToCompetitor(
  state: GameState,
  clientId: string,
  buyerBankId: CompetitorId
): { updatedState: GameState; successMessage: string } {
  const client = state.clients.find(c => c.id === clientId);
  const buyer = state.competitors.find(b => b.id === buyerBankId) || state.competitors[0];
  if (!client) return { updatedState: state, successMessage: 'Cliente no encontrado' };

  const discounts: Record<string, number> = {
    'I - Normal': 0.05,
    'II - Especial': 0.12,
    'III - Subnormal': 0.25,
    'IV - Dudoso Recaudo': 0.45,
    'V - Pérdida': 0.70
  };
  const discountRate = discounts[client.cnbsCategory] || 0.35;
  const debtAmount = client.pastDueAmountHNL > 0 ? client.pastDueAmountHNL : client.loanBalanceHNL;
  const cashProceeds = Math.round(debtAmount * (1 - discountRate));

  const updatedClients = state.clients.map(c => {
    if (c.id !== clientId) return c;
    return {
      ...c,
      isSoldToRival: true,
      soldToBankName: buyer.name,
      hasLoan: false,
      loanBalanceHNL: 0,
      pastDueAmountHNL: 0,
      pastDueDays: 0,
      notes: `${c.notes || ''} [Cartera cedida y vendida a ${buyer.name} con descuento del ${(discountRate * 100).toFixed(0)}%]`
    };
  });

  const updatedFinancials = {
    ...state.financials,
    cashAndBCHReserves: state.financials.cashAndBCHReserves + cashProceeds,
    loanPortfolioPastDue: Math.max(0, state.financials.loanPortfolioPastDue - debtAmount),
    loanLossProvisions: Math.max(0, state.financials.loanLossProvisions - Math.round(debtAmount * discountRate))
  };

  const successMessage = `Venta de cartera perfeccionada. Se transfirió el crédito de ${client.name} (${client.cnbsCategory}) a ${buyer.name}. Áureo Bank recibió ${formatHNL(cashProceeds)} de liquidez inmediata en caja.`;

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      financials: updatedFinancials,
      innovations: {
        ...state.innovations,
        debtWorkouts: {
          ...state.innovations.debtWorkouts,
          totalSoldToRivalsAmountHNL: state.innovations.debtWorkouts.totalSoldToRivalsAmountHNL + debtAmount,
          recoveredCapitalHNL: state.innovations.debtWorkouts.recoveredCapitalHNL + cashProceeds
        }
      }
    },
    successMessage
  };
}

/**
 * Compra de cartera en el mercado interbancario a un banco rival
 */
export function buyInterbankPortfolio(
  state: GameState,
  offerId: string
): { updatedState: GameState; successMessage: string } {
  const offer = state.interbankOffers.find(o => o.id === offerId);
  if (!offer || offer.status !== 'disponible') {
    return { updatedState: state, successMessage: 'Oferta no disponible' };
  }

  if (state.financials.cashAndBCHReserves < offer.offerPriceHNL && offer.portfolioType === 'activos_creditos') {
    return { updatedState: state, successMessage: 'Liquidez insuficiente para comprar esta cartera' };
  }

  const updatedFinancials = { ...state.financials };
  let successMsg = '';

  if (offer.portfolioType === 'activos_creditos') {
    updatedFinancials.cashAndBCHReserves -= offer.offerPriceHNL;
    updatedFinancials.loanPortfolioCurrent += offer.faceValueHNL;
    successMsg = `Adquisición exitosa: Se compró la cartera de créditos "${offer.name}" de ${offer.sellerBankName} por ${formatHNL(offer.offerPriceHNL)} (Valor facial: ${formatHNL(offer.faceValueHNL)}). Se incorporan ${offer.clientCount} clientes acreditados a tu balance.`;
  } else {
    updatedFinancials.cashAndBCHReserves += offer.faceValueHNL;
    updatedFinancials.depositsPublicTotal += offer.faceValueHNL;
    successMsg = `Adquisición de pasivos exitosa: Se asumió la cartera de depósitos "${offer.name}" de ${offer.sellerBankName}. Áureo Bank recibe ${formatHNL(offer.faceValueHNL)} en efectivo para sus reservas.`;
  }

  const updatedDivisions = { ...state.divisions };
  updatedDivisions.corporativa = {
    ...updatedDivisions.corporativa,
    clientCount: updatedDivisions.corporativa.clientCount + offer.clientCount,
    totalLoans: updatedDivisions.corporativa.totalLoans + (offer.portfolioType === 'activos_creditos' ? offer.faceValueHNL : 0),
    totalDeposits: updatedDivisions.corporativa.totalDeposits + (offer.portfolioType === 'activos_creditos' ? 0 : offer.faceValueHNL),
  };

  const updatedOffers = state.interbankOffers.map(o => o.id === offerId ? { ...o, status: 'comprado' as const } : o);

  return {
    updatedState: {
      ...state,
      financials: updatedFinancials,
      interbankOffers: updatedOffers,
      divisions: updatedDivisions
    },
    successMessage: successMsg
  };
}

/**
 * Modificar un comercio POS existente
 */
export function updatePosMerchant(
  state: GameState,
  updatedMerchant: PosMerchant
): GameState {
  const old = state.posMerchants.find(m => m.id === updatedMerchant.id);
  if (!old) return state;
  const diffBalance = updatedMerchant.bankAccountBalanceHNL - (old?.bankAccountBalanceHNL || 0);

  const updatedList = state.posMerchants.map(m => m.id === updatedMerchant.id ? updatedMerchant : m);
  const updatedDivisions = { ...state.divisions };
  if (updatedDivisions.pyme) {
    updatedDivisions.pyme = {
      ...updatedDivisions.pyme,
      totalDeposits: Math.max(0, updatedDivisions.pyme.totalDeposits + diffBalance)
    };
  }

  return {
    ...state,
    posMerchants: updatedList,
    divisions: updatedDivisions,
    financials: {
      ...state.financials,
      depositsPublicTotal: Math.max(0, state.financials.depositsPublicTotal + diffBalance),
      cashAndBCHReserves: Math.max(0, state.financials.cashAndBCHReserves + diffBalance)
    }
  };
}

/**
 * Agregar un nuevo comercio a la red POS
 */
export function addPosMerchant(
  state: GameState,
  newMerchant: PosMerchant
): GameState {
  if (state.posMerchants.some(m => m.id === newMerchant.id)) return state;
  const updatedList = [newMerchant, ...state.posMerchants];
  const updatedDivisions = { ...state.divisions };
  if (updatedDivisions.pyme) {
    updatedDivisions.pyme = {
      ...updatedDivisions.pyme,
      totalDeposits: updatedDivisions.pyme.totalDeposits + newMerchant.bankAccountBalanceHNL,
      clientCount: updatedDivisions.pyme.clientCount + 1,
      activeAccountsCount: updatedDivisions.pyme.activeAccountsCount + 1
    };
  }

  return {
    ...state,
    posMerchants: updatedList,
    divisions: updatedDivisions,
    financials: {
      ...state.financials,
      depositsPublicTotal: state.financials.depositsPublicTotal + newMerchant.bankAccountBalanceHNL,
      cashAndBCHReserves: state.financials.cashAndBCHReserves + newMerchant.bankAccountBalanceHNL
    }
  };
}

/**
 * Modificar un convenio de planilla existente
 */
export function updatePayrollAgreement(
  state: GameState,
  updatedAgreement: CorporatePayrollAgreement
): GameState {
  const old = state.payrollAgreements.find(p => p.id === updatedAgreement.id);
  if (!old) return state;
  const diffBalance = updatedAgreement.bankAccountBalanceHNL - (old?.bankAccountBalanceHNL || 0);

  const updatedList = state.payrollAgreements.map(p => p.id === updatedAgreement.id ? updatedAgreement : p);
  const divId = updatedAgreement.linkedDivision || 'corporativa';
  const updatedDivisions = { ...state.divisions };
  if (updatedDivisions[divId]) {
    updatedDivisions[divId] = {
      ...updatedDivisions[divId],
      totalDeposits: Math.max(0, updatedDivisions[divId].totalDeposits + diffBalance)
    };
  }

  return {
    ...state,
    payrollAgreements: updatedList,
    divisions: updatedDivisions,
    financials: {
      ...state.financials,
      depositsPublicTotal: Math.max(0, state.financials.depositsPublicTotal + diffBalance),
      cashAndBCHReserves: Math.max(0, state.financials.cashAndBCHReserves + diffBalance)
    }
  };
}

/**
 * Agregar una nueva empresa con convenio de nómina CEE
 */
export function addPayrollAgreement(
  state: GameState,
  newAgreement: CorporatePayrollAgreement
): GameState {
  if (state.payrollAgreements.some(p => p.id === newAgreement.id)) return state;
  const updatedList = [newAgreement, ...state.payrollAgreements];
  const divId = newAgreement.linkedDivision || 'corporativa';
  const updatedDivisions = { ...state.divisions };
  if (updatedDivisions[divId]) {
    updatedDivisions[divId] = {
      ...updatedDivisions[divId],
      totalDeposits: updatedDivisions[divId].totalDeposits + newAgreement.bankAccountBalanceHNL,
      clientCount: updatedDivisions[divId].clientCount + 1,
      activeAccountsCount: updatedDivisions[divId].activeAccountsCount + newAgreement.employeeCount
    };
  }

  return {
    ...state,
    payrollAgreements: updatedList,
    divisions: updatedDivisions,
    financials: {
      ...state.financials,
      depositsPublicTotal: state.financials.depositsPublicTotal + newAgreement.bankAccountBalanceHNL,
      cashAndBCHReserves: state.financials.cashAndBCHReserves + newAgreement.bankAccountBalanceHNL
    }
  };
}

/**
 * Aprueba una solicitud de crédito por el Oficial de Crédito (Autonomía <= L. 20M)
 */
function creditApprovalError(state: GameState, app: CreditApplication): string | null {
  if (!Number.isFinite(app.requestedAmount) || app.requestedAmount <= 0 || app.termMonths <= 0 || !Number.isFinite(app.proposedRate) || app.proposedRate < 0) return 'Condiciones de crédito inválidas';
  if (state.financials.cashAndBCHReserves < app.requestedAmount) return 'Liquidez insuficiente para desembolsar el crédito';
  const capacity = (state.staff.find(s => s.id === 'oficiales_credito')?.count ?? 0) * state.advisorMonthlyLimitPerAdvisor;
  if ((state.advisorApprovalsUsedThisMonth || 0) >= capacity) return 'Capacidad mensual de aprobación agotada';
  return null;
}

function monthlyPayment(amount: number, annualRate: number, months: number): number {
  const rate = annualRate / 1200;
  return Math.round(rate === 0 ? amount / months : amount * rate / (1 - Math.pow(1 + rate, -months)));
}

export function approveCreditByOfficer(
  state: GameState,
  appId: string
): { updatedState: GameState; successMessage: string } {
  const app = state.pendingApplications.find(a => a.id === appId);
  if (!app) return { updatedState: state, successMessage: 'Solicitud no encontrada' };
  const error = creditApprovalError(state, app);
  if (error) return { updatedState: state, successMessage: error };

  const advisorLimit = state.advisorAutoApprovalThresholdHNL ?? 20000000;
  if (app.requestedAmount > advisorLimit) {
    return { updatedState: state, successMessage: `Esta solicitud excede la autonomía del Oficial de Crédito (${formatHNL(advisorLimit)}). Requiere aprobación del Comité Ejecutivo y Junta Directiva.` };
  }

  const newLoans = state.financials.loanPortfolioCurrent + app.requestedAmount;
  const updatedDivisions = { ...state.divisions };
  if (updatedDivisions[app.division]) {
    updatedDivisions[app.division] = {
      ...updatedDivisions[app.division],
      totalLoans: updatedDivisions[app.division].totalLoans + app.requestedAmount,
      clientCount: updatedDivisions[app.division].clientCount + 1
    };
  }

  const newClient: IndividualClient = {
    id: `CLI-APR-${app.id}`,
    cif: `CIF-0501-2026-${Math.floor(10000 + Math.random() * 89999)}`,
    name: app.applicantName,
    division: app.division,
    city: app.location,
    notes: `Crédito de ${formatHNL(app.requestedAmount)} aprobado por Oficial de Crédito bajo política de autonomía automática.`,
    joinedMonth: state.gameMonth,
    accountType: 'Cuenta de Ahorro Rendimiento',
    accountBalanceHNL: 0,
    hasCreditCard: true,
    creditCardBrand: 'Visa Clásica',
    creditCardLimitHNL: Math.round(app.monthlyIncome * 1.5),
    creditCardBalanceHNL: 0,
    hasLoan: true,
    loanType: app.productType,
    loanPrincipalHNL: app.requestedAmount,
    loanBalanceHNL: app.requestedAmount,
    loanMonthlyPaymentHNL: monthlyPayment(app.requestedAmount, app.proposedRate, app.termMonths),
    loanInterestRateAnnual: app.proposedRate,
    loanMonthsRemaining: app.termMonths,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: app.equifaxScore,
    cnbsCategory: 'I - Normal',
    otherBankProducts: []
  };

  const updatedFinancials = {
    ...state.financials,
    loanPortfolioCurrent: newLoans,
    cashAndBCHReserves: state.financials.cashAndBCHReserves - app.requestedAmount
  };

  const remainingApps = state.pendingApplications.filter(a => a.id !== appId);

  return {
    updatedState: {
      ...state,
      clients: [newClient, ...state.clients],
      financials: updatedFinancials,
      divisions: updatedDivisions,
      advisorApprovalsUsedThisMonth: (state.advisorApprovalsUsedThisMonth || 0) + 1,
      pendingApplications: remainingApps
    },
    successMessage: `¡Crédito de ${formatHNL(app.requestedAmount)} aprobado con éxito por el Oficial de Crédito para ${app.applicantName}!`
  };
}

/**
 * Aprueba una solicitud de crédito por el Presidente Ejecutivo y Comité Superior (>= L. 21M)
 */
export function approveCreditByExecutiveBoard(
  state: GameState,
  appId: string
): { updatedState: GameState; successMessage: string } {
  const app = state.pendingApplications.find(a => a.id === appId);
  if (!app) return { updatedState: state, successMessage: 'Solicitud no encontrada' };
  const error = creditApprovalError(state, app);
  if (error) return { updatedState: state, successMessage: error };

  const newLoans = state.financials.loanPortfolioCurrent + app.requestedAmount;
  const updatedDivisions = { ...state.divisions };
  if (updatedDivisions[app.division]) {
    updatedDivisions[app.division] = {
      ...updatedDivisions[app.division],
      totalLoans: updatedDivisions[app.division].totalLoans + app.requestedAmount,
      clientCount: updatedDivisions[app.division].clientCount + 1
    };
  }

  const newClient: IndividualClient = {
    id: `CLI-CORP-${app.id}`,
    cif: `CIF-CORP-2026-${Math.floor(1000 + Math.random() * 8999)}`,
    name: app.applicantName,
    division: app.division,
    city: app.location,
    notes: `Mega-crédito corporativo de ${formatHNL(app.requestedAmount)} ratificado en pleno por el Presidente Ejecutivo y Comité de Crédito.`,
    joinedMonth: state.gameMonth,
    accountType: 'Cuenta Corriente / Cheques',
    accountBalanceHNL: 0,
    hasCreditCard: true,
    creditCardBrand: 'Mastercard Corporativa',
    creditCardLimitHNL: 1500000,
    creditCardBalanceHNL: 0,
    hasLoan: true,
    loanType: app.productType,
    loanPrincipalHNL: app.requestedAmount,
    loanBalanceHNL: app.requestedAmount,
    loanMonthlyPaymentHNL: monthlyPayment(app.requestedAmount, app.proposedRate, app.termMonths),
    loanInterestRateAnnual: app.proposedRate,
    loanMonthsRemaining: app.termMonths,
    guaranteedPayment: true,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: app.equifaxScore,
    cnbsCategory: 'I - Normal',
    otherBankProducts: []
  };

  const updatedFinancials = {
    ...state.financials,
    loanPortfolioCurrent: newLoans,
    cashAndBCHReserves: state.financials.cashAndBCHReserves - app.requestedAmount
  };

  const remainingApps = state.pendingApplications.filter(a => a.id !== appId);

  return {
    updatedState: {
      ...state,
      clients: [newClient, ...state.clients],
      financials: updatedFinancials,
      divisions: updatedDivisions,
      advisorApprovalsUsedThisMonth: (state.advisorApprovalsUsedThisMonth || 0) + 1,
      pendingApplications: remainingApps
    },
    successMessage: `¡Resolución de Presidencia ratificada! Mega-crédito de ${formatHNL(app.requestedAmount)} otorgado a ${app.applicantName} con garantías registradas.`
  };
}

/**
 * Rechaza una solicitud de crédito
 */
export function rejectCreditApplication(
  state: GameState,
  appId: string
): { updatedState: GameState; successMessage: string } {
  const app = state.pendingApplications.find(a => a.id === appId);
  const remaining = state.pendingApplications.filter(a => a.id !== appId);
  return {
    updatedState: {
      ...state,
      pendingApplications: remaining
    },
    successMessage: `Solicitud de ${app?.applicantName || 'cliente'} rechazada formalmente.`
  };
}

/**
 * Aprueba automáticamente en bloque todas las solicitudes elegibles según la política del Oficial
 */
export function autoApproveAllOfficerEligibleCredits(state: GameState): { updatedState: GameState; count: number; totalApproved: number } {
  const advisorLimit = state.advisorAutoApprovalThresholdHNL ?? 20000000;
  const eligible = state.pendingApplications.filter(a => a.requestedAmount <= advisorLimit && a.cnbsCategory === 'I - Normal' && a.calculatedDTI <= 45);
  let curState = state;
  let totalApproved = 0;
  let count = 0;

  eligible.forEach(app => {
    const res = approveCreditByOfficer(curState, app.id);
    if (res.updatedState !== curState) {
      count++;
      totalApproved += app.requestedAmount;
    }
    curState = res.updatedState;
  });

  return { updatedState: curState, count, totalApproved };
}

/**
 * Ajusta en tiempo real el límite de autonomía de crédito delegado a los Asesores (de L. 5M a L. 50M)
 */
export function setAdvisorCreditLimit(state: GameState, limitHNL: number): GameState {
  const safeLimit = Math.max(5000000, Math.min(50000000, limitHNL));
  const updatedApps = state.pendingApplications.map(app => {
    const isOverLimit = app.requestedAmount > safeLimit;
    return {
      ...app,
      officerCanAutoApprove: !isOverLimit,
      requiresExecutiveBoardApproval: isOverLimit,
      officerDecisionStatus: isOverLimit ? ('Enviado a Comité' as const) : ('Pendiente' as const),
      officerNote: isOverLimit
        ? `NOTA DEL OFICIAL DE CRÉDITO: Solicitud de ${formatHNL(app.requestedAmount)} excede la autonomía técnica actual (${formatHNL(safeLimit)}). Requiere elevación a Junta Directiva.`
        : `Oficial de Crédito facultado bajo autonomía de ${formatHNL(safeLimit)}. Apto para aprobación inmediata.`
    };
  });

  return {
    ...state,
    advisorAutoApprovalThresholdHNL: safeLimit,
    pendingApplications: updatedApps
  };
}

/**
 * Aplica un abono extraordinario a capital sobre un préstamo existente,
 * debitando los fondos de la cuenta del cliente y reduciendo el saldo deudor y la cuota.
 */
export function executeExtraordinaryLoanPrepayment(
  state: GameState,
  clientId: string,
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  const client = state.clients.find(c => c.id === clientId);
  if (!client || !client.hasLoan || client.loanBalanceHNL <= 0) {
    return { updatedState: state, successMessage: 'El cliente no tiene un préstamo activo para amortizar.' };
  }

  if (client.accountBalanceHNL < amountHNL) {
    return { updatedState: state, successMessage: 'Fondos insuficientes en la cuenta del cliente para realizar el abono extraordinario.' };
  }

  const actualAmortization = Math.min(client.loanBalanceHNL, amountHNL);
  const newAccountBalance = client.accountBalanceHNL - actualAmortization;
  const newLoanBalance = Math.max(0, client.loanBalanceHNL - actualAmortization);
  const isFullyPaid = newLoanBalance === 0;

  // Recalcular cuota mensual reducida si aún queda saldo
  let newMonthlyPayment = 0;
  if (!isFullyPaid && client.loanMonthsRemaining > 0) {
    const monthlyRate = (client.loanInterestRateAnnual / 100) / 12;
    newMonthlyPayment = Math.round((newLoanBalance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -client.loanMonthsRemaining)));
  }

  const updatedClients = state.clients.map(c => {
    if (c.id === clientId) {
      return {
        ...c,
        accountBalanceHNL: newAccountBalance,
        loanBalanceHNL: newLoanBalance,
        loanMonthlyPaymentHNL: newMonthlyPayment,
        hasLoan: !isFullyPaid,
        loanMonthsRemaining: isFullyPaid ? 0 : c.loanMonthsRemaining,
        pastDueDays: 0,
        pastDueAmountHNL: 0,
        cnbsCategory: 'I - Normal' as const,
        lastMonthlyAmortizationStatus: 'al_dia' as const,
        lastAmortizationNotice: `Abono extraordinario a capital aplicado por ${formatHNL(actualAmortization)}. Saldo actual: ${formatHNL(newLoanBalance)}.`
      };
    }
    return c;
  });

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      financials: {
        ...state.financials,
        loanPortfolioCurrent: Math.max(0, state.financials.loanPortfolioCurrent - actualAmortization),
        cashAndBCHReserves: state.financials.cashAndBCHReserves + actualAmortization
      }
    },
    successMessage: isFullyPaid 
      ? `¡Préstamo cancelado en su totalidad con el abono de ${formatHNL(actualAmortization)}!` 
      : `Abono a capital de ${formatHNL(actualAmortization)} ejecutado. Nueva cuota mensual: ${formatHNL(newMonthlyPayment)}.`
  };
}

/**
 * Recalibra manual o institucionalmente el límite crediticio de un cliente
 */
export function recalibrateClientCreditLimit(
  state: GameState,
  clientId: string,
  newLimitHNL: number,
  notes: string
): { updatedState: GameState; successMessage: string } {
  const updatedClients = state.clients.map(c => {
    if (c.id === clientId) {
      return {
        ...c,
        creditCardLimitHNL: newLimitHNL,
        notes: notes ? `${c.notes || ''} · [Límite ajustado a ${formatHNL(newLimitHNL)}: ${notes}]` : c.notes
      };
    }
    return c;
  });

  return {
    updatedState: {
      ...state,
      clients: updatedClients
    },
    successMessage: `Límite de crédito recalibrado a ${formatHNL(newLimitHNL)} correctamente.`
  };
}

/**
 * Abre una operación de Reporto (Repo) con el Banco Central de Honduras o entidad autorizada
 */
export function openBchRepoOperation(
  state: GameState,
  amountHNL: number,
  termDays: 7 | 14 | 28,
  ratePct: number
): { updatedState: GameState; successMessage: string } {
  const newRepo: BchRepoOperation = {
    id: `repo-${Date.now().toString().slice(-5)}`,
    type: 'repo_bch_liquidez',
    counterparty: 'Banco Central de Honduras (BCH)',
    termDays,
    amountHNL,
    interestRatePct: ratePct,
    monthsRemaining: Math.ceil(termDays / 30),
    collateralAsset: 'Letra de Regulación Monetaria BCH-LRM',
    status: 'activo'
  };

  const updatedRepos = [newRepo, ...(state.bchMoneyDesk?.activeRepos || [])];
  const newBchCash = (state.bchMoneyDesk?.cashInBchCurrentAccountHNL || 345000000) + amountHNL;
  const surplus = newBchCash - (state.bchMoneyDesk?.requiredReserveHNL || 280800000);

  return {
    updatedState: {
      ...state,
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + amountHNL,
        interbankBorrowingBCH: state.financials.interbankBorrowingBCH + amountHNL
      },
      bchMoneyDesk: {
        ...(state.bchMoneyDesk || {} as any),
        cashInBchCurrentAccountHNL: newBchCash,
        reserveSurplusOrDeficitHNL: surplus,
        isCompliant: surplus >= 0,
        activeRepos: updatedRepos
      }
    },
    successMessage: `Operación de Reporto por ${formatHNL(amountHNL)} a ${termDays} días concertada con el BCH a tasa ${ratePct}%.`
  };
}

/**
 * Ejecuta una operación de Call Money en el Mercado Interbancario con un banco hondureño
 */
export function executeInterbankCallDeal(
  state: GameState,
  bankId: CompetitorId,
  amountHNL: number,
  direction: 'prestar' | 'pedir_prestado'
): { updatedState: GameState; successMessage: string } {
  const bank = state.competitors.find(b => b.id === bankId);
  const bankName = bank?.name || 'Banco Competidor';

  if (direction === 'prestar') {
    if (state.financials.cashAndBCHReserves < amountHNL) {
      return { updatedState: state, successMessage: 'Reservas de caja insuficientes para prestar liquidez.' };
    }

    return {
      updatedState: {
        ...state,
        financials: {
          ...state.financials,
          cashAndBCHReserves: state.financials.cashAndBCHReserves - amountHNL
        },
        innovations: {
          ...(state.innovations as any),
          interbankCallMoney: {
            lentAmountHNL: ((state.innovations?.interbankCallMoney?.lentAmountHNL || 0) + amountHNL),
            borrowedAmountHNL: state.innovations?.interbankCallMoney?.borrowedAmountHNL || 0,
            callRatePct: state.bch.tpmRate + 0.35
          }
        }
      },
      successMessage: `Se colocaron ${formatHNL(amountHNL)} en Call Money a ${bankName} a tasa ${(state.bch.tpmRate + 0.35).toFixed(2)}%.`
    };
  } else {
    return {
      updatedState: {
        ...state,
        financials: {
          ...state.financials,
          cashAndBCHReserves: state.financials.cashAndBCHReserves + amountHNL
        },
        innovations: {
          ...(state.innovations as any),
          interbankCallMoney: {
            lentAmountHNL: state.innovations?.interbankCallMoney?.lentAmountHNL || 0,
            borrowedAmountHNL: ((state.innovations?.interbankCallMoney?.borrowedAmountHNL || 0) + amountHNL),
            callRatePct: state.bch.tpmRate + 0.55
          }
        }
      },
      successMessage: `Se tomaron prestados ${formatHNL(amountHNL)} en Call Money de ${bankName} a tasa ${(state.bch.tpmRate + 0.55).toFixed(2)}%.`
    };
  }
}

/**
 * Emite un nuevo contrato Forward cambiario no entregable (NDF) USD/HNL
 */
export function createFxForwardContract(
  state: GameState,
  clientName: string,
  companyName: string,
  amountUSD: number,
  agreedRateHNL: number,
  termDays: 30 | 60 | 90 | 180
): { updatedState: GameState; successMessage: string } {
  const premiumFeeHNL = Math.round(amountUSD * 0.12);
  const newForward: FxForwardContract = {
    id: `fwd-${Date.now().toString().slice(-5)}`,
    clientName,
    companyName,
    direction: 'venta_usd_a_cliente',
    amountUSD,
    agreedRateHNL,
    marketRateAtAgreementHNL: state.bch.exchangeRateHNLtoUSD,
    termDays,
    monthsRemaining: Math.ceil(termDays / 30),
    premiumFeeHNL,
    status: 'activo'
  };

  return {
    updatedState: {
      ...state,
      fxForwards: [newForward, ...(state.fxForwards || [])],
      financials: {
        ...state.financials,
        feeIncomeSwiftAndFX: state.financials.feeIncomeSwiftAndFX + premiumFeeHNL,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + premiumFeeHNL
      }
    },
    successMessage: `Contrato Forward USD/HNL acordado con ${companyName} por ${formatUSD(amountUSD)} a L. ${agreedRateHNL}. Comisión cobrada: ${formatHNL(premiumFeeHNL)}.`
  };
}

/**
 * Ejecuta una prueba de estrés macroeconómica integral de la CNBS
 */
export function runMacroStressScenario(
  state: GameState,
  scenario: 'cafe_remesas' | 'fed_rate_hike' | 'sequia_agro'
): { updatedState: GameState; impact: { simCAR: number; simLCR: number; provIncreaseHNL: number; capitalGapHNL: number; analysis: string } } {
  let simCAR = state.financials.capitalAdequacyRatioCAR;
  let simLCR = state.financials.liquidityCoverageRatioLCR;
  let provIncreaseHNL = 0;
  let capitalGapHNL = 0;
  let analysis = '';

  if (scenario === 'cafe_remesas') {
    simCAR = +(simCAR - 2.4).toFixed(1);
    simLCR = +(simLCR - 22.0).toFixed(1);
    provIncreaseHNL = 14500000;
    capitalGapHNL = simCAR < 10.0 ? Math.round((10.0 - simCAR) * 25000000) : 0;
    analysis = 'Choque de caída del 20% en café y remesas: Aumento en mora comercial en Valle de Sula y Comayagua. Requiere constituir L. 14.5M en provisiones adicionales.';
  } else if (scenario === 'fed_rate_hike') {
    simCAR = +(simCAR - 1.8).toFixed(1);
    simLCR = +(simLCR - 18.0).toFixed(1);
    provIncreaseHNL = 9800000;
    capitalGapHNL = 0;
    analysis = 'Alza agresiva de la Reserva Federal: Presión devaluatoria sobre el Lempira y aumento del costo de corresponsalía en Dólares. LCR se mantiene sobre 100%.';
  } else {
    simCAR = +(simCAR - 3.1).toFixed(1);
    simLCR = +(simLCR - 25.0).toFixed(1);
    provIncreaseHNL = 21000000;
    capitalGapHNL = simCAR < 10.0 ? Math.round((10.0 - simCAR) * 30000000) : 0;
    analysis = 'Sequía severa en el Corredor Seco y Pérdidas Agrícolas: Impacta la cartera PYME agropecuaria y cooperativas. Exige refuerzo de provisiones anticíclicas.';
  }

  return {
    updatedState: {
      ...state,
      innovations: {
        ...(state.innovations as any),
        stressTesting: {
          lastScenarioRun: scenario === 'cafe_remesas' ? 'Choque Café & Remesas' : scenario === 'fed_rate_hike' ? 'Alza Tasas Fed USD' : 'Sequía Corredor Seco',
          simulatedCAR: simCAR,
          simulatedLCR: simLCR,
          capitalGapHNL
        }
      }
    },
    impact: {
      simCAR,
      simLCR,
      provIncreaseHNL,
      capitalGapHNL,
      analysis
    }
  };
}

/**
 * Liquidación y actualización mensual automática de las 20 características y programas bancarios
 */
export function advanceBankingPrograms20(
  state: GameState,
  nextMonth: number,
  tpmDelta: number,
  newExchangeRate: number
): {
  updatedPrograms: AureoProgramsState;
  totalProgramNetIncome: number;
} {
  const base = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  // 1. Remesas QR
  const remesasVol = Math.round(18500000 * (1 + (Math.random() * 0.06 - 0.02)));
  const remesasIncome = Math.round(remesasVol * 0.035);
  const updatedRemesasTxs = (base.remesasQrTransactions || []).map(tx => ({
    ...tx,
    status: tx.status === 'Pendiente_Cajero' ? ('Cobrado' as const) : tx.status
  }));
  if (updatedRemesasTxs.length < 5) {
    updatedRemesasTxs.push({
      id: `rem-qr-${nextMonth}-${Date.now().toString().slice(-4)}`,
      senderCountry: Math.random() > 0.4 ? 'Estados Unidos' : 'España',
      beneficiaryName: `${HN_FIRST_NAMES[Math.floor(Math.random() * HN_FIRST_NAMES.length)]} ${HN_LAST_NAMES[Math.floor(Math.random() * HN_LAST_NAMES.length)]}`,
      amountUSD: Math.round(350 + Math.random() * 400),
      amountHNL: Math.round((350 + Math.random() * 400) * newExchangeRate),
      exchangeRateUsed: +(newExchangeRate + 0.10).toFixed(2),
      qrPinCode: Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'Acreditado_Cuenta'
    });
  }

  // 2. Rewards
  const newPoints = Math.round(110000 + Math.random() * 30000);
  const redeemedPoints = Math.round(60000 + Math.random() * 20000);
  const rewardsVol = Math.round(24800000 * (1 + (Math.random() * 0.05)));
  const rewardsNetIncome = Math.round(380000 + (Math.random() * 30000 - 15000));
  const updatedRewards = {
    ...base.rewardsSystem,
    totalPointsIssued: base.rewardsSystem.totalPointsIssued + newPoints,
    totalPointsRedeemed: base.rewardsSystem.totalPointsRedeemed + redeemedPoints,
    activeEnrolledCardholders: base.rewardsSystem.activeEnrolledCardholders + Math.floor(35 + Math.random() * 20)
  };

  // 3. Micro-Ahorro Hucha
  const roundingAdded = Math.round(380000 + Math.random() * 60000);
  const monthlyHuchaYield = (base.microSavingsHuchas.annualYieldPct / 100 / 12);
  const huchaInterest = Math.round(base.microSavingsHuchas.totalAccumulatedHNL * monthlyHuchaYield);
  const updatedHucha = {
    ...base.microSavingsHuchas,
    totalAccumulatedHNL: base.microSavingsHuchas.totalAccumulatedHNL + roundingAdded + huchaInterest,
    totalEnrolledClients: base.microSavingsHuchas.totalEnrolledClients + Math.floor(25 + Math.random() * 30)
  };
  const huchaVol = updatedHucha.totalAccumulatedHNL;
  const huchaIncome = Math.round(145000 + (Math.random() * 20000 - 10000));

  // 4. Adelanto de Salario
  const advanceVol = Math.round(8900000 * (1 + (Math.random() * 0.04 - 0.02)));
  const advanceFee = Math.round(advanceVol * 0.025);
  const updatedAdvances = {
    ...base.salaryAdvanceLedger,
    totalAdvancesDisbursedHNL: advanceVol,
    activeAdvancesCount: Math.round(1200 + Math.random() * 80)
  };

  // 5. Seguros Protege
  const activePolicies = base.insuranceProtege.enrolledPoliciesCount + Math.floor(40 + Math.random() * 25);
  const premiumCollected = activePolicies * base.insuranceProtege.monthlyPremiumHNL;
  const claimsPaid = Math.round(premiumCollected * 0.18);
  const insuranceIncome = premiumCollected - claimsPaid;
  const updatedInsurance = {
    ...base.insuranceProtege,
    enrolledPoliciesCount: activePolicies,
    claimsPaidThisYearHNL: base.insuranceProtege.claimsPaidThisYearHNL + claimsPaid
  };

  // 6. Línea Revolvente Pyme
  const pymeRevVol = Math.round(48000000 * (1 + (Math.random() * 0.04 - 0.01)));
  const pymeRevIncome = Math.round(pymeRevVol * (base.pymeRevolvingLines.annualInterestRatePct / 100 / 12));
  const updatedPymeRev = {
    ...base.pymeRevolvingLines,
    totalDrawnBalanceHNL: pymeRevVol,
    activePymesCount: base.pymeRevolvingLines.activePymesCount + Math.floor(2 + Math.random() * 3)
  };

  // 7. Mujer Emprende
  const mujerVol = Math.round(21500000 * 1.015);
  const mujerIncome = Math.round(mujerVol * (base.mujerEmprendeProgram.subsidizedRatePct / 100 / 12));
  const updatedMujer = {
    ...base.mujerEmprendeProgram,
    totalPortfolioHNL: mujerVol,
    enrolledBusinessesCount: base.mujerEmprendeProgram.enrolledBusinessesCount + 4
  };

  // 8. Smart POS Anticipos
  const posSalesVol = Math.round(32000000 * (1 + (Math.random() * 0.06 - 0.02)));
  const posFactorIncome = Math.round(posSalesVol * 0.018);
  const updatedPosAdvances = {
    ...base.smartPosAdvances,
    advancedSalesVolumeHNL: posSalesVol,
    participatingMerchantsCount: base.smartPosAdvances.participatingMerchantsCount + 3
  };

  // 9. Escrow Custodia
  const escrowVol = Math.round(16500000 * (1 + (Math.random() * 0.05 - 0.02)));
  const escrowIncome = Math.round(escrowVol * (base.escrowCustodyAccounts.annualCustodyFeePct / 100 / 12));
  const updatedEscrow = {
    ...base.escrowCustodyAccounts,
    fundsInCustodyHNL: escrowVol
  };

  // 10. Cosecha Segura Café
  const agroVol = Math.round(65000000 * (1 + (Math.random() * 0.03)));
  const agroIncome = Math.round(agroVol * (0.145 / 12));
  const updatedAgro = {
    ...base.agroCosechaSegura,
    seasonalFinancingHNL: agroVol,
    coveredFincasCount: base.agroCosechaSegura.coveredFincasCount + 2
  };

  // 11. Eco-Crédito Verde
  const ecoVol = Math.round(38000000 * 1.02);
  const ecoIncome = Math.round(ecoVol * (0.115 / 12));
  const updatedEco = {
    ...base.ecoCreditoVerde,
    totalGreenPortfolioHNL: ecoVol,
    co2TonsAvoided: base.ecoCreditoVerde.co2TonsAvoided + 320,
    financedProjectsCount: base.ecoCreditoVerde.financedProjectsCount + 2
  };

  // 12. Bono Prenda Café AGD
  const bonoVol = Math.round(52000000 * (1 + (Math.random() * 0.04 - 0.02)));
  const bonoIncome = Math.round(bonoVol * (0.138 / 12));
  const updatedBono = {
    ...base.bonoPrendaCafeAgd,
    pawnLoanDisbursedHNL: bonoVol
  };

  // 13. Factoring Confirming
  const factVol = Math.round(78000000 * (1 + (Math.random() * 0.05 - 0.01)));
  const factIncome = Math.round(factVol * (base.factoringConfirming.avgDiscountRatePct / 100 / 12));
  const updatedFact = {
    ...base.factoringConfirming,
    outstandingFactoringHNL: factVol,
    discountedInvoicesCount: base.factoringConfirming.discountedInvoicesCount + 12
  };

  // 14. Cartas de Crédito Trade Finance
  const tradeVol = Math.round(45000000 * (1 + (Math.random() * 0.04 - 0.02)));
  const tradeIncome = Math.round(tradeVol * (base.tradeLettersOfCredit.commissionRatePct / 100 / 4));
  const updatedTrade = {
    ...base.tradeLettersOfCredit,
    issuedLettersCount: base.tradeLettersOfCredit.issuedLettersCount + 3
  };

  // 15. Mesa Forward USD
  const fwdDeskVol = Math.round(62000000 * (1 + (Math.random() * 0.05)));
  const fwdDeskIncome = Math.round(980000 + (Math.random() * 80000 - 40000));
  const updatedFwdDesk = {
    ...base.fxCorporateDesk,
    activeSpotVolumeMonthlyUSD: Math.round(base.fxCorporateDesk.activeSpotVolumeMonthlyUSD * 1.02),
    monthlySpreadEarningsHNL: fwdDeskIncome
  };

  // 16. Fideicomisos Inmobiliarios
  const fidVol = Math.round(850000000 * 1.01);
  const fidIncome = Math.round(fidVol * (0.015 / 12));
  const updatedFid = {
    ...base.realEstateTrusts,
    managedAssetsHNL: fidVol,
    fiduciaryCommissionMonthlyHNL: fidIncome
  };

  // 17. DPF Step-Up
  const updatedTranches = (base.stepUpDpfTranches || []).map(t => {
    const nextMonthInTerm = t.currentMonthInTerm + 1;
    let rate = t.currentRatePct;
    let nextRate = t.nextQuarterRatePct;
    if (nextMonthInTerm % 3 === 0) {
      rate = Math.min(10.75, rate + 1.0);
      nextRate = Math.min(11.0, rate + 1.0);
    }
    return {
      ...t,
      currentMonthInTerm: nextMonthInTerm,
      currentRatePct: rate,
      nextQuarterRatePct: nextRate
    };
  });
  const dpfStepVol = Math.round(95000000 * 1.01);
  const dpfStepIncome = Math.round(540000 + (Math.random() * 40000 - 20000));

  // 18. Repos Interbancarios
  const repoVol = Math.round(110000000 + (Math.random() * 10000000 - 5000000));
  const repoIncome = Math.round(repoVol * ((state.bch.tpmRate + 0.5) / 100 / 12));
  const updatedRepos = {
    ...base.interbankReposOverview,
    overnightVolumeHNL: repoVol,
    weightedAverageRepoRatePct: +(state.bch.tpmRate + 0.5).toFixed(2)
  };

  // 19. Calificador CNBS
  const cnbsRiskVol = state.financials.loanPortfolioPastDue;
  const cnbsIncome = Math.round(620000);
  const updatedCnbsRisk = {
    ...base.cnbsRiskScoringEngine,
    requiredProvisionHNL: cnbsRiskVol,
    portfolioWeightedRiskPct: +(state.financials.delinquencyRatioNPL || 2.69).toFixed(2)
  };

  // 20. Portal UIF Cumplimiento
  const uifVol = Math.round(34000000 * (1 + (Math.random() * 0.05)));
  const uifIncome = Math.round(180000);
  const updatedUif = {
    ...base.uifCompliancePortal,
    declarations10kFiledCount: base.uifCompliancePortal.declarations10kFiledCount + Math.floor(18 + Math.random() * 12),
    complianceAuditScorePct: +Math.min(99.5, base.uifCompliancePortal.complianceAuditScorePct + 0.1).toFixed(1)
  };

  // Array consolidado de los 20 programas actualizados
  const updatedProgramList: AureoProgramItem[] = (base.programs || []).map(p => {
    switch (p.number) {
      case 1: return { ...p, monthlyVolumeHNL: remesasVol, monthlyNetIncomeHNL: remesasIncome, keyMetricValue: '+L. 0.10 por USD' };
      case 2: return { ...p, monthlyVolumeHNL: rewardsVol, monthlyNetIncomeHNL: rewardsNetIncome, keyMetricValue: `${updatedRewards.totalPointsIssued.toLocaleString()} pts` };
      case 3: return { ...p, monthlyVolumeHNL: huchaVol, monthlyNetIncomeHNL: huchaIncome, keyMetricValue: `${updatedHucha.annualYieldPct}% anual` };
      case 4: return { ...p, monthlyVolumeHNL: advanceVol, monthlyNetIncomeHNL: advanceFee };
      case 5: return { ...p, monthlyVolumeHNL: premiumCollected, monthlyNetIncomeHNL: insuranceIncome, participantsCount: activePolicies };
      case 6: return { ...p, monthlyVolumeHNL: pymeRevVol, monthlyNetIncomeHNL: pymeRevIncome, participantsCount: updatedPymeRev.activePymesCount };
      case 7: return { ...p, monthlyVolumeHNL: mujerVol, monthlyNetIncomeHNL: mujerIncome, participantsCount: updatedMujer.enrolledBusinessesCount };
      case 8: return { ...p, monthlyVolumeHNL: posSalesVol, monthlyNetIncomeHNL: posFactorIncome };
      case 9: return { ...p, monthlyVolumeHNL: escrowVol, monthlyNetIncomeHNL: escrowIncome };
      case 10: return { ...p, monthlyVolumeHNL: agroVol, monthlyNetIncomeHNL: agroIncome };
      case 11: return { ...p, monthlyVolumeHNL: ecoVol, monthlyNetIncomeHNL: ecoIncome, keyMetricValue: `${updatedEco.co2TonsAvoided} tons CO2` };
      case 12: return { ...p, monthlyVolumeHNL: bonoVol, monthlyNetIncomeHNL: bonoIncome };
      case 13: return { ...p, monthlyVolumeHNL: factVol, monthlyNetIncomeHNL: factIncome };
      case 14: return { ...p, monthlyVolumeHNL: tradeVol, monthlyNetIncomeHNL: tradeIncome };
      case 15: return { ...p, monthlyVolumeHNL: fwdDeskVol, monthlyNetIncomeHNL: fwdDeskIncome };
      case 16: return { ...p, monthlyVolumeHNL: fidVol, monthlyNetIncomeHNL: fidIncome };
      case 17: return { ...p, monthlyVolumeHNL: dpfStepVol, monthlyNetIncomeHNL: dpfStepIncome };
      case 18: return { ...p, monthlyVolumeHNL: repoVol, monthlyNetIncomeHNL: repoIncome };
      case 19: return { ...p, monthlyVolumeHNL: cnbsRiskVol, monthlyNetIncomeHNL: cnbsIncome };
      case 20: return { ...p, monthlyVolumeHNL: uifVol, monthlyNetIncomeHNL: uifIncome, keyMetricValue: `${updatedUif.complianceAuditScorePct}% Favorable` };
      default: return p;
    }
  });

  const totalProgramNetIncome = updatedProgramList.reduce((acc, p) => acc + (p.monthlyNetIncomeHNL || 0), 0);

  const updatedPrograms: AureoProgramsState = {
    programs: updatedProgramList,
    remesasQrTransactions: updatedRemesasTxs,
    rewardsSystem: updatedRewards,
    microSavingsHuchas: updatedHucha,
    salaryAdvanceLedger: updatedAdvances,
    insuranceProtege: updatedInsurance,
    pymeRevolvingLines: updatedPymeRev,
    mujerEmprendeProgram: updatedMujer,
    smartPosAdvances: updatedPosAdvances,
    escrowCustodyAccounts: updatedEscrow,
    agroCosechaSegura: updatedAgro,
    ecoCreditoVerde: updatedEco,
    bonoPrendaCafeAgd: updatedBono,
    factoringConfirming: updatedFact,
    tradeLettersOfCredit: updatedTrade,
    fxCorporateDesk: updatedFwdDesk,
    realEstateTrusts: updatedFid,
    stepUpDpfTranches: updatedTranches,
    interbankReposOverview: updatedRepos,
    cnbsRiskScoringEngine: updatedCnbsRisk,
    uifCompliancePortal: updatedUif
  };

  return {
    updatedPrograms,
    totalProgramNetIncome
  };
}

// -------------------------------------------------------------
// FUNCIONES DE ACCIÓN INTERACTIVA PARA LOS 20 PROGRAMAS BANCARIOS
// -------------------------------------------------------------

/** 1. Remesas Familiares ÁureoCash QR */
export function executeRemittanceCashQR(
  state: GameState,
  senderCountry: 'Estados Unidos' | 'España' | 'Canadá' | 'México',
  beneficiaryName: string,
  amountUSD: number
): { updatedState: GameState; successMessage: string } {
  const rate = +(state.bch.exchangeRateHNLtoUSD + 0.10).toFixed(2);
  const amountHNL = Math.round(amountUSD * rate);
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const feeIncome = Math.round(amountUSD * 0.035 * state.bch.exchangeRateHNLtoUSD);

  const newTx = {
    id: `rem-qr-${Date.now().toString().slice(-5)}`,
    senderCountry,
    beneficiaryName,
    amountUSD,
    amountHNL,
    exchangeRateUsed: rate,
    qrPinCode: pin,
    status: 'Pendiente_Cajero' as const
  };

  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        remesasQrTransactions: [newTx, ...(current.remesasQrTransactions || [])]
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + feeIncome,
        feeIncomeRemittances: state.financials.feeIncomeRemittances + feeIncome
      }
    },
    successMessage: `Remesa emitida por ${formatUSD(amountUSD)} desde ${senderCountry}. PIN QR Generado: ${pin}. Beneficiario: ${beneficiaryName}.`
  };
}

/** 2. Áureo Rewards Puntos */
export function redeemAureoRewardsPoints(
  state: GameState,
  pointsToRedeem: number,
  targetClientId?: string
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  const available = current.rewardsSystem.totalPointsIssued - current.rewardsSystem.totalPointsRedeemed;
  if (pointsToRedeem > available) {
    return { updatedState: state, successMessage: 'Puntos insuficientes en el fondo de recompensas.' };
  }
  const cashValueHNL = Math.round(pointsToRedeem * current.rewardsSystem.exchangeRatePerPointHNL);

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        rewardsSystem: {
          ...current.rewardsSystem,
          totalPointsRedeemed: current.rewardsSystem.totalPointsRedeemed + pointsToRedeem
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: Math.max(0, state.financials.cashAndBCHReserves - cashValueHNL)
      }
    },
    successMessage: `Se canjearon ${pointsToRedeem.toLocaleString()} Puntos Áureo Rewards por ${formatHNL(cashValueHNL)} acreditados exitosamente.`
  };
}

/** 3. Micro-Ahorro Hucha Digital */
export function configureMicroSavings(
  state: GameState,
  threshold: 10 | 50,
  additionalDepositHNL: number
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        microSavingsHuchas: {
          ...current.microSavingsHuchas,
          roundingThreshold: threshold,
          totalAccumulatedHNL: current.microSavingsHuchas.totalAccumulatedHNL + additionalDepositHNL
        }
      },
      financials: {
        ...state.financials,
        depositsPublicTotal: state.financials.depositsPublicTotal + additionalDepositHNL
      }
    },
    successMessage: `Configuración de Hucha Digital actualizada al múltiplo de L. ${threshold}. Fondos acumulados: ${formatHNL(current.microSavingsHuchas.totalAccumulatedHNL + additionalDepositHNL)}.`
  };
}

/** 4. Adelanto de Salario 24/7 */
export function disburseSalaryAdvance(
  state: GameState,
  employeeName: string,
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  const feeHNL = Math.round(amountHNL * 0.025);
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        salaryAdvanceLedger: {
          ...current.salaryAdvanceLedger,
          totalAdvancesDisbursedHNL: current.salaryAdvanceLedger.totalAdvancesDisbursedHNL + amountHNL,
          activeAdvancesCount: current.salaryAdvanceLedger.activeAdvancesCount + 1
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - amountHNL + feeHNL,
        totalFeeIncome: state.financials.totalFeeIncome + feeHNL
      }
    },
    successMessage: `Adelanto de salario concedido a ${employeeName} por ${formatHNL(amountHNL)}. Comisión plana cobrada: ${formatHNL(feeHNL)}.`
  };
}

/** 5. Seguros Colectivos Áureo Protege */
export function enrollClientInInsuranceProtege(
  state: GameState,
  clientId: string
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  const premium = current.insuranceProtege.monthlyPremiumHNL;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        insuranceProtege: {
          ...current.insuranceProtege,
          enrolledPoliciesCount: current.insuranceProtege.enrolledPoliciesCount + 1
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + premium,
        totalFeeIncome: state.financials.totalFeeIncome + premium
      }
    },
    successMessage: `Cliente suscrito a la póliza Áureo Protege (Prima: L. ${premium}/mes). Blindaje contra cesantía y accidentes activo.`
  };
}

/** 6. Línea de Crédito Revolvente Pyme */
export function drawPymeRevolvingCredit(
  state: GameState,
  pymeName: string,
  drawAmountHNL: number
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        pymeRevolvingLines: {
          ...current.pymeRevolvingLines,
          totalDrawnBalanceHNL: current.pymeRevolvingLines.totalDrawnBalanceHNL + drawAmountHNL
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - drawAmountHNL,
        loanPortfolioCurrent: state.financials.loanPortfolioCurrent + drawAmountHNL
      }
    },
    successMessage: `Disposición de línea revolvente por ${formatHNL(drawAmountHNL)} efectuada por ${pymeName}.`
  };
}

/** 7. Programa Mujer Emprende */
export function approveMujerEmprendeCredit(
  state: GameState,
  businessName: string,
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        mujerEmprendeProgram: {
          ...current.mujerEmprendeProgram,
          totalPortfolioHNL: current.mujerEmprendeProgram.totalPortfolioHNL + amountHNL,
          enrolledBusinessesCount: current.mujerEmprendeProgram.enrolledBusinessesCount + 1
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - amountHNL,
        loanPortfolioCurrent: state.financials.loanPortfolioCurrent + amountHNL
      }
    },
    successMessage: `Crédito bonificado "Mujer Emprende" por ${formatHNL(amountHNL)} otorgado a ${businessName} con respaldo FOHDE al 70%.`
  };
}

/** 8. POS Smart Anticipo de Ventas */
export function advancePosSalesImmediate(
  state: GameState,
  merchantId: string,
  advanceAmountHNL: number
): { updatedState: GameState; successMessage: string } {
  const feeHNL = Math.round(advanceAmountHNL * 0.018);
  const netDisbursed = advanceAmountHNL - feeHNL;
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        smartPosAdvances: {
          ...current.smartPosAdvances,
          advancedSalesVolumeHNL: current.smartPosAdvances.advancedSalesVolumeHNL + advanceAmountHNL
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - netDisbursed,
        totalFeeIncome: state.financials.totalFeeIncome + feeHNL
      }
    },
    successMessage: `Anticipo express del 80% liquidado. Monto bruto: ${formatHNL(advanceAmountHNL)}. Comisión retenida: ${formatHNL(feeHNL)}.`
  };
}

/** 9. Cuentas Escrow Custodia */
export function createEscrowContract(
  state: GameState,
  buyerName: string,
  sellerName: string,
  amountHNL: number,
  conditionDescription: string
): { updatedState: GameState; successMessage: string } {
  const feeHNL = Math.round(amountHNL * 0.015);
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        escrowCustodyAccounts: {
          ...current.escrowCustodyAccounts,
          activeEscrowsCount: current.escrowCustodyAccounts.activeEscrowsCount + 1,
          fundsInCustodyHNL: current.escrowCustodyAccounts.fundsInCustodyHNL + amountHNL
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + amountHNL + feeHNL,
        depositsPublicTotal: state.financials.depositsPublicTotal + amountHNL,
        totalFeeIncome: state.financials.totalFeeIncome + feeHNL
      }
    },
    successMessage: `Contrato Escrow aperturado entre ${buyerName} y ${sellerName} por ${formatHNL(amountHNL)}. Condición: ${conditionDescription}.`
  };
}

/** 10. Crédito Estacional Cosecha Segura */
export function disburseAgroCosechaSegura(
  state: GameState,
  cooperativeName: string,
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        agroCosechaSegura: {
          ...current.agroCosechaSegura,
          seasonalFinancingHNL: current.agroCosechaSegura.seasonalFinancingHNL + amountHNL,
          coveredFincasCount: current.agroCosechaSegura.coveredFincasCount + 3
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - amountHNL,
        loanPortfolioCurrent: state.financials.loanPortfolioCurrent + amountHNL
      }
    },
    successMessage: `Financiamiento de corte y cosecha cafetalera por ${formatHNL(amountHNL)} otorgado a ${cooperativeName} con seguro climático.`
  };
}

/** 11. Eco-Crédito Verde Renovable */
export function disburseEcoCreditoVerde(
  state: GameState,
  projectName: string,
  amountHNL: number,
  projectType: string
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  const co2Estimate = Math.round(amountHNL / 12500);

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        ecoCreditoVerde: {
          ...current.ecoCreditoVerde,
          totalGreenPortfolioHNL: current.ecoCreditoVerde.totalGreenPortfolioHNL + amountHNL,
          co2TonsAvoided: current.ecoCreditoVerde.co2TonsAvoided + co2Estimate,
          financedProjectsCount: current.ecoCreditoVerde.financedProjectsCount + 1
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - amountHNL,
        loanPortfolioCurrent: state.financials.loanPortfolioCurrent + amountHNL
      }
    },
    successMessage: `Eco-Crédito Verde formalizado para ${projectName} (${projectType}) por ${formatHNL(amountHNL)}. Reducción estimada: ${co2Estimate} tons CO2/año.`
  };
}

/** 12. Bono de Prenda Café AGD */
export function issueBonoPrendaCafe(
  state: GameState,
  warehouseName: string,
  quintales: number,
  warrantValueHNL: number
): { updatedState: GameState; successMessage: string } {
  const loanDisbursed = Math.round(warrantValueHNL * 0.70); // 70% LTV
  const feeHNL = Math.round(loanDisbursed * 0.012);
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        bonoPrendaCafeAgd: {
          ...current.bonoPrendaCafeAgd,
          storedBagsQuintales: current.bonoPrendaCafeAgd.storedBagsQuintales + quintales,
          warrantValueHNL: current.bonoPrendaCafeAgd.warrantValueHNL + warrantValueHNL,
          pawnLoanDisbursedHNL: current.bonoPrendaCafeAgd.pawnLoanDisbursedHNL + loanDisbursed
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - loanDisbursed + feeHNL,
        loanPortfolioCurrent: state.financials.loanPortfolioCurrent + loanDisbursed,
        totalFeeIncome: state.financials.totalFeeIncome + feeHNL
      }
    },
    successMessage: `Bono de prenda emitido sobre ${quintales.toLocaleString()} qq de café en ${warehouseName}. Desembolso prendario: ${formatHNL(loanDisbursed)}.`
  };
}

/** 13. Factoring Electrónico */
export function discountFactoringInvoice(
  state: GameState,
  supplierName: string,
  payerName: string,
  invoiceAmountHNL: number,
  termDays: number
): { updatedState: GameState; successMessage: string } {
  const discountRate = 0.148;
  const discountSpread = Math.round(invoiceAmountHNL * (discountRate * (termDays / 365)));
  const netPaid = invoiceAmountHNL - discountSpread;
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        factoringConfirming: {
          ...current.factoringConfirming,
          outstandingFactoringHNL: current.factoringConfirming.outstandingFactoringHNL + invoiceAmountHNL,
          discountedInvoicesCount: current.factoringConfirming.discountedInvoicesCount + 1
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - netPaid,
        loanPortfolioCurrent: state.financials.loanPortfolioCurrent + invoiceAmountHNL,
        totalFeeIncome: state.financials.totalFeeIncome + discountSpread
      }
    },
    successMessage: `Factura de ${supplierName} pagadera por ${payerName} descontada a ${termDays} días. Monto facial: ${formatHNL(invoiceAmountHNL)}. Margen retenido: ${formatHNL(discountSpread)}.`
  };
}

/** 14. Cartas de Crédito Trade Finance */
export function issueTradeLetterOfCredit(
  state: GameState,
  importerName: string,
  beneficiaryBank: string,
  amountUSD: number
): { updatedState: GameState; successMessage: string } {
  const commUSD = amountUSD * 0.0075;
  const commHNL = Math.round(commUSD * state.bch.exchangeRateHNLtoUSD);
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        tradeLettersOfCredit: {
          ...current.tradeLettersOfCredit,
          issuedLettersCount: current.tradeLettersOfCredit.issuedLettersCount + 1,
          totalGuaranteedAmountUSD: current.tradeLettersOfCredit.totalGuaranteedAmountUSD + amountUSD
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + commHNL,
        feeIncomeSwiftAndFX: state.financials.feeIncomeSwiftAndFX + commHNL,
        totalFeeIncome: state.financials.totalFeeIncome + commHNL
      }
    },
    successMessage: `Carta de crédito irrevocable emitida para ${importerName} ante ${beneficiaryBank} por ${formatUSD(amountUSD)}. Comisión cobrada: ${formatHNL(commHNL)}.`
  };
}

/** 15. Mesa Cambiaria Forward */
export function createCorporateFxForward(
  state: GameState,
  clientName: string,
  companyName: string,
  amountUSD: number,
  agreedRateHNL: number,
  termDays: 30 | 60 | 90 | 180
): { updatedState: GameState; successMessage: string } {
  return createFxForwardContract(state, clientName, companyName, amountUSD, agreedRateHNL, termDays);
}

/** 16. Fideicomisos Inmobiliarios */
export function createRealEstateTrust(
  state: GameState,
  projectName: string,
  developerName: string,
  assetValueHNL: number
): { updatedState: GameState; successMessage: string } {
  const feeHNL = Math.round(assetValueHNL * 0.005);
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        realEstateTrusts: {
          ...current.realEstateTrusts,
          activeTrustsCount: current.realEstateTrusts.activeTrustsCount + 1,
          managedAssetsHNL: current.realEstateTrusts.managedAssetsHNL + assetValueHNL
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + feeHNL,
        totalFeeIncome: state.financials.totalFeeIncome + feeHNL
      }
    },
    successMessage: `Patrimonio autónomo fiduciario constituido para ${projectName} (${developerName}) por ${formatHNL(assetValueHNL)}. Comisión de apertura: ${formatHNL(feeHNL)}.`
  };
}

/** 17. DPF Step-Up Digital */
export function openStepUpDpfDeposit(
  state: GameState,
  clientName: string,
  principalHNL: number
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  const newTranche = {
    id: `step-${Date.now().toString().slice(-4)}`,
    clientName,
    principalHNL,
    currentMonthInTerm: 1,
    currentRatePct: 7.50,
    nextQuarterRatePct: 8.50
  };

  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        stepUpDpfTranches: [newTranche, ...(current.stepUpDpfTranches || [])]
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + principalHNL,
        depositsPublicTotal: state.financials.depositsPublicTotal + principalHNL
      }
    },
    successMessage: `DPF Step-Up aperturado a nombre de ${clientName} por ${formatHNL(principalHNL)}. Tasa inicial: 7.50% (Escala hasta 10.50%).`
  };
}

/** 18. Repos Interbancarios BCH */
export function executeInterbankRepoTrade(
  state: GameState,
  counterpartyBank: string,
  amountHNL: number,
  termDays: 7 | 14 | 28,
  ratePct: number
): { updatedState: GameState; successMessage: string } {
  return openBchRepoOperation(state, amountHNL, termDays, ratePct);
}

/** 19. Calificador de Riesgo CNBS */
export function reclassifyCnbsLoanWorkout(
  state: GameState,
  clientId: string,
  workoutType: 'condonacion_mora' | 'ampliar_plazo_36m' | 'dacion_garantia'
): { updatedState: GameState; successMessage: string } {
  const delinquentTarget = state.clients.find(c => c.pastDueDays > 0 || c.cnbsCategory !== 'I - Normal');
  const target = state.clients.find(c => c.id === clientId) || delinquentTarget || state.clients[0];
  if (!target) {
    return { updatedState: state, successMessage: 'Cliente no encontrado.' };
  }

  const updatedClients = state.clients.map(c => {
    if (c.id === target.id) {
      if (workoutType === 'condonacion_mora') {
        return {
          ...c,
          cnbsCategory: 'I - Normal' as const,
          pastDueDays: 0,
          pastDueAmountHNL: 0,
          loanBalanceHNL: Math.round(c.loanBalanceHNL * 0.85),
          isRestructured: true,
          guaranteedPayment: true,
          notes: 'Reestructurado con condonación total de recargos moratorios conforme a resolución CNBS.'
        };
      } else if (workoutType === 'ampliar_plazo_36m') {
        return {
          ...c,
          cnbsCategory: 'I - Normal' as const,
          pastDueDays: 0,
          pastDueAmountHNL: 0,
          loanMonthsRemaining: 36,
          loanMonthlyPaymentHNL: Math.round(c.loanMonthlyPaymentHNL * 0.65),
          isRestructured: true,
          notes: 'Plazo ampliado a 36 meses reduciendo la cuota al 65%.'
        };
      } else {
        return {
          ...c,
          cnbsCategory: 'I - Normal' as const,
          pastDueDays: 0,
          pastDueAmountHNL: 0,
          loanBalanceHNL: 0,
          hasLoan: false,
          notes: 'Deuda saldada mediante dación en pago de activo en garantía.'
        };
      }
    }
    return c;
  });

  const updatedDivisions = { ...state.divisions };
  if (target.division && updatedDivisions[target.division]) {
    updatedDivisions[target.division] = {
      ...updatedDivisions[target.division],
      delinquencyRate: Math.max(0, +(updatedDivisions[target.division].delinquencyRate * 0.8).toFixed(2)),
      satisfactionScore: Math.min(100, updatedDivisions[target.division].satisfactionScore + 3)
    };
  }

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      divisions: updatedDivisions,
      financials: {
        ...state.financials,
        loanPortfolioPastDue: Math.max(0, state.financials.loanPortfolioPastDue - Math.max(25000, target.pastDueAmountHNL || 0)),
        loanLossProvisions: Math.max(0, state.financials.loanLossProvisions - Math.max(12500, Math.round((target.pastDueAmountHNL || 0) * 0.5)))
      }
    },
    successMessage: `Quita y renegociación regulatoria CNBS ejecutada con éxito para ${target.name}. Recargos condonados y crédito restituido a Categoría I - Normal.`
  };
}

/** 20. Portal UIF Cumplimiento Regulatorio */
export function fileUifComplianceDeclaration(
  state: GameState,
  clientName: string,
  amountUSD: number,
  sourceOfFunds: string
): { updatedState: GameState; successMessage: string } {
  const current = state.bankingPrograms20 || INITIAL_BANKING_PROGRAMS_20;
  return {
    updatedState: {
      ...state,
      bankingPrograms20: {
        ...current,
        uifCompliancePortal: {
          ...current.uifCompliancePortal,
          declarations10kFiledCount: current.uifCompliancePortal.declarations10kFiledCount + 1,
          complianceAuditScorePct: +Math.min(99.9, current.uifCompliancePortal.complianceAuditScorePct + 0.05).toFixed(1)
        }
      }
    },
    successMessage: `Formulario de origen de fondos ($10,000+ USD) radicado ante UIF para ${clientName} (${formatUSD(amountUSD)}). Origen: ${sourceOfFunds}. Auditoría favorable.`
  };
}

// ====================================================================================
// CENTRO DE OPERACIONES AVANZADAS: 24 CARACTERÍSTICAS EN 4 EJES ESTRATÉGICOS
// ====================================================================================

/**
 * Liquidación y actualización mensual automática de las 24 operaciones avanzadas
 */
export function advanceAdvancedOperationsMonth(
  state: GameState,
  nextMonth: number,
  tpmDelta: number,
  newExchangeRate: number
): {
  updatedOperations: AdvancedOperationsState;
  totalOperationsIncome: number;
} {
  const base: AdvancedOperationsState = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;

  // EJE 1: RED FÍSICA & CANALES
  let branchTotalOperatingCost = 0;
  const updatedBranches = (base.departmentBranches || []).map(dept => {
    if (dept.status === 'Operativa') {
      const growthFactor = 1 + (0.006 + Math.random() * 0.008);
      const loanFactor = 1 + (0.004 + Math.random() * 0.006);
      const newDeposits = Math.round(dept.depositsCollectedHNL * growthFactor);
      const newLoans = Math.round(dept.loansDisbursedHNL * loanFactor);
      branchTotalOperatingCost += dept.monthlyOperatingCostHNL;
      return {
        ...dept,
        depositsCollectedHNL: newDeposits,
        loansDisbursedHNL: newLoans
      };
    }
    return dept;
  });

  // ATMs
  let atmFeeIncome = 0;
  let atmMaintenanceTotal = 0;
  const updatedAtms = (base.atmFleet || []).map(atm => {
    const txCount = Math.round(atm.monthlyTransactions * (1 + (Math.random() * 0.06 - 0.03)));
    const fee = txCount * 20; // L. 20 por transacción interbancaria
    atmFeeIncome += fee;
    atmMaintenanceTotal += atm.maintenanceCostHNL;
    const dispensed = Math.round(txCount * 180);
    const newVault = Math.max(150000, atm.cashVaultHNL - dispensed);
    return {
      ...atm,
      monthlyTransactions: txCount,
      monthlyFeeIncomeHNL: fee,
      cashVaultHNL: newVault,
      uptimePct: +(Math.min(99.9, Math.max(97.5, atm.uptimePct + (Math.random() * 0.4 - 0.2)))).toFixed(1)
    };
  });

  // Agentes Comunitarios ("Caja Amiga")
  let agentCommissionIncome = 0;
  const updatedAgents = (base.bankingAgents || []).map(agent => {
    const vol = Math.round(agent.monthlyVolumeHNL * (1 + (Math.random() * 0.04 - 0.01)));
    const comm = Math.round(vol * 0.035);
    agentCommissionIncome += comm;
    return {
      ...agent,
      monthlyVolumeHNL: vol,
      commissionSharedHNL: comm
    };
  });

  // EJE 2: MERCADO DE CAPITALES & TESORERÍA
  const updatedBonds = (base.subordinatedBonds || []).map(b => ({
    ...b,
    monthsElapsed: b.monthsElapsed + 1
  }));

  const updatedSovereign = (base.sovereignHoldings || []).map(s => {
    const newRem = Math.max(0, s.termMonthsRemaining - 1);
    return {
      ...s,
      termMonthsRemaining: newRem
    };
  });

  // Fondos Mutuos (AUM crece por suscripciones y rendimiento)
  let mutualFundFeeIncome = 0;
  const updatedMutualFunds = (base.mutualFunds || []).map(fund => {
    const returnMonthly = 0.0055;
    const growth = Math.round(fund.aumHNL * (1 + returnMonthly + (Math.random() * 0.008)));
    const fee = Math.round(growth * (fund.managementFeePct / 100 / 12));
    mutualFundFeeIncome += fee;
    return {
      ...fund,
      aumHNL: growth,
      investorCount: fund.investorCount + Math.floor(Math.random() * 8 + 2),
      navPerShareHNL: +(fund.navPerShareHNL * (1 + returnMonthly)).toFixed(2)
    };
  });

  // EJE 3: INTELIGENCIA EJECUTIVA & REGULATORIA
  const totalLoans = state.financials.loanPortfolioCurrent || 2150000000;
  const pastDue = state.financials.loanPortfolioPastDue || 32000000;
  const stage1 = Math.round(totalLoans * 0.008);
  const stage2 = Math.round(totalLoans * 0.025);
  const stage3 = Math.round(pastDue * 0.65);
  const totalEcl = stage1 + stage2 + stage3;

  const cyberSec = {
    ...base.cyberSecurityCenter,
    ddosBlockedAttacksCount: base.cyberSecurityCenter.ddosBlockedAttacksCount + Math.floor(1200 + Math.random() * 800),
    suspiciousTxBlockedCount: base.cyberSecurityCenter.suspiciousTxBlockedCount + Math.floor(15 + Math.random() * 20),
    pciDssComplianceScorePct: +(Math.min(99.9, Math.max(98.0, base.cyberSecurityCenter.pciDssComplianceScorePct + (Math.random() * 0.2 - 0.1)))).toFixed(1)
  };

  const aml = {
    ...base.amlCompliancePortal,
    transactionsOver10kScreened: base.amlCompliancePortal.transactionsOver10kScreened + Math.floor(45 + Math.random() * 30),
    pepsAlertsTriggered: base.amlCompliancePortal.pepsAlertsTriggered + Math.floor(1 + Math.random() * 3),
    complianceClearanceRatePct: +(Math.min(99.9, Math.max(98.5, base.amlCompliancePortal.complianceClearanceRatePct + (Math.random() * 0.1 - 0.05)))).toFixed(1)
  };

  // Métricas ALCO
  const nim = +(Math.max(4.5, Math.min(8.0, (state.financials.netInterestMargin || 14000000) / (state.financials.totalAssets || 3000000000) * 1200))).toFixed(2);
  const cir = +(Math.max(40, Math.min(65, (state.financials.totalOperatingExpense || 12000000) / Math.max(1, (state.financials.totalFinancialIncome || 24000000) + (state.financials.totalFeeIncome || 4000000)) * 100))).toFixed(1);

  // EJE 4: CORPORATIVO & CLIENTES
  const cashMgmt = {
    ...base.corporateCashManagement,
    corporateClientsEnrolled: base.corporateCashManagement.corporateClientsEnrolled + (nextMonth % 2 === 0 ? 1 : 0),
    monthlyPayrollDispersalsHNL: Math.round(base.corporateCashManagement.monthlyPayrollDispersalsHNL * (1 + (Math.random() * 0.03 - 0.01))),
    feeGeneratedHNL: Math.round(base.corporateCashManagement.feeGeneratedHNL * 1.02)
  };

  let fiduciaryFeeTotal = 0;
  const updatedTrusts = (base.fiduciaryTrustContracts || []).map(t => {
    fiduciaryFeeTotal += t.monthlyFiduciaryFeeHNL;
    return t;
  });

  let insuranceIncome = 0;
  const updatedInsurance = (base.microInsurancePortfolio || []).map(ins => {
    const newPolicies = ins.activePolicies + Math.floor(20 + Math.random() * 40);
    const premium = newPolicies * ins.monthlyPremiumHNL;
    const claims = Math.round(premium * (ins.monthlyLossRatioPct / 100));
    insuranceIncome += (premium - claims);
    return {
      ...ins,
      activePolicies: newPolicies
    };
  });

  // Churn & NPS
  const npsScore = Math.floor(76 + Math.random() * 6);
  const churnPredictor = {
    ...base.clientChurnPredictor,
    overallNPSScore: npsScore,
    highRiskChurnClientsCount: Math.max(3, Math.floor(12 + Math.random() * 5 - 2))
  };

  // Préstamos Digitales Instantáneos
  const instantCount = Math.floor(90 + Math.random() * 50);
  const instantVolume = Math.round(instantCount * 95000);
  const digitalInstant = {
    disbursedThisMonthCount: instantCount,
    totalDisbursedHNL: instantVolume,
    averageApprovalTimeMinutes: +(Math.max(1.8, Math.min(3.2, 2.4 + (Math.random() * 0.4 - 0.2)))).toFixed(1),
    badRatePct: 1.1
  };

  // Portal del Accionista
  const bookVal = +(Math.max(25, (state.financials.totalEquity || 425000000) / (base.shareholdersPortal.sharesOutstanding || 10000000))).toFixed(2);
  const shareholders = {
    ...base.shareholdersPortal,
    bookValuePerShareHNL: bookVal
  };

  const totalOperationsIncome = atmFeeIncome + agentCommissionIncome + mutualFundFeeIncome + fiduciaryFeeTotal + insuranceIncome + cashMgmt.feeGeneratedHNL - branchTotalOperatingCost - atmMaintenanceTotal;

  const updatedOperations: AdvancedOperationsState = {
    ...base,
    departmentBranches: updatedBranches,
    atmFleet: updatedAtms,
    bankingAgents: updatedAgents,
    subordinatedBonds: updatedBonds,
    sovereignHoldings: updatedSovereign,
    mutualFunds: updatedMutualFunds,
    ifrs9ProvisionsLedger: {
      stage1NormalHNL: stage1,
      stage2WatchlistHNL: stage2,
      stage3ImpairedHNL: stage3,
      totalExpectedLossHNL: totalEcl,
      coverageRatioPct: +(Math.min(180, Math.max(105, (state.financials.loanLossProvisions / Math.max(1, totalEcl)) * 100))).toFixed(1)
    },
    cyberSecurityCenter: cyberSec,
    amlCompliancePortal: aml,
    executiveAlcoMetrics: {
      netInterestMarginNIM: Number(nim),
      costOfFundsPct: +(Math.max(2.5, 4.15 + tpmDelta * 0.5)).toFixed(2),
      efficiencyRatioCIR: Number(cir),
      returnOnEquityROE: +(state.financials.returnOnEquityROE || 16.8).toFixed(1),
      returnOnAssetsROA: +(state.financials.returnOnEquityROE ? state.financials.returnOnEquityROE / 7.8 : 2.15).toFixed(2)
    },
    corporateCashManagement: cashMgmt,
    fiduciaryTrustContracts: updatedTrusts,
    microInsurancePortfolio: updatedInsurance,
    clientChurnPredictor: churnPredictor,
    digitalInstantLoans: digitalInstant,
    shareholdersPortal: shareholders
  };

  return {
    updatedOperations,
    totalOperationsIncome
  };
}

// ------------------------------------------------------------------------------------
// ACCIONES INTERACTIVAS DIRECTAS: 24 CARACTERÍSTICAS
// ------------------------------------------------------------------------------------

/** 1. Expandir o Aperturar Sucursal Departamental */
export function openOrExpandDepartmentBranch(
  state: GameState,
  departmentId: string
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const dept = (current.departmentBranches || []).find(d => d.id === departmentId);
  if (!dept) return { updatedState: state, successMessage: 'Departamento no encontrado.' };

  const cost = dept.expansionCostHNL;
  if (state.financials.cashAndBCHReserves < cost) {
    return { updatedState: state, successMessage: `Liquidez insuficiente para abrir sucursal en ${dept.name} (${formatHNL(cost)} requerido).` };
  }

  const updatedDeptList = current.departmentBranches.map(d => {
    if (d.id === departmentId) {
      return {
        ...d,
        activeBranches: d.activeBranches + 1,
        totalEmployees: d.totalEmployees + 10,
        depositsCollectedHNL: d.depositsCollectedHNL + 75000000,
        loansDisbursedHNL: d.loansDisbursedHNL + 65000000,
        monthlyOperatingCostHNL: d.monthlyOperatingCostHNL + 380000,
        status: 'Operativa' as const
      };
    }
    return d;
  });

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        departmentBranches: updatedDeptList
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - cost,
        fixedAssetsBranches: state.financials.fixedAssetsBranches + cost,
        depositsPublicTotal: state.financials.depositsPublicTotal + 75000000
      }
    },
    successMessage: `¡Nueva sucursal bancaria inaugurada en ${dept.name} (${dept.capitalCity})! Inversión: ${formatHNL(cost)}.`
  };
}

/** 2. Instalar Nuevo Cajero Automático Inteligente (ATM) */
export function installNewAtmUnit(
  state: GameState,
  location: string,
  type: 'Multifunción Smart' | 'Básico Dispensador'
): { updatedState: GameState; successMessage: string } {
  const cost = type === 'Multifunción Smart' ? 650000 : 350000;
  if (state.financials.cashAndBCHReserves < cost) {
    return { updatedState: state, successMessage: 'Liquidez insuficiente para adquirir este cajero.' };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const newAtm: AtmUnit = {
    id: `atm-${Date.now().toString().slice(-4)}`,
    location,
    type,
    cashVaultHNL: type === 'Multifunción Smart' ? 1500000 : 800000,
    maxCapacityHNL: type === 'Multifunción Smart' ? 2500000 : 1200000,
    monthlyTransactions: 5200,
    monthlyFeeIncomeHNL: 104000,
    maintenanceCostHNL: type === 'Multifunción Smart' ? 22000 : 16000,
    uptimePct: 99.7
  };

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        atmFleet: [newAtm, ...(current.atmFleet || [])]
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - cost,
        fixedAssetsBranches: state.financials.fixedAssetsBranches + cost
      }
    },
    successMessage: `Cajero ${type} instalado exitosamente en ${location}. Inversión: ${formatHNL(cost)}.`
  };
}

/** 3. Recargar Efectivo en Bóveda de Cajero ATM */
export function reloadAtmVaultCash(
  state: GameState,
  atmId: string,
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const atm = (current.atmFleet || []).find(a => a.id === atmId);
  if (!atm) return { updatedState: state, successMessage: 'Cajero no encontrado.' };

  if (state.financials.cashAndBCHReserves < amountHNL) {
    return { updatedState: state, successMessage: 'Fondos insuficientes en reservas centrales de caja.' };
  }

  const updatedFleet = current.atmFleet.map(a => {
    if (a.id === atmId) {
      return {
        ...a,
        cashVaultHNL: Math.min(a.maxCapacityHNL, a.cashVaultHNL + amountHNL)
      };
    }
    return a;
  });

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        atmFleet: updatedFleet
      }
    },
    successMessage: `Remesa de ${formatHNL(amountHNL)} cargada exitosamente en la bóveda del cajero ${atm.location}.`
  };
}

/** 4. Afiliar Agente Comunitario "Caja Amiga" */
export function affiliateBankingAgent(
  state: GameState,
  businessName: string,
  department: string,
  services: string[]
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const newAgent = {
    id: `caja-${Date.now().toString().slice(-4)}`,
    businessName,
    department,
    monthlyVolumeHNL: 350000,
    commissionSharedHNL: 12000,
    activeServices: services.length > 0 ? services : ['Depósitos en Efectivo', 'Retiros con Tarjeta', 'Pago de Luz y Agua']
  };

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        bankingAgents: [newAgent, ...(current.bankingAgents || [])]
      }
    },
    successMessage: `¡Nuevo Corresponsal "Caja Amiga" afiliado! ${businessName} en ${department}.`
  };
}

/** 5. Fortalecer Flota de Transporte de Valores Blindados */
export function upgradeArmoredTransportSecurity(
  state: GameState
): { updatedState: GameState; successMessage: string } {
  const cost = 2800000;
  if (state.financials.cashAndBCHReserves < cost) {
    return { updatedState: state, successMessage: 'Liquidez insuficiente para adquirir nueva unidad blindada.' };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        armoredTransportFleet: {
          ...current.armoredTransportFleet,
          armoredTrucksCount: current.armoredTransportFleet.armoredTrucksCount + 1,
          cashInTransitInsuredHNL: current.armoredTransportFleet.cashInTransitInsuredHNL + 30000000,
          monthlyRouteCostHNL: current.armoredTransportFleet.monthlyRouteCostHNL + 35000
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - cost,
        fixedAssetsBranches: state.financials.fixedAssetsBranches + cost
      }
    },
    successMessage: `Camión blindado nivel balístico IV añadido a la flota de transporte de valores. Cobertura asegurada ampliada a ${formatHNL(current.armoredTransportFleet.cashInTransitInsuredHNL + 30000000)}.`
  };
}

/** 6. Habilitar Autobanco o Lounge de Banca Privada */
export function addDriveThruOrLounge(
  state: GameState,
  type: 'autobanco' | 'lounge'
): { updatedState: GameState; successMessage: string } {
  const cost = type === 'autobanco' ? 1200000 : 2500000;
  if (state.financials.cashAndBCHReserves < cost) {
    return { updatedState: state, successMessage: 'Liquidez insuficiente para esta adecuación arquitectónica.' };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const isAutobanco = type === 'autobanco';

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        driveThruLanesCount: isAutobanco ? current.driveThruLanesCount + 1 : current.driveThruLanesCount,
        privateLoungesCount: !isAutobanco ? current.privateLoungesCount + 1 : current.privateLoungesCount
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - cost,
        fixedAssetsBranches: state.financials.fixedAssetsBranches + cost
      }
    },
    successMessage: isAutobanco 
      ? `Carril de Autobanco Express inaugurado para agilizar transacciones vehiculares. Costo: ${formatHNL(cost)}.`
      : `Salón VIP de Banca Privada inaugurado para captación de clientes de alto patrimonio patrimonial. Costo: ${formatHNL(cost)}.`
  };
}

/** 7. Emitir Bonos Subordinados Tier 2 (Mercado de Capitales) */
export function issueSubordinatedBond(
  state: GameState,
  seriesName: string,
  faceValueHNL: number,
  couponRateAnnualPct: number,
  tenorYears: number,
  tierCategory: 'Tier 2 Complementario' | 'Bono Sostenible Verde'
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const newBond: SubordinatedBondEmission = {
    id: `bond-sub-${Date.now().toString().slice(-4)}`,
    seriesName,
    faceValueHNL,
    couponRateAnnualPct,
    tenorYears,
    tierCategory,
    status: 'En Circulación',
    monthsElapsed: 0
  };

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        subordinatedBonds: [newBond, ...(current.subordinatedBonds || [])]
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + faceValueHNL,
        totalEquity: state.financials.totalEquity + (tierCategory === 'Tier 2 Complementario' ? Math.round(faceValueHNL * 0.5) : 0),
        capitalAdequacyRatioCAR: +(state.financials.capitalAdequacyRatioCAR + (faceValueHNL / 100000000)).toFixed(1)
      }
    },
    successMessage: `Emisión de ${seriesName} completada en el Mercado de Valores por ${formatHNL(faceValueHNL)} a ${tenorYears} años (Cupón: ${couponRateAnnualPct}%). CAR fortalecido.`
  };
}

/** 8. Postular Postura en Subasta de Divisas BCH (Mesa Cambiaria USD) */
export function submitFxBchBid(
  state: GameState,
  requestedUSD: number,
  offeredRate: number
): { updatedState: GameState; successMessage: string } {
  const costHNL = Math.round(requestedUSD * offeredRate);
  if (state.financials.cashAndBCHReserves < costHNL) {
    return { updatedState: state, successMessage: `Liquidez en lempiras insuficiente para liquidar esta postura cambiaria (${formatHNL(costHNL)}).` };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const allocationRatio = offeredRate >= state.bch.exchangeRateHNLtoUSD ? 1.0 : 0.75;
  const allocatedUSD = Math.round(requestedUSD * allocationRatio);
  const status: FxAuctionBid['status'] = allocationRatio === 1.0 ? 'Adjudicado' : 'Parcial';

  const newBid: FxAuctionBid = {
    id: `fx-bid-${Date.now().toString().slice(-4)}`,
    bidDate: `Mes ${state.gameMonth}`,
    requestedUSD,
    offeredExchangeRate: offeredRate,
    allocatedUSD,
    status
  };

  const actualCostHNL = Math.round(allocatedUSD * offeredRate);
  const spreadProfitHNL = Math.round(allocatedUSD * 0.12); // Diferencial cambiario en mesa

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        fxBchBids: [newBid, ...(current.fxBchBids || [])]
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + spreadProfitHNL,
        feeIncomeSwiftAndFX: state.financials.feeIncomeSwiftAndFX + spreadProfitHNL
      }
    },
    successMessage: `Subasta de divisas BCH: Postura adjudicada por ${formatUSD(allocatedUSD)} a tipo de cambio L. ${offeredRate}. Margen cambiario devengado: ${formatHNL(spreadProfitHNL)}.`
  };
}

/** 9. Invertir en Títulos Soberanos (Letras BCH o Bonos SEFIN) */
export function investInSovereignAsset(
  state: GameState,
  securityType: 'Letra BCH (LRM)' | 'Bono Soberano SEFIN' | 'Certificado de Absorción',
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  if (state.financials.cashAndBCHReserves < amountHNL) {
    return { updatedState: state, successMessage: 'Liquidez insuficiente para comprar este título soberano.' };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const yieldPct = securityType === 'Letra BCH (LRM)' ? 6.25 : (securityType === 'Bono Soberano SEFIN' ? 7.60 : 5.80);
  const termMonths = securityType === 'Letra BCH (LRM)' ? 9 : (securityType === 'Bono Soberano SEFIN' ? 36 : 6);

  const newAsset: SovereignHolding = {
    id: `sov-${Date.now().toString().slice(-4)}`,
    securityType,
    principalHNL: amountHNL,
    yieldPct,
    termMonthsRemaining: termMonths,
    liquidCollateralRatio: 1.0
  };

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        sovereignHoldings: [newAsset, ...(current.sovereignHoldings || [])]
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - amountHNL,
        secondarySecuritiesValueHNL: (state.financials.secondarySecuritiesValueHNL || 0) + amountHNL
      }
    },
    successMessage: `Inversión formalizada en ${securityType} por ${formatHNL(amountHNL)} a tasa garantizada del ${yieldPct}% anual.`
  };
}

/** 10. Desembolsar Línea de Crédito Multilateral (BCIE o BID Invest) */
export function drawMultilateralLine(
  state: GameState,
  institution: 'BCIE' | 'BID Invest' | 'IFC Banco Mundial',
  amountUSD: number
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const line = (current.multilateralLines || []).find(l => l.institution === institution);
  if (!line) return { updatedState: state, successMessage: 'Línea multilateral no configurada.' };

  const available = line.totalFacilityUSD - line.drawnUSD;
  if (amountUSD > available) {
    return { updatedState: state, successMessage: `Cupo disponible insuficiente en línea de ${institution} ($${available.toLocaleString()} USD restante).` };
  }

  const disbursedHNL = Math.round(amountUSD * state.bch.exchangeRateHNLtoUSD);
  const updatedLines = current.multilateralLines.map(l => {
    if (l.institution === institution) {
      return { ...l, drawnUSD: l.drawnUSD + amountUSD };
    }
    return l;
  });

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        multilateralLines: updatedLines
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + disbursedHNL,
        interbankBorrowingBCH: state.financials.interbankBorrowingBCH + disbursedHNL
      }
    },
    successMessage: `Desembolso de financiamiento multilateral con ${institution} por ${formatUSD(amountUSD)} (${formatHNL(disbursedHNL)}) liquidado en reservas.`
  };
}

/** 11. Suscribir o Promover Fondo Mutuo Áureo */
export function investInMutualFund(
  state: GameState,
  fundId: string,
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const fund = (current.mutualFunds || []).find(f => f.id === fundId);
  if (!fund) return { updatedState: state, successMessage: 'Fondo mutuo no encontrado.' };

  const feeEarned = Math.round(amountHNL * 0.015);
  const updatedFunds = current.mutualFunds.map(f => {
    if (f.id === fundId) {
      return {
        ...f,
        aumHNL: f.aumHNL + amountHNL,
        investorCount: f.investorCount + 12
      };
    }
    return f;
  });

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        mutualFunds: updatedFunds
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + feeEarned,
        feeIncomePensionFunds: state.financials.feeIncomePensionFunds + feeEarned
      }
    },
    successMessage: `Suscripción de ${formatHNL(amountHNL)} captada para el ${fund.fundName}. Comisión de colocación devengada: ${formatHNL(feeEarned)}.`
  };
}

/** 12. Operar Liquidez Overnight en Mercado Interbancario */
export function executeOvernightCall(
  state: GameState,
  direction: 'prestar' | 'tomar',
  amountHNL: number
): { updatedState: GameState; successMessage: string } {
  if (direction === 'prestar' && state.financials.cashAndBCHReserves < amountHNL) {
    return { updatedState: state, successMessage: 'Reservas insuficientes para colocar dinero overnight.' };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const rate = state.bch.tpmRate + 0.35;
  const isLending = direction === 'prestar';

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        overnightInterbankPositions: {
          lentOvernightHNL: isLending ? amountHNL : 0,
          borrowedOvernightHNL: !isLending ? amountHNL : 0,
          weightedRatePct: rate
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: isLending ? state.financials.cashAndBCHReserves - amountHNL : state.financials.cashAndBCHReserves + amountHNL
      }
    },
    successMessage: isLending 
      ? `Se colocaron ${formatHNL(amountHNL)} en Call Overnight a tasa ${rate.toFixed(2)}%.` 
      : `Se tomaron prestados ${formatHNL(amountHNL)} en Call Overnight a tasa ${rate.toFixed(2)}% para balancear encaje.`
  };
}

/** 13. Ejecutar Simulador en Vivo de Pruebas de Estrés CNBS */
export function executeAdvancedStressTest(
  state: GameState,
  scenarioId: 'devaluacion_hnl' | 'sequia_el_nino' | 'shock_tpm_bch' | 'crisis_liquidez_retiros'
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  let simulatedCAR = state.financials.capitalAdequacyRatioCAR;
  let simulatedLCR = state.financials.liquidityCoverageRatioLCR;
  let provAdd = 0;
  let gap = 0;
  let notice = '';
  let sName = '';

  if (scenarioId === 'devaluacion_hnl') {
    sName = 'Choque Cambiario: Devaluación del 8.5% en HNL';
    simulatedCAR = +(simulatedCAR - 1.9).toFixed(1);
    simulatedLCR = +(simulatedLCR - 15.0).toFixed(1);
    provAdd = 18500000;
    gap = simulatedCAR < 10.0 ? Math.round((10.0 - simulatedCAR) * 20000000) : 0;
    notice = 'La devaluación encarece los créditos denominados en USD y el fondeo internacional. Se recomienda cobertura forward obligatoria a importadores.';
  } else if (scenarioId === 'sequia_el_nino') {
    sName = 'Shock Climático: Pérdidas Agrícolas por Fenómeno El Niño';
    simulatedCAR = +(simulatedCAR - 2.8).toFixed(1);
    simulatedLCR = +(simulatedLCR - 22.0).toFixed(1);
    provAdd = 28000000;
    gap = simulatedCAR < 10.0 ? Math.round((10.0 - simulatedCAR) * 35000000) : 0;
    notice = 'Impacto directo en fincas cafetaleras y cultivos de granos básicos en Olancho y Comayagua. Requiere activar fondos de garantía FOHDE.';
  } else if (scenarioId === 'shock_tpm_bch') {
    sName = 'Shock de Tasa: Alza Agresiva de 250 bps en TPM BCH';
    simulatedCAR = +(simulatedCAR - 1.2).toFixed(1);
    simulatedLCR = +(simulatedLCR - 10.0).toFixed(1);
    provAdd = 12000000;
    gap = 0;
    notice = 'Aumento abrupto en el costo de depósitos a plazo fijo. El margen financiero se comprime temporalmente si no se indexa la cartera crediticia.';
  } else {
    sName = 'Crisis de Liquidez: Retiro Masivo del 15% de Depósitos';
    simulatedCAR = +(simulatedCAR - 3.4).toFixed(1);
    simulatedLCR = +(simulatedLCR - 45.0).toFixed(1);
    provAdd = 35000000;
    gap = simulatedCAR < 10.0 ? Math.round((10.0 - simulatedCAR) * 45000000) : 0;
    notice = 'Prueba extrema de corrida bancaria. El banco debe activar la ventanilla de liquidez de última instancia con el BCH empeñando Bonos Soberanos.';
  }

  const result: StressSimulationResult = {
    scenarioId,
    scenarioName: sName,
    simulatedCAR,
    simulatedLCR,
    provAdditionalHNL: provAdd,
    capitalShortfallHNL: gap,
    cnbsRegulatoryNotice: notice,
    executedAtMonth: state.gameMonth
  };

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        lastStressTest: result
      }
    },
    successMessage: `Prueba de estrés simulada: ${sName}. CAR Proyectado: ${simulatedCAR}% (Mínimo CNBS: 10.0%). Brecha de Capital: ${formatHNL(gap)}.`
  };
}

/** 14. Rebalancear Provisiones IFRS 9 por Tramos */
export function rebalanceIfrs9Provisions(
  state: GameState,
  targetCoveragePct: number
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const currentEcl = current.ifrs9ProvisionsLedger.totalExpectedLossHNL;
  const requiredProvisions = Math.round(currentEcl * (targetCoveragePct / 100));
  const provisionDelta = requiredProvisions - state.financials.loanLossProvisions;

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        ifrs9ProvisionsLedger: {
          ...current.ifrs9ProvisionsLedger,
          coverageRatioPct: targetCoveragePct
        }
      },
      financials: {
        ...state.financials,
        loanLossProvisions: requiredProvisions
      }
    },
    successMessage: `Cobertura de provisiones IFRS 9 recalibrada al ${targetCoveragePct}%. Reservas totales constituidas: ${formatHNL(requiredProvisions)}.`
  };
}

/** 15. Blindar Ciberseguridad y Escudo Antifraude */
export function upgradeCyberSecurityFirewall(
  state: GameState
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const currentTier = current.cyberSecurityCenter.securityFirewallTier;
  if (currentTier >= 4) {
    return { updatedState: state, successMessage: 'El banco ya cuenta con el Escudo Máximo de Ciberseguridad Tier 4 (Blindaje Militar).' };
  }

  const cost = currentTier * 1800000;
  if (state.financials.cashAndBCHReserves < cost) {
    return { updatedState: state, successMessage: `Liquidez insuficiente para actualizar firewall (${formatHNL(cost)} requerido).` };
  }

  const nextTier = (currentTier + 1) as 1 | 2 | 3 | 4;

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        cyberSecurityCenter: {
          ...current.cyberSecurityCenter,
          securityFirewallTier: nextTier,
          pciDssComplianceScorePct: +(Math.min(99.9, current.cyberSecurityCenter.pciDssComplianceScorePct + 0.3)).toFixed(1)
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - cost,
        technologyAndMarketingExpense: state.financials.technologyAndMarketingExpense + cost
      }
    },
    successMessage: `Ciberseguridad bancaria actualizada a Tier ${nextTier}. Sistema de prevención de fraude en tiempo real activado.`
  };
}

/** 16. Radicar Inspección AML / Cumplimiento UIF */
export function fileAmlComplianceInspection(
  state: GameState,
  notes: string
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        amlCompliancePortal: {
          ...current.amlCompliancePortal,
          uifReportsSubmitted: current.amlCompliancePortal.uifReportsSubmitted + 1,
          complianceClearanceRatePct: +Math.min(99.9, current.amlCompliancePortal.complianceClearanceRatePct + 0.1).toFixed(1)
        }
      }
    },
    successMessage: `Expediente de cumplimiento contra lavado de activos remitido a la UIF. Dictamen: Conforme. ${notes}`
  };
}

/** 17. Aplicar Ajuste Estratégico de Tasas del Comité ALCO */
export function executeAlcoRateAdjustment(
  state: GameState
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const forecast = current.alcoInterestRateForecast;
  const nimBoostHNL = Math.round(state.financials.totalAssets * (forecast.expectedNIMImprovementBps / 10000 / 12));

  return {
    updatedState: {
      ...state,
      financials: {
        ...state.financials,
        netInterestMargin: state.financials.netInterestMargin + nimBoostHNL,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + nimBoostHNL
      }
    },
    successMessage: `Recomendación ALCO implementada: Tasa activa objetivo ajustada a ${forecast.recommendedActiveRatePct}% y pasiva a ${forecast.recommendedPassiveRatePct}%. Expansión estimada del NIM: +${forecast.expectedNIMImprovementBps} bps.`
  };
}

/** 18. Dispersión Corporativa Cash Management (Planilla y Proveedores) */
export function disperseCorporateCashManagement(
  state: GameState,
  payrollAmountHNL: number,
  suppliersAmountHNL: number
): { updatedState: GameState; successMessage: string } {
  const totalDispersed = payrollAmountHNL + suppliersAmountHNL;
  const feeHNL = Math.round(totalDispersed * 0.0035); // 0.35% comisión por servicio de dispersión masiva
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        corporateCashManagement: {
          ...current.corporateCashManagement,
          monthlyPayrollDispersalsHNL: current.corporateCashManagement.monthlyPayrollDispersalsHNL + payrollAmountHNL,
          supplierPaymentsProcessedHNL: current.corporateCashManagement.supplierPaymentsProcessedHNL + suppliersAmountHNL,
          feeGeneratedHNL: current.corporateCashManagement.feeGeneratedHNL + feeHNL
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + feeHNL,
        feeIncomePayrollServices: state.financials.feeIncomePayrollServices + feeHNL
      }
    },
    successMessage: `Lote de dispersión corporativa procesado por ${formatHNL(totalDispersed)}. Comisión devengada: ${formatHNL(feeHNL)}.`
  };
}

/** 19. Constituir Fideicomiso Bancario Empresarial */
export function createCorporateFiduciaryTrust(
  state: GameState,
  trustName: string,
  settlorClientName: string,
  assetsHNL: number,
  trustType: 'Garantía Crediticia' | 'Administración Inmobiliaria' | 'Pago de Infraestructura'
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const feeOpening = Math.round(assetsHNL * 0.004);
  const monthlyFee = Math.round(assetsHNL * 0.0006);

  const newTrust: CorporateTrustContract = {
    id: `fidei-${Date.now().toString().slice(-4)}`,
    trustName,
    settlorClientName,
    fiduciaryAssetsHNL: assetsHNL,
    trustType,
    monthlyFiduciaryFeeHNL: monthlyFee,
    activeBeneficiariesCount: 8
  };

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        fiduciaryTrustContracts: [newTrust, ...(current.fiduciaryTrustContracts || [])]
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + feeOpening,
        totalFeeIncome: state.financials.totalFeeIncome + feeOpening
      }
    },
    successMessage: `Fideicomiso ${trustType} constituido para ${trustName} (${settlorClientName}) por ${formatHNL(assetsHNL)}. Honorario de estructuración: ${formatHNL(feeOpening)}.`
  };
}

/** 20. Afiliar Lote de Microseguros Populares */
export function enrollMicroInsuranceBatch(
  state: GameState,
  productId: string,
  newPoliciesCount: number
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const prod = (current.microInsurancePortfolio || []).find(p => p.id === productId);
  if (!prod) return { updatedState: state, successMessage: 'Producto de microseguro no encontrado.' };

  const premiumIncome = newPoliciesCount * prod.monthlyPremiumHNL;
  const updatedProds = current.microInsurancePortfolio.map(p => {
    if (p.id === productId) {
      return {
        ...p,
        activePolicies: p.activePolicies + newPoliciesCount
      };
    }
    return p;
  });

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        microInsurancePortfolio: updatedProds
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves + premiumIncome,
        totalFeeIncome: state.financials.totalFeeIncome + premiumIncome
      }
    },
    successMessage: `Se emitieron ${newPoliciesCount.toLocaleString()} nuevas pólizas del ${prod.productName}. Primas recaudadas: ${formatHNL(premiumIncome)}.`
  };
}

/** 21. Lanzar Campaña de Retención y Fidelización NPS */
export function launchRetentionCampaign(
  state: GameState,
  budgetHNL: number
): { updatedState: GameState; successMessage: string } {
  if (state.financials.cashAndBCHReserves < budgetHNL) {
    return { updatedState: state, successMessage: 'Fondos insuficientes para la campaña publicitaria.' };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const savedClients = Math.round(budgetHNL / 25000);

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        clientChurnPredictor: {
          ...current.clientChurnPredictor,
          overallNPSScore: Math.min(95, current.clientChurnPredictor.overallNPSScore + 4),
          highRiskChurnClientsCount: Math.max(0, current.clientChurnPredictor.highRiskChurnClientsCount - savedClients),
          activeLoyaltyCampaignsCount: current.clientChurnPredictor.activeLoyaltyCampaignsCount + 1
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - budgetHNL,
        technologyAndMarketingExpense: state.financials.technologyAndMarketingExpense + budgetHNL
      }
    },
    successMessage: `Campaña de retención activada con inversión de ${formatHNL(budgetHNL)}. Score NPS sube a ${Math.min(95, current.clientChurnPredictor.overallNPSScore + 4)} puntos.`
  };
}

/** 22. Desembolsar Préstamos Digitales Instantáneos con Firma Biométrica */
export function disburseDigitalInstantLoanBatch(
  state: GameState,
  count: number,
  totalHNL: number
): { updatedState: GameState; successMessage: string } {
  if (state.financials.cashAndBCHReserves < totalHNL) {
    return { updatedState: state, successMessage: 'Liquidez insuficiente para fondear este lote digital.' };
  }

  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const feeEarned = Math.round(totalHNL * 0.02);

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        digitalInstantLoans: {
          ...current.digitalInstantLoans,
          disbursedThisMonthCount: current.digitalInstantLoans.disbursedThisMonthCount + count,
          totalDisbursedHNL: current.digitalInstantLoans.totalDisbursedHNL + totalHNL
        }
      },
      financials: {
        ...state.financials,
        cashAndBCHReserves: state.financials.cashAndBCHReserves - totalHNL + feeEarned,
        loanPortfolioCurrent: state.financials.loanPortfolioCurrent + totalHNL,
        totalFeeIncome: state.financials.totalFeeIncome + feeEarned
      }
    },
    successMessage: `Lote de ${count} créditos digitales desembolsados en menos de 3 minutos por ${formatHNL(totalHNL)}. Comisión de apertura: ${formatHNL(feeEarned)}.`
  };
}

/** 23. Simular Política de Dividendos para el Portal de Accionistas */
export function simulateDividendDistribution(
  state: GameState,
  dividendPayoutRatioPct: number
): { updatedState: GameState; successMessage: string } {
  const current = state.advancedOperations || INITIAL_ADVANCED_OPERATIONS;
  const netProfit = state.financials.currentMonthProfit || 15000000;
  const totalDividendHNL = Math.round(netProfit * (dividendPayoutRatioPct / 100));
  const perShare = +(totalDividendHNL / current.shareholdersPortal.sharesOutstanding).toFixed(2);
  const retainedPct = 100 - dividendPayoutRatioPct;

  return {
    updatedState: {
      ...state,
      advancedOperations: {
        ...current,
        shareholdersPortal: {
          ...current.shareholdersPortal,
          declaredDividendPerShareHNL: perShare,
          retainedEarningsRatioPct: retainedPct
        }
      }
    },
    successMessage: `Política de dividendos proyectada para Asamblea: Payout ${dividendPayoutRatioPct}% (${formatHNL(perShare)} por acción). Reinversión de utilidades retenidas: ${retainedPct}%.`
  };
}

// ------------------------------------------------------------------------------------
// MOTOR REACTIVO EN TIEMPO REAL: SANDBOX MACROECONÓMICO, FISCAL Y SCORING CNBS
// ------------------------------------------------------------------------------------

/**
 * Aplica en tiempo real cualquier modificación en los parámetros del Sandbox Financiero,
 * recalculando simultáneamente el balance general, encaje BCH, impuestos SAR, provisiones
 * y solvencia de capital en toda la aplicación.
 */
export function updateFinancialSandboxConfig(
  state: GameState,
  newConfig: Partial<FinancialSandboxConfig>
): GameState {
  const current = state.financialSandbox || INITIAL_FINANCIAL_SANDBOX;
  const merged: FinancialSandboxConfig = {
    macro: { ...current.macro, ...(newConfig.macro || {}) },
    fiscalSar: { ...current.fiscalSar, ...(newConfig.fiscalSar || {}) },
    bankAlco: { ...current.bankAlco, ...(newConfig.bankAlco || {}) },
    creditScoringCnbs: { ...current.creditScoringCnbs, ...(newConfig.creditScoringCnbs || {}) },
    lastAppliedTimestamp: Date.now(),
    realtimeReactivityActive: newConfig.realtimeReactivityActive ?? current.realtimeReactivityActive
  };

  // 1. Cascada inmediata a Tickers e Indicadores del Banco Central de Honduras (BCH)
  const updatedBch = {
    ...state.bch,
    tpmRate: merged.macro.tpmRatePct,
    interannualInflation: merged.macro.interannualInflationPct,
    exchangeRateHNLtoUSD: merged.macro.exchangeRateUsdHnl,
    reserveRequirementPct: merged.macro.reserveReqPct
  };

  // 2. Cascada inmediata a Encaje Legal Requerido en BCH
  const requiredReserves = Math.round(state.financials.depositsPublicTotal * (merged.macro.reserveReqPct / 100));

  // 3. Recálculo impositivo según SAR (ISR 25% + Aportación Solidaria 5%)
  const approxOperatingIncome = Math.round(Math.max(10000000, state.financials.currentMonthProfit / 0.70));
  let recalculatedNetProfit = state.financials.currentMonthProfit;
  if (approxOperatingIncome > 0) {
    const isr = Math.round(approxOperatingIncome * (merged.fiscalSar.isrRatePct / 100));
    const taxableOver1M = Math.max(0, approxOperatingIncome - Math.round(1000000 / 12));
    const solidaria = Math.round(taxableOver1M * (merged.fiscalSar.aportacionSolidariaPct / 100));
    recalculatedNetProfit = approxOperatingIncome - isr - solidaria;
  }

  // 4. Modelo de Scoring Crediticio CNBS (Resolución 284/2003): Reclasificación dinámica
  const scoreThreshold = merged.creditScoringCnbs.minBureauScoreThreshold;
  const dtiMax = merged.creditScoringCnbs.maxDtiAllowedPct;
  const arrearsLossTrigger = merged.creditScoringCnbs.categoryVArrearsDaysTrigger;

  const updatedClients = state.clients.map(client => {
    let cnbsCat = client.cnbsCategory;
    if (client.pastDueDays >= arrearsLossTrigger) {
      cnbsCat = 'V - Pérdida';
    } else if (client.pastDueDays >= 90) {
      cnbsCat = 'IV - Dudoso Recaudo';
    } else if (client.pastDueDays >= 60) {
      cnbsCat = 'III - Subnormal';
    } else if (client.pastDueDays > 0 || client.equifaxScore < scoreThreshold) {
      cnbsCat = 'II - Especial';
    } else {
      cnbsCat = 'I - Normal';
    }
    return { ...client, cnbsCategory: cnbsCat };
  });

  // 5. Provisiones IFRS 9 dinámicas según tramos CNBS
  let calculatedProvisions = 0;
  updatedClients.forEach(c => {
    if (c.hasLoan && c.loanBalanceHNL > 0) {
      if (c.cnbsCategory === 'V - Pérdida') calculatedProvisions += c.loanBalanceHNL * 1.0;
      else if (c.cnbsCategory === 'IV - Dudoso Recaudo') calculatedProvisions += c.loanBalanceHNL * 0.50;
      else if (c.cnbsCategory === 'III - Subnormal') calculatedProvisions += c.loanBalanceHNL * 0.20;
      else if (c.cnbsCategory === 'II - Especial') calculatedProvisions += c.loanBalanceHNL * 0.05;
      else calculatedProvisions += c.loanBalanceHNL * 0.01;
    }
  });

  // 6. Solvencia CAR con buffer ALCO
  const totalAssets = state.financials.totalAssets;
  const baseCAR = +((state.financials.totalEquity / (totalAssets * 0.72)) * 100).toFixed(2);
  const adjustedCAR = +(baseCAR + (merged.bankAlco.minTier1CarBufferPct * 0.1)).toFixed(2);

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    requiredReserveAmount: requiredReserves,
    currentMonthProfit: recalculatedNetProfit,
    loanLossProvisions: Math.round(calculatedProvisions),
    capitalAdequacyRatioCAR: adjustedCAR
  };

  return {
    ...state,
    bch: updatedBch,
    financials: updatedFinancials,
    clients: updatedClients,
    financialSandbox: merged
  };
}

/**
 * Actualiza la política de dividendos para el año fiscal 2026,
 * recalculando el payout, DPS, dividend yield y el impacto en Capital Tier 1.
 */
export function updateCurrentYearDividendPolicy(
  state: GameState,
  targetPayoutPct: number
): GameState {
  const currentGov = state.dividendGovernance || INITIAL_DIVIDEND_GOVERNANCE;
  const clampedPayout = Math.max(10, Math.min(90, targetPayoutPct));

  // Utilidad neta anualizada estimada para 2026
  const annualizedProfit2026 = Math.max(
    380000000, 
    Math.round(state.financials.currentMonthProfit * 12)
  );

  const proposedCashDividend = Math.round(annualizedProfit2026 * (clampedPayout / 100));
  const retainedTier1 = annualizedProfit2026 - proposedCashDividend;
  const dps = +(proposedCashDividend / 10000000).toFixed(2);
  const bookValue = +(state.financials.totalEquity / 10000000).toFixed(2);
  const dividendYield = +( (dps / Math.max(1, bookValue)) * 100 ).toFixed(1);
  const expectedCarImpact = +( (retainedTier1 / state.financials.totalAssets) * 10 ).toFixed(1);

  const updatedRecord2026: FiscalYearDividendRecord = {
    fiscalYear: 2026,
    netIncomeAuditHNL: annualizedProfit2026,
    dividendCashDistributedHNL: proposedCashDividend,
    retainedTier1HNL: retainedTier1,
    payoutRatioPct: clampedPayout,
    sharesCount: 10000000,
    dividendPerShareHNL: dps,
    bookValuePerShareHNL: bookValue,
    dividendYieldPct: dividendYield,
    carClosingPct: +(state.financials.capitalAdequacyRatioCAR + (retainedTier1 > 150000000 ? 0.3 : 0.1)).toFixed(1),
    governanceAuditorOpinion: 'Favorable sin Salvedades',
    rankingPosition: 1
  };

  const updated10Years = currentGov.historical10Years.map(rec => 
    rec.fiscalYear === 2026 ? updatedRecord2026 : rec
  );

  // Re-calcular ranking por monto de dividendo desembolsado
  const sorted = [...updated10Years].sort((a, b) => b.dividendCashDistributedHNL - a.dividendCashDistributedHNL);
  const ranked10Years = updated10Years.map(rec => {
    const rank = sorted.findIndex(s => s.fiscalYear === rec.fiscalYear) + 1;
    return { ...rec, rankingPosition: rank };
  });

  const totalDividends = ranked10Years.reduce((sum, r) => sum + r.dividendCashDistributedHNL, 0);
  const avgPayout = +(ranked10Years.reduce((sum, r) => sum + r.payoutRatioPct, 0) / ranked10Years.length).toFixed(1);
  const totalRetained = ranked10Years.reduce((sum, r) => sum + r.retainedTier1HNL, 0);

  return {
    ...state,
    dividendGovernance: {
      ...currentGov,
      historical10Years: ranked10Years,
      currentYearPolicy2026: {
        ...currentGov.currentYearPolicy2026,
        targetPayoutPct: clampedPayout,
        proposedCashDividendHNL: proposedCashDividend,
        retainedCapitalTier1HNL: retainedTier1,
        expectedCarImpactPct: expectedCarImpact
      },
      totalHistoricalDividendsHNL: totalDividends,
      avgHistoricalPayoutPct: avgPayout,
      accumulatedTier1RetainedHNL: totalRetained
    }
  };
}

/**
 * Procesa la evolución mensual de las 24 Mejoras Estratégicas Institucionales:
 * Actualiza el progreso de hitos de desbloqueo, acumula el beneficio neto mensual
 * y actualiza los indicadores clave.
 */
export function advanceStrategicImprovementsMonth(
  state: GameState,
  nextMonth: number,
  totalAssets: number,
  car: number,
  npl: number
): {
  updatedImprovements: StrategicImprovementsState;
  totalProfitBoostHNL: number;
  totalOpexHNL: number;
} {
  const current = state.strategicImprovements || INITIAL_STRATEGIC_IMPROVEMENTS;
  const totalClients = Object.values(state.divisions).reduce((sum, d) => sum + (d.clientCount || 0), 0);

  let totalProfitBoostHNL = 0;
  let totalOpexHNL = 0;

  const updatedItems = current.items.map(item => {
    let milestone = item.unlockMilestone;
    if (milestone) {
      let currentVal = milestone.currentValue;
      if (milestone.metricType === 'gameMonth') {
        currentVal = nextMonth;
      } else if (milestone.metricType === 'totalAssets') {
        currentVal = totalAssets;
      } else if (milestone.metricType === 'car') {
        currentVal = car;
      } else if (milestone.metricType === 'clientsCount') {
        currentVal = totalClients;
      } else if (milestone.metricType === 'nplRatio') {
        currentVal = npl;
      }

      const isAchieved = milestone.metricType === 'nplRatio' 
        ? currentVal <= milestone.targetValue 
        : currentVal >= milestone.targetValue;

      milestone = {
        ...milestone,
        currentValue: currentVal,
        isAchieved: milestone.isAchieved || isAchieved
      };
    }

    if (item.status === 'active') {
      totalProfitBoostHNL += item.monthlyProfitBoostHNL;
      totalOpexHNL += item.monthlyOpexHNL;
    }

    return {
      ...item,
      unlockMilestone: milestone
    };
  });

  return {
    updatedImprovements: {
      ...current,
      items: updatedItems,
      totalMonthlyOpexHNL: totalOpexHNL,
      totalMonthlyProfitBoostHNL: totalProfitBoostHNL
    },
    totalProfitBoostHNL,
    totalOpexHNL
  };
}

/**
 * Activa o pausa una mejora estratégica del banco según el modo seleccionado:
 * - formal_board: Deduce el CAPEX en efectivo, lo capitaliza en activos fijos y ajusta CAR.
 * - sandbox_instant: Conmutación en tiempo real sin deducción de caja para simulaciones.
 * - milestone_unlock: Activación tras haber alcanzado el hito institucional regulatorio.
 */
export function toggleStrategicImprovement(
  state: GameState,
  improvementId: string,
  mode?: StrategicActivationMode
): { updatedState: GameState; successMessage: string } {
  const improvementsState = state.strategicImprovements || INITIAL_STRATEGIC_IMPROVEMENTS;
  const item = improvementsState.items.find(i => i.id === improvementId);
  if (!item) {
    return { updatedState: state, successMessage: 'Mejora estratégica no encontrada' };
  }

  const effectiveMode = mode || improvementsState.interactionMode;
  const isActivating = item.status !== 'active';

  if ((effectiveMode === 'milestone_unlocked' || effectiveMode === 'milestone_unlock') && isActivating && item.unlockMilestone && !item.unlockMilestone.isAchieved) {
    return {
      updatedState: state,
      successMessage: `Requisito no cumplido: ${item.unlockMilestone.description} (Objetivo: ${item.unlockMilestone.targetValue}, Actual: ${item.unlockMilestone.currentValue}).`
    };
  }

  if (effectiveMode === 'formal_board' && isActivating) {
    if (state.financials.cashAndBCHReserves < item.capexCostHNL) {
      return {
        updatedState: state,
        successMessage: `Liquidez insuficiente: Se requiere ${formatHNL(item.capexCostHNL)} de CAPEX disponible, pero las reservas de caja son ${formatHNL(state.financials.cashAndBCHReserves)}.`
      };
    }
  }

  const updatedFinancials = { ...state.financials };

  if (effectiveMode === 'formal_board') {
    if (isActivating) {
      updatedFinancials.cashAndBCHReserves -= item.capexCostHNL;
      updatedFinancials.fixedAssetsBranches += item.capexCostHNL;
      updatedFinancials.capitalAdequacyRatioCAR = +(updatedFinancials.capitalAdequacyRatioCAR + (item.carImpactBps / 100)).toFixed(2);
    } else {
      updatedFinancials.capitalAdequacyRatioCAR = Math.max(10.0, +(updatedFinancials.capitalAdequacyRatioCAR - (item.carImpactBps / 100)).toFixed(2));
    }
  } else if (effectiveMode === 'sandbox_instant') {
    if (isActivating) {
      updatedFinancials.capitalAdequacyRatioCAR = +(updatedFinancials.capitalAdequacyRatioCAR + (item.carImpactBps / 100)).toFixed(2);
    } else {
      updatedFinancials.capitalAdequacyRatioCAR = Math.max(10.0, +(updatedFinancials.capitalAdequacyRatioCAR - (item.carImpactBps / 100)).toFixed(2));
    }
  }

  const updatedItems = improvementsState.items.map(it => {
    if (it.id === improvementId) {
      return {
        ...it,
        status: isActivating ? ('active' as const) : ('inactive' as const),
        activationMode: effectiveMode
      };
    }
    return it;
  });

  const activeItems = updatedItems.filter(it => it.status === 'active');
  const totalCapex = activeItems.reduce((acc, it) => acc + it.capexCostHNL, 0);
  const totalOpex = activeItems.reduce((acc, it) => acc + it.monthlyOpexHNL, 0);
  const totalBoost = activeItems.reduce((acc, it) => acc + it.monthlyProfitBoostHNL, 0);

  const updatedImprovements: StrategicImprovementsState = {
    ...improvementsState,
    items: updatedItems,
    totalCapexInvestedHNL: totalCapex,
    totalMonthlyOpexHNL: totalOpex,
    totalMonthlyProfitBoostHNL: totalBoost
  };

  const actionVerb = isActivating ? 'activada con éxito' : 'pausada';
  const modeLabel = effectiveMode === 'formal_board' 
    ? 'Aprobación formal de Junta Directiva (CAPEX/OPEX)' 
    : effectiveMode === 'sandbox_instant' 
      ? 'Sandbox Interactivo en Tiempo Real' 
      : 'Desbloqueo por Cumplimiento de Hito Institucional';

  const successMessage = `Mejora #${item.number} "${item.title}" ${actionVerb} mediante ${modeLabel}. Retorno neto mensual estimado: ${formatHNL(item.monthlyProfitBoostHNL - item.monthlyOpexHNL)}.`;

  return {
    updatedState: {
      ...state,
      financials: updatedFinancials,
      strategicImprovements: updatedImprovements
    },
    successMessage
  };
}

export function setStrategicInteractionMode(
  state: GameState,
  mode: StrategicActivationMode
): GameState {
  const current = state.strategicImprovements || INITIAL_STRATEGIC_IMPROVEMENTS;
  return {
    ...state,
    strategicImprovements: {
      ...current,
      interactionMode: mode
    }
  };
}

export function setStrategicFilter(
  state: GameState,
  filter: StrategicImprovementPillar | 'all'
): GameState {
  const current = state.strategicImprovements || INITIAL_STRATEGIC_IMPROVEMENTS;
  return {
    ...state,
    strategicImprovements: {
      ...current,
      activeFilter: filter
    }
  };
}

export function checkAndUnlockMilestones(state: GameState): GameState {
  const current = state.strategicImprovements || INITIAL_STRATEGIC_IMPROVEMENTS;
  const totalAssets = state.financials.totalAssets;
  const car = state.financials.capitalAdequacyRatioCAR;
  const npl = state.financials.delinquencyRatioNPL;
  const totalClients = Object.values(state.divisions).reduce((sum, d) => sum + (d.clientCount || 0), 0);

  const updatedItems = current.items.map(item => {
    if (!item.unlockMilestone) return item;
    let currentVal = item.unlockMilestone.currentValue;
    if (item.unlockMilestone.metricType === 'gameMonth') currentVal = state.gameMonth;
    else if (item.unlockMilestone.metricType === 'totalAssets') currentVal = totalAssets;
    else if (item.unlockMilestone.metricType === 'car') currentVal = car;
    else if (item.unlockMilestone.metricType === 'clientsCount') currentVal = totalClients;
    else if (item.unlockMilestone.metricType === 'nplRatio') currentVal = npl;

    const isAchieved = item.unlockMilestone.metricType === 'nplRatio' 
      ? currentVal <= item.unlockMilestone.targetValue 
      : currentVal >= item.unlockMilestone.targetValue;

    return {
      ...item,
      unlockMilestone: {
        ...item.unlockMilestone,
        currentValue: currentVal,
        isAchieved: item.unlockMilestone.isAchieved || isAchieved
      }
    };
  });

  return {
    ...state,
    strategicImprovements: {
      ...current,
      items: updatedItems
    }
  };
}

// ============================================================================
// CENTRO GLOBAL DE PREVENCIÓN DE FRAUDES, LAVADO DE ACTIVOS (AML/CFT) Y REPORTES UIF
// ============================================================================

export function advanceAmlComplianceMonth(state: GameState, nextMonth: number): AmlComplianceState {
  const current = state.amlCompliance || INITIAL_AML_COMPLIANCE;
  const newTransactionsScreened = Math.floor(32000 + Math.random() * 8000);
  const additionalSuspiciousVol = Math.floor(1200000 + Math.random() * 1800000);

  // Generación condicional de nuevas alertas heurísticas conforme avanzan los meses
  const rawAlerts = Array.isArray(current.alerts) ? current.alerts : (Array.isArray(current.transactionAlerts) ? current.transactionAlerts : (INITIAL_AML_COMPLIANCE.alerts || []));
  let alerts = [...rawAlerts];

  if (nextMonth === 2 && !alerts.some(a => a.id === 'aml-alt-07')) {
    alerts.unshift({
      id: 'aml-alt-07',
      clientId: 'CLI-PYM-03',
      ticketCode: 'AML-2026-CHOL-09',
      clientName: 'Agroinsumos del Aguan S. de R.L.',
      clientRtn: '0501-9018-882190',
      clientRtnOrId: '0501-9018-882190',
      division: 'pyme',
      type: 'rapid_movement',
      alertType: 'rapid_movement',
      severity: 'alta',
      amountHNL: 3850000,
      involvedAmountHNL: 3850000,
      amountUSD: 155000,
      originCountry: 'Honduras (Tocoa)',
      destinationCountry: 'Extranjero (Exchange Cripto P2P)',
      status: 'en_analisis',
      detectedMonth: nextMonth,
      detectedAtMonth: nextMonth,
      description: 'Transferencias rápidas recibidas de múltiples cuentas personales en Tocoa y desvío inmediato hacia cuenta de criptoactivos no registrada.',
      triggerHeuristic: 'Incompatibilidad de flujo comercial agrícola con destino en exchange P2P extranjero.',
      recommendedAction: 'Solicitar facturas de venta gravadas por SAR e inmovilizar saldo de salida.',
      riskScore: 68,
      evidenceNotes: ['Flujo rápido sin justificación comercial.', 'Desvío hacia plataforma no regulada.'],
      isAccountFrozen: false
    });
  } else if (nextMonth === 3 && !alerts.some(a => a.id === 'aml-alt-08')) {
    alerts.unshift({
      id: 'aml-alt-08',
      clientId: 'CLI-CORP-04',
      ticketCode: 'AML-2026-TGU-12',
      clientName: 'Consorcio Vial Maya Honduras',
      clientRtn: '0801-9003-124991',
      clientRtnOrId: '0801-9003-124991',
      division: 'corporativa',
      type: 'pep_high_risk',
      alertType: 'pep_high_risk',
      severity: 'critica',
      amountHNL: 14200000,
      involvedAmountHNL: 14200000,
      amountUSD: 572000,
      originCountry: 'Honduras (Fideicomiso Público)',
      destinationCountry: 'Honduras (Cuentas Personales Familiares PEP)',
      status: 'en_analisis',
      detectedMonth: nextMonth,
      detectedAtMonth: nextMonth,
      description: 'Anticipo de contrato de obra pública transferido a cuentas personales de familiares de ex-funcionario de infraestructura.',
      triggerHeuristic: 'Cruce con base de datos de Personas Expuestas Políticamente (PEP) y beneficiarios finales opacos.',
      recommendedAction: 'Elevar a Oficial de Cumplimiento Titular para emisión inmediata de ROS ante la UIF.',
      riskScore: 84,
      evidenceNotes: ['Familiar de primer grado de consanguinidad de PEP.', 'Contrato público objetado por el Tribunal Superior de Cuentas.'],
      isAccountFrozen: false
    });
  }

  // Recalcular montos congelados basados en clientes reales
  const frozenClients = (state.clients || []).filter(c => c.isFrozen);
  const calculatedFrozenFunds = frozenClients.reduce((sum, c) => sum + (c.accountBalanceHNL || 0), 0);
  const calculatedFrozenAccounts = Math.max(current.frozenAccountsCount || 0, frozenClients.length);

  const prevScreened = current.totalScreenedTransactionsMonth || current.monthlyScreenedTransactionsCount || 124500;
  const prevSuspicious = current.totalSuspiciousVolumeHNL || current.suspiciousActivityVolumeHNL || 48555500;
  const prevFrozenFunds = calculatedFrozenFunds > 0 ? calculatedFrozenFunds : (current.totalFrozenFundsHNL || current.frozenFundsTotalHNL || 11928000);
  const uifList = current.uifReports || current.historicalUifReports || INITIAL_AML_COMPLIANCE.uifReports || [];

  // Ciclo procesal formal de expedientes UIF (Resolución en 1 a 2 meses)
  let totalResolvedCount = current.totalResolvedUifCasesCount || 0;
  let totalForfeitedHNL = current.totalForfeitedToOabiHNL || 0;

  const updatedUifReports = uifList.map(r => {
    if (r.rulingOutcome && r.rulingOutcome !== 'Pendiente') {
      return r;
    }

    const currentRem = r.monthsUntilResolution !== undefined ? r.monthsUntilResolution : 2;
    if (currentRem > 1) {
      return {
        ...r,
        monthsUntilResolution: currentRem - 1,
        uifCaseStatus: 'En Investigación Fiscal' as const,
        status: 'investigacion_fiscal'
      };
    } else if (currentRem === 1) {
      totalResolvedCount++;
      let outcome: 'Decomiso OABI' | 'Desestimado por Justificación' | 'Sanción Ratificada' = 'Decomiso OABI';
      let details = '';
      let statusCase: UifReportDossier['uifCaseStatus'] = 'Bloqueo Judicial Ratificado';

      if (r.typology === 'ofac_onu_match' || r.typology === 'pitufeo_structuring') {
        outcome = 'Decomiso OABI';
        statusCase = 'Bloqueo Judicial Ratificado';
        details = `Juzgado de Letras de Privación de Dominio ratificó extinción de dominio sobre ${formatHNL(r.totalFlaggedAmountHNL)}. Fondos transferidos a la OABI conforme al Decreto 144-2014.`;
        totalForfeitedHNL += r.totalFlaggedAmountHNL;
      } else if (r.typology === 'pep_high_risk' || r.typology === 'shell_company') {
        outcome = 'Sanción Ratificada';
        statusCase = 'Bloqueo Judicial Ratificado';
        details = `CNBS y UIF ratificaron sanción legal grave. Cierre forzoso de cuenta y remisión penal al Ministerio Público.`;
      } else {
        outcome = 'Desestimado por Justificación';
        statusCase = 'Enviado a UIF/CNBS';
        details = `FESCCO y analistas de la UIF admitieron soporte documental tributario SAR. Proceso archivado y levantamiento de alertas.`;
      }

      return {
        ...r,
        monthsUntilResolution: 0,
        rulingOutcome: outcome,
        rulingDetails: details,
        rulingMonth: nextMonth,
        uifCaseStatus: statusCase,
        status: 'dictamen_final_emitido'
      };
    }
    return r;
  });

  return {
    ...current,
    alerts,
    transactionAlerts: alerts,
    uifReports: updatedUifReports,
    historicalUifReports: updatedUifReports,
    totalScreenedTransactionsMonth: prevScreened + newTransactionsScreened,
    monthlyScreenedTransactionsCount: prevScreened + newTransactionsScreened,
    totalSuspiciousVolumeHNL: prevSuspicious + additionalSuspiciousVol,
    suspiciousActivityVolumeHNL: prevSuspicious + additionalSuspiciousVol,
    frozenAccountsCount: calculatedFrozenAccounts,
    totalFrozenFundsHNL: prevFrozenFunds,
    frozenFundsTotalHNL: prevFrozenFunds,
    ofacMatchesBlockedCount: current.ofacMatchesBlockedCount || 3,
    autoStructuringRulesActive: true,
    pepStrictMonitoringActive: true,
    riskThresholdScore: current.riskThresholdScore || 75,
    complianceAuditRatingScore: current.complianceAuditRatingScore || 94.5,
    uifReportsFiledCount: updatedUifReports.length,
    totalResolvedUifCasesCount: totalResolvedCount,
    totalForfeitedToOabiHNL: totalForfeitedHNL
  };
}

/** Congelar cuenta de un cliente bajo orden UIF / Decreto 144-2014 */
export function freezeClientAccount(
  state: GameState,
  clientIdOrAlertId: string,
  reason: string = 'Inmovilización preventiva por indicios de lavado de activos (Decreto 144-2014)'
): { updatedState: GameState; successMessage: string } {
  const currentAml = state.amlCompliance || INITIAL_AML_COMPLIANCE;
  const baseAlerts = currentAml.alerts || currentAml.transactionAlerts || INITIAL_AML_COMPLIANCE.alerts || [];

  let targetClient = state.clients.find(c => c.id === clientIdOrAlertId || c.rtn === clientIdOrAlertId || c.cif === clientIdOrAlertId);

  // Si no se encuentra directo por clientId, buscar si coincide con alguna alerta AML
  const linkedAlert = baseAlerts.find(a => a.id === clientIdOrAlertId || a.clientRtn === clientIdOrAlertId || a.clientRtnOrId === clientIdOrAlertId || a.clientName === clientIdOrAlertId || a.clientId === clientIdOrAlertId);
  if (!targetClient && linkedAlert) {
    targetClient = state.clients.find(c => c.id === linkedAlert.clientId || c.rtn === linkedAlert.clientRtn || c.rtn === linkedAlert.clientRtnOrId || c.name.toLowerCase() === linkedAlert.clientName.toLowerCase());
  }

  const clientName = targetClient ? targetClient.name : (linkedAlert ? linkedAlert.clientName : 'Titular de Cuenta');
  const frozenAmount = targetClient ? targetClient.accountBalanceHNL : (linkedAlert ? (linkedAlert.amountHNL || linkedAlert.involvedAmountHNL || 0) : 0);

  // Actualizar clientes
  const updatedClients = state.clients.map(c => {
    if (targetClient && c.id === targetClient.id) {
      return {
        ...c,
        isFrozen: true,
        frozenReason: reason,
        amlStatus: 'congelada_uif' as const,
        notes: `${c.notes || ''} [CUENTA CONGELADA POR ORDEN UIF/CNBS en Mes ${state.gameMonth}]`
      };
    }
    return c;
  });

  // Actualizar alertas asociadas
  const updatedAlerts = baseAlerts.map(a => {
    if (a.id === clientIdOrAlertId || (targetClient && (a.clientId === targetClient.id || a.clientRtn === targetClient.rtn || a.clientRtnOrId === targetClient.rtn || a.clientName.toLowerCase() === targetClient.name.toLowerCase()))) {
      return {
        ...a,
        status: 'congelada' as const,
        isAccountFrozen: true,
        assignedInvestigator: 'Oficial de Cumplimiento Titular'
      };
    }
    return a;
  });

  const updatedFrozenCount = (currentAml.frozenAccountsCount || 0) + 1;
  const updatedFrozenFunds = (currentAml.totalFrozenFundsHNL || currentAml.frozenFundsTotalHNL || 0) + frozenAmount;

  const updatedAml: AmlComplianceState = {
    ...currentAml,
    alerts: updatedAlerts,
    transactionAlerts: updatedAlerts,
    frozenAccountsCount: updatedFrozenCount,
    totalFrozenFundsHNL: updatedFrozenFunds,
    frozenFundsTotalHNL: updatedFrozenFunds,
    complianceAuditRatingScore: +Math.min(99.8, (currentAml.complianceAuditRatingScore || 94.5) + 0.4).toFixed(1)
  };

  const newNotification: GameEventNotification = {
    id: `notif-freeze-${Date.now()}`,
    month: state.gameMonth,
    year: state.bch.year,
    type: 'regulatory_alert',
    title: `Inmovilización Judicial de Fondos: ${clientName}`,
    message: `Se aplicó congelamiento preventivo sobre la cuenta de ${clientName} por ${formatHNL(frozenAmount)}. Motivo: ${reason}.`,
    impactSummary: `Fondos en custodia judicial: ${formatHNL(frozenAmount)} · Cumplimiento UIF al 100%`
  };

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      amlCompliance: updatedAml,
      notifications: [newNotification, ...state.notifications]
    },
    successMessage: `Cuenta de ${clientName} inmovilizada exitosamente conforme al Decreto 144-2014. Fondos retenidos: ${formatHNL(frozenAmount)}.`
  };
}

/** Descongelar cuenta tras descargo legal y resolución favorable */
export function unfreezeClientAccount(
  state: GameState,
  clientIdOrAlertId: string
): { updatedState: GameState; successMessage: string } {
  const currentAml = state.amlCompliance || INITIAL_AML_COMPLIANCE;
  const baseAlerts = currentAml.alerts || currentAml.transactionAlerts || INITIAL_AML_COMPLIANCE.alerts || [];

  let targetClient = state.clients.find(c => c.id === clientIdOrAlertId || c.rtn === clientIdOrAlertId);
  const linkedAlert = baseAlerts.find(a => a.id === clientIdOrAlertId || a.clientRtn === clientIdOrAlertId || a.clientRtnOrId === clientIdOrAlertId || a.clientId === clientIdOrAlertId);
  if (!targetClient && linkedAlert) {
    targetClient = state.clients.find(c => c.id === linkedAlert.clientId || c.rtn === linkedAlert.clientRtn || c.rtn === linkedAlert.clientRtnOrId || c.name.toLowerCase() === linkedAlert.clientName.toLowerCase());
  }

  const clientName = targetClient ? targetClient.name : (linkedAlert ? linkedAlert.clientName : 'Cliente');
  const unfrozenAmount = targetClient ? targetClient.accountBalanceHNL : 0;

  const updatedClients = state.clients.map(c => {
    if (targetClient && c.id === targetClient.id) {
      return {
        ...c,
        isFrozen: false,
        frozenReason: undefined,
        amlStatus: 'investigada_limpia' as const,
        notes: `${c.notes || ''} [Descongelada por sobreseimiento en Mes ${state.gameMonth}]`
      };
    }
    return c;
  });

  const updatedAlerts = baseAlerts.map(a => {
    if (a.id === clientIdOrAlertId || (targetClient && (a.clientId === targetClient.id || a.clientRtn === targetClient.rtn || a.clientRtnOrId === targetClient.rtn || a.clientName.toLowerCase() === targetClient.name.toLowerCase()))) {
      return {
        ...a,
        status: 'archivada_justificada' as const,
        isAccountFrozen: false
      };
    }
    return a;
  });

  const updatedFrozenCount = Math.max(0, (currentAml.frozenAccountsCount || 0) - 1);
  const updatedFrozenFunds = Math.max(0, (currentAml.totalFrozenFundsHNL || currentAml.frozenFundsTotalHNL || 0) - unfrozenAmount);

  const updatedAml: AmlComplianceState = {
    ...currentAml,
    alerts: updatedAlerts,
    transactionAlerts: updatedAlerts,
    frozenAccountsCount: updatedFrozenCount,
    totalFrozenFundsHNL: updatedFrozenFunds,
    frozenFundsTotalHNL: updatedFrozenFunds
  };

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      amlCompliance: updatedAml
    },
    successMessage: `Cuenta de ${clientName} reactivada y desbloqueada tras dictamen legal favorable.`
  };
}

/** Emitir y Radicar Reporte de Operación Sospechosa (ROS) formal ante la UIF y CNBS */
export function fileUifSuspiciousReport(
  state: GameState,
  alertId: string,
  suspicionSummary?: string
): { updatedState: GameState; successMessage: string; reportId: string } {
  const currentAml = state.amlCompliance || INITIAL_AML_COMPLIANCE;
  const baseAlerts = currentAml.alerts || currentAml.transactionAlerts || INITIAL_AML_COMPLIANCE.alerts || [];
  const baseReports = currentAml.uifReports || currentAml.historicalUifReports || INITIAL_AML_COMPLIANCE.uifReports || [];

  const alert = baseAlerts.find(a => a.id === alertId);
  const reportNumber = baseReports.length + 1;
  const reportId = `ROS-UIF-2026-${String(reportNumber).padStart(3, '0')}`;
  const receiptCode = `BCH-UIF-REC-${Math.floor(100000 + Math.random() * 900000)}`;

  const newDossier: UifReportDossier = {
    reportId,
    id: reportId,
    filingMonth: state.gameMonth,
    gameMonth: state.gameMonth,
    filingDate: `Mes ${state.gameMonth} - 2026`,
    alertId,
    clientId: alert?.clientId || `CLI-AML-${alertId}`,
    clientName: alert?.clientName || 'Titular no identificado',
    clientRtn: alert?.clientRtn || alert?.clientRtnOrId || '0801-1990-00000',
    clientRtnOrId: alert?.clientRtn || alert?.clientRtnOrId || '0801-1990-00000',
    expedienteNumber: `EXP-UIF-HN-${alert?.ticketCode || alertId.toUpperCase()}`,
    typology: (alert?.alertType || alert?.type || 'pitufeo_structuring') as any,
    totalFlaggedAmountHNL: alert?.amountHNL || alert?.involvedAmountHNL || 1500000,
    involvedAmountHNL: alert?.amountHNL || alert?.involvedAmountHNL || 1500000,
    suspicionSummary: suspicionSummary || alert?.description || 'Operaciones no congruentes con el perfil económico del cliente.',
    legalBasis: 'Ley Especial Contra el Lavado de Activos Decreto No. 144-2014, Artículo 34 y Circular CNBS No. 018/2022',
    legalBasisArticles: [
      'Decreto 144-2014 Art. 34 (Ley Especial contra el Lavado de Activos de Honduras)',
      'Resolución CNBS No. 082/2021 Art. 19 (Obligación de Remisión de ROS dentro de las 24 Horas)',
      'Recomendación 20 de los Estándares Internacionales GAFI / GAFILAT'
    ],
    uifCaseStatus: 'Enviado a UIF/CNBS',
    status: 'remitido_uif',
    submissionTimestamp: Date.now(),
    complianceOfficerSignature: 'Lic. Fernando Zelaya (Oficial de Cumplimiento Titular CNBS #OF-094)',
    uifAcknowledgmentReceipt: receiptCode,
    monthsUntilResolution: 2,
    rulingOutcome: 'Pendiente'
  };

  const updatedAlerts = baseAlerts.map(a => {
    if (a.id === alertId) {
      return {
        ...a,
        status: 'reportada_uif' as const,
        uifReportId: reportId,
        uifReportFiled: true,
        assignedInvestigator: 'Oficial de Cumplimiento Titular'
      };
    }
    return a;
  });

  const updatedReports = [newDossier, ...baseReports];
  const updatedAml: AmlComplianceState = {
    ...currentAml,
    alerts: updatedAlerts,
    transactionAlerts: updatedAlerts,
    uifReports: updatedReports,
    historicalUifReports: updatedReports,
    uifReportsFiledCount: updatedReports.length,
    complianceAuditRatingScore: +Math.min(99.8, (currentAml.complianceAuditRatingScore || 94.5) + 0.3).toFixed(1)
  };

  const notif: GameEventNotification = {
    id: `notif-uif-${Date.now()}`,
    month: state.gameMonth,
    year: state.bch.year,
    type: 'regulatory_alert',
    title: `Reporte ROS Radicado ante la UIF: ${reportId}`,
    message: `Se transmitió exitosamente el expediente ${newDossier.expedienteNumber} a la Unidad de Información Financiera (UIF/CNBS) por ${formatHNL(newDossier.totalFlaggedAmountHNL)}. Recibo: ${receiptCode}.`,
    impactSummary: 'Cumplimiento normativo penal blindado ante la CNBS.'
  };

  return {
    updatedState: {
      ...state,
      amlCompliance: updatedAml,
      notifications: [notif, ...state.notifications]
    },
    successMessage: `Expediente ROS ${reportId} transmitido con acuse de recibo oficial de la UIF (${receiptCode}).`,
    reportId
  };
}

/** Resolver una alerta de AML mediante archivo justificado, congelamiento o remisión UIF */
export function resolveAmlAlert(
  state: GameState,
  alertId: string,
  action: 'archivar_justificada' | 'congelar_y_reportar' | 'remitir_uif',
  notes?: string
): { updatedState: GameState; successMessage: string } {
  const currentAml = state.amlCompliance || INITIAL_AML_COMPLIANCE;
  const baseAlerts = currentAml.alerts || currentAml.transactionAlerts || INITIAL_AML_COMPLIANCE.alerts || [];
  const alert = baseAlerts.find(a => a.id === alertId);
  if (!alert) {
    return { updatedState: state, successMessage: 'Alerta no encontrada' };
  }

  if (action === 'congelar_y_reportar') {
    const freezeRes = freezeClientAccount(state, alertId, notes || `Inmovilización preventiva por alerta ${alert.ticketCode || alert.id}`);
    const uifRes = fileUifSuspiciousReport(freezeRes.updatedState, alertId, notes);
    return {
      updatedState: uifRes.updatedState,
      successMessage: `Acción ejecutada: Cuenta inmovilizada y expediente ${uifRes.reportId} radicado ante la UIF/CNBS.`
    };
  } else if (action === 'remitir_uif') {
    const uifRes = fileUifSuspiciousReport(state, alertId, notes);
    return {
      updatedState: uifRes.updatedState,
      successMessage: `Expediente transmitido a la UIF bajo recibo oficial.`
    };
  } else {
    // Archivar con justificación documentada
    const updatedAlerts = baseAlerts.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'archivada_justificada' as const,
          clearedByOfficer: 'Auditoría Forense Interna',
          assignedInvestigator: 'Auditoría Forense Interna'
        };
      }
      return a;
    });

    const updatedAml: AmlComplianceState = {
      ...currentAml,
      alerts: updatedAlerts,
      transactionAlerts: updatedAlerts,
      complianceAuditRatingScore: +Math.min(99.8, (currentAml.complianceAuditRatingScore || 94.5) + 0.1).toFixed(1)
    };

    return {
      updatedState: {
        ...state,
        amlCompliance: updatedAml
      },
      successMessage: `Alerta ${alert.ticketCode || alert.id} archivada con dictamen técnico de auditoría y soporte documental.`
    };
  }
}

/**
 * Escanea a demanda la red transaccional para auditoría heurística en tiempo real
 */
export function scanAmlTransactions(state: GameState): { updatedState: GameState; successMessage: string; newAlertsFound: number } {
  const current = state.amlCompliance || INITIAL_AML_COMPLIANCE;
  const baseAlerts = current.alerts || current.transactionAlerts || [];
  
  const addedScreened = Math.floor(2200 + Math.random() * 3000);
  const updatedScreened = (current.totalScreenedTransactionsMonth || 124500) + addedScreened;
  
  let alerts = [...baseAlerts];
  let newAlertCount = 0;
  
  // Si hay pocas alertas abiertas, inyectar una nueva detección
  if (alerts.filter(a => a.status === 'abierta' || a.status === 'en_analisis').length < 4) {
    newAlertCount = 1;
    const newId = `aml-scan-${Date.now().toString().slice(-4)}`;
    alerts.unshift({
      id: newId,
      clientId: `CLI-SCAN-${state.gameMonth}`,
      ticketCode: `AML-2026-SCAN-${Math.floor(10 + Math.random() * 89)}`,
      clientName: 'Agropecuaria del Aguan S. de R.L.',
      clientRtn: '0501-1994-09921',
      clientRtnOrId: '0501-1994-09921',
      division: 'pyme',
      type: 'rapid_movement',
      alertType: 'rapid_movement',
      severity: 'alta',
      amountHNL: 3850000,
      involvedAmountHNL: 3850000,
      amountUSD: 154000,
      originCountry: 'Honduras (Depósitos de Efectivo en Tocoa/Colón)',
      destinationCountry: 'Panamá (Zona Libre de Colón)',
      status: 'abierta',
      detectedMonth: state.gameMonth,
      detectedAtMonth: state.gameMonth,
      description: 'Transferencias rápidas sucesivas de efectivo bancarizado en Colón enviadas a cuenta en Panamá sin declaración aduanera.',
      triggerHeuristic: 'Velocidad de liquidación transfronteriza y fraccionamiento múltiple de depósitos.',
      recommendedAction: 'Requerir facturas proforma y comprobante de importación SAR.',
      riskScore: 78,
      evidenceNotes: ['Sin historial previo de importación.', 'Depósitos en efectivo por terceros en taquilla.'],
      isAccountFrozen: false
    });
  }

  const updatedAml: AmlComplianceState = {
    ...current,
    alerts,
    transactionAlerts: alerts,
    totalScreenedTransactionsMonth: updatedScreened,
    monthlyScreenedTransactionsCount: updatedScreened,
    lastScanMonth: state.gameMonth,
    complianceAuditRatingScore: +Math.min(99.9, (current.complianceAuditRatingScore || 94.5) + 0.2).toFixed(1)
  };

  const message = newAlertCount > 0
    ? `Escaneo transaccional completado: ${addedScreened.toLocaleString()} operaciones analizadas. Se detectó 1 alerta que requiere análisis de cumplimiento.`
    : `Escaneo transaccional completado: ${addedScreened.toLocaleString()} operaciones analizadas. Parámetros de monitoreo 100% conformes a CNBS.`;

  return {
    updatedState: {
      ...state,
      amlCompliance: updatedAml
    },
    successMessage: message,
    newAlertsFound: newAlertCount
  };
}

// ============================================================================
// MOTOR DE DILEMAS EJECUTIVOS, ÉTICOS Y CRISIS DE JUNTA DIRECTIVA
// ============================================================================

export function advanceExecutiveDilemmasMonth(state: GameState, nextMonth: number): ExecutiveDilemmasState {
  const current = state.executiveDilemmas || INITIAL_EXECUTIVE_DILEMMAS;
  
  // Buscar el primer dilema pendiente para ponerlo como activo
  const pendingDilemma = current.dilemmas.find(d => d.status === 'pendiente');
  const activeId = pendingDilemma ? pendingDilemma.id : current.activeDilemmaId;

  return {
    ...current,
    activeDilemmaId: activeId
  };
}

/** Resolver un dilema ético/financiero por votación de la Junta Directiva */
export function resolveExecutiveDilemma(
  state: GameState,
  dilemmaId: string,
  optionId: string
): { updatedState: GameState; successMessage: string } {
  const current = state.executiveDilemmas || INITIAL_EXECUTIVE_DILEMMAS;
  const dilemma = current.dilemmas.find(d => d.id === dilemmaId);
  if (!dilemma) {
    return { updatedState: state, successMessage: 'Dilema de Directorio no encontrado.' };
  }

  const option = dilemma.options.find(o => o.id === optionId);
  if (!option) {
    return { updatedState: state, successMessage: 'Opción resolutiva no encontrada.' };
  }

  const { impactFinancials, impactCompliance } = option;
  const cashDelta = impactFinancials.cashDeltaHNL - (impactFinancials.cnbsFineHNL || 0);
  const profitDelta = impactFinancials.profitDeltaHNL;
  const carDeltaPct = +(impactFinancials.carDeltaBps / 100).toFixed(2);
  const cnbsFine = impactFinancials.cnbsFineHNL || 0;

  // Actualizar dilema
  const updatedDilemmas = current.dilemmas.map(d => {
    if (d.id === dilemmaId) {
      return {
        ...d,
        status: 'resuelto' as const,
        chosenOptionId: optionId,
        resolvedAtMonth: state.gameMonth
      };
    }
    return d;
  });

  // Próximo dilema activo si queda alguno
  const nextPending = updatedDilemmas.find(d => d.status === 'pendiente');

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    cashAndBCHReserves: Math.max(0, state.financials.cashAndBCHReserves + cashDelta),
    currentMonthProfit: state.financials.currentMonthProfit + profitDelta,
    retainedEarnings: state.financials.retainedEarnings + profitDelta,
    totalEquity: state.financials.totalEquity + profitDelta,
    capitalAdequacyRatioCAR: +(Math.max(8.0, state.financials.capitalAdequacyRatioCAR + carDeltaPct)).toFixed(2)
  };

  const updatedDilemmasState: ExecutiveDilemmasState = {
    ...current,
    dilemmas: updatedDilemmas,
    activeDilemmaId: nextPending ? nextPending.id : dilemmaId,
    resolvedDilemmasCount: current.resolvedDilemmasCount + 1,
    accumulatedFinesHNL: current.accumulatedFinesHNL + cnbsFine,
    publicReputationScore: Math.max(10, Math.min(100, current.publicReputationScore + impactCompliance.reputationScoreDelta)),
    complianceTrustScore: Math.max(10, Math.min(100, current.complianceTrustScore + impactCompliance.complianceScoreDelta))
  };

  const notif: GameEventNotification = {
    id: `notif-dil-${Date.now()}`,
    month: state.gameMonth,
    year: state.bch.year,
    type: 'board_decision',
    title: `Resolución de Directorio: ${dilemma.title}`,
    message: `La Junta Directiva aprobó la opción "${option.title}" con un ${option.directorsVotesApprovalPct}% de votos favorables. ${option.consequencesSummary}`,
    impactSummary: `Impacto en Utilidad: ${profitDelta >= 0 ? '+' : ''}${formatHNL(profitDelta)} · CAR: ${carDeltaPct >= 0 ? '+' : ''}${carDeltaPct}% · Multa CNBS: ${formatHNL(cnbsFine)}`
  };

  return {
    updatedState: {
      ...state,
      financials: updatedFinancials,
      executiveDilemmas: updatedDilemmasState,
      notifications: [notif, ...state.notifications]
    },
    successMessage: `Resolución de Directorio adoptada: "${option.title}". Dictamen asentado en acta formal.`
  };
}

/** Activar simulacro de crisis de reputación y corrida de liquidez */
export function triggerReputationalCrisisSimulation(state: GameState): { updatedState: GameState; successMessage: string } {
  const current = state.executiveDilemmas || INITIAL_EXECUTIVE_DILEMMAS;
  const depositOutflowSimulated = Math.round(state.financials.depositsPublicTotal * 0.04);

  const updatedDilemmas: ExecutiveDilemmasState = {
    ...current,
    crisisActive: true,
    publicReputationScore: Math.max(20, current.publicReputationScore - 12)
  };

  const notif: GameEventNotification = {
    id: `notif-crisis-${Date.now()}`,
    month: state.gameMonth,
    year: state.bch.year,
    type: 'regulatory_alert',
    title: '¡Simulacro de Crisis Reputacional y Tensión de Depósitos!',
    message: `Se activó el protocolo de defensa ante rumores en redes sociales. Demanda de retiros estimada en ${formatHNL(depositOutflowSimulated)}. El Comité de Crisis debe emitir postura.`,
    impactSummary: 'Protocolo de liquidez contingente activado ante BCH.'
  };

  return {
    updatedState: {
      ...state,
      executiveDilemmas: updatedDilemmas,
      notifications: [notif, ...state.notifications]
    },
    successMessage: 'Simulacro de crisis reputacional activado. Mide la resiliencia institucional de tu gobernanza.'
  };
}

/** Responder y desactivar la crisis reputacional */
export function resolveReputationalCrisis(
  state: GameState,
  strategy: 'transparencia_inmediata' | 'comunicado_juridico' | 'auditoria_externa'
): { updatedState: GameState; successMessage: string } {
  const current = state.executiveDilemmas || INITIAL_EXECUTIVE_DILEMMAS;
  let reputationRecovery = 10;
  let costHNL = 0;
  let summary = '';

  if (strategy === 'transparencia_inmediata') {
    reputationRecovery = 15;
    costHNL = 450000;
    summary = 'Rueda de prensa televisada en Tegucigalpa y San Pedro Sula desmintiendo rumores con auditores presentes.';
  } else if (strategy === 'auditoria_externa') {
    reputationRecovery = 18;
    costHNL = 1200000;
    summary = 'Certificación especial de solvencia emitida por Deloitte & Touche y respaldo público del BCH.';
  } else {
    reputationRecovery = 8;
    costHNL = 150000;
    summary = 'Comunicado oficial por prensa escrita y redes sociales advirtiendo acciones legales por difamación.';
  }

  const updatedDilemmas: ExecutiveDilemmasState = {
    ...current,
    crisisActive: false,
    publicReputationScore: Math.min(100, current.publicReputationScore + reputationRecovery),
    complianceTrustScore: Math.min(100, current.complianceTrustScore + 5)
  };

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    cashAndBCHReserves: Math.max(0, state.financials.cashAndBCHReserves - costHNL),
    totalOperatingExpense: state.financials.totalOperatingExpense + costHNL
  };

  return {
    updatedState: {
      ...state,
      financials: updatedFinancials,
      executiveDilemmas: updatedDilemmas
    },
    successMessage: `Crisis resuelta con éxito mediante ${strategy.replace(/_/g, ' ')}. ${summary}`
  };
}

export interface BulkAllocationParams {
  division?: BankingDivisionId;
  divisionId?: BankingDivisionId;
  clientCount?: number;
  depositHoldersCount: number;
  avgDepositAmountHNL?: number;
  avgDepositHNL?: number;
  loanBorrowersCount: number;
  avgLoanAmountHNL?: number;
  avgLoanHNL?: number;
  loanRateAnnualPct?: number;
  loanMonths?: number;
  loanTermMonths?: number;
  delinquencyRate?: number;
}

/**
 * Aplica en bloque la asignación de saldos y créditos para una banca completa:
 * Permite definir cuántas personas tienen cuánto dinero en depósitos, y cuántas tienen préstamos
 */
export function applyBulkPortfolioAllocation(
  state: GameState,
  params: BulkAllocationParams
): { updatedState: GameState; successMessage: string } {
  const divisionKey = params.divisionId || params.division || 'personas';
  const currentDiv = state.divisions[divisionKey];
  if (!currentDiv) {
    return { updatedState: state, successMessage: 'Banca no encontrada.' };
  }

  const depositHolders = Math.max(1, Math.round(params.depositHoldersCount));
  const avgDeposit = Math.max(0, (params.avgDepositHNL !== undefined ? params.avgDepositHNL : params.avgDepositAmountHNL) ?? 0);
  const loanBorrowers = Math.max(0, Math.round(params.loanBorrowersCount));
  const avgLoan = Math.max(0, (params.avgLoanHNL !== undefined ? params.avgLoanHNL : params.avgLoanAmountHNL) ?? 0);

  const newTotalDeposits = Math.round(depositHolders * avgDeposit);
  const newTotalLoans = Math.round(loanBorrowers * avgLoan);
  const newClientCount = params.clientCount ? Math.max(params.clientCount, depositHolders, loanBorrowers) : Math.max(depositHolders, loanBorrowers, currentDiv.clientCount);

  const depositDelta = newTotalDeposits - currentDiv.totalDeposits;
  const loanDelta = newTotalLoans - currentDiv.totalLoans;

  // Actualizar clientes en memoria pertenecientes a esta banca
  const updatedClients = state.clients.map(c => {
    if (c.division === divisionKey) {
      const isBorrower = Math.random() < (loanBorrowers / Math.max(1, newClientCount));
      const newBalance = Math.round(avgDeposit * (0.8 + Math.random() * 0.4));
      const newLoanBal = isBorrower ? Math.round(avgLoan * (0.85 + Math.random() * 0.3)) : 0;
      const rate = params.loanRateAnnualPct || c.loanInterestRateAnnual || currentDiv.avgLendingRate;
      const months = params.loanMonths || params.loanTermMonths || c.loanMonthsRemaining || 36;
      const monthlyPayment = newLoanBal > 0 ? Math.round((newLoanBal * (1 + rate / 100)) / months) : 0;

      return {
        ...c,
        accountBalanceHNL: newBalance,
        hasLoan: isBorrower,
        loanPrincipalHNL: isBorrower ? Math.round(newLoanBal * 1.1) : 0,
        loanBalanceHNL: newLoanBal,
        loanMonthlyPaymentHNL: monthlyPayment,
        loanInterestRateAnnual: rate,
        loanMonthsRemaining: months
      };
    }
    return c;
  });

  const updatedDivision: BankDivisionConfig = {
    ...currentDiv,
    clientCount: newClientCount,
    totalDeposits: newTotalDeposits,
    totalLoans: newTotalLoans,
    avgLendingRate: params.loanRateAnnualPct || currentDiv.avgLendingRate,
    delinquencyRate: params.delinquencyRate !== undefined ? params.delinquencyRate : currentDiv.delinquencyRate,
    customDepositHolders: depositHolders,
    customAvgDepositHNL: avgDeposit,
    customLoanBorrowers: loanBorrowers,
    customAvgLoanHNL: avgLoan
  };

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    depositsPublicTotal: Math.max(0, state.financials.depositsPublicTotal + depositDelta),
    loanPortfolioCurrent: Math.max(0, state.financials.loanPortfolioCurrent + loanDelta),
    cashAndBCHReserves: Math.max(10000000, state.financials.cashAndBCHReserves + depositDelta - loanDelta)
  };

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      divisions: {
        ...state.divisions,
        [divisionKey]: updatedDivision
      },
      financials: updatedFinancials
    },
    successMessage: `Asignación masiva aplicada en ${currentDiv.name}: ${depositHolders.toLocaleString()} clientes con depósitos de ${formatHNL(avgDeposit)} y ${loanBorrowers.toLocaleString()} con créditos de ${formatHNL(avgLoan)}.`
  };
}

/**
 * Quita de mora individual efectiva: condona recargos, resetea mora y reclasifica a Categoría I - Normal
 */
export function executeSingleClientMoraWaiver(
  state: GameState,
  targetClient: IndividualClient | string
): { updatedState: GameState; waivedClient: IndividualClient; successMessage: string } {
  let clientObj: IndividualClient;
  if (typeof targetClient === 'string') {
    const found = state.clients.find(c => c.id === targetClient);
    if (found) {
      clientObj = found;
    } else {
      // Cliente sintético del libro mayor
      clientObj = {
        id: targetClient,
        cif: `CIF-0501-2026-${Math.floor(10000 + Math.random() * 89999)}`,
        name: 'Cliente Regularizado CNBS',
        division: 'personas',
        city: 'Tegucigalpa (Distrito Central)',
        joinedMonth: state.gameMonth,
        accountType: 'Cuenta de Ahorro Rendimiento',
        accountBalanceHNL: 15000,
        hasCreditCard: false,
        creditCardBrand: 'Sin Tarjeta',
        creditCardLimitHNL: 0,
        creditCardBalanceHNL: 0,
        hasLoan: true,
        loanType: 'Préstamo Reestructurado CNBS',
        loanPrincipalHNL: 65000,
        loanBalanceHNL: 48000,
        loanMonthlyPaymentHNL: 2100,
        loanInterestRateAnnual: 16.5,
        loanMonthsRemaining: 24,
        guaranteedPayment: true,
        pastDueDays: 45,
        pastDueAmountHNL: 6300,
        equifaxScore: 680,
        cnbsCategory: 'III - Subnormal',
        otherBankProducts: []
      };
    }
  } else {
    clientObj = targetClient;
  }

  const waived: IndividualClient = {
    ...clientObj,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    cnbsCategory: 'I - Normal',
    isRestructured: true,
    guaranteedPayment: true,
    notes: 'Alivio de mora aplicado: condonación de recargos moratorios y reclasificación a Categoría I (Resolución CNBS).'
  };

  const existsInState = state.clients.some(c => c.id === waived.id);
  const updatedClients = existsInState
    ? state.clients.map(c => c.id === waived.id ? waived : c)
    : [waived, ...state.clients];

  const divKey = waived.division || 'personas';
  const currentDiv = state.divisions[divKey];
  const updatedDivisions = { ...state.divisions };
  if (currentDiv) {
    updatedDivisions[divKey] = {
      ...currentDiv,
      delinquencyRate: Math.max(0, +(currentDiv.delinquencyRate * 0.85).toFixed(2)),
      satisfactionScore: Math.min(100, currentDiv.satisfactionScore + 2)
    };
  }

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    loanPortfolioPastDue: Math.max(0, state.financials.loanPortfolioPastDue - (clientObj.pastDueAmountHNL || 15000)),
    loanLossProvisions: Math.max(0, state.financials.loanLossProvisions - Math.round((clientObj.pastDueAmountHNL || 15000) * 0.5))
  };

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      divisions: updatedDivisions,
      financials: updatedFinancials
    },
    waivedClient: waived,
    successMessage: `Quita de mora aplicada a ${waived.name}: recargos moratorios condonados y crédito restituido a Categoría I - Normal.`
  };
}

/**
 * Quita masiva de mora para toda la banca o cartera morosa
 */
export function executeBulkDivisionMoraWaiver(
  state: GameState,
  divisionKey?: BankingDivisionId
): { updatedState: GameState; waivedCount: number; successMessage: string } {
  const targetDivision = divisionKey || 'personas';
  const divConfig = state.divisions[targetDivision];

  let waivedCount = 0;
  const updatedClients = state.clients.map(c => {
    if ((!divisionKey || c.division === divisionKey) && (c.pastDueDays > 0 || c.cnbsCategory !== 'I - Normal')) {
      waivedCount++;
      return {
        ...c,
        pastDueDays: 0,
        pastDueAmountHNL: 0,
        cnbsCategory: 'I - Normal' as const,
        isRestructured: true,
        notes: 'Alivio masivo de mora: condonación total de recargos y restitución de categoría.'
      };
    }
    return c;
  });

  const updatedDivisions = { ...state.divisions };
  if (divConfig) {
    updatedDivisions[targetDivision] = {
      ...divConfig,
      delinquencyRate: 0.2, // Tasa de mora mínima saneada
      satisfactionScore: Math.min(100, divConfig.satisfactionScore + 8)
    };
  }

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    loanPortfolioPastDue: Math.max(0, Math.round(state.financials.loanPortfolioPastDue * 0.3)),
    loanLossProvisions: Math.max(0, Math.round(state.financials.loanLossProvisions * 0.5))
  };

  const countDisplay = Math.max(waivedCount, divConfig ? Math.round(divConfig.clientCount * (divConfig.delinquencyRate / 100)) : 120);

  return {
    updatedState: {
      ...state,
      clients: updatedClients,
      divisions: updatedDivisions,
      financials: updatedFinancials
    },
    waivedCount: countDisplay,
    successMessage: `Alivio masivo ejecutado en ${divConfig?.name || 'la cartera'}: se condonó la mora a ${countDisplay.toLocaleString()} créditos y la tasa de mora se redujo a 0.2%.`
  };
}

// ------------------------------------------------------------------------------------
// CORE BANCARIO INSTITUCIONAL (MÓDULOS DE ALTA FIDELIDAD)
// ------------------------------------------------------------------------------------

/**
 * Emisión de Certificado de Depósito a Plazo Fijo (DPF / Time Certificate)
 * Aplica tasa escalonada según plazo (30 a 720 días) y cálculo de retención fiscal SAR 10%
 */
export function issueTermDepositCertificate(
  state: GameState,
  params: {
    clientName: string;
    clientCif?: string;
    division?: BankingDivisionId;
    principalHNL: number;
    termDays: number;
    interestRateAnnualPct: number;
    couponPaymentFrequency?: 'mensual' | 'al_vencimiento';
    autoRenew?: boolean;
  }
): { updatedState: GameState; certificate: TermDepositCertificate; successMessage: string } {
  const principal = Math.max(1000, params.principalHNL || 50000);
  const termDays = params.termDays || 360;
  const ratePct = params.interestRateAnnualPct || 8.5;
  const grossInterest = Math.round(principal * (ratePct / 100) * (termDays / 360));
  const sarTaxWithheld = Math.round(grossInterest * 0.10); // 10% Retención SAR obligatoria
  const netInterest = grossInterest - sarTaxWithheld;

  const certId = `DPF-2026-${Math.floor(1000 + Math.random() * 8999)}`;
  const certCif = params.clientCif || `CIF-0501-19${Math.floor(70 + Math.random() * 29)}-${Math.floor(10000 + Math.random() * 89999)}`;
  const div = params.division || 'personas';

  const newCert: TermDepositCertificate = {
    id: certId,
    cif: certCif,
    clientName: params.clientName,
    division: div,
    principalHNL: principal,
    interestRateAnnualPct: ratePct,
    termDays: termDays,
    startMonth: state.gameMonth,
    startYear: 2026,
    maturityMonth: state.gameMonth + Math.ceil(termDays / 30),
    maturityYear: 2026 + Math.floor((state.gameMonth + Math.ceil(termDays / 30) - 1) / 12),
    status: 'vigente',
    isPledged: false,
    accumulatedGrossInterestHNL: grossInterest,
    accumulatedSarTaxWithheldHNL: sarTaxWithheld,
    netInterestPaidHNL: netInterest,
    couponPaymentFrequency: params.couponPaymentFrequency || 'mensual',
    autoRenew: params.autoRenew ?? true
  };

  const existingCertificates = state.termDeposits || [];
  const updatedCertificates = [newCert, ...existingCertificates];

  // Actualizar Balance General (Pasivo exigible a plazo)
  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    depositsPublicTotal: state.financials.depositsPublicTotal + principal,
    cashAndBCHReserves: state.financials.cashAndBCHReserves + principal
  };

  const divConfig = state.divisions[div];
  const updatedDivisions = {
    ...state.divisions,
    [div]: {
      ...divConfig,
      totalDeposits: divConfig.totalDeposits + principal
    }
  };

  return {
    updatedState: {
      ...state,
      termDeposits: updatedCertificates,
      financials: updatedFinancials,
      divisions: updatedDivisions
    },
    certificate: newCert,
    successMessage: `Certificado DPF ${certId} emitido exitosamente a ${params.clientName} por ${formatHNL(principal)} al ${ratePct}% (${termDays} días). Rendimiento neto estimado: ${formatHNL(netInterest)} (Retención SAR 10%: ${formatHNL(sarTaxWithheld)}).`
  };
}

/**
 * Originación de Préstamo o Tarjeta Back-to-Back (Garantía Líquida 100% / Riesgo Cero RWA)
 * Respaldado mediante pignoración de DPF en custodia.
 */
export function originateBackToBackFacility(
  state: GameState,
  params: {
    dpfCertificateId: string;
    type: 'prestamo_garantizado' | 'tarjeta_garantizada';
    coverageRatioPct?: number; // 80% a 95%
    termMonths?: number; // 12 a 60 meses
    spreadRatePct?: number; // Spread sobre DPF (estándar +3.0%)
  }
): { updatedState: GameState; facility?: BackToBackFacility; successMessage?: string; errorMessage?: string } {
  const certs = state.termDeposits || [];
  const dpf = certs.find(c => c.id === params.dpfCertificateId);

  if (!dpf) {
    return { updatedState: state, errorMessage: 'Certificado DPF no encontrado en custodia.' };
  }

  if (dpf.isPledged || dpf.status === 'pignorado') {
    return { updatedState: state, errorMessage: `El DPF ${dpf.id} ya se encuentra pignorado a otra facilidad de crédito.` };
  }

  const coverage = Math.min(95, Math.max(80, params.coverageRatioPct || 90));
  const spread = params.spreadRatePct ?? 3.0;
  const termMonths = params.termMonths || 24;
  const approvedAmount = Math.round(dpf.principalHNL * (coverage / 100));
  const effectiveRate = +(dpf.interestRateAnnualPct + spread).toFixed(2);

  // Comisión por otorgamiento / desembolso: 0.50% (mínimo L. 500)
  const disbursementFee = Math.max(500, Math.round(approvedAmount * 0.005));
  // Seguro de saldo deudor: L. 6.50 por millar
  const debtorInsurance = Math.round((approvedAmount / 1000) * 6.50);

  // Cuota mensual nivelada francesa
  const monthlyRate = (effectiveRate / 100) / 12;
  const monthlyQuota = Math.round((approvedAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths)));

  const facilityId = params.type === 'prestamo_garantizado'
    ? `B2B-CR-${Math.floor(1000 + Math.random() * 8999)}`
    : `B2B-TC-${Math.floor(1000 + Math.random() * 8999)}`;

  const newFacility: BackToBackFacility = {
    id: facilityId,
    type: params.type,
    clientName: dpf.clientName,
    clientCif: dpf.cif,
    division: dpf.division,
    dpfCertificateId: dpf.id,
    dpfPrincipalHNL: dpf.principalHNL,
    dpfInterestRatePct: dpf.interestRateAnnualPct,
    coverageRatioPct: coverage,
    approvedAmountHNL: approvedAmount,
    outstandingBalanceHNL: approvedAmount,
    spreadRatePct: spread,
    effectiveInterestRatePct: effectiveRate,
    termMonths: termMonths,
    monthlyQuotaHNL: monthlyQuota,
    disbursementFeeHNL: disbursementFee,
    monthlyDebtorInsuranceHNL: debtorInsurance,
    riskWeightingRwaPct: 0, // 0% RWA según normativa CNBS
    requiredProvisionHNL: 0, // L. 0.00 provisiones de riesgo
    status: 'vigente',
    pastDueDays: 0,
    originationMonth: state.gameMonth
  };

  // Pignorar y bloquear el DPF colateral
  const updatedCertificates = certs.map(c => {
    if (c.id === dpf.id) {
      return {
        ...c,
        isPledged: true,
        status: 'pignorado' as const,
        pledgedToFacilityId: facilityId
      };
    }
    return c;
  });

  const existingFacilities = state.backToBackFacilities || [];
  const updatedFacilities = [newFacility, ...existingFacilities];

  // Actualizar balances financieros (Colocación y cobro de comisión)
  const netCashOutflow = approvedAmount - disbursementFee;
  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    loanPortfolioCurrent: state.financials.loanPortfolioCurrent + approvedAmount,
    cashAndBCHReserves: Math.max(1000000, state.financials.cashAndBCHReserves - netCashOutflow),
    totalFeeIncome: state.financials.totalFeeIncome + disbursementFee,
    nonInterestFeeIncomeMonthly: (state.financials.nonInterestFeeIncomeMonthly || 0) + disbursementFee
  };

  const divConfig = state.divisions[dpf.division];
  const updatedDivisions = {
    ...state.divisions,
    [dpf.division]: {
      ...divConfig,
      totalLoans: divConfig.totalLoans + approvedAmount,
      feeIncomeMonthly: divConfig.feeIncomeMonthly + disbursementFee
    }
  };

  return {
    updatedState: {
      ...state,
      termDeposits: updatedCertificates,
      backToBackFacilities: updatedFacilities,
      financials: updatedFinancials,
      divisions: updatedDivisions
    },
    facility: newFacility,
    successMessage: `Facilidad Back-to-Back ${facilityId} aprobada al 100%: Monto ${formatHNL(approvedAmount)} (cobertura ${coverage}% sobre DPF ${dpf.id}). Tasa activa: ${effectiveRate}% (DPF + ${spread}%). Comisión de apertura cobrada: ${formatHNL(disbursementFee)}. RWA: 0% / Provisión: L. 0.00.`
  };
}

/**
 * Pago o liquidación de cuota de crédito Back-to-Back
 * Si el saldo llega a 0, se libera el gravamen del DPF colateral automáticamente.
 */
export function payBackToBackInstallment(
  state: GameState,
  facilityId: string,
  amountHNL?: number
): { updatedState: GameState; facility?: BackToBackFacility; successMessage: string } {
  const facilities = state.backToBackFacilities || [];
  const facility = facilities.find(f => f.id === facilityId);

  if (!facility || facility.status !== 'vigente') {
    return { updatedState: state, successMessage: 'La facilidad no se encuentra activa.' };
  }

  const payment = amountHNL ? Math.min(amountHNL, facility.outstandingBalanceHNL) : Math.min(facility.monthlyQuotaHNL, facility.outstandingBalanceHNL);
  const newBalance = Math.max(0, facility.outstandingBalanceHNL - payment);
  const isFullyPaid = newBalance === 0;

  const updatedFacilities = facilities.map(f => {
    if (f.id === facilityId) {
      return {
        ...f,
        outstandingBalanceHNL: newBalance,
        status: isFullyPaid ? ('cancelado' as const) : f.status,
        lastPaymentMonth: state.gameMonth
      };
    }
    return f;
  });

  // Si se canceló totalmente, desgravar / liberar el DPF pignorado
  let updatedCertificates = state.termDeposits || [];
  if (isFullyPaid) {
    updatedCertificates = updatedCertificates.map(c => {
      if (c.id === facility.dpfCertificateId) {
        return {
          ...c,
          isPledged: false,
          status: 'vigente' as const,
          pledgedToFacilityId: undefined
        };
      }
      return c;
    });
  }

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    loanPortfolioCurrent: Math.max(0, state.financials.loanPortfolioCurrent - payment),
    cashAndBCHReserves: state.financials.cashAndBCHReserves + payment
  };

  const updatedFacility = updatedFacilities.find(f => f.id === facilityId);

  return {
    updatedState: {
      ...state,
      backToBackFacilities: updatedFacilities,
      termDeposits: updatedCertificates,
      financials: updatedFinancials
    },
    facility: updatedFacility,
    successMessage: isFullyPaid
      ? `Crédito Back-to-Back ${facilityId} cancelado al 100%. Se liberó el gravamen sobre el DPF ${facility.dpfCertificateId}.`
      : `Abono de ${formatHNL(payment)} aplicado a ${facilityId}. Saldo pendiente: ${formatHNL(newBalance)}.`
  };
}

/**
 * Ejecución extrajudicial forzosa de garantía líquida DPF
 * En caso de mora insalvable, se compensa la deuda directamente contra el DPF sin juicio.
 */
export function executePledgedDepositForeclosure(
  state: GameState,
  facilityId: string
): { updatedState: GameState; successMessage: string } {
  const facilities = state.backToBackFacilities || [];
  const facility = facilities.find(f => f.id === facilityId);

  if (!facility || facility.status !== 'vigente') {
    return { updatedState: state, successMessage: 'Facilidad no disponible para ejecución.' };
  }

  const debtToLiquidate = facility.outstandingBalanceHNL;

  const updatedFacilities = facilities.map(f => {
    if (f.id === facilityId) {
      return {
        ...f,
        outstandingBalanceHNL: 0,
        status: 'ejecutado' as const
      };
    }
    return f;
  });

  const updatedCertificates = (state.termDeposits || []).map(c => {
    if (c.id === facility.dpfCertificateId) {
      const remainingPrincipal = Math.max(0, c.principalHNL - debtToLiquidate);
      return {
        ...c,
        principalHNL: remainingPrincipal,
        isPledged: false,
        status: remainingPrincipal > 0 ? ('vigente' as const) : ('ejecutado' as const),
        pledgedToFacilityId: undefined
      };
    }
    return c;
  });

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    loanPortfolioCurrent: Math.max(0, state.financials.loanPortfolioCurrent - debtToLiquidate),
    depositsPublicTotal: Math.max(0, state.financials.depositsPublicTotal - debtToLiquidate)
  };

  return {
    updatedState: {
      ...state,
      backToBackFacilities: updatedFacilities,
      termDeposits: updatedCertificates,
      financials: updatedFinancials
    },
    successMessage: `Garantía líquida ejecutada en core: se canceló el saldo insoluto de ${formatHNL(debtToLiquidate)} contra el DPF ${facility.dpfCertificateId}. El colateral cubrió el 100% sin pérdidas para el banco.`
  };
}

/**
 * Procesamiento de dispersión masiva de planilla empresarial (ACH Corporativo)
 * Cobra tarifa oficial por colaborador (L. 18 a L. 22)
 */
export function processCorporatePayrollDispersion(
  state: GameState,
  params: {
    companyName: string;
    companyAccountNumber?: string;
    employeeCount: number;
    totalPayrollAmountHNL: number;
    feePerEmployeeHNL?: number;
  }
): { updatedState: GameState; batch: CorporatePayrollBatch; successMessage: string } {
  const feeRate = params.feePerEmployeeHNL || 20.0;
  const totalFee = Math.round(params.employeeCount * feeRate);
  const batchId = `PAY-2026-${Math.floor(100 + Math.random() * 899)}`;

  const newBatch: CorporatePayrollBatch = {
    id: batchId,
    companyName: params.companyName,
    companyAccountNumber: params.companyAccountNumber || 'CTA-0501-8841-01',
    employeeCount: params.employeeCount,
    totalPayrollAmountHNL: params.totalPayrollAmountHNL,
    feePerEmployeeHNL: feeRate,
    totalFeeCollectedHNL: totalFee,
    status: 'procesada',
    processedMonth: state.gameMonth
  };

  const existingBatches = state.payrollBatches || [];
  const updatedBatches = [newBatch, ...existingBatches];

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    feeIncomePayrollServices: state.financials.feeIncomePayrollServices + totalFee,
    totalFeeIncome: state.financials.totalFeeIncome + totalFee,
    nonInterestFeeIncomeMonthly: (state.financials.nonInterestFeeIncomeMonthly || 0) + totalFee,
    cashAndBCHReserves: state.financials.cashAndBCHReserves + totalFee
  };

  return {
    updatedState: {
      ...state,
      payrollBatches: updatedBatches,
      financials: updatedFinancials
    },
    batch: newBatch,
    successMessage: `Planilla de ${params.companyName} procesada: ${params.employeeCount.toLocaleString()} colaboradores acreditados por ${formatHNL(params.totalPayrollAmountHNL)}. Comisión por dispersión cobrada: ${formatHNL(totalFee)}.`
  };
}

/**
 * Ejecución de transferencia interbancaria ACH Pronto (CEPROBAN)
 * Costo oficial regulado de L. 20.00 por transacción
 */
export function executeAchTransfer(
  state: GameState,
  params: {
    sourceAccountNumber: string;
    sourceClientName: string;
    destinationBank: 'Banco Atlántida' | 'Banco Ficohsa' | 'BAC Credomatic' | 'Banpaís' | 'Banco de Occidente' | 'Davivienda' | 'Promerica';
    destinationAccount: string;
    recipientName: string;
    amountHNL: number;
    referenceNote: string;
  }
): { updatedState: GameState; transaction: AchTransferTransaction; successMessage: string } {
  const achFee = 20.0; // Tarifa oficial regulada CEPROBAN
  const txId = `ACH-2026-${Math.floor(100000 + Math.random() * 899999)}`;

  const newTx: AchTransferTransaction = {
    id: txId,
    sourceAccountNumber: params.sourceAccountNumber,
    sourceClientName: params.sourceClientName,
    destinationBank: params.destinationBank,
    destinationAccount: params.destinationAccount,
    recipientName: params.recipientName,
    amountHNL: params.amountHNL,
    commissionFeeHNL: achFee,
    referenceNote: params.referenceNote,
    status: 'liquidada',
    timestamp: Date.now(),
    month: state.gameMonth
  };

  const existingTxs = state.achTransactions || [];
  const updatedTxs = [newTx, ...existingTxs];

  const updatedFinancials: BankFinancialStatements = {
    ...state.financials,
    feeIncomeClearingACH: state.financials.feeIncomeClearingACH + achFee,
    totalFeeIncome: state.financials.totalFeeIncome + achFee,
    nonInterestFeeIncomeMonthly: (state.financials.nonInterestFeeIncomeMonthly || 0) + achFee,
    cashAndBCHReserves: state.financials.cashAndBCHReserves + achFee
  };

  return {
    updatedState: {
      ...state,
      achTransactions: updatedTxs,
      financials: updatedFinancials
    },
    transaction: newTx,
    successMessage: `Transferencia ACH Pronto ${txId} liquidada hacia ${params.destinationBank} por ${formatHNL(params.amountHNL)}. Comisión CEPROBAN cobrada: L. 20.00.`
  };
}


