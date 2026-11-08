// ============================================================================
// MOTOR FINANCIERO Y CONTABLE DEL SISTEMA ERP CORPORATIVO & LIBRO MAYOR
// ============================================================================

import { DailySimulationState, TransactionVoucher } from './retroSimTypes';
import { 
  IErpCorporateState, 
  IErpSupplierInvoice, 
  IErpInvoiceInstallment,
  ErpInvoiceStatus,
  ILedgerEntry, 
  IErpBranchOffice, 
  IErpMarketingCampaign,
  IErpStaffWelfareProgram,
  ErpAccountCategory
} from './erpCorporateTypes';

/**
 * Genera el estado inicial del ERP para la empresa
 */
export function createInitialErpCorporateState(companyName: string = 'Áureo Enterprise'): IErpCorporateState {
  // Facturas de proveedores iniciales con cronograma de vencimiento
  const supplierInvoices: IErpSupplierInvoice[] = [
    {
      id: 'inv-sup-001',
      invoiceNumber: 'FAC-001-002-8849',
      supplierId: 'sup-dinant',
      supplierName: 'Distribuidora Mercantil del Norte',
      supplierCategory: 'MERCADERIA',
      issueDateStr: 'Día 1, Mes 1, 2026',
      dueDateStr: 'Día 28, Mes 1, 2026',
      totalAmountHNL: 120000,
      paidAmountHNL: 40000,
      remainingAmountHNL: 80000,
      status: 'PARTIAL',
      taxIncludedHNL: 15652,
      concept: 'Adquisición de lote de mercaderías e inventario de alta rotación',
      installments: [
        { installmentNumber: 1, dueDateStr: 'Día 10, Mes 1, 2026', amountHNL: 40000, isPaid: true, paidDateStr: 'Día 10, Mes 1, 2026' },
        { installmentNumber: 2, dueDateStr: 'Día 20, Mes 1, 2026', amountHNL: 40000, isPaid: false },
        { installmentNumber: 3, dueDateStr: 'Día 28, Mes 1, 2026', amountHNL: 40000, isPaid: false }
      ]
    },
    {
      id: 'inv-sup-002',
      invoiceNumber: 'FAC-003-001-5214',
      supplierId: 'sup-cemento',
      supplierName: 'Argos Cementos & Agregados Honduras',
      supplierCategory: 'MATERIALES',
      issueDateStr: 'Día 3, Mes 1, 2026',
      dueDateStr: 'Día 25, Mes 1, 2026',
      totalAmountHNL: 285000,
      paidAmountHNL: 0,
      remainingAmountHNL: 285000,
      status: 'PENDING',
      taxIncludedHNL: 37173,
      concept: 'Suministro de 1,200 bolsas de cemento Portland estructural y varilla corrugada',
      installments: [
        { installmentNumber: 1, dueDateStr: 'Día 15, Mes 1, 2026', amountHNL: 142500, isPaid: false },
        { installmentNumber: 2, dueDateStr: 'Día 25, Mes 1, 2026', amountHNL: 142500, isPaid: false }
      ]
    },
    {
      id: 'inv-sup-003',
      invoiceNumber: 'FAC-008-005-1994',
      supplierId: 'sup-texaco',
      supplierName: 'Combustibles & Derivados del Caribe S.A.',
      supplierCategory: 'SERVICIOS',
      issueDateStr: 'Día 2, Mes 1, 2026',
      dueDateStr: 'Día 18, Mes 1, 2026',
      totalAmountHNL: 64500,
      paidAmountHNL: 64500,
      remainingAmountHNL: 0,
      status: 'PAID',
      taxIncludedHNL: 8413,
      concept: 'Consumo de diésel premium para flota de reparto y maquinaria pesada',
      installments: [
        { installmentNumber: 1, dueDateStr: 'Día 12, Mes 1, 2026', amountHNL: 64500, isPaid: true, paidDateStr: 'Día 12, Mes 1, 2026' }
      ]
    },
    {
      id: 'inv-sup-004',
      invoiceNumber: 'FAC-002-004-9912',
      supplierId: 'sup-hondutel',
      supplierName: 'Empresa Nacional de Telecomunicaciones & Cloud',
      supplierCategory: 'TECNOLOGIA',
      issueDateStr: 'Día 5, Mes 1, 2026',
      dueDateStr: 'Día 30, Mes 1, 2026',
      totalAmountHNL: 18500,
      paidAmountHNL: 0,
      remainingAmountHNL: 18500,
      status: 'PENDING',
      taxIncludedHNL: 2413,
      concept: 'Servicio mensual de fibra óptica corporativa, data center y enlace bancario POS',
      installments: [
        { installmentNumber: 1, dueDateStr: 'Día 30, Mes 1, 2026', amountHNL: 18500, isPaid: false }
      ]
    }
  ];

  // Asientos iniciales en el Libro Mayor General (Apertura y Operaciones)
  const generalLedger: ILedgerEntry[] = [
    {
      entryId: 'AS-001',
      timestampStr: 'Día 1, Mes 1, 2026 08:00 AM',
      simDay: 1,
      simMonth: 1,
      simYear: 2026,
      accountCategory: 'ASSET',
      accountCode: '1102',
      accountName: 'Bancos - Cuenta Corriente Operativa',
      debitHNL: 2500000,
      creditHNL: 0,
      concept: 'Asiento de Apertura: Aportación inicial de capital en cuenta corriente',
      authorizedByRole: 'DIRECTORIO'
    },
    {
      entryId: 'AS-002',
      timestampStr: 'Día 1, Mes 1, 2026 08:00 AM',
      simDay: 1,
      simMonth: 1,
      simYear: 2026,
      accountCategory: 'EQUITY',
      accountCode: '3101',
      accountName: 'Capital Social Pagado',
      debitHNL: 0,
      creditHNL: 2500000,
      concept: 'Asiento de Apertura: Registro del Capital Social de la empresa',
      authorizedByRole: 'DIRECTORIO'
    },
    {
      entryId: 'AS-003',
      timestampStr: 'Día 5, Mes 1, 2026 11:30 AM',
      simDay: 5,
      simMonth: 1,
      simYear: 2026,
      accountCategory: 'EXPENSE',
      accountCode: '5101',
      accountName: 'Costo de Ventas - Inventario de Mercaderías',
      debitHNL: 120000,
      creditHNL: 0,
      concept: 'Recepción de factura FAC-001-002-8849 de Distribuidora Mercantil del Norte',
      authorizedByRole: 'GERENTE_FINANCIERO',
      referenceVoucherId: 'FAC-001-002-8849'
    },
    {
      entryId: 'AS-004',
      timestampStr: 'Día 5, Mes 1, 2026 11:30 AM',
      simDay: 5,
      simMonth: 1,
      simYear: 2026,
      accountCategory: 'LIABILITY',
      accountCode: '2101',
      accountName: 'Proveedores Nacionales por Pagar',
      debitHNL: 0,
      creditHNL: 120000,
      concept: 'Reconocimiento de pasivo comercial a corto plazo con proveedor',
      authorizedByRole: 'GERENTE_FINANCIERO',
      referenceVoucherId: 'FAC-001-002-8849'
    },
    {
      entryId: 'AS-005',
      timestampStr: 'Día 10, Mes 1, 2026 02:15 PM',
      simDay: 10,
      simMonth: 1,
      simYear: 2026,
      accountCategory: 'LIABILITY',
      accountCode: '2101',
      accountName: 'Proveedores Nacionales por Pagar',
      debitHNL: 40000,
      creditHNL: 0,
      concept: 'Pago de cuota 1 de factura FAC-001-002-8849',
      authorizedByRole: 'CONTADOR',
      referenceVoucherId: 'VOUCHER-PAY-4001'
    },
    {
      entryId: 'AS-006',
      timestampStr: 'Día 10, Mes 1, 2026 02:15 PM',
      simDay: 10,
      simMonth: 1,
      simYear: 2026,
      accountCategory: 'ASSET',
      accountCode: '1102',
      accountName: 'Bancos - Cuenta Corriente Operativa',
      debitHNL: 0,
      creditHNL: 40000,
      concept: 'Desembolso bancario para cancelación de cuota 1 a proveedor',
      authorizedByRole: 'CONTADOR',
      referenceVoucherId: 'VOUCHER-PAY-4001'
    }
  ];

  // Sucursal inicial
  const branches: IErpBranchOffice[] = [
    {
      branchId: 'BR-TEG-01',
      name: 'Sede Principal — Bulevar Morazán',
      city: 'Tegucigalpa',
      openedDay: 1,
      openedMonth: 1,
      openedYear: 2026,
      setupCostHNL: 1200000,
      staffAssigned: 8,
      monthlyOperatingCostHNL: 95000,
      dailySalesBoostHNL: 38000,
      status: 'OPERATING'
    }
  ];

  // Campañas de Marketing
  const marketingCampaigns: IErpMarketingCampaign[] = [
    {
      id: 'camp-001',
      name: 'Lanzamiento Corporativo Multi-Plataforma 2026',
      channel: 'DIGITAL_ADS',
      costHNL: 45000,
      brandEquityBoost: 12,
      dailyRevenueMultiplier: 1.08,
      executedDay: 2,
      executedMonth: 1,
      executedYear: 2026,
      durationDays: 30
    }
  ];

  // Programas de bienestar laboral
  const staffWelfarePrograms: IErpStaffWelfareProgram[] = [
    {
      id: 'welfare-01',
      title: 'Seguro Médico Hospitalario Colectivo',
      costMonthlyHNL: 28000,
      moraleBoostPct: 20,
      productivityBoostPct: 15,
      isActive: true,
      description: 'Cobertura médica privada para empleados y dependientes directos.'
    },
    {
      id: 'welfare-02',
      title: 'Plan de Capacitación Continua & Certificaciones',
      costMonthlyHNL: 18500,
      moraleBoostPct: 15,
      productivityBoostPct: 20,
      isActive: true,
      description: 'Formación profesional en gestión bancaria, contabilidad y ventas técnicas.'
    },
    {
      id: 'welfare-03',
      title: 'Bono Trimestral por Desempeño y Cero Mermas',
      costMonthlyHNL: 35000,
      moraleBoostPct: 25,
      productivityBoostPct: 25,
      isActive: false,
      description: 'Incentivo económico distribuido al equipo al superar las metas operativas.'
    }
  ];

  return {
    supplierInvoices,
    generalLedger,
    branches,
    marketingCampaigns,
    staffWelfarePrograms,
    brandEquityScore: 58,
    employeeMoraleScore: 82,
    taxProvisionAccumulatedHNL: 48500
  };
}

