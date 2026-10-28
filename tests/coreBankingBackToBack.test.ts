import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  issueTermDepositCertificate, 
  originateBackToBackFacility, 
  payBackToBackInstallment, 
  executePledgedDepositForeclosure,
  processCorporatePayrollDispersion,
  executeAchTransfer
} from '../src/game/economyEngine';

test('Core Bancario: Emisión de Certificado DPF con retención fiscal SAR del 10%', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const initialDeposits = state.financials.depositsPublicTotal;

  const res = issueTermDepositCertificate(state, {
    clientName: 'Constructora del Valle S.A.',
    division: 'corporativa',
    principalHNL: 1000000,
    termDays: 360,
    interestRateAnnualPct: 8.5,
    couponPaymentFrequency: 'mensual',
    autoRenew: true
  });

  const cert = res.certificate;
  assert.equal(cert.clientName, 'Constructora del Valle S.A.');
  assert.equal(cert.principalHNL, 1000000);
  assert.equal(cert.interestRateAnnualPct, 8.5);
  assert.equal(cert.termDays, 360);
  assert.equal(cert.isPledged, false);
  assert.equal(cert.status, 'vigente');

  // Cálculo fiscal SAR 10%
  // 1,000,000 * 8.5% * (360/360) = 85,000 HNL bruto
  assert.equal(cert.accumulatedGrossInterestHNL, 85000);
  // Retención 10% = 8,500 HNL
  assert.equal(cert.accumulatedSarTaxWithheldHNL, 8500);
  // Rendimiento neto = 76,500 HNL
  assert.equal(cert.netInterestPaidHNL, 76500);

  // Verificación de balance pasivo
  assert.equal(res.updatedState.financials.depositsPublicTotal, initialDeposits + 1000000);
});

test('Core Bancario: Originación de Préstamo Back-to-Back (0% RWA / L. 0.00 provisiones / spread +3.0%)', () => {
  const state = structuredClone(INITIAL_GAME_STATE);

  // 1. Emitir un DPF libre
  const { updatedState: stateWithDpf, certificate: dpf } = issueTermDepositCertificate(state, {
    clientName: 'Distribuidora Sula S.A.',
    division: 'pyme',
    principalHNL: 2000000,
    termDays: 360,
    interestRateAnnualPct: 8.0
  });

  const initialLoans = stateWithDpf.financials.loanPortfolioCurrent;

  // 2. Originar préstamo Back-to-Back al 90% con spread de 3.0%
  const res = originateBackToBackFacility(stateWithDpf, {
    dpfCertificateId: dpf.id,
    type: 'prestamo_garantizado',
    coverageRatioPct: 90,
    termMonths: 24,
    spreadRatePct: 3.0
  });

  assert.ok(res.facility);
  const fac = res.facility;

  // Verificaciones de monto y tasas
  assert.equal(fac.approvedAmountHNL, 1800000); // 90% de 2,000,000
  assert.equal(fac.effectiveInterestRatePct, 11.0); // 8.0% + 3.0%
  assert.equal(fac.spreadRatePct, 3.0);
  assert.equal(fac.riskWeightingRwaPct, 0); // 0% RWA regulatorio CNBS
  assert.equal(fac.requiredProvisionHNL, 0); // L. 0.00 provisión por garantía líquida

  // Comisión de desembolso 0.5% (mínimo L. 500)
  // 1,800,000 * 0.005 = 9,000 HNL
  assert.equal(fac.disbursementFeeHNL, 9000);

  // Seguro de saldo deudor (L. 6.50 por millar)
  // (1,800,000 / 1000) * 6.50 = 11,700 HNL
  assert.equal(fac.monthlyDebtorInsuranceHNL, 11700);

  // Verificación de pignoración y bloqueo en el DPF
  const updatedDpf = res.updatedState.termDeposits?.find(d => d.id === dpf.id);
  assert.ok(updatedDpf);
  assert.equal(updatedDpf.isPledged, true);
  assert.equal(updatedDpf.status, 'pignorado');
  assert.equal(updatedDpf.pledgedToFacilityId, fac.id);

  // Verificación de colocación crediticia en balance
  assert.equal(res.updatedState.financials.loanPortfolioCurrent, initialLoans + 1800000);
});

test('Core Bancario: Tarjeta de Crédito Garantizada Back-to-Back (cupo 90% de DPF)', () => {
  const state = structuredClone(INITIAL_GAME_STATE);

  const { updatedState: stateWithDpf, certificate: dpf } = issueTermDepositCertificate(state, {
    clientName: 'Dra. María Elena Villeda',
    division: 'premier',
    principalHNL: 300000,
    termDays: 180,
    interestRateAnnualPct: 7.5
  });

  const res = originateBackToBackFacility(stateWithDpf, {
    dpfCertificateId: dpf.id,
    type: 'tarjeta_garantizada',
    coverageRatioPct: 90,
    termMonths: 36,
    spreadRatePct: 3.5
  });

  assert.ok(res.facility);
  assert.equal(res.facility.type, 'tarjeta_garantizada');
  assert.equal(res.facility.approvedAmountHNL, 270000); // 90% de 300,000
  assert.equal(res.facility.effectiveInterestRatePct, 11.0); // 7.5% + 3.5%
});

