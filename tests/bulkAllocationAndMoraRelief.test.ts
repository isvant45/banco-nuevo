import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  applyBulkPortfolioAllocation, 
  executeSingleClientMoraWaiver, 
  executeBulkDivisionMoraWaiver 
} from '../src/game/economyEngine';
import { queryDivisionClients } from '../src/game/clientRegistry';
import { IndividualClient, GameState } from '../src/game/types';

function fresh(): GameState {
  return JSON.parse(JSON.stringify(INITIAL_GAME_STATE));
}

test('1. Asignación Masiva de Cartera: Calibra clientes, depósitos y préstamos en bloque', () => {
  const state = fresh();

  const { updatedState, successMessage } = applyBulkPortfolioAllocation(state, {
    divisionId: 'personas',
    clientCount: 18450,
    depositHoldersCount: 16000,
    avgDepositHNL: 45000,
    loanBorrowersCount: 6500,
    avgLoanHNL: 85000,
    delinquencyRate: 1.5
  });

  assert.ok(successMessage.includes('Asignación masiva aplicada'));
  const div = updatedState.divisions.personas;
  assert.equal(div.clientCount, 18450);
  assert.equal(div.totalDeposits, 16000 * 45000); // 720,000,000 HNL
  assert.equal(div.totalLoans, 6500 * 85000); // 552,500,000 HNL
  assert.equal(div.delinquencyRate, 1.5);
  assert.equal(div.customDepositHolders, 16000);
  assert.equal(div.customAvgDepositHNL, 45000);

  // Activos y pasivos en estados financieros reflejan el nuevo balance
  assert.ok(updatedState.financials.depositsPublicTotal > 0);
  assert.ok(updatedState.financials.loanPortfolioCurrent > 0);

  // Los clientes sintéticos generados en la paginación reflejan la calibración
  const pageResult = queryDivisionClients(
    updatedState.clients,
    'personas',
    div.clientCount,
    { page: 1, pageSize: 25 },
    div
  );
  assert.equal(pageResult.clients.length, 25);
  const avgSampleDeposit = pageResult.clients.reduce((acc, c) => acc + c.accountBalanceHNL, 0) / pageResult.clients.length;
  assert.ok(avgSampleDeposit > 20000, 'Saldo promedio de clientes sintéticos calibrado');
});

test('2. Quita de Mora Individual: Condonación 100% y restauración a Categoría I', () => {
  const state = fresh();
  const moraClient = state.clients.find(c => c.pastDueDays > 0) || state.clients[2];
  assert.ok(moraClient, 'Cliente en mora encontrado');

  const { updatedState, waivedClient, successMessage } = executeSingleClientMoraWaiver(state, moraClient);

  assert.ok(successMessage.includes('Quita de mora aplicada'));
  assert.equal(waivedClient.pastDueDays, 0);
  assert.equal(waivedClient.pastDueAmountHNL, 0);
  assert.equal(waivedClient.cnbsCategory, 'I - Normal');

  const updatedClientInState = updatedState.clients.find(c => c.id === moraClient.id);
  assert.equal(updatedClientInState?.pastDueDays, 0);
  assert.equal(updatedClientInState?.cnbsCategory, 'I - Normal');
});

test('3. Quita de Mora en Cliente Sintético: Se persiste en el estado sin perderse', () => {
  const state = fresh();
  const syntheticMoraClient: IndividualClient = {
    id: 'CLI-PER-SYNTH-999',
    cif: 'CIF-0501-2026-99999',
    name: 'Cliente Sintético En Mora',
    division: 'personas',
    city: 'San Pedro Sula',
    notes: 'Generado sintéticamente',
    joinedMonth: 1,
    accountType: 'Cuenta de Ahorro Rendimiento',
    accountBalanceHNL: 15000,
    hasCreditCard: true,
    creditCardBrand: 'Visa Clásica',
    creditCardLimitHNL: 25000,
    creditCardBalanceHNL: 12000,
    hasLoan: true,
    loanType: 'Préstamo Personal',
    loanPrincipalHNL: 50000,
    loanBalanceHNL: 42000,
    loanMonthlyPaymentHNL: 2800,
    loanInterestRateAnnual: 22.0,
    loanMonthsRemaining: 24,
    guaranteedPayment: false,
    pastDueDays: 60,
    pastDueAmountHNL: 5600,
    equifaxScore: 610,
    cnbsCategory: 'III - Subnormal',
    otherBankProducts: []
  };

  assert.equal(state.clients.some(c => c.id === syntheticMoraClient.id), false);

  const { updatedState } = executeSingleClientMoraWaiver(state, syntheticMoraClient);

  assert.equal(updatedState.clients.some(c => c.id === syntheticMoraClient.id), true);
  const persisted = updatedState.clients.find(c => c.id === syntheticMoraClient.id);
  assert.equal(persisted?.pastDueDays, 0);
  assert.equal(persisted?.cnbsCategory, 'I - Normal');
});

test('4. Condonación Masiva de Mora: Reduce mora de división a 0.2% y sanea cartera', () => {
  const state = fresh();
  const { updatedState, waivedCount } = executeBulkDivisionMoraWaiver(state, 'personas');

  assert.ok(waivedCount > 0);
  assert.equal(updatedState.divisions.personas.delinquencyRate, 0.2);
  const stillDelinquent = updatedState.clients.filter(c => c.division === 'personas' && c.pastDueDays > 0);
  assert.equal(stillDelinquent.length, 0);
});

test('5. Disponibilidad de Nuevos Items: Alivio financiero, bolsa y alianzas corporativas', () => {
  const state = fresh();

  // 1. Nuevos Programas (21, 22, 23)
  const prog21 = state.bankingPrograms20.programs.find(p => p.number === 21);
  const prog22 = state.bankingPrograms20.programs.find(p => p.number === 22);
  const prog23 = state.bankingPrograms20.programs.find(p => p.number === 23);
  assert.ok(prog21);
  assert.equal(prog21?.id, 'prog-plan-respiro-bch');
  assert.ok(prog22);
  assert.equal(prog22?.id, 'prog-fogapi-pyme');
  assert.ok(prog23);
  assert.equal(prog23?.id, 'prog-cero-mora-educativo');

  // 2. Nuevos Títulos en Bolsa / Tesorería
  const ficohsaCdn = state.secondarySecurities.find(s => s.id === 'sec-cdn-ficohsa');
  const greenBch = state.secondarySecurities.find(s => s.id === 'sec-green-bch');
  const fidInmob = state.secondarySecurities.find(s => s.id === 'sec-fid-inmob');
  assert.ok(ficohsaCdn);
  assert.ok(greenBch);
  assert.ok(fidInmob);

  // 3. Nuevos Convenios de Planilla y Comercios POS
  const pay04 = state.payrollAgreements.find(a => a.id === 'pay-04');
  const pay05 = state.payrollAgreements.find(a => a.id === 'pay-05');
  assert.ok(pay04);
  assert.equal(pay04?.employeeCount, 1200);
  assert.ok(pay05);
  assert.equal(pay05?.employeeCount, 3400);

  const pos06 = state.posMerchants.find(m => m.id === 'pos-06');
  const pos07 = state.posMerchants.find(m => m.id === 'pos-07');
  assert.ok(pos06);
  assert.ok(pos06?.merchantName.includes('Supermercados La Colonia'));
  assert.ok(pos07);
});