/**
 * Registra un asiento por partida doble en el Libro Mayor
 */
export function addLedgerTransaction(
  state: DailySimulationState,
  debitAccount: { code: string; name: string; category: ErpAccountCategory; amountHNL: number },
  creditAccount: { code: string; name: string; category: ErpAccountCategory; amountHNL: number },
  concept: string,
  authorizedByRole: 'CONTADOR' | 'GERENTE_FINANCIERO' | 'AUDITOR_INTERNO' | 'DIRECTORIO' = 'CONTADOR',
  referenceVoucherId?: string
): DailySimulationState {
  const currentErp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);
  const nowStr = `Día ${state.currentDay}, Mes ${state.currentMonth}, Año ${state.currentYear || 2026}`;

  const nextEntryNum = currentErp.generalLedger.length + 1;
  const entryDebitId = `AS-${nextEntryNum.toString().padStart(3, '0')}`;
  const entryCreditId = `AS-${(nextEntryNum + 1).toString().padStart(3, '0')}`;

  const debitEntry: ILedgerEntry = {
    entryId: entryDebitId,
    timestampStr: nowStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    accountCategory: debitAccount.category,
    accountCode: debitAccount.code,
    accountName: debitAccount.name,
    debitHNL: debitAccount.amountHNL,
    creditHNL: 0,
    concept,
    authorizedByRole,
    referenceVoucherId
  };

  const creditEntry: ILedgerEntry = {
    entryId: entryCreditId,
    timestampStr: nowStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    accountCategory: creditAccount.category,
    accountCode: creditAccount.code,
    accountName: creditAccount.name,
    debitHNL: 0,
    creditHNL: creditAccount.amountHNL,
    concept,
    authorizedByRole,
    referenceVoucherId
  };

  return {
    ...state,
    erpCorporateState: {
      ...currentErp,
      generalLedger: [debitEntry, creditEntry, ...currentErp.generalLedger]
    }
  };
}

