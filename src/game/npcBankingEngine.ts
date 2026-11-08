import { 
  DailySimulationState, 
  NpcBankId, 
  NpcBankProfile, 
  NpcCreditEvaluation, 
  NpcActiveLoan,
  TransactionVoucher,
  SimulatedEmail
} from './retroSimTypes';
import { calculateCollateralAvailableCoverage } from './commercialBanksEngine';

/**
 * Perfiles matemáticos de los 3 Bancos Virtuales NPC
 */
export const NPC_BANK_PROFILES: Record<NpcBankId, NpcBankProfile> = {
  banco_nacional: {
    id: 'banco_nacional',
    name: 'Banco Nacional de Desarrollo',
    tagline: 'El Conservador: Las tasas más bajas del país, pero exige máxima solvencia y colaterales reales.',
    personality: 'conservador',
    colorHex: '#1e3a8a', // Azul institucional
    icon: '🏛️',
    interestRateAnnual: 8.5, // Tasa Prime + 2.5%
    minCreditScoreRequired: 700,
    requiresCollateral: true,
    collateralRatioReq: 1.5, // 150% del valor del préstamo en garantías
    description: 'Entidad pública conservadora. Otorga préstamos a tasas preferenciales únicamente a empresas con historial impecable, liquidez comprobada y respaldo hipotecario o prendario de primer orden.'
  },
  banco_privado_intermedio: {
    id: 'banco_privado_intermedio',
    name: 'Banco de Inversión Metropolitano',
    tagline: 'El Intermedio: Flexibilidad crediticia, plazos adaptables y balance entre tasa y riesgo.',
    personality: 'intermedio',
    colorHex: '#047857', // Verde esmeralda bancario
    icon: '🏦',
    interestRateAnnual: 13.5,
    minCreditScoreRequired: 500,
    requiresCollateral: false,
    collateralRatioReq: 0.8, // 80% si el score es ajustado
    description: 'Banca comercial privada enfocada en pymes y corporaciones medianas. Ofrece desembolsos ágiles y opciones de renegociación a cambio de un margen financiero moderado.'
  },
  tiburon_prestamista: {
    id: 'tiburon_prestamista',
    name: 'Prestamista Capital "El Tiburón"',
    tagline: 'El Depredador: Liquidez de emergencia sin avales ni requisitos. Cobra tasa usurera y retiene ventas en mora.',
    personality: 'depredador',
    colorHex: '#991b1b', // Rojo peligro
    icon: '🦈',
    interestRateAnnual: 34.0, // Usura regulada
    minCreditScoreRequired: 0, // Presta a cualquiera
    requiresCollateral: false,
    collateralRatioReq: 0,
    sharkRetentionPct: 50, // Retiene el 50% de las ventas diarias si caes en mora
    description: 'Fondo de crédito no bancario de alto riesgo. Presta a empresas en quiebra sin pedir estados financieros, pero su cláusula de ejecución retiene el 50% del flujo de ingresos diarios en caja en caso de atraso.'
  }
};

/**
 * Fórmula de amortización francesa para calcular la cuota fija mensual
 */
function calculateFrenchQuota(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0) return principal;
  const monthlyRate = (annualRatePct / 100) / 12;
  if (monthlyRate === 0) return principal / months;
  const quota = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(quota);
}

/**
 * Subasta Instantánea: Evalúa la solicitud del jugador en los 3 bancos NPC simultáneamente
 */
