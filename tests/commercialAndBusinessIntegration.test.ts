import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DailySimulationState } from '../src/game/retroSimTypes';
import {
  createDefaultBankRelationships,
  createDefaultRealEstateCollaterals,
  requestFullCommercialCredit,
  executeFlexibleLoanPayment,
  transferBetweenAccounts,
  requestNewAppraisal,
  registerNewAssetAsCollateral,
  evaluateAndGenerateBankOffers,
  createInitialSimulatedEmails
} from '../src/game/commercialBanksEngine';
import {
  parseMonetaryInput,
  formatHNLAmount
} from '../src/components/common/CustomAmountInput';
import {
  fileSarDeclaration,
  paySarTaxObligation,
  requestSarSolvenciaCertificate
} from '../src/game/sarFiscalEngine';
import {
  restoreDailySimulationState
} from '../src/game/savedState';
import { DEFAULT_CONSTRUCTION_MATERIALS, DEFAULT_INITIAL_SAR_RECORD } from '../src/game/constructionEngine';
import { DEFAULT_MACHINERY_DEALERS, DEFAULT_MANUFACTURER_QUOTES } from '../src/game/machineryAndSuppliersEngine';

function createMockSimState(overrides: Partial<DailySimulationState> = {}): DailySimulationState {
  const initialBankBalance = 500000;
  const companyName = 'Constructora & Inversiones El Águila S. de R.L.';
  return {
    currentDay: 5,
    currentMonth: 2,
    currentYear: 2026,
    dailyHour: 10,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,

    retailSector: 'constructora',
    storeName: companyName,
    storeCash: 45000,
    storeBankBalance: initialBankBalance,
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
    smartBankCreditRating: 'AA',

    constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
    constructionOrders: [],
    availableTenders: [],
    activeWorks: [],
    completedWorksHistory: [],

    sarTaxRecord: DEFAULT_INITIAL_SAR_RECORD,
    fiscalSolvenciaActive: true,

    commercialBanks: createDefaultBankRelationships(initialBankBalance),
    ownedMachinery: [],
    machineryDealers: DEFAULT_MACHINERY_DEALERS,
    materialManufacturerQuotes: DEFAULT_MANUFACTURER_QUOTES,

    bankerVaultCash: 500000,
    bankerBchReserve: 540000,
    bankerTotalDeposits: 4500000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 82,
    bankerRunRiskPct: 8,
    docketQueue: [],
    activeLoansCount: 10,
    totalLoanPortfolio: 5000000,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,

    realEstateCollaterals: createDefaultRealEstateCollaterals(companyName, 'constructora'),
    simulatedEmails: createInitialSimulatedEmails(companyName, 'constructora', initialBankBalance),
    transactionVouchers: [],
    dynamicBankOffers: [],
    fiscalPeriods: [],

    dailyHistory: [],
    ...overrides
  };
}

describe('Aceptación A: Corrección del desembolso de préstamos bancarios', () => {
  it('Acredita el desembolso neto en la cuenta de cheques seleccionada y sincroniza storeBankBalance', () => {
    const state = createMockSimState();
    const targetBankId = 'ficohsa';
    const initialChecking = state.commercialBanks[targetBankId].checkingAccount.balance;
    const initialStoreBank = state.storeBankBalance;

    const approvedAmount = 200000;
    const res = requestFullCommercialCredit(
      state,
      targetBankId,
      'credito_empresarial',
      approvedAmount,
      12,
      'Capital de trabajo para compra de maquinaria pesada',
      0,
      undefined,
      targetBankId
    );

    assert.equal(res.success, true);
    assert.ok(res.voucher, 'Debe generar un TransactionVoucher');

    const updatedChecking = res.updatedState.commercialBanks[targetBankId].checkingAccount.balance;
    const updatedStoreBank = res.updatedState.storeBankBalance;

    // Comisión de apertura 1.5% CNBS
    const openingFee = Math.round(approvedAmount * 0.015);
    const expectedNetDisbursement = approvedAmount - openingFee;

    assert.equal(updatedChecking, initialChecking + expectedNetDisbursement);
    assert.equal(updatedStoreBank, initialStoreBank + expectedNetDisbursement);
    assert.equal(res.voucher?.amount, approvedAmount);
    assert.equal(res.voucher?.netDisbursement, expectedNetDisbursement);
    assert.equal(res.voucher?.openingFeeDeduction, openingFee);
    assert.equal(res.voucher?.newBalance, updatedChecking);
    assert.equal(res.voucher?.destinationBankId, targetBankId);

    // Debe existir un correo de aviso en simulatedEmails
    const emailAviso = res.updatedState.simulatedEmails?.find(e => e.voucherId === res.voucher?.id);
    assert.ok(emailAviso, 'Debe existir notificación por correo del desembolso con el comprobante');
  });

  it('Permite desembolsar en una cuenta de cheques de otro banco propio (ej: préstamo en Ficohsa acreditado en Atlántida)', () => {
    const state = createMockSimState();
    const lendingBankId = 'ficohsa';
    const destBankId = 'atlantida';
    const initDestChecking = state.commercialBanks[destBankId].checkingAccount.balance;

    const res = requestFullCommercialCredit(
      state,
      lendingBankId,
      'credito_empresarial',
      100000,
      6,
      'Fondo rotatorio de tesorería',
      0,
      undefined,
      destBankId
    );

    assert.equal(res.success, true);
    const expectedNet = 100000 - Math.round(100000 * 0.015);
    assert.equal(res.updatedState.commercialBanks[destBankId].checkingAccount.balance, initDestChecking + expectedNet);
  });
});