/**
 * Pago de Factura a Proveedor (Total, Cuota o Parcial) con Asiento Contable Automático
 */
export function payErpSupplierInvoice(
  state: DailySimulationState,
  invoiceId: string,
  amountToPay: number,
  paySource: 'checking' | 'cash' = 'checking'
): { updatedState: DailySimulationState; success: boolean; message: string; voucher?: TransactionVoucher } {
  const currentErp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);
  const invoice = currentErp.supplierInvoices.find(inv => inv.id === invoiceId);

  if (!invoice) {
    return { updatedState: state, success: false, message: 'La factura seleccionada no fue encontrada en las cuentas por pagar.' };
  }

  if (invoice.status === 'PAID' || invoice.remainingAmountHNL <= 0) {
    return { updatedState: state, success: false, message: `La factura No. ${invoice.invoiceNumber} ya se encuentra 100% saldada.` };
  }

  if (amountToPay <= 0) {
    return { updatedState: state, success: false, message: 'El importe a pagar debe ser estrictamente mayor a L 0.00.' };
  }

  const actualPayment = Math.min(amountToPay, invoice.remainingAmountHNL);
  const isCash = paySource === 'cash';
  const availableFunds = isCash ? (state.storeCash || 0) : (state.storeBankBalance || 0);

  if (availableFunds < actualPayment) {
    return {
      updatedState: state,
      success: false,
      message: `Restricción de Liquidez: Fondos insuficientes en ${isCash ? 'caja' : 'cuenta corriente'}. Requerido: L ${actualPayment.toLocaleString()}, Disponible: L ${availableFunds.toLocaleString()}.`
    };
  }

  // Deducción financiera
  const newBank = !isCash ? state.storeBankBalance - actualPayment : state.storeBankBalance;
  const newCash = isCash ? state.storeCash - actualPayment : state.storeCash;

  // Actualizar factura y cuotas
  const newPaid = invoice.paidAmountHNL + actualPayment;
  const newRemaining = Math.max(0, invoice.totalAmountHNL - newPaid);
  const newStatus: ErpInvoiceStatus = newRemaining <= 0 ? 'PAID' : 'PARTIAL';

  let pool = actualPayment;
  const updatedInstallments = invoice.installments.map(inst => {
    if (!inst.isPaid && pool >= inst.amountHNL) {
      pool -= inst.amountHNL;
      return { ...inst, isPaid: true, paidDateStr: `Día ${state.currentDay}, Mes ${state.currentMonth}, 2026` };
    }
    return inst;
  });

  const updatedInvoices: IErpSupplierInvoice[] = currentErp.supplierInvoices.map(inv => {
    if (inv.id !== invoiceId) return inv;
    return {
      ...inv,
      paidAmountHNL: newPaid,
      remainingAmountHNL: newRemaining,
      status: newStatus,
      installments: updatedInstallments
    };
  });

  const voucherNum = `VOUCHER-CXP-${Date.now().toString().slice(-6)}`;
  const nowStr = `Día ${state.currentDay}, Mes ${state.currentMonth}, Año ${state.currentYear || 2026}`;

  const voucher: TransactionVoucher = {
    id: `vch-${Date.now()}`,
    voucherNumber: voucherNum,
    operationType: 'pago_proveedor_cxp',
    title: `Pago a Proveedor: ${invoice.supplierName}`,
    timestamp: nowStr,
    simDay: state.currentDay,
    simMonth: state.currentMonth,
    simYear: state.currentYear || 2026,
    companyName: state.storeName,
    grossAmountHNL: actualPayment,
    deductionsHNL: 0,
    netDisbursedOrPaidHNL: actualPayment,
    priorBalanceHNL: availableFunds,
    newBalanceHNL: availableFunds - actualPayment,
    referenceCode: `CXP-${invoice.invoiceNumber}`,
    authStamp: `ERP-CXP-${state.currentDay}-${Date.now().toString().slice(-4)}`,
    notes: `Liquidación de factura ${invoice.invoiceNumber} por concepto de: ${invoice.concept}. Saldo restante de la factura: L ${newRemaining.toLocaleString()}.`,
    disclaimer: 'Comprobante Oficial ERP - Partida Doble Registrada'
  };

  // Asiento automático en Libro Mayor:
  // Débito: Cuentas por Pagar (2101) - Disminuye pasivo
  // Crédito: Bancos / Caja (1102 / 1101) - Disminuye activo
  const stateWithDeduction: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    storeCash: newCash,
    erpCorporateState: {
      ...currentErp,
      supplierInvoices: updatedInvoices
    },
    transactionVouchers: [voucher, ...(state.transactionVouchers || [])]
  };

  const finalState = addLedgerTransaction(
    stateWithDeduction,
    { code: '2101', name: 'Proveedores Nacionales por Pagar', category: 'LIABILITY', amountHNL: actualPayment },
    { code: isCash ? '1101' : '1102', name: isCash ? 'Caja General en Efectivo' : 'Bancos - Cuenta Corriente', category: 'ASSET', amountHNL: actualPayment },
    `Liquidación ${newStatus === 'PAID' ? 'Total' : 'Parcial'} de Factura ${invoice.invoiceNumber} (${invoice.supplierName})`,
    'CONTADOR',
    voucher.id
  );

  return {
    updatedState: finalState,
    success: true,
    message: `¡PAGO A PROVEEDOR PROCESADO! Se abonaron L ${actualPayment.toLocaleString()} a "${invoice.supplierName}". Estado factura: ${newStatus === 'PAID' ? 'PAGADA AL 100%' : `PARCIAL (Resta: L ${newRemaining.toLocaleString()})`}. Asiento en Libro Mayor registrado.`,
    voucher
  };
}