test('Core Bancario: Pago de cuota francesa y desgravamen automático de DPF al completar saldo', () => {
  const state = structuredClone(INITIAL_GAME_STATE);

  const { updatedState: s1, certificate: dpf } = issueTermDepositCertificate(state, {
    clientName: 'Inversiones Rápidas S.A.',
    principalHNL: 500000,
    termDays: 360,
    interestRateAnnualPct: 8.0
  });

  const { updatedState: s2, facility } = originateBackToBackFacility(s1, {
    dpfCertificateId: dpf.id,
    type: 'prestamo_garantizado',
    coverageRatioPct: 90
  });

  assert.ok(facility);
  // Abono parcial
  const p1 = payBackToBackInstallment(s2, facility.id, 100000);
  assert.equal(p1.facility?.outstandingBalanceHNL, 350000); // 450,000 - 100,000

  // Liquidación del saldo total restante (350,000)
  const p2 = payBackToBackInstallment(p1.updatedState, facility.id, 350000);
  assert.equal(p2.facility?.outstandingBalanceHNL, 0);
  assert.equal(p2.facility?.status, 'cancelado');

  // El DPF colateral debe quedar automáticamente desgravado
  const unpledgedDpf = p2.updatedState.termDeposits?.find(d => d.id === dpf.id);
  assert.ok(unpledgedDpf);
  assert.equal(unpledgedDpf.isPledged, false);
  assert.equal(unpledgedDpf.status, 'vigente');
  assert.equal(unpledgedDpf.pledgedToFacilityId, undefined);
});

test('Core Bancario: Ejecución extrajudicial forzosa de garantía líquida sin juicio', () => {
  const state = structuredClone(INITIAL_GAME_STATE);

  const { updatedState: s1, certificate: dpf } = issueTermDepositCertificate(state, {
    clientName: 'Agropecuaria de Occidente S.A.',
    principalHNL: 1000000,
    termDays: 360,
    interestRateAnnualPct: 8.0
  });

  const { updatedState: s2, facility } = originateBackToBackFacility(s1, {
    dpfCertificateId: dpf.id,
    type: 'prestamo_garantizado',
    coverageRatioPct: 90 // 900,000 HNL
  });

  assert.ok(facility);

  // Ejecución de garantía
  const res = executePledgedDepositForeclosure(s2, facility.id);

  const fac = res.updatedState.backToBackFacilities?.find(f => f.id === facility.id);
  assert.ok(fac);
  assert.equal(fac.status, 'ejecutado');
  assert.equal(fac.outstandingBalanceHNL, 0);

  // El DPF cubre la deuda de 900k y le queda un remanente de 100k
  const executedDpf = res.updatedState.termDeposits?.find(d => d.id === dpf.id);
  assert.ok(executedDpf);
  assert.equal(executedDpf.principalHNL, 100000);
  assert.equal(executedDpf.isPledged, false);
});

test('Core Bancario: Dispersión masiva de planilla empresarial y comisiones por colaborador', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const initialFeeIncome = state.financials.totalFeeIncome;

  const res = processCorporatePayrollDispersion(state, {
    companyName: 'Fruit of the Loom Villanueva',
    employeeCount: 1500,
    totalPayrollAmountHNL: 22500000,
    feePerEmployeeHNL: 20.0
  });

  assert.equal(res.batch.companyName, 'Fruit of the Loom Villanueva');
  assert.equal(res.batch.employeeCount, 1500);
  // Comisión cobrada = 1,500 * L. 20.00 = 30,000 HNL
  assert.equal(res.batch.totalFeeCollectedHNL, 30000);
  assert.equal(res.updatedState.financials.totalFeeIncome, initialFeeIncome + 30000);
});

test('Core Bancario: Transferencia ACH Pronto CEPROBAN con tarifa oficial de L. 20.00', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const initialFeeIncome = state.financials.totalFeeIncome;

  const res = executeAchTransfer(state, {
    sourceAccountNumber: '1102-0501-0084-912',
    sourceClientName: 'Corporación Agroindustrial del Norte S.A.',
    destinationBank: 'Banco Ficohsa',
    destinationAccount: '2001-9941-8812',
    recipientName: 'Empaques del Norte S.A.',
    amountHNL: 75000,
    referenceNote: 'Pago Factura #1822'
  });

  assert.equal(res.transaction.commissionFeeHNL, 20.0);
  assert.equal(res.transaction.amountHNL, 75000);
  assert.equal(res.transaction.status, 'liquidada');
  assert.equal(res.updatedState.financials.totalFeeIncome, initialFeeIncome + 20.0);
});
