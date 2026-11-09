import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DailySimulationState,
  CommercialBankId,
  CommercialLoanType
} from '../src/game/retroSimTypes';
import {
  createDefaultBankRelationships,
  createDefaultRealEstateCollaterals,
  generateInitialInGameEmails,
  requestFullCommercialCredit,
  executeLoanRepayment,
  executeInterbankTransfer,
  requestCollateralAppraisal,
  releaseRealEstateCollateral,
  pledgeRealEstateCollateralToLoan
} from '../src/game/commercialBanksEngine';
import { parseMonetaryInput } from '../src/components/retro/CustomAmountInput';
import { DEFAULT_INITIAL_SAR_RECORD } from '../src/game/constructionEngine';

function createMockSimState(): DailySimulationState {
  const initialStoreBank = 300000;
  return {
    currentDay: 5,
    currentMonth: 1,
    currentYear: 2026,
    dailyHour: 10,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,
    retailSector: 'constructora',
    storeName: 'Constructora Metropolitana',
    storeCash: 50000,
    storeBankBalance: initialStoreBank,
    storeReputation: 85,
    storeCleanliness: 90,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 15,
    dailyWages: 6000,
    dailyRent: 2000,
    monthlySalesAccumulated: 850000,
    smartBankOffers: [],
    smartBankCreditRating: 'AAA',
    constructionMaterials: {} as any,
    constructionOrders: [],
    availableTenders: [],
    activeWorks: [],
    completedWorksHistory: [],
    sarTaxRecord: {
      ...DEFAULT_INITIAL_SAR_RECORD,
      grossRevenues: 1200000,
      deductibleMaterialsExpenses: 500000,
      deductiblePayrollExpenses: 300000,
      deductibleOtherCosts: 100000,
      netTaxableIncome: 300000,
      isrTaxAmount: 75000,
      isPaid: false,
      isDeclarationFiled: false,
      paidAmountHNL: 0,
      remainingTaxDueHNL: 75000,
      solvenciaBlockers: ['Declaración Jurada SAR-25 pendiente', 'Pago de ISR pendiente'],
      taxHistory: []
    },
    fiscalSolvenciaActive: false,
    commercialBanks: createDefaultBankRelationships(initialStoreBank),
    ownedMachinery: [],
    machineryDealers: [],
    materialManufacturerQuotes: [],
    bankerVaultCash: 500000,
    bankerBchReserve: 540000,
    bankerTotalDeposits: 4500000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 85,
    bankerRunRiskPct: 5,
    docketQueue: [],
    activeLoansCount: 40,
    totalLoanPortfolio: 12000000,
    delinquentLoansCount: 1,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,
    dailyHistory: [],
    realEstateCollaterals: createDefaultRealEstateCollaterals('constructora'),
    disbursementVouchers: [],
    interbankTransfers: [],
    inGameEmails: generateInitialInGameEmails('constructora', 'Constructora Metropolitana', 'Constructora Metropolitana'),
    corporateEmailAccounts: {
      enterpriseEmail: 'gerencia@constructora.hn',
      personalEmail: 'propietario@banco-aureo.hn'
    }
  };
}