describe('Aceptación B: Entrada y parseo de cualquier monto personalizado', () => {
  it('Parsea correctamente formatos de moneda habituales sin alterar decimales ni centavos', () => {
    assert.equal(parseMonetaryInput('L 1,250.50'), 1250.50);
    assert.equal(parseMonetaryInput('1250,50'), 1250.50);
    assert.equal(parseMonetaryInput('L. 25,000.75'), 25000.75);
    assert.equal(parseMonetaryInput('1.500.000,25'), 1500000.25);
    assert.equal(parseMonetaryInput('500.9'), 500.9);
    assert.equal(parseMonetaryInput('  75000.00  '), 75000.0);
    assert.equal(parseMonetaryInput('0.05'), 0.05);
  });

  it('Rechaza importes negativos, no numéricos o vacíos devolviendo 0 o NaN', () => {
    assert.equal(isNaN(parseMonetaryInput('texto-invalido')), true);
    assert.equal(parseMonetaryInput(''), 0);
    assert.equal(isNaN(parseMonetaryInput('-500.00')), true);
  });

  it('Formatea con precisión bancaria y símbolo oficial de Lempiras (L)', () => {
    const formatted = formatHNLAmount(125430.75);
    assert.ok(formatted.includes('125,430.75') || formatted.includes('125.430,75'));
    assert.ok(formatted.startsWith('L'));
  });
});

describe('Aceptación C: Validación sin recorte silencioso del monto', () => {
  it('Rechaza transferencias o pagos que excedan el saldo disponible explicando el motivo exacto', () => {
    const state = createMockSimState();
    const checkingBalance = state.commercialBanks.ficohsa.checkingAccount.balance;
    const excessiveAmount = checkingBalance + 100000;

    const res = transferBetweenAccounts(state, 'ficohsa', 'atlantida', excessiveAmount);
    assert.equal(res.success, false);
    assert.ok(res.message.includes('Fondos insuficientes'), 'Debe reportar falta de fondos explícitamente');
    // El balance no debe cambiar
    assert.equal(res.updatedState.commercialBanks.ficohsa.checkingAccount.balance, checkingBalance);
  });
});