export function evaluateNpcCreditAuction(
  state: DailySimulationState,
  requestedAmountHNL: number,
  termMonths: number,
  selectedCollateralIds: string[] = []
): NpcCreditEvaluation[] {
  const currentScore = state.companyCreditProfile?.score ?? 680;
  // Si tiene CFO contratado, buff pasivo de +50 puntos de score
  const hasCfo = Boolean(state.cSuiteStaff && state.cSuiteStaff.includes('CFO'));
  const effectiveScore = hasCfo ? Math.min(850, currentScore + 50) : currentScore;

  // Calcular cobertura de garantías aportadas
  const collaterals = state.realEstateCollaterals || [];
  const selectedCollaterals = collaterals.filter(c => selectedCollateralIds.includes(c.id));
  const collateralProvidedHNL = selectedCollaterals.reduce((acc, c) => acc + calculateCollateralAvailableCoverage(c), 0);

  // Evaluar flujo de los últimos turnos
  const profitsHistory = state.historicalProfits || [];
  const recentProfits = profitsHistory.slice(-3);
  const isCashFlowPositive = recentProfits.length === 0 || recentProfits.every(p => p >= 0);

  return (Object.keys(NPC_BANK_PROFILES) as NpcBankId[]).map(bId => {
    const profile = NPC_BANK_PROFILES[bId];
    const quota = calculateFrenchQuota(requestedAmountHNL, profile.interestRateAnnual, termMonths);
    const totalRepayment = quota * termMonths;

    let isApproved = true;
    let rejectionReason: string | undefined = undefined;
    let collateralRequiredHNL = 0;
    let collateralMet = true;
    let specialClause: string | undefined = undefined;

    if (bId === 'banco_nacional') {
      collateralRequiredHNL = Math.round(requestedAmountHNL * profile.collateralRatioReq);
      collateralMet = collateralProvidedHNL >= collateralRequiredHNL;

      if (effectiveScore < profile.minCreditScoreRequired) {
        isApproved = false;
        rejectionReason = `Credit Score insuficiente (${effectiveScore} pts). Banco Nacional exige mínimo ${profile.minCreditScoreRequired} puntos.`;
      } else if (!isCashFlowPositive) {
        isApproved = false;
        rejectionReason = 'Tu flujo de caja registra meses deficitarios recientes. El comité de riesgo exige 3 turnos continuos en positivo.';
      } else if (!collateralMet) {
        isApproved = false;
        rejectionReason = `Exige garantía real del 150% (L ${collateralRequiredHNL.toLocaleString()}). Aportaste L ${collateralProvidedHNL.toLocaleString()}.`;
      } else {
        specialClause = 'Tasa preferencial Prime + 2.5%. Hipoteca/Prenda de 1er Rango registrada sobre los bienes aportados.';
      }
    } else if (bId === 'banco_privado_intermedio') {
      if (effectiveScore < profile.minCreditScoreRequired) {
        isApproved = false;
        rejectionReason = `Credit Score insuficiente (${effectiveScore} pts). Exige al menos ${profile.minCreditScoreRequired} puntos.`;
      } else {
        specialClause = 'Línea de crédito comercial con opción a reestructuración de cuotas sin penalidad severa.';
      }
    } else if (bId === 'tiburon_prestamista') {
      // El tiburón siempre aprueba, pero advierte sobre la retención agresiva de caja
      isApproved = true;
      specialClause = 'ADVERTENCIA DE RIESGO: Si caes en mora, El Tiburón retiene automáticamente el 50% de todas las ventas diarias hasta cancelar la cuota.';
    }

    return {
      bankId: profile.id,
      bankName: profile.name,
      personality: profile.personality,
      icon: profile.icon,
      isApproved,
      rejectionReason,
      approvedAmountHNL: requestedAmountHNL,
      interestRateAnnual: profile.interestRateAnnual,
      termMonths,
      monthlyQuotaHNL: quota,
      totalRepaymentHNL: totalRepayment,
      collateralRequiredHNL,
      collateralProvidedHNL,
      collateralMet,
      specialClause
    };
  });
}

/**
 * Desembolsa inmediatamente el préstamo seleccionado de un banco NPC
 */
