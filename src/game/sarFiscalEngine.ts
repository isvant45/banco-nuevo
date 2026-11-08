import { 
  DailySimulationState, 
  SarFiscalPeriodRecord, 
  TransactionVoucher,
  SimulatedEmail,
  CommercialBankId
} from './retroSimTypes';

/**
 * Obtiene o crea el periodo fiscal del año simulado en curso
 */
export function getOrCreateCurrentFiscalPeriod(state: DailySimulationState): SarFiscalPeriodRecord {
  const currentYear = state.currentYear || 2026;
  const periods = state.fiscalPeriods || [];
  const existing = periods.find(p => p.fiscalYear === currentYear);

  if (existing) {
    return existing;
  }

  // Base imponible: ingresos brutos de ventas acumuladas
  const gross = Math.max(state.monthlySalesAccumulated * 12, 1200000);
  const deductions = Math.round(gross * 0.65); // 65% gastos y costos deducibles permitidos
  const taxableNet = Math.max(0, gross - deductions);
  const isrRate = 0.25; // 25% ISR
  const taxAmount = Math.round(taxableNet * isrRate);

  const newPeriod: SarFiscalPeriodRecord = {
    fiscalYear: currentYear,
    periodName: `Ejercicio Fiscal Ordinario ${currentYear}`,
    grossRevenueHNL: gross,
    allowableDeductionsHNL: deductions,
    taxableNetIncomeHNL: taxableNet,
    calculatedTaxAmount: taxAmount,
    isDeclared: false,
    isPaid: false,
    paidAmountHNL: 0,
    solvenciaIssued: false
  };

  return newPeriod;
}

/**
 * Presentación formal de la Declaración Jurada Formulario SAR-25
 * Nota: La presentación declara el impuesto adeudado pero NO debita dinero automáticamente.
 */
