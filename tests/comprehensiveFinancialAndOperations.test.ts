import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMMERCIAL_LOAN_PRODUCTS,
  calculateCreditTermsDisclosure,
  requestFullCommercialCredit,
  consultBankAdvisor,
  makeExtraordinaryLoanPaymentWithOptions,
  createDefaultRealEstateCollaterals,
  pledgeRealEstateCollateralToLoan,
  releaseRealEstateCollateral,
  executeInvoiceFactoring,
  paySupplierInvoice,
  createDefaultCompetitors,
  executeCompetitorAcquisition,
  calculateComprehensiveFinancialStatements,
  createDefaultBankRelationships
} from '../src/game/commercialBanksEngine';
import { DailySimulationState, CommercialLoanType } from '../src/game/retroSimTypes';
import { DEFAULT_CONSTRUCTION_MATERIALS, DEFAULT_INITIAL_SAR_RECORD } from '../src/game/constructionEngine';
import { DEFAULT_MACHINERY_DEALERS, DEFAULT_MANUFACTURER_QUOTES } from '../src/game/machineryAndSuppliersEngine';

function createMockSimState(): DailySimulationState {
  const initialBank = 3500000;
  const initialCash = 250000;
  return {
    currentDay: 1,
    currentMonth: 1,
    currentYear: 2026,
    dailyHour: 9,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,
    retailSector: 'constructora',
    storeName: 'Constructora Metropolitana',
    storeCash: initialCash,
    storeBankBalance: initialBank,
    storeReputation: 80,
    storeCleanliness: 95,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 12,
    dailyWages: 4800,
    dailyRent: 1500,
    monthlySalesAccumulated: 850000,
    constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
    constructionOrders: [],
    availableTenders: [],
    activeWorks: [],
    completedWorksHistory: [],
    sarTaxRecord: {
      ...DEFAULT_INITIAL_SAR_RECORD,
      isPaid: false,
      isrTaxAmount: 45000
    },
    fiscalSolvenciaActive: true,
    commercialBanks: createDefaultBankRelationships(initialBank),
    ownedMachinery: [],
    machineryDealers: DEFAULT_MACHINERY_DEALERS,
    materialManufacturerQuotes: DEFAULT_MANUFACTURER_QUOTES,
    bankerVaultCash: 500000,
    bankerBchReserve: 200000,
    bankerTotalDeposits: 1000000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 80,
    bankerRunRiskPct: 5,
    docketQueue: [],
    activeLoansCount: 10,
    totalLoanPortfolio: 5000000,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,
    dailyHistory: [],
    realEstateCollaterals: createDefaultRealEstateCollaterals('constructora'),
    supplierCredits: [
      {
        id: 'inv_cem_01',
        supplierName: 'Cementos Argos de Honduras',
        concept: '500 Bolsas de Cemento Gris Especial',
        invoiceNumber: '001-002-2026-991',
        amountHNL: 110000,
        issuedDay: 1,
        dueDay: 30,
        isPaid: false,
        earlyDiscountPct: 2.0,
        latePenaltyDailyPct: 0.1
      }
    ],
    activeCompetitors: createDefaultCompetitors('constructora'),
    autoDebitEnabled: true
  };
}

test('1. Catálogo Completo de Créditos: Configuración de los 12+ Productos Financieros', () => {
  const expectedProducts: CommercialLoanType[] = [
    'capital_trabajo',
    'linea_revolvente',
    'credito_inventario',
    'credito_maquinaria',
    'credito_vehicular',
    'financiamiento_inmobiliario',
    'construccion_avances',
    'adquisicion_competidores',
    'tarjeta_empresarial',
    'credito_proveedores',
    'leasing_financiero',
    'factoraje_facturas',
    'reestructurado'
  ];

  for (const prodId of expectedProducts) {
    const config = COMMERCIAL_LOAN_PRODUCTS[prodId];
    assert.ok(config, `El producto ${prodId} debe existir en COMMERCIAL_LOAN_PRODUCTS`);
    assert.ok(config.minAmountHNL > 0, `${prodId} debe tener un monto mínimo mayor a 0`);
    assert.ok(config.maxTermMonths >= config.minTermMonths, `${prodId} plazo máximo >= mínimo`);
  }
});

