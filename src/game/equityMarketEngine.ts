import { 
  DailySimulationState, 
  CapTableInvestor, 
  EquityRoundOffer, 
  IpoStatus,
  TransactionVoucher,
  SimulatedEmail
} from './retroSimTypes';

/**
 * Motor Financiero de Equity, Valuación Corporativa, Cap Table y Salida a Bolsa (IPO)
 */

/**
 * Fórmula de Valuación Básica:
 * Valor Empresa = (Ganancia Neta Promedio de últimos 3 turnos * 10) + Activos Fijos - Pasivos
 */
export function calculateCompanyValuation(state: DailySimulationState): {
  valuationHNL: number;
  averageMonthlyNetProfitHNL: number;
  totalAssetsHNL: number;
  totalLiabilitiesHNL: number;
  netEquityHNL: number;
  breakdown: {
    cashAndBanks: number;
    inventory: number;
    machinery: number;
    collaterals: number;
    bankDebt: number;
    npcDebt: number;
    sarDebt: number;
    supplierDebt: number;
  };
} {
  // 1. Ganancia Neta Promedio de últimos meses (mínimo 1 mes o historial)
  const profitsHistory = state.historicalProfits || [];
  const recentProfits = profitsHistory.length > 0 
    ? profitsHistory.slice(-3) 
    : [state.monthlySalesAccumulated > 0 ? state.monthlySalesAccumulated * 0.15 : 25000];

  const avgProfit = Math.max(0, recentProfits.reduce((acc, p) => acc + p, 0) / recentProfits.length);

  // 2. Activos Totales
  const cashAndBanks = (state.storeCash || 0) + (state.storeBankBalance || 0);

  const inventory = (state.products || []).reduce((acc, p) => acc + ((p.stock || 0) * (p.buyPrice || 0)), 0);

  const machinery = (state.ownedMachinery || []).reduce((acc, m) => {
    return acc + ((m.purchasePrice || m.purchaseCost || 0) * ((m.conditionPct || 100) / 100));
  }, 0);

  const collaterals = (state.realEstateCollaterals || []).reduce((acc, c) => {
    return acc + (c.marketValueHNL || c.marketValue || c.appraisalValueHNL || c.appraisalValue || 0);
  }, 0);

  const totalAssets = cashAndBanks + inventory + machinery + collaterals;

  // 3. Pasivos Totales
  let bankDebt = 0;
  if (state.commercialBanks) {
    for (const bId of Object.keys(state.commercialBanks)) {
      const rel = state.commercialBanks[bId as keyof typeof state.commercialBanks];
      if (rel?.activeLoan) {
        bankDebt += rel.activeLoan.balanceRemaining || 0;
      }
      if (rel?.corporateCard) {
        bankDebt += rel.corporateCard.usedBalance || rel.corporateCard.currentBalance || 0;
      }
    }
  }

  const npcDebt = (state.npcLoans || []).reduce((acc, l) => acc + (l.balanceRemaining || 0), 0);
  const sarDebt = state.sarTaxRecord?.pendingTaxDue || 0;
  const supplierDebt = (state.supplierCredits || []).filter(c => !c.isPaid).reduce((acc, c) => acc + c.amountHNL, 0);

  const totalLiabilities = bankDebt + npcDebt + sarDebt + supplierDebt;
  const netEquity = totalAssets - totalLiabilities;

  // Valuación con múltiplo de utilidades 10x más patrimonio tangible
  // Piso mínimo: el valor en libros neto positivo
  const earningsValue = avgProfit * 10;
  const rawValuation = earningsValue + Math.max(0, netEquity);
  const valuationHNL = Math.max(300000, Math.round(rawValuation));

  return {
    valuationHNL,
    averageMonthlyNetProfitHNL: Math.round(avgProfit),
    totalAssetsHNL: Math.round(totalAssets),
    totalLiabilitiesHNL: Math.round(totalLiabilities),
    netEquityHNL: Math.round(netEquity),
    breakdown: {
      cashAndBanks: Math.round(cashAndBanks),
      inventory: Math.round(inventory),
      machinery: Math.round(machinery),
      collaterals: Math.round(collaterals),
      bankDebt: Math.round(bankDebt),
      npcDebt: Math.round(npcDebt),
      sarDebt: Math.round(sarDebt),
      supplierDebt: Math.round(supplierDebt)
    }
  };
}

/**
 * Obtiene o inicializa la tabla de capitalización (Cap Table) del jugador al 100%
 */