export function fileSarDeclaration(
  state: DailySimulationState,
  fiscalYear: number,
  periodMonth?: number
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentPeriod = getOrCreateCurrentFiscalPeriod(state);

  if (currentPeriod.isDeclared && state.sarTaxRecord?.isFiled) {
    return {
      updatedState: state,
      success: false,
      message: `La declaración jurada SAR-25 del periodo ${fiscalYear} ya fue presentada formalmente ante el SAR.`
    };
  }

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const formNumber = `SAR-25-DEC-${fiscalYear}-${Math.floor(100000 + Math.random() * 900000)}`;

  const updatedPeriod: SarFiscalPeriodRecord = {
    ...currentPeriod,
    isDeclared: true,
    declaredDate: timestampStr,
    declarationFormNumber: formNumber
  };

  const currentPeriods = state.fiscalPeriods || [];
  const nextPeriods = currentPeriods.some(p => p.fiscalYear === fiscalYear)
    ? currentPeriods.map(p => p.fiscalYear === fiscalYear ? updatedPeriod : p)
    : [...currentPeriods, updatedPeriod];

  // Generar notificación formal al correo empresarial
  const sarEmail: SimulatedEmail = {
    id: `email-sar-decl-${Date.now()}`,
    category: 'sar_tributario',
    senderName: 'Servicio de Administración de Rentas (SAR)',
    senderEmail: 'declaraciones@sar.gob.hn',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Confirmación de Recepción: Declaración Jurada SAR-25 Ejercicio ${fiscalYear}`,
    body: `Servicio de Administración de Rentas (SAR)\nNotificación Oficial Tributaria\n\nSe confirma la presentación electrónica de su Declaración Jurada anual de ISR (Formulario SAR-25):\n\n• Número de Formulario: ${formNumber}\n• Ejercicio Fiscal: ${fiscalYear}\n• Renta Neta Gravable: L ${updatedPeriod.taxableNetIncomeHNL.toLocaleString()}\n• Impuesto Determinado (25% ISR): L ${updatedPeriod.calculatedTaxAmount.toLocaleString()}\n• Estado de Pago: PENDIENTE DE LIQUIDACIÓN\n\nRECORDATORIO LEGAL: La presentación de la declaración no constituye pago. Para obtener su Solvencia Fiscal deberá realizar el pago correspondiente en ventanilla bancaria o a través del sistema.`,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    isArchived: false,
    folder: 'inbox',
    relatedEntityType: 'sar_obligation',
    relatedEntityId: formNumber
  };

  return {
    updatedState: {
      ...state,
      fiscalPeriods: nextPeriods,
      simulatedEmails: [sarEmail, ...(state.simulatedEmails || [])],
      sarTaxRecord: {
        ...state.sarTaxRecord,
        isFiled: true,
        pendingTaxDue: updatedPeriod.calculatedTaxAmount,
        isrTaxAmount: updatedPeriod.calculatedTaxAmount,
        isPaid: false
      }
    },
    success: true,
    message: `¡Declaración Jurada SAR-25 presentada con éxito! Se ha asignado el registro ${formNumber}. Impuesto determinado a pagar: L ${updatedPeriod.calculatedTaxAmount.toLocaleString()}.`
  };
}

/**
 * Pago total o parcial de la obligación tributaria de ISR ante el SAR
 */
export function paySarTaxObligation(
  state: DailySimulationState,
  amountToPay: number,
  payFromAccount: 'checking' | 'cash' | 'cuenta_bancaria' | 'caja' = 'checking',
  selectedBankId?: CommercialBankId,
  options?: {
    emailId?: string;
    fiscalYear?: number;
    obligationType?: string;
    paymentKey?: string;
  }
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher; remainingDebt: number } {
  // 1. Validar importe positivo y finito
  if (!Number.isFinite(amountToPay) || amountToPay <= 0) {
    return { 
      updatedState: state, 
      success: false, 
      message: 'El importe a pagar debe ser un valor numérico positivo y válido.',
      remainingDebt: state.sarTaxRecord?.pendingTaxDue ?? 0
    };
  }

  // 2. Identificar período fiscal exacto (sin inventar deudas)
  const targetYear = options?.fiscalYear || state.currentYear || 2026;
  const existingPeriod = (state.fiscalPeriods || []).find(p => p.fiscalYear === targetYear);
  const period = existingPeriod || getOrCreateCurrentFiscalPeriod(state);

  const pendingPeriodDebt = period.isPaid ? 0 : Math.max(0, period.calculatedTaxAmount - (period.paidAmountHNL || 0));
  const effectiveDebt = pendingPeriodDebt > 0 
    ? pendingPeriodDebt 
    : (state.sarTaxRecord?.pendingTaxDue && targetYear === (state.currentYear || 2026) ? state.sarTaxRecord.pendingTaxDue : 0);

  if (effectiveDebt <= 0) {
    return { 
      updatedState: state, 
      success: false, 
      message: `No existen saldos pendientes de pago para el ejercicio fiscal ${targetYear}. La obligación ya se encuentra liquidada.`,
      remainingDebt: 0
    };
  }

  const actualPayment = Math.min(amountToPay, effectiveDebt);
  const isCash = payFromAccount === 'cash' || payFromAccount === 'caja';

  // 3. Validar fondos suficientes en la cuenta de origen seleccionada
  let newCash = state.storeCash;
  let newBank = state.storeBankBalance;
  let updatedCommercialBanks = { ...state.commercialBanks };
  let sourceAccountLabel = 'Caja Chica (Efectivo)';
  let selectedBankName = 'Caja Chica';

  if (isCash) {
    if (state.storeCash < actualPayment) {
      return {
        updatedState: state,
        success: false,
        message: `Fondos insuficientes en Caja Chica para realizar el pago al SAR. Saldo disponible: L ${state.storeCash.toLocaleString()}, Importe requerido: L ${actualPayment.toLocaleString()}.`,
        remainingDebt: effectiveDebt
      };
    }
    newCash -= actualPayment;
  } else {
    // Para pagos en cuenta: si no se especifica banco, seleccionar el banco con cuenta de cheques disponible
    let targetBankId = selectedBankId;
    if (!targetBankId) {
      const bankIds = Object.keys(state.commercialBanks || {}) as CommercialBankId[];
      const sortedByBalance = bankIds
        .filter(id => state.commercialBanks[id]?.checkingAccount)
        .sort((a, b) => ((state.commercialBanks[b]?.checkingAccount?.balance || 0) - (state.commercialBanks[a]?.checkingAccount?.balance || 0)));
      targetBankId = sortedByBalance[0] || 'atlantida';
    }

    const bankRel = state.commercialBanks[targetBankId];
    const checkingBalance = bankRel?.checkingAccount?.balance ?? 0;
    const overdraftLimit = bankRel?.checkingAccount?.overdraftLimit ?? 0;
    const overdraftUsed = bankRel?.checkingAccount?.overdraftUsed ?? 0;
    const overdraftAvailable = Math.max(0, overdraftLimit - overdraftUsed);
    const totalCheckingAvailable = checkingBalance + overdraftAvailable;
    
    // Si la empresa tiene saldo global consolidado suficiente en storeBankBalance o en la cuenta
    const effectiveFunds = Math.max(totalCheckingAvailable, state.storeBankBalance);

    if (effectiveFunds < actualPayment) {
      return {
        updatedState: state,
        success: false,
        message: `Fondos insuficientes en la cuenta corriente de ${targetBankId.toUpperCase()}. Saldo disponible: L ${totalCheckingAvailable.toLocaleString()}, Importe requerido: L ${actualPayment.toLocaleString()}.`,
        remainingDebt: effectiveDebt
      };
    }

    newBank = Math.max(0, state.storeBankBalance - actualPayment);
    const currentChk = bankRel?.checkingAccount || {
      accountNumber: `CTA-0101-2026-${targetBankId.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 0,
      overdraftLimit: 250000,
      overdraftUsed: 0,
      checksUsedCount: 1,
      interestRateAnnual: 4.0
    };

    let newBalance = currentChk.balance;
    let newOverdraftUsed = currentChk.overdraftUsed || 0;

    if (newBalance >= actualPayment) {
      newBalance -= actualPayment;
    } else {
      const remainingNeeded = actualPayment - newBalance;
      newBalance = 0;
      newOverdraftUsed += remainingNeeded;
    }

    updatedCommercialBanks[targetBankId] = {
      ...bankRel,
      bankId: targetBankId,
      relationshipScore: bankRel?.relationshipScore ?? 50,
      guaranteeDeposits: bankRel?.guaranteeDeposits ?? [],
      termDeposits: bankRel?.termDeposits ?? [],
      checkingAccount: {
        ...currentChk,
        balance: newBalance,
        overdraftUsed: newOverdraftUsed
      }
    };
    sourceAccountLabel = `Cuenta Corriente ${targetBankId.toUpperCase()} (${currentChk.accountNumber})`;
    selectedBankName = targetBankId.toUpperCase();
  }

  // 4. Actualizar la obligación exacta del período fiscal
  const newPeriodPaidAmount = (period.paidAmountHNL || 0) + actualPayment;
  const newRemainingDebt = Math.max(0, period.calculatedTaxAmount - newPeriodPaidAmount);
  const isFullyPaid = newRemainingDebt === 0;
  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const receiptNumber = `SAR-BOL-${state.currentYear || 2026}-${Math.floor(100000 + Math.random() * 900000)}`;

  const updatedPeriod: SarFiscalPeriodRecord = {
    ...period,
    paidAmountHNL: newPeriodPaidAmount,
    isPaid: isFullyPaid,
    paidDate: timestampStr,
    paymentReceiptNumber: receiptNumber
  };

  const currentPeriods = state.fiscalPeriods || [];
  const nextPeriods = currentPeriods.some(p => p.fiscalYear === updatedPeriod.fiscalYear)
    ? currentPeriods.map(p => p.fiscalYear === updatedPeriod.fiscalYear ? updatedPeriod : p)
    : [...currentPeriods, updatedPeriod];

  // 5. Generar Comprobante Oficial de Pago Tributario
  const voucher: TransactionVoucher = {
    id: `vch-sar-${Date.now()}`,
    voucherNumber: receiptNumber,
    operationType: 'pago_impuesto_sar',
    title: `Boleta Oficial de Pago Tributario SAR (Ejercicio ${targetYear})`,
    timestamp: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    accountNumber: sourceAccountLabel,
    destinationAccountNumber: 'TESORERÍA GENERAL DE LA REPÚBLICA (TGR-SAR)',
    grossAmountHNL: actualPayment,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: actualPayment,
    priorBalanceHNL: effectiveDebt,
    newBalanceHNL: newRemainingDebt,
    loanBalancePriorHNL: effectiveDebt,
    loanBalanceNewHNL: newRemainingDebt,
    referenceCode: `SAR-TX-${Math.floor(100000 + Math.random() * 900000)}`,
    authStamp: `SAR-VALID-ISR-${state.currentYear || 2026}`,
    disclaimer: 'Simulación Financiera y Fiscal - Sin Validez Legal Oficial'
  };

  // 6. Actualizar ÚNICAMENTE los avisos y correos relacionados con esta obligación
  const targetEmailId = options?.emailId;
  const updatedEmails = (state.simulatedEmails || []).map(em => {
    // Si se especificó el email ID, actualizar solo ese
    if (targetEmailId && em.id === targetEmailId) {
      if (isFullyPaid) {
        return {
          ...em,
          isResolved: true,
          statusTag: 'Resuelto' as const,
          actionRequired: false
        };
      } else {
        return {
          ...em,
          statusTag: 'Pendiente' as const,
          paymentNoticePayload: em.paymentNoticePayload ? {
            ...em.paymentNoticePayload,
            amountDueHNL: newRemainingDebt
          } : undefined
        };
      }
    }

    // Si no se pasó emailId, actualizar solo el correo que coincida con el formulario o año fiscal
    if (!targetEmailId && em.category === 'sar_tributario') {
      const isMatchingNotice = em.relatedEntityId === period.declarationFormNumber || em.subject.includes(String(targetYear));
      if (isMatchingNotice) {
        if (isFullyPaid) {
          return {
            ...em,
            isResolved: true,
            statusTag: 'Resuelto' as const,
            actionRequired: false
          };
        } else {
          return {
            ...em,
            statusTag: 'Pendiente' as const,
            paymentNoticePayload: em.paymentNoticePayload ? {
              ...em.paymentNoticePayload,
              amountDueHNL: newRemainingDebt
            } : undefined
          };
        }
      }
    }

    return em;
  });

  // Generar correo de confirmación de pago para la bitácora
  const paymentEmail: SimulatedEmail = {
    id: `email-sar-pay-${Date.now()}`,
    category: 'sar_tributario',
    senderName: 'Servicio de Administración de Rentas (SAR)',
    senderEmail: 'recaudacion@sar.gob.hn',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Recibo de Pago Acreditado: Boleta SAR No. ${receiptNumber} (L ${actualPayment.toLocaleString()})`,
    body: `Comprobante de Pago Oficial - SAR Honduras:\n\nSe ha acreditado satisfactoriamente el pago de su obligación tributaria de ISR (Ejercicio ${targetYear}):\n\n• Monto Pagado: L ${actualPayment.toLocaleString()}\n• Boleta Oficial No.: ${receiptNumber}\n• Medio de Pago: ${sourceAccountLabel}\n• Saldo Tributario Restante del Ejercicio ${targetYear}: L ${newRemainingDebt.toLocaleString()}\n• Estado de Liquidación: ${isFullyPaid ? '100% CANCELADO Y AL DÍA' : 'ABONO PARCIAL APLICADO'}\n\n${isFullyPaid ? 'Su empresa se encuentra ahora habilitada para solicitar la Constancia de Solvencia Fiscal del ejercicio.' : ''}\n\n[Simulación Financiera y Fiscal - Sin Validez Legal Oficial]`,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: false,
    isArchived: false,
    folder: 'inbox',
    relatedEntityType: 'sar_obligation',
    relatedEntityId: receiptNumber,
    voucherPayload: voucher
  };

  // 7. Evaluar elegibilidad general de solvencia fiscal
  const allCurrentPeriodsPaid = nextPeriods.every(p => p.isPaid || (p.calculatedTaxAmount - p.paidAmountHNL <= 0));

  const updatedState: DailySimulationState = {
    ...state,
    storeCash: newCash,
    storeBankBalance: newBank,
    commercialBanks: updatedCommercialBanks,
    fiscalPeriods: nextPeriods,
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])],
    simulatedEmails: [paymentEmail, ...updatedEmails],
    sarTaxRecord: {
      ...state.sarTaxRecord,
      pendingTaxDue: newRemainingDebt,
      isrTaxAmount: newRemainingDebt,
      isPaid: allCurrentPeriodsPaid,
      totalTaxPaidYtd: (state.sarTaxRecord?.totalTaxPaidYtd || 0) + actualPayment
    }
  };

  return {
    updatedState,
    success: true,
    message: isFullyPaid
      ? `¡Obligación fiscal SAR del ejercicio ${targetYear} cancelada al 100%! Boleta No. ${receiptNumber}. Saldo L 0.00.`
      : `¡Abono parcial de L ${actualPayment.toLocaleString()} acreditado al SAR! Saldo pendiente: L ${newRemainingDebt.toLocaleString()}. Boleta No. ${receiptNumber}.`,
    voucher,
    remainingDebt: newRemainingDebt
  };
}

/**
 * Evaluación y Emisión de la Constancia de Solvencia Fiscal
 * Condiciones:
 * 1. Declaración Formulario SAR-25 presentada.
 * 2. Impuesto determinado pagado al 100% (saldo 0).
 * 3. Sin multas o recargos pendientes.
 */
export function requestSarSolvenciaCertificate(state: DailySimulationState): {
  updatedState: DailySimulationState;
  success: boolean;
  message: string;
  solvenciaIssued: boolean;
  certificateText?: string;
  checklist: {
    declarationFiled: boolean;
    taxesFullyPaid: boolean;
    noPendingFines: boolean;
  };
  certificateData?: {
    certNumber: string;
    issueDate: string;
    expiryDate: string;
    qrCode: string;
    status: 'SOLVENTE' | 'NO_SOLVENTE';
  };
} {
  const currentPeriod = getOrCreateCurrentFiscalPeriod(state);
  const isPendingDue = (state.sarTaxRecord?.pendingTaxDue ?? 0) > 0 || (currentPeriod.calculatedTaxAmount - currentPeriod.paidAmountHNL) > 0;
  const isDeclared = currentPeriod.isDeclared || (state.sarTaxRecord?.isFiled ?? false);
  const isPaid = !isPendingDue && (currentPeriod.isPaid || (state.sarTaxRecord?.isPaid ?? false));

  const checklist = {
    declarationFiled: isDeclared,
    taxesFullyPaid: isPaid,
    noPendingFines: true // No hay multas acumuladas
  };

  const isEligible = checklist.declarationFiled && checklist.taxesFullyPaid && checklist.noPendingFines;

  if (!isEligible) {
    const missing: string[] = [];
    if (!checklist.declarationFiled) missing.push('Presentar la Declaración Jurada anual (Formulario SAR-25).');
    if (!checklist.taxesFullyPaid) missing.push(`Liquidar el saldo del impuesto pendiente.`);

    return {
      updatedState: state,
      success: false,
      solvenciaIssued: false,
      message: `Solicitud rechazada: Tu empresa NO reúne los requisitos de Solvencia Fiscal. Requisitos faltantes:\n• ${missing.join('\n• ')}`,
      checklist
    };
  }

  const timestampStr = `Día ${state.currentDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const expiryDay = state.currentDay + 90; // 90 días de vigencia legal
  const expiryDateStr = `Día ${expiryDay}, Mes ${state.currentMonth} (${state.currentYear || 2026})`;
  const certNumber = `SAR-CSF-${state.currentYear || 2026}-${Math.floor(100000 + Math.random() * 900000)}`;

  const updatedPeriod: SarFiscalPeriodRecord = {
    ...currentPeriod,
    solvenciaIssued: true,
    solvenciaNumber: certNumber,
    solvenciaExpiryDate: expiryDateStr
  };

  const currentPeriods = state.fiscalPeriods || [];
  const nextPeriods = currentPeriods.map(p => p.fiscalYear === updatedPeriod.fiscalYear ? updatedPeriod : p);

  const certBody = `Constancia de Solvencia Fiscal - SAR Honduras:\n\nSe certifica que la empresa mercantil ${state.storeName} se encuentra formalmente SOLVENTE ante el Fisco Nacional:\n\n• Certificado No.: ${certNumber}\n• Fecha de Emisión: ${timestampStr}\n• Vigencia: 90 Días (${expiryDateStr})\n• Calificación Tributaria: Cumplidor Puntual (Riesgo Cero)\n\nSIMULACIÓN — SIN VALIDEZ OFICIAL. Documento de control interno de la simulación.`;

  // Email formal con certificado
  const certEmail: SimulatedEmail = {
    id: `email-sar-cert-${Date.now()}`,
    category: 'sar_tributario',
    senderName: 'Servicio de Administración de Rentas (SAR)',
    senderEmail: 'certificaciones@sar.gob.hn',
    recipientEmail: `gerencia@${state.storeName.toLowerCase().replace(/[^a-z0-9]/g, '')}.hn`,
    companyName: state.storeName,
    subject: `Constancia Oficial de Solvencia Fiscal Emitida: Certificado No. ${certNumber}`,
    body: certBody,
    sentDate: timestampStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    isRead: false,
    isStarred: true,
    isArchived: false,
    folder: 'inbox',
    relatedEntityType: 'sar_obligation',
    relatedEntityId: certNumber
  };

  return {
    updatedState: {
      ...state,
      fiscalSolvenciaActive: true,
      fiscalPeriods: nextPeriods,
      simulatedEmails: [certEmail, ...(state.simulatedEmails || [])],
      sarTaxRecord: {
        ...state.sarTaxRecord,
        solvenciaFiscalIssued: true
      }
    },
    success: true,
    solvenciaIssued: true,
    certificateText: certBody,
    message: `¡Constancia de Solvencia Fiscal No. ${certNumber} emitida con éxito! Válida por 90 días del calendario simulado.`,
    checklist,
    certificateData: {
      certNumber,
      issueDate: timestampStr,
      expiryDate: expiryDateStr,
      qrCode: `https://sar.gob.hn/verificar?cert=${certNumber}`,
      status: 'SOLVENTE'
    }
  };
}