test('2. Pre-confirmación y Hoja de Liquidación (Disclosure de Términos)', () => {
  const state = createMockSimState();
  const disclosure = calculateCreditTermsDisclosure(
    state,
    'atlantida',
    'capital_trabajo',
    500000,
    24,
    3 // 3 meses de gracia
  );

  assert.equal(disclosure.requestedAmountHNL, 500000);
  assert.equal(disclosure.approvedAmountHNL, 500000);
  assert.ok(disclosure.annualNominalRatePct > 0, 'Debe calcular tasa anual nominal');
  assert.ok(disclosure.annualEffectiveRatePct >= disclosure.annualNominalRatePct, 'Tasa efectiva >= nominal');
  assert.ok(disclosure.monthlyPaymentHNL > 0, 'Cuota nivelada > 0');
  assert.equal(disclosure.openingFeeHNL, 500000 * 0.015, 'Comisión de apertura 1.5%');
  assert.equal(disclosure.netDisbursementHNL, 500000 - disclosure.openingFeeHNL, 'Desembolso neto = aprobado - comisión');
  assert.ok(disclosure.amortizationPreview.length >= 3, 'Previsualización de al menos 3 cuotas');
  assert.ok(disclosure.liquidityImpactSummary.length > 10, 'Debe incluir explicación de impacto en liquidez');
});

test('3. Desembolso de Crédito: Aumenta caja/bancos y deuda pasiva sin considerarse ingreso por ventas', () => {
  const state = createMockSimState();
  const initialBank = state.storeBankBalance;
  const initialSales = state.monthlySalesAccumulated;

  const res = requestFullCommercialCredit(
    state,
    'ficohsa',
    'capital_trabajo',
    600000,
    36,
    'Expansión de Cuadrilla y Compra de Materiales'
  );

  assert.equal(res.success, true, 'El crédito debe desembolsarse exitosamente');
  assert.ok(res.updatedState.storeBankBalance > initialBank, 'El banco del jugador debe recibir el desembolso neto');
  assert.equal(res.updatedState.monthlySalesAccumulated, initialSales, 'Recibir un préstamo NO representa venta ni utilidad');

  const rel = res.updatedState.commercialBanks.ficohsa;
  assert.ok(rel?.activeLoan, 'Debe crearse el préstamo comercial activo');
  assert.equal(rel.activeLoan?.balanceRemaining, 600000);
});

test('4. Asesor Bancario Interactivo Offline: Respuestas deterministas con datos reales de la partida', () => {
  const state = createMockSimState();
  const consultRate = consultBankAdvisor(state, 'atlantida', 'negociar_tasa');

  assert.ok(consultRate.officerName.length > 0, 'Debe asignar el nombre del vicepresidente');
  assert.ok(consultRate.officerDialog.includes('Roberto Facussé') || consultRate.officerDialog.length > 20, 'Diálogo detallado');
  assert.ok(consultRate.keyFinancialData.some(d => d.label === 'Score Crediticio'), 'Audita el Score');
  assert.ok(consultRate.keyFinancialData.some(d => d.label === 'Ratio Deuda/Ingreso (DTI)'), 'Audita el DTI');

  const consultGrace = consultBankAdvisor(state, 'ficohsa', 'periodo_gracia');
  assert.ok(consultGrace.verdict === 'aprobado' || consultGrace.verdict === 'contraoferta', 'Evalúa período de gracia');
});

test('5. Abonos Extraordinarios: Opción Reducir Plazo vs Reducir Cuota y Liberación de Garantía', () => {
  const state = createMockSimState();
  // Solicitamos un crédito previo
  const creditRes = requestFullCommercialCredit(
    state,
    'atlantida',
    'capital_trabajo',
    300000,
    24,
    'Capital de Operación'
  );

  const stateWithCredit = creditRes.updatedState;
  const initialLoan = stateWithCredit.commercialBanks.atlantida.activeLoan!;
  const initialPayment = initialLoan.monthlyPayment;
  const initialTerm = initialLoan.termMonthsRemaining;

  // Abono opción 'reducir_cuota'
  const abonoCuotaRes = makeExtraordinaryLoanPaymentWithOptions(
    stateWithCredit,
    'atlantida',
    100000,
    'reducir_cuota'
  );

  assert.equal(abonoCuotaRes.success, true);
  assert.ok(abonoCuotaRes.newMonthlyPaymentHNL < initialPayment, 'La cuota mensual debe reducirse');
  assert.equal(abonoCuotaRes.newMonthsRemaining, initialTerm, 'El plazo en meses se mantiene igual');
  assert.ok(abonoCuotaRes.interestSavedHNL > 0, 'Debe calcular el ahorro de intereses futuros');

  // Abono opción 'reducir_plazo'
  const abonoPlazoRes = makeExtraordinaryLoanPaymentWithOptions(
    stateWithCredit,
    'atlantida',
    100000,
    'reducir_plazo'
  );

  assert.equal(abonoPlazoRes.success, true);
  assert.ok(abonoPlazoRes.newMonthsRemaining < initialTerm, 'El plazo en meses debe reducirse');
  assert.ok(abonoPlazoRes.interestSavedHNL > 0, 'Ahorro sustancial en intereses');
});

