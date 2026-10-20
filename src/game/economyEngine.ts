import { 
  GameState, 
  CreditApplication, 
  GameEventNotification,
  BankFinancialStatements,
  BankingDivisionId,
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
  SwiftTransaction
} from './types';

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

  (Object.keys(updatedDivisions) as BankingDivisionId[]).forEach(divId => {
    const div = { ...updatedDivisions[divId] };
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

  // 4. Actualización Mensual Individual de Clientes (Cuentas, Préstamos, Tarjetas, Mora y Promoción Automática)
  const upgradeNotifs: GameEventNotification[] = [];
  const updatedClients: IndividualClient[] = state.clients.map(client => {
    // Si el cliente fue vendido a un banco competidor, ya no opera en Áureo
    if (client.isSoldToRival) {
      return client;
    }

    const divConfig = updatedDivisions[client.division] || updatedDivisions.personas;
    const monthlyDepositRate = (divConfig.avgDepositRate / 100) / 12;

    // A. Rendimiento de cuenta bancaria e ingresos mensuales
    let newBalance = Math.round(client.accountBalanceHNL * (1 + monthlyDepositRate));
    // Pequeño flujo regular de ingresos o salarios acreditados
    const regularInflow = Math.round(client.accountBalanceHNL * (0.005 + Math.random() * 0.015));
    newBalance += regularInflow;

    // B. Cuotas de Préstamo y Cobranza / Mora
    let loanBal = client.loanBalanceHNL;
    let monthsRem = client.loanMonthsRemaining;
    let pastDays = client.pastDueDays;
    let pastAmt = client.pastDueAmountHNL;
    let cnbs = client.cnbsCategory;

    if (client.hasLoan && monthsRem > 0 && loanBal > 0) {
      const paymentDue = client.loanMonthlyPaymentHNL;
      const canPay = client.guaranteedPayment || newBalance >= paymentDue;

      if (canPay) {
        // Pago exitoso de cuota
        if (!client.guaranteedPayment) {
          newBalance = Math.max(0, newBalance - paymentDue);
        }
        const amortization = Math.min(loanBal, paymentDue * 0.75);
        loanBal = Math.max(0, loanBal - amortization);
        monthsRem = Math.max(0, monthsRem - 1);
        pastDays = 0;
        pastAmt = 0;
        cnbs = 'I - Normal';

        // Si terminó de pagar el préstamo
        if (loanBal <= 0 || monthsRem <= 0) {
          loanBal = 0;
          monthsRem = 0;
        }
      } else {
        // Incumplimiento: entra o incrementa días de mora
        pastDays += 30;
        pastAmt += paymentDue;
        if (pastDays >= 180) {
          cnbs = 'V - Pérdida';
        } else if (pastDays >= 90) {
          cnbs = 'IV - Dudoso Recaudo';
        } else if (pastDays >= 60) {
          cnbs = 'III - Subnormal';
        } else {
          cnbs = 'II - Especial';
        }
      }
    }

    // C. Tarjeta de Crédito (Pagos y Consumos)
    let cardBal = client.creditCardBalanceHNL;
    if (client.hasCreditCard && cardBal > 0) {
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
      // Consumo mensual regular si tiene límite
      if (client.creditCardLimitHNL > cardBal) {
        const newCharge = Math.round((client.creditCardLimitHNL - cardBal) * (0.05 + Math.random() * 0.1));
        cardBal += newCharge;
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
      loanMonthsRemaining: monthsRem,
      pastDueDays: pastDays,
      pastDueAmountHNL: pastAmt,
      cnbsCategory: cnbs,
      creditCardBalanceHNL: cardBal,
      pensionBalanceHNL: pensionBal
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
    innovations: updatedInnovations
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

  if (app.requestedAmount > 20000000) {
    return { updatedState: state, successMessage: 'Esta solicitud excede la autonomía del Oficial de Crédito (L. 20M). Requiere aprobación del Comité Ejecutivo y Presidencia.' };
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
 * Aprueba automáticamente en bloque todas las solicitudes elegibles según la política del Oficial (<= L. 20M)
 */
export function autoApproveAllOfficerEligibleCredits(state: GameState): { updatedState: GameState; count: number; totalApproved: number } {
  const eligible = state.pendingApplications.filter(a => a.requestedAmount <= 20000000 && a.cnbsCategory === 'I - Normal' && a.calculatedDTI <= 45);
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