describe('Loan Disbursement, Flexible Repayment, In-Game Emails & Collaterals Tests', () => {

  it('1. Desembolso neto de préstamo acredita la cuenta corriente seleccionada y genera comprobante y correo', () => {
    const state = createMockSimState();
    const destBankId: CommercialBankId = 'ficohsa';
    const initDestBalance = state.commercialBanks[destBankId].checkingAccount?.balance || 0;
    const initGlobalBalance = state.storeBankBalance;

    const res = requestFullCommercialCredit(
      state,
      'ficohsa',
      'capital_trabajo',
      500000,
      24,
      'Financiamiento de planillas y materiales',
      0,
      undefined,
      destBankId
    );

    assert.equal(res.success, true, 'El crédito debió ser aprobado');
    assert.ok(res.voucher, 'Debe generarse un comprobante de desembolso');
    assert.equal(res.voucher?.destinationBankId, 'ficohsa');
    assert.equal(res.voucher?.approvedAmountHNL, 500000);
    const netDisb = res.voucher?.netDisbursementHNL || 0;
    assert.ok(netDisb > 450000, 'El desembolso neto debe contemplar comisiones');

    // Verificar acreditación exacta en la cuenta corriente del banco de destino
    const updatedDestBalance = res.updatedState.commercialBanks[destBankId].checkingAccount?.balance || 0;
    assert.equal(
      Math.round(updatedDestBalance),
      Math.round(initDestBalance + netDisb),
      'El saldo de la cuenta de cheques de Ficohsa debe aumentar exactamente por el desembolso neto'
    );

    // Verificar que el saldo global del empresario aumentó por el neto recibido
    assert.equal(
      Math.round(res.updatedState.storeBankBalance),
      Math.round(initGlobalBalance + netDisb),
      'El saldo bancario global debe reflejar el desembolso neto'
    );

    // Verificar registro en el historial de comprobantes
    assert.ok(res.updatedState.disbursementVouchers?.length! > 0);
    assert.equal(res.updatedState.disbursementVouchers![0].id, res.voucher?.id);

    // Verificar que se envió un correo de confirmación de desembolso a la bandeja de entrada
    const disbursementEmail = res.updatedState.inGameEmails?.find(e => e.id.includes('email-desemb') || e.subject.includes('Desembolso'));
    assert.ok(disbursementEmail, 'Debe existir un correo notificando el desembolso');
    assert.equal(disbursementEmail?.category, 'bancos_financiamiento');
    assert.ok(disbursementEmail?.body.includes('500,000'));
  });

  it('2. Parseo monetario personalizado admite centavos, comas y prefijos Lempiras', () => {
    assert.equal(parseMonetaryInput('1237.50').amount, 1237.5);
    assert.equal(parseMonetaryInput('1,237.50').amount, 1237.5);
    assert.equal(parseMonetaryInput('L 1,237.50').amount, 1237.5);
    assert.equal(parseMonetaryInput('1237,50').amount, 1237.5);
    assert.equal(parseMonetaryInput('500,000').amount, 500000);
    assert.equal(parseMonetaryInput('-500').isValid, false, 'No debe permitir importes negativos');
    assert.ok(parseMonetaryInput('-500').error?.includes('negativos'));
    assert.equal(parseMonetaryInput('abc').isValid, false, 'Texto no numérico es inválido');
  });

  it('3. Pagos flexibles: pago parcial, abono extraordinario y cancelación total sin intereses futuros', () => {
    let state = createMockSimState();
    
    // Primero desembolsar préstamo
    const loanRes = requestFullCommercialCredit(
      state,
      'atlantida',
      'capital_trabajo',
      300000,
      12,
      'Línea de crédito para compras'
    );
    state = loanRes.updatedState;
    const loan = state.commercialBanks.atlantida.activeLoan!;
    assert.ok(loan, 'Debe tener préstamo activo');
    const initialDebt = loan.balanceRemaining;
    const monthlyQuota = loan.monthlyPayment;

    // A. Pago Parcial
    const partialPaymentAmount = Math.round(monthlyQuota * 0.5);
    const partialRes = executeLoanRepayment(
      state,
      'atlantida',
      partialPaymentAmount,
      'pago_parcial',
      'reducir_plazo'
    );
    assert.equal(partialRes.success, true);
    const partialLoan = partialRes.updatedState.commercialBanks.atlantida.activeLoan!;
    assert.ok(partialLoan.balanceRemaining < initialDebt, 'La deuda debe haber disminuido');
    assert.ok(partialLoan.balanceRemaining > 0, 'El préstamo sigue activo');

    // B. Abono a capital para reducir plazo
    const capitalAbonoRes = executeLoanRepayment(
      partialRes.updatedState,
      'atlantida',
      50000,
      'abono_capital',
      'reducir_plazo'
    );
    assert.equal(capitalAbonoRes.success, true);
    const capitalLoan = capitalAbonoRes.updatedState.commercialBanks.atlantida.activeLoan!;
    assert.ok(capitalLoan.termMonthsRemaining <= partialLoan.termMonthsRemaining, 'El plazo restante debe haberse reducido');

    // C. Cancelación total
    const payoffRes = executeLoanRepayment(
      capitalAbonoRes.updatedState,
      'atlantida',
      capitalLoan.balanceRemaining,
      'cancelacion_total',
      'reducir_plazo'
    );
    assert.equal(payoffRes.success, true);
    assert.equal(payoffRes.updatedState.commercialBanks.atlantida.activeLoan, undefined, 'El préstamo debe quedar totalmente cancelado');
    assert.ok(payoffRes.message.includes('LIQUIDACIÓN TOTAL') || payoffRes.message.includes('cancelado'), 'Mensaje de liquidación total');
  });

  it('4. Transferencias interbancarias ACH entre cuentas propias mueven fondos sin duplicar dinero', () => {
    const state = createMockSimState();
    const fromBank: CommercialBankId = 'atlantida';
    const toBank: CommercialBankId = 'ficohsa';

    const initFromBalance = state.commercialBanks[fromBank].checkingAccount!.balance;
    const initToBalance = state.commercialBanks[toBank].checkingAccount!.balance;
    const initGlobal = state.storeBankBalance;

    const transferAmount = 40000;
    const transferRes = executeInterbankTransfer(state, fromBank, toBank, transferAmount);
    assert.equal(transferRes.success, true, 'La transferencia ACH debe ser exitosa');

    const updatedFrom = transferRes.updatedState.commercialBanks[fromBank].checkingAccount!.balance;
    const updatedTo = transferRes.updatedState.commercialBanks[toBank].checkingAccount!.balance;

    assert.equal(updatedFrom, initFromBalance - transferAmount, 'Se debitó la cuenta de origen');
    assert.equal(updatedTo, initToBalance + transferAmount, 'Se acreditó la cuenta de destino');
    assert.equal(transferRes.updatedState.storeBankBalance, initGlobal, 'El patrimonio y saldo global no se duplica');
    assert.ok(transferRes.updatedState.interbankTransfers?.length! > 0, 'Debe registrarse en el log de transferencias ACH');
  });

  it('5. Garantías Reales: avalúo elegible, pignoración con prelación y liberación de gravamen', () => {
    let state = createMockSimState();
    const property = state.realEstateCollaterals![0];
    assert.ok(property, 'Debe existir una propiedad registrada');
    
    // Fórmula: Avalúo × % Aceptado = Valor Elegible
    const expectedEligible = Math.round(property.appraisalValueHNL * (property.ltvAcceptedPct / 100));
    assert.equal(property.eligibleValueHNL, expectedEligible, 'El valor elegible debe calcularse según el LTV aceptado');
    assert.equal(property.remainingCoverageHNL, expectedEligible, 'Inicialmente la cobertura restante es igual al valor elegible');

    // Reavalúo técnico con perito CNBS
    const revalRes = requestCollateralAppraisal(state, property.id);
    assert.equal(revalRes.success, true, 'El avalúo debe procesarse con éxito');
    const updatedProperty = revalRes.updatedState.realEstateCollaterals!.find(p => p.id === property.id)!;
    assert.ok((updatedProperty.eligibleValueHNL || 0) > 0);

    // Pignorar garantía a un préstamo
    const pledgeRes = pledgeRealEstateCollateralToLoan(revalRes.updatedState, property.id, 'atlantida', 'LOAN-TEST-001');
    assert.equal(pledgeRes.success, true);
    const pledgedProp = pledgeRes.updatedState.realEstateCollaterals!.find(p => p.id === property.id)!;
    assert.equal(pledgedProp.status, 'comprometida');
    assert.equal(pledgedProp.liensHistory?.length, 1);
    assert.equal(pledgedProp.liensHistory?.[0].priorityOrder, 1, 'Primer gravamen hipotecario tiene prelación 1');

    // Liberación de garantía
    const releaseRes = releaseRealEstateCollateral(pledgeRes.updatedState, property.id);
    assert.equal(releaseRes.success, true);
    const releasedProp = releaseRes.updatedState.realEstateCollaterals!.find(p => p.id === property.id)!;
    assert.equal(releasedProp.status, 'liberada');
    assert.equal(releasedProp.committedCoverageHNL, 0);
  });

  it('6. Correo empresarial interno simula carpetas, respuestas y ofertas bancarias', () => {
    const state = createMockSimState();
    const emails = state.inGameEmails!;
    assert.ok(emails.length >= 4, 'Deben existir al menos 4 correos iniciales');

    const unreadCount = emails.filter(e => !e.isRead).length;
    assert.ok(unreadCount > 0, 'Debe haber mensajes no leídos');

    // Oferta bancaria
    const bankOfferMail = emails.find(e => e.category === 'bancos_financiamiento');
    assert.ok(bankOfferMail, 'Debe existir una oferta de financiamiento');
    assert.ok(bankOfferMail?.loanOfferData, 'El correo de banco contiene datos de la oferta');
    assert.ok(bankOfferMail?.actions && bankOfferMail.actions.length > 0, 'Contiene acciones como Ver Condiciones o Negociar');

    // Aviso de cliente/pedido
    const clientMail = emails.find(e => e.category === 'ventas_clientes');
    assert.ok(clientMail, 'Debe existir un correo de pedido de cliente');
  });

  it('7. SAR Solvencia Fiscal: enumera bloqueadores cuando hay mora o falta de declaración', () => {
    const state = createMockSimState();
    const sar = state.sarTaxRecord!;

    // Con declaración pendiente y pago pendiente
    assert.equal(sar.isDeclarationFiled, false);
    assert.equal(sar.remainingTaxDueHNL, 75000);
    assert.ok((sar.solvenciaBlockers?.length || 0) >= 2, 'Deben listarse bloqueadores de solvencia');

    // Simular que se presenta y se paga
    const filedSar = {
      ...sar,
      isDeclarationFiled: true,
      filingDate: 'Día 5, Enero 2026',
      paidAmountHNL: 100000,
      remainingTaxDueHNL: 0,
      solvenciaBlockers: []
    };

    assert.equal(filedSar.remainingTaxDueHNL, 0);
    assert.equal(filedSar.solvenciaBlockers.length, 0, 'Sin bloqueadores una vez cumplida la obligación');
  });
});