describe('Aceptación D: Pagos flexibles de préstamos y abonos extraordinarios', () => {
  it('Abona 1 cuota respetando la distribución entre intereses devengados y capital', () => {
    const baseState = createMockSimState();
    // Obtener un préstamo primero
    const loanRes = requestFullCommercialCredit(
      baseState,
      'ficohsa',
      'credito_empresarial',
      120000,
      12,
      'Inversión',
      0
    );
    const loanState = loanRes.updatedState;
    const activeLoan = loanState.commercialBanks.ficohsa.loans[0];
    assert.ok(activeLoan, 'Debe haber un préstamo activo');

    const initialRemaining = activeLoan.remainingBalance;
    const paymentRes = executeFlexibleLoanPayment(loanState, {
      bankId: 'ficohsa',
      paymentMode: 'una_cuota',
      amount: activeLoan.monthlyPayment,
      sourceAccount: 'cuenta_bancaria'
    });

    assert.equal(paymentRes.success, true);
    assert.ok(paymentRes.voucher, 'Debe generar comprobante de pago');
    const updatedLoan = paymentRes.updatedState.commercialBanks.ficohsa.loans[0];
    assert.ok(updatedLoan.remainingBalance < initialRemaining, 'El capital remanente debe haberse reducido');
    assert.equal(updatedLoan.paidInstallments, 1);
  });

  it('Realiza un pago parcial abonando primero a intereses sin marcar la cuota mensual como totalmente saldada', () => {
    const baseState = createMockSimState();
    const loanRes = requestFullCommercialCredit(baseState, 'ficohsa', 'credito_empresarial', 100000, 12, 'Inv');
    const loanState = loanRes.updatedState;
    const loan = loanState.commercialBanks.ficohsa.loans[0];

    const partialAmount = Math.round(loan.monthlyPayment * 0.5); // 50% de la cuota
    const payRes = executeFlexibleLoanPayment(loanState, {
      bankId: 'ficohsa',
      paymentMode: 'pago_parcial',
      amount: partialAmount,
      sourceAccount: 'cuenta_bancaria'
    });

    assert.equal(payRes.success, true);
    const updatedLoan = payRes.updatedState.commercialBanks.ficohsa.loans[0];
    assert.equal(updatedLoan.paidInstallments, 0, 'Un pago parcial no debe incrementar la cantidad de cuotas completas saldadas');
    assert.ok(updatedLoan.remainingBalance < loan.remainingBalance, 'Debe amortizar el remanente neto al capital');
  });

  it('Cancela completamente el préstamo cobrando únicamente el saldo de capital remanente e interés devengado sin intereses futuros no incurridos', () => {
    const baseState = createMockSimState();
    const loanRes = requestFullCommercialCredit(baseState, 'ficohsa', 'credito_empresarial', 50000, 12, 'Inv');
    const loanState = loanRes.updatedState;
    const loan = loanState.commercialBanks.ficohsa.loans[0];

    // Asegurar saldo suficiente en cuenta
    loanState.commercialBanks.ficohsa.checkingAccount.balance = 200000;
    loanState.storeBankBalance = 200000;

    const cancelRes = executeFlexibleLoanPayment(loanState, {
      bankId: 'ficohsa',
      paymentMode: 'cancelar_prestamo',
      amount: 0, // modo cancelación calcula el saldo exacto
      sourceAccount: 'cuenta_bancaria'
    });

    assert.equal(cancelRes.success, true);
    const updatedLoan = cancelRes.updatedState.commercialBanks.ficohsa.loans[0];
    assert.equal(updatedLoan.status, 'cancelado');
    assert.equal(updatedLoan.remainingBalance, 0);
    assert.ok(cancelRes.voucher?.description.includes('Liquidación total'));
  });

  it('Abono a capital con reducción de cuota mensual recalcula la cuota restante', () => {
    const baseState = createMockSimState();
    const loanRes = requestFullCommercialCredit(baseState, 'ficohsa', 'credito_empresarial', 150000, 24, 'Inv');
    const loanState = loanRes.updatedState;
    const loan = loanState.commercialBanks.ficohsa.loans[0];
    const initialMonthlyPayment = loan.monthlyPayment;

    const abonoRes = executeFlexibleLoanPayment(loanState, {
      bankId: 'ficohsa',
      paymentMode: 'abono_capital',
      amount: 40000,
      extraordinaryStrategy: 'reducir_cuota',
      sourceAccount: 'cuenta_bancaria'
    });

    assert.equal(abonoRes.success, true);
    const updatedLoan = abonoRes.updatedState.commercialBanks.ficohsa.loans[0];
    assert.ok(updatedLoan.monthlyPayment < initialMonthlyPayment, 'La cuota mensual debe haberse reducido');
  });
});