export function getOrCreateCapTable(state: DailySimulationState): CapTableInvestor[] {
  if (state.capTable && state.capTable.length > 0) {
    return state.capTable;
  }

  const valuation = calculateCompanyValuation(state).valuationHNL;
  return [
    {
      id: 'investor_founder',
      name: `${state.storeName} (Propietario Fundador)`,
      sharePercentage: 100,
      investmentTotalHNL: 0,
      dividendsPaidTotalHNL: 0,
      isPlayer: true,
      type: 'founder',
      entryMonth: state.currentMonth || 1,
      entryValuationHNL: valuation
    }
  ];
}

/**
 * Genera rondas de inversión y propuestas de Venture Capital NPC basadas en la valuación
 */
export function generateEquityRoundOffers(state: DailySimulationState): EquityRoundOffer[] {
  const { valuationHNL, averageMonthlyNetProfitHNL } = calculateCompanyValuation(state);
  const month = state.currentMonth || 1;

  const templates = [
    {
      id: `offer_angel_${month}`,
      fundName: 'Red de Ángeles Inversionistas de Honduras',
      fundType: 'angel_group' as const,
      badge: '👼 Ángeles Inversionistas',
      offeredSharePct: 10,
      premiumMultiplier: 1.05,
      minMonthlyProfitReq: 0,
      description: 'Inyección de capital inicial para consolidar caja operativa y acelerar inventarios sin atarse a cuotas bancarias.'
    },
    {
      id: `offer_vc_valle_${month}`,
      fundName: 'Valle de Sula Venture Capital',
      fundType: 'venture_capital' as const,
      badge: '🚀 Venture Capital',
      offeredSharePct: 15,
      premiumMultiplier: 1.15,
      minMonthlyProfitReq: 15000,
      description: 'Fondo de capital de riesgo para scale-ups comerciales y constructoras con alto potencial de crecimiento regional.'
    },
    {
      id: `offer_pe_morazan_${month}`,
      fundName: 'Morazán Private Equity Partners',
      fundType: 'private_equity' as const,
      badge: '🏛️ Private Equity',
      offeredSharePct: 20,
      premiumMultiplier: 1.25,
      minMonthlyProfitReq: 40000,
      description: 'Inversión institucional para expansión agresiva de flota, aperturas de sucursales y preparación para Salida a Bolsa (IPO).'
    }
  ];

  return templates.map(t => {
    const rawCash = (valuationHNL * (t.offeredSharePct / 100)) * t.premiumMultiplier;
    const cashInjectionHNL = Math.round(rawCash / 1000) * 1000;
    const impliedValuation = Math.round((cashInjectionHNL / (t.offeredSharePct / 100)));

    return {
      id: t.id,
      fundName: t.fundName,
      fundType: t.fundType,
      badge: t.badge,
      offeredSharePct: t.offeredSharePct,
      cashInjectionHNL,
      impliedValuationHNL: impliedValuation,
      minMonthlyProfitReq: t.minMonthlyProfitReq,
      expiresMonth: month + 2,
      description: t.description,
      status: 'disponible' as const
    };
  });
}

/**
 * Acepta una oferta de Venture Capital / Inversionista:
 * Inyecta el capital a bancos/caja sin cuotas ni deuda y añade el inversionista al Cap Table
 */