test('6. Pignoración y Liberación de Garantías Reales (Casas, Terrenos, Bodegas)', () => {
  const state = createMockSimState();
  const col = state.realEstateCollaterals![0];

  // Pignorar garantía a un préstamo
  const pledgeRes = pledgeRealEstateCollateralToLoan(state, col.id, 'atlantida', 'loan-999');
  assert.equal(pledgeRes.success, true);
  const pledgedCol = pledgeRes.updatedState.realEstateCollaterals!.find(c => c.id === col.id);
  assert.equal(pledgedCol?.isPledged, true);
  assert.equal(pledgedCol?.pledgedToBankId, 'atlantida');

  // Liberar garantía
  const releaseRes = releaseRealEstateCollateral(pledgeRes.updatedState, col.id);
  assert.equal(releaseRes.success, true);
  const releasedCol = releaseRes.updatedState.realEstateCollaterals!.find(c => c.id === col.id);
  assert.equal(releasedCol?.isPledged, false);
});

test('7. Factoraje de Facturas: Anticipo líquido del 90% con descuento del 6%', () => {
  const state = createMockSimState();
  const initialBank = state.storeBankBalance;
  const invoiceAmount = 200000;

  const factRes = executeInvoiceFactoring(state, 'ficohsa', invoiceAmount, 'SIT Obras Públicas');
  assert.equal(factRes.success, true);

  const expectedNet = (invoiceAmount * 0.90) - (invoiceAmount * 0.06); // 180,000 - 12,000 = 168,000
  assert.equal(factRes.updatedState.storeBankBalance, initialBank + expectedNet);
});

test('8. Gestión de Cuentas por Pagar a Proveedores', () => {
  const state = createMockSimState();
  const initialBank = state.storeBankBalance;
  const inv = state.supplierCredits![0];

  const payRes = paySupplierInvoice(state, inv.id);
  assert.equal(payRes.success, true);
  assert.equal(payRes.updatedState.storeBankBalance, initialBank - inv.amountHNL);
  assert.equal(payRes.updatedState.supplierCredits![0].isPaid, true);
});

test('9. Mercado Competidor y Ejecución de M&A (Asset Deal vs Share Purchase)', () => {
  const state = createMockSimState();
  const comp = state.activeCompetitors![1]; // Empresa en dificultades (Vialtec)

  // 1. Asset Deal
  const assetDealRes = executeCompetitorAcquisition(state, comp.id, 'asset_deal');
  assert.equal(assetDealRes.success, true);
  assert.ok(assetDealRes.updatedState.storeBankBalance < state.storeBankBalance);

  // 2. Share Purchase (100% de acciones)
  const stateForShare = createMockSimState();
  const initialRep = stateForShare.storeReputation;
  const shareDealRes = executeCompetitorAcquisition(stateForShare, comp.id, 'share_purchase');
  assert.equal(shareDealRes.success, true);
  assert.ok(shareDealRes.updatedState.storeReputation > initialRep, 'La reputación empresarial aumenta tras la absorción');
  assert.equal(shareDealRes.updatedState.activeCompetitors!.find(c => c.id === comp.id)?.status, 'adquirido_jugador');
});

test('10. Motor Contable Central: Verificación estricta de la Ecuación Patrimonial (Activos = Pasivos + Patrimonio)', () => {
  const state = createMockSimState();
  const financials = calculateComprehensiveFinancialStatements(state);

  assert.ok(financials.totalAssets > 0, 'Total Activos debe ser mayor a 0');
  assert.ok(financials.totalLiabilities >= 0, 'Total Pasivos >= 0');
  
  // Regla fundamental contable:
  // Patrimonio Neto = Total Activos - Total Pasivos
  // Total Activos = Total Pasivos + Patrimonio Neto
  const balanceCheck = financials.totalLiabilities + financials.netEquity;
  assert.equal(balanceCheck, financials.totalAssets, 'La ecuación contable Activos = Pasivos + Patrimonio Neto debe cuadrar al centavo');

  // P&L Check
  assert.ok(financials.incomeStatement.grossProfit === financials.incomeStatement.grossRevenue - financials.incomeStatement.cogs);
  assert.ok(financials.incomeStatement.ebitda === financials.incomeStatement.grossProfit - financials.incomeStatement.operatingExpenses);
  assert.ok(financials.incomeStatement.netIncome <= financials.incomeStatement.ebitda);
});