describe('Aceptación E: Ofertas bancarias dinámicas y no coercitivas', () => {
  it('Genera ofertas comerciales de los bancos según liquidez y ventas sin obligar a contraer deuda', () => {
    const state = createMockSimState();
    const updated = evaluateAndGenerateBankOffers(state);

    assert.ok(updated.dynamicBankOffers && updated.dynamicBankOffers.length > 0, 'Debe haber generado ofertas bancarias dinámicas');
    const offer = updated.dynamicBankOffers[0];
    assert.ok(offer.offeredAmount > 0);
    assert.ok(offer.annualRatePct > 0);
    assert.equal(offer.status, 'disponible');

    // Comprobar que tener ofertas en estado disponible no crea préstamos en commercialBanks
    const loansCount = updated.commercialBanks[offer.bankId].loans.length;
    assert.equal(loansCount, 0, 'Tener una oferta en bandeja no debe generar deuda activa');
  });
});

describe('Aceptación F: SAR, Declaración Jurada e Impuestos (25% ISR)', () => {
  it('Distingue entre declaración jurada presentada e impuesto pagado', () => {
    const state = createMockSimState({
      monthlySalesAccumulated: 200000,
      sarTaxRecord: {
        ...DEFAULT_INITIAL_SAR_RECORD,
        pendingTaxDue: 0,
        isFiled: false
      }
    });

    // 1. Presentar declaración Formulario SAR-25
    const fileRes = fileSarDeclaration(state, 2026, 1);
    assert.equal(fileRes.success, true);
    assert.equal(fileRes.updatedState.sarTaxRecord.isFiled, true);
    assert.ok(fileRes.updatedState.sarTaxRecord.pendingTaxDue > 0, 'Debe calcular el ISR adeudado');

    // 2. Comprobar que la solvencia se niega mientras el impuesto esté pendiente de pago
    const solvenciaCheck = requestSarSolvenciaCertificate(fileRes.updatedState);
    assert.equal(solvenciaCheck.solvenciaIssued, false, 'No debe otorgar solvencia si hay deuda líquida pendiente');

    // 3. Pagar la obligación fiscal mediante cuenta bancaria
    const payRes = paySarTaxObligation(
      fileRes.updatedState,
      fileRes.updatedState.sarTaxRecord.pendingTaxDue,
      'cuenta_bancaria',
      'ficohsa'
    );
    assert.equal(payRes.success, true);
    assert.equal(payRes.updatedState.sarTaxRecord.pendingTaxDue, 0);

    // 4. Solicitar solvencia ahora que está solvente
    const solvenciaOk = requestSarSolvenciaCertificate(payRes.updatedState);
    assert.equal(solvenciaOk.solvenciaIssued, true);
    assert.ok(solvenciaOk.certificateText?.includes('SIMULACIÓN — SIN VALIDEZ OFICIAL'), 'El certificado debe contener la leyenda obligatoria');
  });
});

describe('Aceptación G: Garantías reales, LTV, gravámenes de prelación y bloqueo de enajenación', () => {
  it('Calcula el valor computable elegible (Avalúo x % LTV) y gestiona gravámenes de 1er rango', () => {
    const state = createMockSimState();
    const plantAsset = state.realEstateCollaterals.find(c => c.assetType === 'planta_industrial');
    assert.ok(plantAsset, 'Debe existir activo industrial en constructora');

    const expectedEligible = Math.round(plantAsset.appraisalValue * (plantAsset.ltvPercentage / 100));
    assert.equal(plantAsset.eligibleValue, expectedEligible);
    assert.equal(plantAsset.isPledged, false);

    // Solicitar crédito gravando este inmueble
    const loanRes = requestFullCommercialCredit(
      state,
      'ficohsa',
      'credito_empresarial',
      300000,
      24,
      'Compra de Grúa Torre',
      0,
      plantAsset.id
    );

    assert.equal(loanRes.success, true);
    const updatedAsset = loanRes.updatedState.realEstateCollaterals.find(c => c.id === plantAsset.id)!;
    assert.equal(updatedAsset.isPledged, true, 'El inmueble debe estar marcado como gravado');
    assert.equal(updatedAsset.liens.length, 1, 'Debe registrar 1 gravamen hipotecario');
    assert.equal(updatedAsset.liens[0].priorityRank, 1, 'El primer gravamen es de 1er rango');
    assert.equal(updatedAsset.committedCoverage, 300000);
    assert.equal(updatedAsset.availableCoverage, expectedEligible - 300000);

    // Al cancelar el préstamo, la garantía debe liberarse automáticamente
    loanRes.updatedState.commercialBanks.ficohsa.checkingAccount.balance = 500000;
    const cancelRes = executeFlexibleLoanPayment(loanRes.updatedState, {
      bankId: 'ficohsa',
      paymentMode: 'cancelar_prestamo',
      amount: 0,
      sourceAccount: 'cuenta_bancaria'
    });

    assert.equal(cancelRes.success, true);
    const releasedAsset = cancelRes.updatedState.realEstateCollaterals.find(c => c.id === plantAsset.id)!;
    assert.equal(releasedAsset.isPledged, false, 'Al saldarse la deuda, la garantía queda liberada');
    assert.equal(releasedAsset.committedCoverage, 0);
  });

  it('Permite solicitar un nuevo avalúo pericial CNBS actualizando el valor comercial', () => {
    const state = createMockSimState();
    const lotAsset = state.realEstateCollaterals.find(c => c.assetType === 'terreno_comercial')!;
    const initialAppraisal = lotAsset.appraisalValue;

    const appraisalRes = requestNewAppraisal(state, lotAsset.id);
    assert.equal(appraisalRes.success, true);
    assert.ok(appraisalRes.updatedState.realEstateCollaterals.find(c => c.id === lotAsset.id)!.appraisalValue !== initialAppraisal);
  });
});