export function acceptEquityOffer(
  state: DailySimulationState,
  offerId: string,
  destination: 'bank' | 'cash' = 'bank'
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher } {
  const capTable = getOrCreateCapTable(state);
  const playerInvestor = capTable.find(i => i.isPlayer);
  if (!playerInvestor) {
    return { updatedState: state, success: false, message: 'No se encontró la titularidad del fundador en el Cap Table.' };
  }

  const offers = state.equityOffers && state.equityOffers.length > 0 
    ? state.equityOffers 
    : generateEquityRoundOffers(state);

  const offer = offers.find(o => o.id === offerId);
  if (!offer) {
    return { updatedState: state, success: false, message: 'La oferta de inversión seleccionada no existe o expiró.' };
  }

  if (offer.status !== 'disponible') {
    return { updatedState: state, success: false, message: 'Esta oferta de inversión ya fue procesada anteriormente.' };
  }

  if (playerInvestor.sharePercentage < offer.offeredSharePct + 10) {
    return { 
      updatedState: state, 
      success: false, 
      message: `No tienes suficiente porcentaje accionario disponible. Tu participación actual es de ${playerInvestor.sharePercentage}%.` 
    };
  }

  // 1. Inyección de liquidez en tesorería
  const isCash = destination === 'cash';
  const newCash = isCash ? state.storeCash + offer.cashInjectionHNL : state.storeCash;
  const newBank = !isCash ? state.storeBankBalance + offer.cashInjectionHNL : state.storeBankBalance;

  let updatedBanks = { ...state.commercialBanks };
  if (!isCash && updatedBanks) {
    // Acreditar en el primer banco con cuenta
    const firstBankId = Object.keys(updatedBanks)[0] as keyof typeof updatedBanks;
    if (firstBankId && updatedBanks[firstBankId]?.checkingAccount) {
      const chk = updatedBanks[firstBankId]!.checkingAccount!;
      updatedBanks = {
        ...updatedBanks,
        [firstBankId]: {
          ...updatedBanks[firstBankId]!,
          checkingAccount: {
            ...chk,
            balance: chk.balance + offer.cashInjectionHNL
          }
        }
      };
    }
  }

  // 2. Actualizar Cap Table
  const newInvestor: CapTableInvestor = {
    id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: offer.fundName,
    sharePercentage: offer.offeredSharePct,
    investmentTotalHNL: offer.cashInjectionHNL,
    dividendsPaidTotalHNL: 0,
    isPlayer: false,
    type: offer.fundType === 'angel_group' ? 'angel_investor' : 'venture_capital',
    entryMonth: state.currentMonth || 1,
    entryValuationHNL: offer.impliedValuationHNL
  };

  const updatedCapTable: CapTableInvestor[] = capTable.map(inv => {
    if (inv.isPlayer) {
      return {
        ...inv,
        sharePercentage: Number((inv.sharePercentage - offer.offeredSharePct).toFixed(2))
      };
    }
    return inv;
  }).concat(newInvestor);

  // 3. Generar Comprobante Oficial de Inyección de Capital
  const voucher: TransactionVoucher = {
    id: `vch_equity_${Date.now()}`,
    voucherNumber: `EQ-INJ-${state.currentYear || 2026}-${Math.floor(100000 + Math.random() * 900000)}`,
    operationType: 'inyeccion_capital_equity',
    title: `Escritura de Aumento de Capital & Inyección de Equity (${offer.offeredSharePct}%)`,
    timestamp: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    accountNumber: isCash ? 'Caja Chica de Tesorería' : 'Cuenta de Cheques Comercial',
    destinationAccountNumber: `FONDO-INV-${offer.fundName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}`,
    grossAmountHNL: offer.cashInjectionHNL,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: offer.cashInjectionHNL,
    priorBalanceHNL: isCash ? state.storeCash : state.storeBankBalance,
    newBalanceHNL: isCash ? newCash : newBank,
    referenceCode: `EQ-REF-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: `REGISTRO MERCANTIL DE HONDURAS - LIBRO ACCIONISTAS - FOLIO ${Math.floor(100 + Math.random() * 900)}`,
    disclaimer: `Inversión en Equity al ${offer.offeredSharePct}%. Sin pasivo exigible ni cuota mensual fija.`
  };

  // 4. Notificación formal en el correo empresarial
  const email: SimulatedEmail = {
    id: `email_eq_${Date.now()}`,
    category: 'bancos_financiamiento',
    senderName: offer.fundName,
    senderEmail: `inversiones@${offer.fundName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `¡Formalización Exitosa! Inyección de Capital L ${offer.cashInjectionHNL.toLocaleString()} Acreditada`,
    body: `Estimado(a) Director(a) General:\n\nNos complace confirmar el cierre formal de la ronda de inversión por el ${offer.offeredSharePct}% de las acciones de ${state.storeName}.\n\n• Capital Aportado: L ${offer.cashInjectionHNL.toLocaleString()} (100% líquido, libre de deuda)\n• Valuación Implícita Acordada: L ${offer.impliedValuationHNL.toLocaleString()}\n• Nueva Participación del Fundador: ${(playerInvestor.sharePercentage - offer.offeredSharePct).toFixed(1)}%\n\nEsta inyección no devenga cuotas de amortización. La retribución a nuestro fondo provendrá exclusivamente de los dividendos semestrales o anuales generados por la rentabilidad neta del negocio.\n\nAtentamente,\nComité de Inversiones de ${offer.fundName}`,
    sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    voucherPayload: voucher,
    accionEjecutada: true,
    accionResultado: '✔ Ronda Cerrada'
  };

  const updatedOffers = offers.map(o => o.id === offerId ? { ...o, status: 'aceptada' as const } : o);

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: newCash,
    storeBankBalance: newBank,
    commercialBanks: updatedBanks,
    capTable: updatedCapTable,
    equityOffers: updatedOffers,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
    simulatedEmails: [email, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState,
    success: true,
    message: `¡Ronda de inversión cerrada! Se inyectaron L ${offer.cashInjectionHNL.toLocaleString()} a cambio del ${offer.offeredSharePct}% de la empresa.`,
    voucher
  };
}

/**
 * Recompra de Acciones (Share Buyback):
 * El fundador recompra la participación de un inversionista al valor actual de mercado
 */
export function executeShareBuyback(
  state: DailySimulationState,
  investorId: string
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher } {
  const capTable = getOrCreateCapTable(state);
  const investor = capTable.find(i => i.id === investorId);
  const founder = capTable.find(i => i.isPlayer);

  if (!investor || investor.isPlayer) {
    return { updatedState: state, success: false, message: 'Inversionista no válido para recompra accionaria.' };
  }
  if (!founder) {
    return { updatedState: state, success: false, message: 'No se encontró la ficha del fundador.' };
  }

  const { valuationHNL } = calculateCompanyValuation(state);
  const buybackCostHNL = Math.round(valuationHNL * (investor.sharePercentage / 100));

  const availableLiquidity = (state.storeBankBalance || 0) + (state.storeCash || 0);
  if (buybackCostHNL > availableLiquidity) {
    return {
      updatedState: state,
      success: false,
      message: `Liquidez insuficiente para recomprar el ${investor.sharePercentage}% de acciones. Costo actual de mercado: L ${buybackCostHNL.toLocaleString()}, Liquidez disponible: L ${availableLiquidity.toLocaleString()}.`
    };
  }

  // Descontar pago de fondos de la empresa (prioridad cuenta bancaria)
  let newBank = state.storeBankBalance;
  let newCash = state.storeCash;
  if (newBank >= buybackCostHNL) {
    newBank -= buybackCostHNL;
  } else {
    const remainder = buybackCostHNL - newBank;
    newBank = 0;
    newCash -= remainder;
  }

  // Restituir porcentaje al fundador y eliminar inversionista
  const restoredShare = Number((founder.sharePercentage + investor.sharePercentage).toFixed(2));
  const updatedCapTable: CapTableInvestor[] = capTable
    .filter(i => i.id !== investorId)
    .map(i => i.isPlayer ? { ...i, sharePercentage: restoredShare } : i);

  const voucher: TransactionVoucher = {
    id: `vch_buyback_${Date.now()}`,
    voucherNumber: `BUYBACK-${state.currentYear || 2026}-${Math.floor(100000 + Math.random() * 900000)}`,
    operationType: 'recompra_acciones',
    title: `Comprobante de Recompra Accionaria (${investor.sharePercentage}%)`,
    timestamp: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    grossAmountHNL: buybackCostHNL,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: buybackCostHNL,
    priorBalanceHNL: availableLiquidity,
    newBalanceHNL: newBank + newCash,
    referenceCode: `BB-TX-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: 'RECOMPRA ACCIONARIA VALIDADA — RETORNO A CONTROL TOTAL',
    disclaimer: `El fundador recupera el ${investor.sharePercentage}% accionario. Participación consolidada: ${restoredShare}%.`
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    capTable: updatedCapTable,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])]
  };

  return {
    updatedState,
    success: true,
    message: `¡Recompra accionaria completada! Recuperaste el ${investor.sharePercentage}% por L ${buybackCostHNL.toLocaleString()}. Tu control actual es del ${restoredShare}%.`,
    voucher
  };
}

/**
 * Reparto Automático de Dividendos al Fin de Turno / Mes:
 * Si hay ganancia neta positiva, se reparte pro-rata a inversionistas externos.
 */
export function distributeDividendsAtMonthEnd(
  state: DailySimulationState,
  monthlyNetProfit: number
): { updatedState: DailySimulationState; totalDividendsPaid: number; distributions: { name: string; amount: number }[] } {
  if (monthlyNetProfit <= 0) {
    return { updatedState: state, totalDividendsPaid: 0, distributions: [] };
  }

  const capTable = getOrCreateCapTable(state);
  const externalInvestors = capTable.filter(i => !i.isPlayer && i.sharePercentage > 0);

  if (externalInvestors.length === 0) {
    return { updatedState: state, totalDividendsPaid: 0, distributions: [] };
  }

  // Repartir el 40% de la utilidad neta como dividendo distribuible
  const dividendPool = monthlyNetProfit * 0.40;
  let totalDistributed = 0;
  const distributions: { name: string; amount: number }[] = [];

  const updatedCapTable = capTable.map(inv => {
    if (!inv.isPlayer && inv.sharePercentage > 0) {
      const payout = Math.round(dividendPool * (inv.sharePercentage / 100));
      totalDistributed += payout;
      distributions.push({ name: inv.name, amount: payout });
      return {
        ...inv,
        dividendsPaidTotalHNL: (inv.dividendsPaidTotalHNL || 0) + payout
      };
    }
    return inv;
  });

  // Deducir de banco si hay saldo, de lo contrario caja
  let newBank = state.storeBankBalance || 0;
  let newCash = state.storeCash || 0;
  if (newBank >= totalDistributed) {
    newBank -= totalDistributed;
  } else {
    const rem = totalDistributed - newBank;
    newBank = 0;
    newCash = Math.max(0, newCash - rem);
  }

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    capTable: updatedCapTable,
    dividendsPaidYTD: (state.dividendsPaidYTD || 0) + totalDistributed
  };

  return {
    updatedState,
    totalDividendsPaid: totalDistributed,
    distributions
  };
}

/**
 * Evaluación de Elegibilidad para Salida a Bolsa (IPO - Initial Public Offering)
 */
export function evaluateIpoEligibility(state: DailySimulationState): IpoStatus {
  const { valuationHNL, netEquityHNL } = calculateCompanyValuation(state);
  const minValuationMet = valuationHNL >= 10000000; // L 10 Millones
  const solvenciaFiscalActive = Boolean(state.fiscalSolvenciaActive && state.sarTaxRecord?.solvenciaFiscalIssued);
  const profitsHistory = state.historicalProfits || [];
  
  // Contar meses consecutivos con ganancia positiva
  let consecutiveProfitableMonths = 0;
  for (let i = profitsHistory.length - 1; i >= 0; i--) {
    if (profitsHistory[i] > 0) {
      consecutiveProfitableMonths++;
    } else {
      break;
    }
  }

  const positiveNetEquity = netEquityHNL > 2000000;
  const targetConsecutiveMonths = 3;
  const isEligible = minValuationMet && solvenciaFiscalActive && (consecutiveProfitableMonths >= targetConsecutiveMonths) && positiveNetEquity;

  return {
    isEligible,
    isIpoCompleted: Boolean(state.ipoStatus?.isIpoCompleted),
    tickerSymbol: state.ipoStatus?.tickerSymbol,
    ipoDay: state.ipoStatus?.ipoDay,
    ipoMonth: state.ipoStatus?.ipoMonth,
    ipoYear: state.ipoStatus?.ipoYear,
    ipoValuationHNL: state.ipoStatus?.ipoValuationHNL,
    fundsRaisedHNL: state.ipoStatus?.fundsRaisedHNL,
    publicSharePct: state.ipoStatus?.publicSharePct,
    requirements: {
      minValuationMet,
      solvenciaFiscalActive,
      consecutiveProfitableMonths,
      targetConsecutiveMonths,
      positiveNetEquity
    }
  };
}

/**
 * Ejecución de la Salida a Bolsa (IPO): El "Endgame" de Victoria Empresarial
 */
export function executeIpo(
  state: DailySimulationState,
  tickerSymbolInput?: string
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher } {
  const eligibility = evaluateIpoEligibility(state);
  if (!eligibility.isEligible && !state.ipoStatus?.isIpoCompleted) {
    return {
      updatedState: state,
      success: false,
      message: 'La empresa aún no cumple los requisitos bursátiles oficiales para salir a bolsa (Valuación L 10M+, Solvencia SAR activa, 3 meses seguidos de utilidades netas positivas).'
    };
  }

  if (state.ipoStatus?.isIpoCompleted) {
    return {
      updatedState: state,
      success: false,
      message: 'La empresa ya cotiza públicamente en el Mercado de Valores.'
    };
  }

  const { valuationHNL } = calculateCompanyValuation(state);
  const capTable = getOrCreateCapTable(state);
  const founder = capTable.find(i => i.isPlayer);
  if (!founder || founder.sharePercentage < 35) {
    return { updatedState: state, success: false, message: 'El fundador no posee suficiente participación para emitir acciones al mercado público.' };
  }

  // Oferta pública del 25% de la empresa a un múltiplo premium institucional (+20%)
  const publicSharePct = 25;
  const fundsRaisedHNL = Math.round((valuationHNL * 1.20) * (publicSharePct / 100));
  const newFounderShare = Number((founder.sharePercentage - publicSharePct).toFixed(2));

  const cleanTicker = (tickerSymbolInput || state.storeName.replace(/[^a-zA-Z]/g, '').slice(0, 4)).toUpperCase();

  const publicInvestor: CapTableInvestor = {
    id: 'investor_public_market',
    name: `Mercado Bursátil Público (${cleanTicker})`,
    sharePercentage: publicSharePct,
    investmentTotalHNL: fundsRaisedHNL,
    dividendsPaidTotalHNL: 0,
    isPlayer: false,
    type: 'public_market',
    entryMonth: state.currentMonth || 1,
    entryValuationHNL: Math.round(valuationHNL * 1.20)
  };

  const updatedCapTable: CapTableInvestor[] = capTable.map(inv => {
    if (inv.isPlayer) {
      return { ...inv, sharePercentage: newFounderShare };
    }
    return inv;
  }).concat(publicInvestor);

  const newBank = (state.storeBankBalance || 0) + fundsRaisedHNL;

  const ipoStatus: IpoStatus = {
    isEligible: true,
    isIpoCompleted: true,
    tickerSymbol: cleanTicker,
    ipoDay: state.currentDay,
    ipoMonth: state.currentMonth,
    ipoYear: state.currentYear || 2026,
    ipoValuationHNL: Math.round(valuationHNL * 1.20),
    fundsRaisedHNL,
    publicSharePct,
    requirements: eligibility.requirements
  };

  const voucher: TransactionVoucher = {
    id: `vch_ipo_${Date.now()}`,
    voucherNumber: `IPO-${cleanTicker}-${state.currentYear || 2026}`,
    operationType: 'salida_a_bolsa_ipo',
    title: `CAMPANADA OFICIAL: SALIDA A BOLSA DE VALORES (TICKER: ${cleanTicker})`,
    timestamp: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    grossAmountHNL: fundsRaisedHNL,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: fundsRaisedHNL,
    priorBalanceHNL: state.storeBankBalance || 0,
    newBalanceHNL: newBank,
    referenceCode: `IPO-HN-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: 'BOLSA CENTROAMERICANA DE VALORES - CAMPANA INAUGURAL - EMISIÓN PÚBLICA OFICIAL',
    disclaimer: `¡Victoria Empresarial! Salida pública exitosa. Capital recaudado: L ${fundsRaisedHNL.toLocaleString()}.`
  };

  const ipoEmail: SimulatedEmail = {
    id: `email_ipo_${Date.now()}`,
    category: 'sistema_avisos',
    senderName: 'Bolsa Centroamericana de Valores (BCV)',
    senderEmail: 'presidencia@bcv.hn',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `🔔 ¡HISTÓRICO! ${state.storeName} debuta en Bolsa con el Ticker [${cleanTicker}]`,
    body: `Estimado(a) Presidente(a) y Fundador(a):\n\nLa Bolsa de Valores se enorgullece en certificar el debut accionario de ${state.storeName}.\n\n• Ticker Oficial: ${cleanTicker}\n• Valuación de Salida: L ${(valuationHNL * 1.20).toLocaleString()}\n• Capital Neto Recaudado: L ${fundsRaisedHNL.toLocaleString()}\n• Participación Pública: 25.0%\n• Control del Fundador: ${newFounderShare}%\n\nHas alcanzado el estatus de Empresa Pública Consolidada. ¡Felicitaciones por coronar tu camino de empresario con esta victoria corporativa sin precedentes!`,
    sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    voucherPayload: voucher,
    accionEjecutada: true,
    accionResultado: `✔ Cotiza como ${cleanTicker}`
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    capTable: updatedCapTable,
    ipoStatus,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
    simulatedEmails: [ipoEmail, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState,
    success: true,
    message: `¡CAMPANA DE SALIDA A BOLSA! Tu empresa ahora cotiza como [${cleanTicker}] y recaudó L ${fundsRaisedHNL.toLocaleString()} en el mercado de valores público.`,
    voucher
  };
}