/**
 * Apertura de Sucursal Empresarial con Validación Estricta de Capital y Personal
 */
export function openErpBranchOffice(
  state: DailySimulationState,
  branchData: {
    name: string;
    city: 'Tegucigalpa' | 'San Pedro Sula' | 'La Ceiba' | 'Choluteca' | 'Comayagua' | 'Roatán';
    staffAssigned: number;
    setupCostHNL?: number;
  }
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentErp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);
  const cost = branchData.setupCostHNL || 650000;

  if (state.storeBankBalance < cost) {
    return {
      updatedState: state,
      success: false,
      message: `Inviabilidad Financiera: Se requiere un capital de instalación de L ${cost.toLocaleString()} en cuenta bancaria. Saldo actual: L ${state.storeBankBalance.toLocaleString()}.`
    };
  }

  if (branchData.staffAssigned < 2) {
    return {
      updatedState: state,
      success: false,
      message: `Restricción Operativa: Se requiere una dotación mínima de 2 colaboradores por sucursal (Encargado de tienda + Cajero/Operador).`
    };
  }

  const existingCities = currentErp.branches.filter(b => b.city === branchData.city);
  if (existingCities.length >= 3) {
    return {
      updatedState: state,
      success: false,
      message: `Restricción de Mercado: Ya mantienes 3 sucursales operativas en ${branchData.city}. Elige otra plaza geográfica para diversificar.`
    };
  }

  const newBranch: IErpBranchOffice = {
    branchId: `BR-${branchData.city.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    name: branchData.name,
    city: branchData.city,
    openedDay: state.currentDay,
    openedMonth: state.currentMonth,
    openedYear: state.currentYear || 2026,
    setupCostHNL: cost,
    staffAssigned: branchData.staffAssigned,
    monthlyOperatingCostHNL: Math.round(cost * 0.12),
    dailySalesBoostHNL: Math.round(cost * 0.045), // ~L 29,250 de ventas adicionales al día
    status: 'OPERATING'
  };

  const newBank = state.storeBankBalance - cost;
  const newStaffCount = (state.staffCount || 0) + branchData.staffAssigned;

  const stateAfterCapital: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    staffCount: newStaffCount,
    erpCorporateState: {
      ...currentErp,
      branches: [...currentErp.branches, newBranch],
      brandEquityScore: Math.min(100, currentErp.brandEquityScore + 8)
    }
  };

  // Asiento contable: Activo Fijo Inmuebles & Instalaciones (1501) vs Bancos (1102)
  const finalState = addLedgerTransaction(
    stateAfterCapital,
    { code: '1501', name: 'Activo Fijo - Instalaciones & Sucursales', category: 'ASSET', amountHNL: cost },
    { code: '1102', name: 'Bancos - Cuenta Corriente Operativa', category: 'ASSET', amountHNL: cost },
    `Inversión de Capital: Apertura de nueva sucursal comercial en ${branchData.city} (${branchData.name})`,
    'GERENTE_FINANCIERO'
  );

  return {
    updatedState: finalState,
    success: true,
    message: `¡SUCURSAL INAUGURADA CON ÉXITO! La nueva sede "${branchData.name}" en ${branchData.city} está operando con ${branchData.staffAssigned} empleados. Desembolso de capital: -L ${cost.toLocaleString()}. Ventas diarias proyectadas: +L ${newBranch.dailySalesBoostHNL.toLocaleString()}/día.`
  };
}

/**
 * Despliegue de Campaña de Publicidad & Marketing Corporativo
 */
export function launchErpMarketingCampaign(
  state: DailySimulationState,
  campaignData: {
    name: string;
    channel: 'DIGITAL_ADS' | 'RADIO_PRENSA' | 'VALLAS_BTL' | 'PATROCINIO_DEPORTIVO';
    budgetHNL: number;
  }
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentErp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);
  const budget = campaignData.budgetHNL;

  if (budget <= 0) {
    return { updatedState: state, success: false, message: 'Ingresa un presupuesto de mercadeo válido.' };
  }

  if (state.storeBankBalance < budget) {
    return {
      updatedState: state,
      success: false,
      message: `Presupuesto Insuficiente: La campaña requiere L ${budget.toLocaleString()} en cuenta bancaria. Disponible: L ${state.storeBankBalance.toLocaleString()}.`
    };
  }

  const brandBoost = Math.min(20, Math.round(budget / 10000));
  const newBrandScore = Math.min(100, currentErp.brandEquityScore + brandBoost);

  const newCampaign: IErpMarketingCampaign = {
    id: `camp-${Date.now()}`,
    name: campaignData.name,
    channel: campaignData.channel,
    costHNL: budget,
    brandEquityBoost: brandBoost,
    dailyRevenueMultiplier: 1.05 + (brandBoost * 0.005),
    executedDay: state.currentDay,
    executedMonth: state.currentMonth,
    executedYear: state.currentYear || 2026,
    durationDays: 30
  };

  const newBank = state.storeBankBalance - budget;

  const stateAfterCost: DailySimulationState = {
    ...state,
    storeBankBalance: newBank,
    erpCorporateState: {
      ...currentErp,
      marketingCampaigns: [newCampaign, ...currentErp.marketingCampaigns],
      brandEquityScore: newBrandScore
    }
  };

  // Asiento Contable: Gasto de Publicidad y Propaganda (5202) vs Bancos (1102)
  const finalState = addLedgerTransaction(
    stateAfterCost,
    { code: '5202', name: 'Gastos de Comercialización & Marketing', category: 'EXPENSE', amountHNL: budget },
    { code: '1102', name: 'Bancos - Cuenta Corriente Operativa', category: 'ASSET', amountHNL: budget },
    `Despliegue publicitario: ${campaignData.name} (${campaignData.channel})`,
    'GERENTE_FINANCIERO'
  );

  return {
    updatedState: finalState,
    success: true,
    message: `¡CAMPAÑA PUBLICITARIA LANZADA! Inversión: L ${budget.toLocaleString()} en ${campaignData.channel}. El reconocimiento de marca aumentó a ${newBrandScore}/100 (+${brandBoost} pts), impulsando las ventas diarias de todas las sucursales.`
  };
}

/**
 * Activación o Inversión en Programas de Bienestar y Productividad Laboral
 */
export function toggleErpWelfareProgram(
  state: DailySimulationState,
  programId: string
): { updatedState: DailySimulationState; success: boolean; message: string } {
  const currentErp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);
  const prog = currentErp.staffWelfarePrograms.find(p => p.id === programId);

  if (!prog) {
    return { updatedState: state, success: false, message: 'Programa no localizado.' };
  }

  const willBeActive = !prog.isActive;

  if (willBeActive && state.storeBankBalance < prog.costMonthlyHNL) {
    return {
      updatedState: state,
      success: false,
      message: `Fondos Insuficientes: Se requiere una provisión de L ${prog.costMonthlyHNL.toLocaleString()} para activar este beneficio.`
    };
  }

  const updatedPrograms = currentErp.staffWelfarePrograms.map(p => {
    if (p.id !== programId) return p;
    return { ...p, isActive: willBeActive };
  });

  const deltaMorale = willBeActive ? prog.moraleBoostPct : -prog.moraleBoostPct;
  const newMorale = Math.max(20, Math.min(100, currentErp.employeeMoraleScore + deltaMorale));

  let finalState: DailySimulationState = {
    ...state,
    erpCorporateState: {
      ...currentErp,
      staffWelfarePrograms: updatedPrograms,
      employeeMoraleScore: newMorale
    }
  };

  if (willBeActive) {
    finalState = {
      ...finalState,
      storeBankBalance: state.storeBankBalance - prog.costMonthlyHNL
    };

    finalState = addLedgerTransaction(
      finalState,
      { code: '5201', name: 'Gastos de Personal & Beneficios Sociales', category: 'EXPENSE', amountHNL: prog.costMonthlyHNL },
      { code: '1102', name: 'Bancos - Cuenta Corriente Operativa', category: 'ASSET', amountHNL: prog.costMonthlyHNL },
      `Activación de programa laboral: ${prog.title}`,
      'GERENTE_FINANCIERO'
    );
  }

  return {
    updatedState: finalState,
    success: true,
    message: willBeActive
      ? `¡Programa "${prog.title}" activado! La moral del equipo aumentó a ${newMorale}/100, mejorando la eficiencia y reduciendo mermas operativas.`
      : `Programa "${prog.title}" pausado. La provisión mensual ha quedado liberada.`
  };
}

/**
 * Cálculo del Cierre Fiscal y Liquidación de Impuestos a Fin de Mes
 */
export function calculateErpMonthlyTaxAudit(state: DailySimulationState): {
  grossSalesHNL: number;
  operatingCostsHNL: number;
  financialCostsHNL: number;
  depreciationHNL: number;
  netTaxableIncomeHNL: number;
  incomeTaxRatePct: number;
  incomeTaxHNL: number;
  solidarityContributionHNL: number;
  totalTaxLiabilityHNL: number;
  effectiveTaxRatePct: number;
  auditObservations: string;
} {
  const currentErp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);

  // Ventas del mes
  const grossSalesHNL = state.monthlySalesAccumulated > 0 
    ? state.monthlySalesAccumulated 
    : ((state.dailyReceipts || []).reduce((sum, r) => sum + (r.totalHNL ?? 0), 0) * 30 || 450000);

  // Costos operativos (salarios, alquileres, sucursales)
  const branchMonthlyCosts = (currentErp.branches || []).reduce((sum, b) => sum + b.monthlyOperatingCostHNL, 0);
  const operatingCostsHNL = (((state.dailyWages || 0) + (state.dailyRent || 0)) * 30) + branchMonthlyCosts;

  // Gastos financieros
  const financialCostsHNL = Object.values(state.commercialBanks || {}).reduce((sum, b) => {
    return sum + (b.activeLoan ? Math.round(b.activeLoan.balanceRemaining * (b.activeLoan.interestRateAnnual / 100 / 12)) : 0);
  }, 0);

  const depreciationHNL = 15000;
  const totalDeductible = operatingCostsHNL + financialCostsHNL + depreciationHNL;
  const netTaxableIncomeHNL = Math.max(0, grossSalesHNL - totalDeductible);

  let incomeTaxHNL = 0;
  let solidarityContributionHNL = 0;

  if (netTaxableIncomeHNL > 0) {
    incomeTaxHNL = Math.round(netTaxableIncomeHNL * 0.25); // 25% ISR Corporativo
    if (netTaxableIncomeHNL > 1000000) {
      // 5% Aportación Solidaria sobre excedente de L 1,000,000 (Decreto 51-2003)
      solidarityContributionHNL = Math.round((netTaxableIncomeHNL - 1000000) * 0.05);
    }
  }

  const totalTaxLiabilityHNL = incomeTaxHNL + solidarityContributionHNL;
  const effectiveTaxRatePct = grossSalesHNL > 0 ? Number(((totalTaxLiabilityHNL / grossSalesHNL) * 100).toFixed(2)) : 0;

  const auditObservations = netTaxableIncomeHNL <= 0
    ? 'Declaración con renta neta gravable cero o pérdida operativa deducible para ejercicios futuros.'
    : `Declaración regular: 25% ISR (L ${incomeTaxHNL.toLocaleString()}) ${solidarityContributionHNL > 0 ? `+ 5% Aportación Solidaria (L ${solidarityContributionHNL.toLocaleString()})` : 'sin excedente solidario'}.`;

  return {
    grossSalesHNL,
    operatingCostsHNL,
    financialCostsHNL,
    depreciationHNL,
    netTaxableIncomeHNL,
    incomeTaxRatePct: 25.0,
    incomeTaxHNL,
    solidarityContributionHNL,
    totalTaxLiabilityHNL,
    effectiveTaxRatePct,
    auditObservations
  };
}

/**
 * Procesa el avance de jornada para el sistema ERP corporativo:
 * - Liquida ventas adicionales generadas por sucursales en expansión
 * - Devenga campañas publicitarias y computa incremento de reconocimiento de marca
 * - Monitorea programas de bienestar laboral y moral de empleados
 * - Asienta automáticamente los ingresos en el Libro Mayor General
 */
export function advanceErpCorporateDay(state: DailySimulationState): DailySimulationState {
  const erp = state.erpCorporateState || createInitialErpCorporateState(state.storeName);
  let updatedErp: IErpCorporateState = { ...erp };
  let additionalSalesHNL = 0;

  // 1. Sucursales operativas: Generan ventas consolidadas
  const operatingBranches = updatedErp.branches.filter(b => b.status === 'OPERATING');
  if (operatingBranches.length > 0) {
    additionalSalesHNL = operatingBranches.reduce((sum, b) => sum + b.dailySalesBoostHNL, 0);
  }

  // 2. Programas de bienestar laboral activos: Asegurar moral alta y productividad
  const activeWelfarePrograms = updatedErp.staffWelfarePrograms.filter(w => w.isActive);
  if (activeWelfarePrograms.length > 0) {
    const welfareBonus = activeWelfarePrograms.reduce((sum, w) => sum + w.moraleBoostPct, 0);
    updatedErp.employeeMoraleScore = Math.min(100, Math.max(80, updatedErp.employeeMoraleScore + Math.round(welfareBonus * 0.1)));
  }

  // 3. Campañas publicitarias activas: Potencian reconocimiento de marca
  const activeMarketing = updatedErp.marketingCampaigns.filter(c => (state.currentDay - c.executedDay) < c.durationDays);
  if (activeMarketing.length > 0) {
    const brandBoost = activeMarketing.reduce((sum, c) => sum + c.brandEquityBoost, 0);
    updatedErp.brandEquityScore = Math.min(100, updatedErp.brandEquityScore + Math.round(brandBoost * 0.05));
  }

  // 4. Actualizar tesorería e ingresos si hubo ventas de sucursales
  const newStoreBank = (state.storeBankBalance || 0) + additionalSalesHNL;
  const newMonthlySales = (state.monthlySalesAccumulated || 0) + additionalSalesHNL;

  let nextState: DailySimulationState = {
    ...state,
    storeBankBalance: newStoreBank,
    monthlySalesAccumulated: newMonthlySales,
    erpCorporateState: updatedErp
  };

  // 5. Asiento contable de partida doble en el Libro Mayor si hubo ingresos de sucursales
  if (additionalSalesHNL > 0) {
    nextState = addLedgerTransaction(
      nextState,
      { code: '1102', name: 'Bancos - Cuenta Corriente Operativa', category: 'ASSET', amountHNL: additionalSalesHNL },
      { code: '4101', name: 'Ingresos por Ventas de Sucursales', category: 'REVENUE', amountHNL: additionalSalesHNL },
      `Ventas consolidadas del día - ${operatingBranches.length} sucursal(es) en operación`,
      'GERENTE_FINANCIERO'
    );
  }

  return nextState;
}