describe('Aceptación H: Transferencias directas entre cuentas de cheques propias', () => {
  it('Transfiere fondos entre Ficohsa y Atlántida, genera comprobante y mantiene balance consolidado', () => {
    const state = createMockSimState();
    const ficohsaInit = state.commercialBanks.ficohsa.checkingAccount.balance;
    const atlantidaInit = state.commercialBanks.atlantida.checkingAccount.balance;
    const storeBankInit = state.storeBankBalance;

    const transferAmount = 75000;
    const transferRes = transferBetweenAccounts(
      state,
      'ficohsa',
      'atlantida',
      transferAmount,
      'Rebalanceo de liquidez operativa'
    );

    assert.equal(transferRes.success, true);
    assert.ok(transferRes.voucher, 'Debe generar comprobante de transferencia');
    assert.equal(transferRes.voucher?.sourceBankId, 'ficohsa');
    assert.equal(transferRes.voucher?.destinationBankId, 'atlantida');
    assert.equal(transferRes.updatedState.commercialBanks.ficohsa.checkingAccount.balance, ficohsaInit - transferAmount);
    assert.equal(transferRes.updatedState.commercialBanks.atlantida.checkingAccount.balance, atlantidaInit + transferAmount);
    // El saldo total en bancos no debe variar ya que es una transferencia interna
    assert.equal(transferRes.updatedState.storeBankBalance, storeBankInit);
  });
});

describe('Aceptación I: Persistencia y migración de partidas guardadas', () => {
  it('Restaura un estado de guardado antiguo sin campos nuevos y los rellena coherentemente', () => {
    const legacySavedState: any = {
      currentDay: 14,
      currentMonth: 3,
      currentYear: 2026,
      roleMode: 'empresario',
      retailSector: 'minimarket',
      storeName: 'Minimarket Los Próceres',
      storeCash: 25000,
      storeBankBalance: 180000,
      commercialBanks: createDefaultBankRelationships(180000)
      // Omitimos intencionalmente realEstateCollaterals, simulatedEmails, etc.
    };

    const restored = restoreDailySimulationState(legacySavedState);
    assert.equal(restored.currentDay, 14);
    assert.equal(restored.storeBankBalance, 180000);
    assert.ok(restored.realEstateCollaterals && restored.realEstateCollaterals.length > 0, 'Debe hidratar garantías reales');
    assert.ok(restored.simulatedEmails && restored.simulatedEmails.length > 0, 'Debe inicializar la bandeja de correos');
    assert.ok(Array.isArray(restored.transactionVouchers), 'Debe inicializar array de vouchers');
    assert.ok(Array.isArray(restored.dynamicBankOffers), 'Debe inicializar array de ofertas');
    assert.ok(Array.isArray(restored.fiscalPeriods), 'Debe inicializar array fiscal');
  });
});