export function disburseNpcLoan(
  state: DailySimulationState,
  bankId: NpcBankId,
  amountHNL: number,
  termMonths: number,
  destination: 'bank' | 'cash' = 'bank',
  selectedCollateralIds: string[] = []
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher } {
  if (amountHNL <= 0 || termMonths <= 0) {
    return { updatedState: state, success: false, message: 'El monto y plazo solicitados deben ser superiores a cero.' };
  }

  const evaluation = evaluateNpcCreditAuction(state, amountHNL, termMonths, selectedCollateralIds)
    .find(e => e.bankId === bankId);

  if (!evaluation || !evaluation.isApproved) {
    return {
      updatedState: state,
      success: false,
      message: evaluation?.rejectionReason || 'La entidad bancaria rechazó la solicitud de crédito.'
    };
  }

  const profile = NPC_BANK_PROFILES[bankId];
  const quota = evaluation.monthlyQuotaHNL;

  // 1. Acreditar fondos líquidos
  const isCash = destination === 'cash';
  const newCash = isCash ? state.storeCash + amountHNL : state.storeCash;
  const newBank = !isCash ? state.storeBankBalance + amountHNL : state.storeBankBalance;

  let updatedCommercialBanks = { ...state.commercialBanks };
  if (!isCash && updatedCommercialBanks) {
    const firstBId = Object.keys(updatedCommercialBanks)[0] as keyof typeof updatedCommercialBanks;
    if (firstBId && updatedCommercialBanks[firstBId]?.checkingAccount) {
      const chk = updatedCommercialBanks[firstBId]!.checkingAccount!;
      updatedCommercialBanks = {
        ...updatedCommercialBanks,
        [firstBId]: {
          ...updatedCommercialBanks[firstBId]!,
          checkingAccount: { ...chk, balance: chk.balance + amountHNL }
        }
      };
    }
  }

  // 2. Pignorar garantías si es Banco Nacional
  let updatedCollaterals = state.realEstateCollaterals ? [...state.realEstateCollaterals] : [];
  if (profile.requiresCollateral && selectedCollateralIds.length > 0) {
    updatedCollaterals = updatedCollaterals.map(col => {
      if (selectedCollateralIds.includes(col.id)) {
        return {
          ...col,
          isPledged: true,
          isLockedForSale: true,
          status: 'pignorado_total' as const,
          situationNotes: `Pignorado a favor de ${profile.name} en garantía de crédito por L ${amountHNL.toLocaleString()}.`
        };
      }
      return col;
    });
  }

  // 3. Crear el crédito activo NPC
  const newLoan: NpcActiveLoan = {
    id: `npc_loan_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    bankId: profile.id,
    bankName: profile.name,
    principalAmount: amountHNL,
    balanceRemaining: amountHNL,
    monthlyQuota: quota,
    interestRateAnnual: profile.interestRateAnnual,
    termMonthsRemaining: termMonths,
    isSharkLoan: bankId === 'tiburon_prestamista',
    sharkBlockedCash: false,
    sharkRetainedAmount: 0,
    isDelinquent: false,
    collateralIdRef: selectedCollateralIds[0]
  };

  const updatedNpcLoans = [...(state.npcLoans || []), newLoan];

  // 4. Comprobante Oficial de Desembolso
  const voucher: TransactionVoucher = {
    id: `vch_npc_${Date.now()}`,
    voucherNumber: `NPC-DISB-${profile.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
    operationType: 'desembolso_prestamo',
    title: `Desembolso de Financiamiento — ${profile.name}`,
    timestamp: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    accountNumber: isCash ? 'Caja Chica de Tesorería' : 'Cuenta Comercial Bancaria',
    destinationAccountNumber: `${profile.id.toUpperCase()}-CRED-LN`,
    grossAmountHNL: amountHNL,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: amountHNL,
    priorBalanceHNL: isCash ? state.storeCash : state.storeBankBalance,
    newBalanceHNL: isCash ? newCash : newBank,
    referenceCode: `NPC-TX-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: `SISTEMA FINANCIERO NPC — AUTORIZACIÓN ${profile.personality.toUpperCase()}`,
    disclaimer: `Cuota Mensual pactada: L ${quota.toLocaleString()} / mes durante ${termMonths} meses al ${profile.interestRateAnnual}% anual.`
  };

  const email: SimulatedEmail = {
    id: `email_npc_disb_${Date.now()}`,
    category: 'bancos_financiamiento',
    senderName: profile.name,
    senderEmail: `creditos@${profile.id}.hn`,
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `¡Financiamiento Aprobado y Desembolsado! L ${amountHNL.toLocaleString()}`,
    body: `Estimado(a) Cliente:\n\nConfirmamos la acreditación de L ${amountHNL.toLocaleString()} en su cuenta de ${isCash ? 'Caja Chica' : 'Bancos'}.\n\n• Entidad Financiera: ${profile.name}\n• Tasa de Interés: ${profile.interestRateAnnual}% anual\n• Plazo de Pago: ${termMonths} meses\n• Cuota Nivelada Mensual: L ${quota.toLocaleString()}\n\n${evaluation.specialClause || ''}\n\nFavor mantener sus fondos disponibles antes de cada cierre mensual para evitar morosidad y recargos coactivos.`,
    sentDate: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    voucherPayload: voucher,
    accionEjecutada: true,
    accionResultado: '✔ Crédito Liquidado'
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: newCash,
    storeBankBalance: newBank,
    commercialBanks: updatedCommercialBanks,
    realEstateCollaterals: updatedCollaterals,
    npcLoans: updatedNpcLoans,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
    simulatedEmails: [email, ...(state.simulatedEmails || [])]
  };

  return {
    updatedState,
    success: true,
    message: `¡Crédito de ${profile.name} por L ${amountHNL.toLocaleString()} desembolsado exitosamente! Cuota mensual: L ${quota.toLocaleString()}.`,
    voucher
  };
}

/**
 * Pago manual o abono a cuota de un préstamo NPC
 */
/**
 * Pago manual o abono a cuota de un préstamo NPC
 */
export function payNpcLoanQuota(
  state: DailySimulationState,
  loanId: string,
  amountOrFullPayoff: number | boolean,
  source: 'bank' | 'cash' = 'bank'
): { updatedState: DailySimulationState; success: boolean; message: string; remainingBalance: number; voucher?: TransactionVoucher } {
  const loans = state.npcLoans || [];
  const loan = loans.find(l => l.id === loanId);
  if (!loan) {
    return { updatedState: state, success: false, message: 'Préstamo no encontrado.', remainingBalance: 0 };
  }

  const isCash = source === 'cash';
  const availableFunds = isCash ? (state.storeCash || 0) : (state.storeBankBalance || 0);
  
  let targetAmount: number;
  if (typeof amountOrFullPayoff === 'boolean') {
    targetAmount = amountOrFullPayoff ? loan.balanceRemaining : loan.monthlyQuota;
  } else {
    targetAmount = amountOrFullPayoff;
  }

  const actualPayment = Math.min(targetAmount, loan.balanceRemaining);

  if (actualPayment <= 0) {
    return { updatedState: state, success: false, message: 'El importe a pagar debe ser mayor a cero.', remainingBalance: loan.balanceRemaining };
  }
  if (actualPayment > availableFunds) {
    return { 
      updatedState: state, 
      success: false, 
      message: `Fondos insuficientes en ${isCash ? 'Caja' : 'Banco'}. Disponible: L ${availableFunds.toLocaleString()}, Requerido: L ${actualPayment.toLocaleString()}.`, 
      remainingBalance: loan.balanceRemaining 
    };
  }

  const newBalance = Math.max(0, loan.balanceRemaining - actualPayment);
  const newCash = isCash ? state.storeCash - actualPayment : state.storeCash;
  const newBank = !isCash ? state.storeBankBalance - actualPayment : state.storeBankBalance;

  // Si cancela la deuda, liberar garantía si tenía
  let updatedCollaterals = state.realEstateCollaterals ? [...state.realEstateCollaterals] : [];
  if (newBalance === 0 && loan.collateralIdRef) {
    updatedCollaterals = updatedCollaterals.map(c => {
      if (c.id === loan.collateralIdRef) {
        return {
          ...c,
          isPledged: false,
          isLockedForSale: false,
          status: 'disponible' as const,
          situationNotes: 'Garantía liberada por finiquito total del crédito.'
        };
      }
      return c;
    });
  }

  const updatedLoans = loans.map(l => {
    if (l.id === loanId) {
      return {
        ...l,
        balanceRemaining: newBalance,
        isDelinquent: false,
        sharkBlockedCash: false
      };
    }
    return l;
  }).filter(l => l.balanceRemaining > 0); // Remover si está en cero

  const voucher: TransactionVoucher = {
    id: `vch_npc_pay_${Date.now()}`,
    voucherNumber: `NPC-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
    operationType: newBalance === 0 ? 'cancelacion_total' : 'pago_cuota',
    title: `Recibo de Pago — ${loan.bankName}`,
    timestamp: `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    grossAmountHNL: actualPayment,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: actualPayment,
    priorBalanceHNL: loan.balanceRemaining,
    newBalanceHNL: newBalance,
    referenceCode: `NPC-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: 'PAGO APLICADO A CARTERA NPC — CONFORMIDAD DE RECIBIDO',
    disclaimer: newBalance === 0 ? '¡Préstamo cancelado en su totalidad!' : `Saldo pendiente: L ${newBalance.toLocaleString()}.`
  };

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: newCash,
    storeBankBalance: newBank,
    realEstateCollaterals: updatedCollaterals,
    npcLoans: updatedLoans,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])]
  };

  return {
    updatedState,
    success: true,
    message: newBalance === 0 
      ? `¡Préstamo con ${loan.bankName} cancelado al 100%! Garantías liberadas.`
      : `Abono de L ${actualPayment.toLocaleString()} aplicado. Saldo deudor restante: L ${newBalance.toLocaleString()}.`,
    remainingBalance: newBalance,
    voucher
  };
}

