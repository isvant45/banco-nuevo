import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateClientDivisionUpgrade, formatHNL, getMonthName } from '../src/game/economyEngine';
import type { IndividualClient } from '../src/game/types';

function client(division: IndividualClient['division']): IndividualClient {
  return {
    id: 'TEST-001',
    cif: 'TEST-CIF',
    name: 'Cliente de Prueba',
    division,
    city: 'San Pedro Sula',
    joinedMonth: 1,
    accountType: 'Cuenta de Ahorro Rendimiento',
    accountBalanceHNL: 100000,
    hasCreditCard: false,
    creditCardBrand: 'Sin Tarjeta',
    creditCardLimitHNL: 0,
    creditCardBalanceHNL: 0,
    hasLoan: false,
    loanType: 'Ninguno',
    loanPrincipalHNL: 0,
    loanBalanceHNL: 0,
    loanMonthlyPaymentHNL: 0,
    loanInterestRateAnnual: 0,
    loanMonthsRemaining: 0,
    guaranteedPayment: false,
    pastDueDays: 0,
    pastDueAmountHNL: 0,
    equifaxScore: 700,
    cnbsCategory: 'I - Normal',
    otherBankProducts: []
  };
}

test('el calendario financiero avanza correctamente entre años', () => {
  assert.deepEqual(getMonthName(12), { name: 'Diciembre', year: 2026, fullLabel: 'Diciembre 2026' });
  assert.deepEqual(getMonthName(13), { name: 'Enero', year: 2027, fullLabel: 'Enero 2027' });
});

test('los importes en lempiras se muestran con dos decimales', () => {
  assert.equal(formatHNL(1234.5), 'L. 1,234.50');
  assert.equal(formatHNL(0), 'L. 0.00');
});

test('un saldo de L 250,000 promociona a banca premier', () => {
  const result = evaluateClientDivisionUpgrade(client('personas'), 250000);
  assert.equal(result.wasUpgraded, true);
  assert.equal(result.upgradedDivision, 'premier');
});

test('un saldo de L 1,200,000 promociona a banca privada', () => {
  const result = evaluateClientDivisionUpgrade(client('premier'), 1200000);
  assert.equal(result.wasUpgraded, true);
  assert.equal(result.upgradedDivision, 'privada');
});

test('las divisiones empresariales no cambian automáticamente de segmento', () => {
  const result = evaluateClientDivisionUpgrade(client('pyme'), 2000000);
  assert.equal(result.wasUpgraded, false);
  assert.equal(result.upgradedDivision, 'pyme');
});