/**
 * Retención diaria agresiva del Tiburón si el jugador está en mora:
 * Retiene el 50% de las ventas en caja hasta cubrir la cuota atrasada
 */
export function applySharkDailyRetention(
  state: DailySimulationState,
  dailyGrossSales?: number
): DailySimulationState & { updatedState: DailySimulationState; retainedHNL: number; message?: string } {
  const loans = state.npcLoans || [];
  const delinquentSharkLoan = loans.find(l => l.isSharkLoan && l.isDelinquent);

  const effectiveSales = dailyGrossSales !== undefined
    ? dailyGrossSales
    : (state.dailyReceipts || []).reduce((sum, r) => sum + (r.totalAmount ?? (r as any).total ?? 0), 0);

  if (!delinquentSharkLoan || effectiveSales <= 0) {
    const res = { ...state, updatedState: state, retainedHNL: 0 };
    return res;
  }

  // Retener el 50% de las ventas del día
  const retainedHNL = Math.round(effectiveSales * 0.50);
  const newLoanBalance = Math.max(0, delinquentSharkLoan.balanceRemaining - retainedHNL);
  const newRetainedTotal = (delinquentSharkLoan.sharkRetainedAmount || 0) + retainedHNL;
  const isCured = newLoanBalance === 0 || newRetainedTotal >= delinquentSharkLoan.monthlyQuota;

  const updatedLoans = loans.map(l => {
    if (l.id === delinquentSharkLoan.id) {
      return {
        ...l,
        balanceRemaining: newLoanBalance,
        sharkRetainedAmount: newRetainedTotal,
        isDelinquent: !isCured,
        sharkBlockedCash: true
      };
    }
    return l;
  });

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: Math.max(0, (state.storeCash || 0) - retainedHNL),
    npcLoans: updatedLoans
  };

  const finalResult = {
    ...updatedState,
    updatedState,
    retainedHNL,
    message: `⚠️ RETENCIÓN FORZOSA: El Tiburón embargó L ${retainedHNL.toLocaleString()} (50% de tus ventas de hoy) por cuota en mora.`
  };

  return finalResult;
}
