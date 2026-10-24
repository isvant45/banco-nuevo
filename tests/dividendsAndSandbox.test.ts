import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  updateCurrentYearDividendPolicy, 
  updateFinancialSandboxConfig,
  advanceGameMonth
} from '../src/game/economyEngine';

const fresh = () => structuredClone(INITIAL_GAME_STATE);

function checkAllNumbersFinite(value: any, path = 'state') {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `Value at ${path} is not finite (${value})`);
  } else if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      checkAllNumbersFinite(entry, `${path}.${key}`);
    }
  }
}

test('1. Integridad del Registro Histórico de 10 Años Fiscales de Dividendos (2017-2026)', () => {
  const state = fresh();
  assert.ok(state.dividendGovernance, 'dividendGovernance debe existir en el estado inicial');
  
  const history = state.dividendGovernance.historical10Years;
  assert.equal(history.length, 10, 'Deben existir exactamente 10 ejercicios fiscales');

  // Verificar que los años van de 2017 a 2026 secuencialmente
  history.forEach((rec, idx) => {
    assert.equal(rec.fiscalYear, 2017 + idx, `Año fiscal en índice ${idx} debe ser ${2017 + idx}`);
    assert.ok(rec.netIncomeAuditHNL > 0, `Utilidad neta positiva en ${rec.fiscalYear}`);
    assert.ok(rec.dividendCashDistributedHNL > 0, `Dividendo en efectivo positivo en ${rec.fiscalYear}`);
    assert.ok(rec.retainedTier1HNL > 0, `Capital retenido positivo en ${rec.fiscalYear}`);
    assert.ok(rec.payoutRatioPct >= 35 && rec.payoutRatioPct <= 65, `Payout ratio razonable en ${rec.fiscalYear}`);
    assert.equal(rec.sharesCount, 10000000, 'Acciones en circulación constantes (10M)');
    assert.ok(rec.dividendPerShareHNL > 0, 'DPS positivo');
    assert.ok(rec.rankingPosition >= 1 && rec.rankingPosition <= 10, 'Ranking entre 1 y 10');
  });

  checkAllNumbersFinite(state.dividendGovernance);
});

test('2. Reactividad en Tiempo Real del Simulador de Política de Dividendos 2026', () => {
  const state = fresh();
  const initialProposedDiv = state.dividendGovernance.currentYearPolicy2026.proposedCashDividendHNL;

  // Ajustar Payout a 70% (Agresivo)
  const updatedState70 = updateCurrentYearDividendPolicy(state, 70);
  const pol70 = updatedState70.dividendGovernance.currentYearPolicy2026;
  assert.equal(pol70.targetPayoutPct, 70);
  assert.ok(pol70.proposedCashDividendHNL > initialProposedDiv, 'Mayor dividendo al 70%');
  assert.ok(pol70.retainedCapitalTier1HNL < state.dividendGovernance.currentYearPolicy2026.retainedCapitalTier1HNL, 'Menor retención');

  const rec2026_70 = updatedState70.dividendGovernance.historical10Years.find(h => h.fiscalYear === 2026)!;
  assert.equal(rec2026_70.payoutRatioPct, 70);
  assert.equal(rec2026_70.dividendCashDistributedHNL, pol70.proposedCashDividendHNL);

  // Ajustar Payout a 30% (Conservador)
  const updatedState30 = updateCurrentYearDividendPolicy(state, 30);
  const pol30 = updatedState30.dividendGovernance.currentYearPolicy2026;
  assert.equal(pol30.targetPayoutPct, 30);
  assert.ok(pol30.proposedCashDividendHNL < initialProposedDiv, 'Menor dividendo al 30%');
  assert.ok(pol30.retainedCapitalTier1HNL > pol70.retainedCapitalTier1HNL, 'Mayor retención para Tier 1 al 30%');

  checkAllNumbersFinite(updatedState70);
  checkAllNumbersFinite(updatedState30);
});

test('3. Sandbox Central Reactivo: Cascada Inmediata a Encaje BCH, Impuestos SAR y Provisiones CNBS', () => {
  const state = fresh();
  const initialRequiredReserves = state.financials.requiredReserveAmount;
  const initialProfit = state.financials.currentMonthProfit;

  // 1. Modificar Encaje Legal BCH de 12% a 16%
  const stateHighReserve = updateFinancialSandboxConfig(state, {
    macro: { ...state.financialSandbox.macro, reserveReqPct: 16.0 }
  });
  assert.equal(stateHighReserve.bch.reserveRequirementPct, 16.0);
  assert.ok(stateHighReserve.financials.requiredReserveAmount > initialRequiredReserves, 'Mayor encaje requerido al 16%');

  // 2. Modificar Tasa de ISR SAR de 25% a 32%
  const stateHighTax = updateFinancialSandboxConfig(state, {
    fiscalSar: { ...state.financialSandbox.fiscalSar, isrRatePct: 32.0 }
  });
  assert.ok(stateHighTax.financials.currentMonthProfit < initialProfit, 'Mayor tasa impositiva reduce la utilidad neta');

  // 3. Modificar Umbral de Scoring Crediticio (de 640 a 720 puntos)
  const stateStrictScoring = updateFinancialSandboxConfig(state, {
    creditScoringCnbs: { ...state.financialSandbox.creditScoringCnbs, minBureauScoreThreshold: 720 }
  });
  const normalClientsCountStrict = stateStrictScoring.clients.filter(c => c.cnbsCategory === 'I - Normal').length;
  const normalClientsCountBase = state.clients.filter(c => c.cnbsCategory === 'I - Normal').length;
  assert.ok(normalClientsCountStrict <= normalClientsCountBase, 'Filtro buró más estricto reclasifica clientes a categoría II');
  assert.ok(stateStrictScoring.financials.loanLossProvisions > 0, 'Provisiones calculadas');

  checkAllNumbersFinite(stateHighReserve);
  checkAllNumbersFinite(stateHighTax);
  checkAllNumbersFinite(stateStrictScoring);
});

test('4. Cierre Mensual Acumula Correctamente bajo Parámetros del Sandbox', () => {
  let state = fresh();
  // Aplicar política personalizada
  state = updateFinancialSandboxConfig(state, {
    macro: { ...state.financialSandbox.macro, tpmRatePct: 6.25, reserveReqPct: 13.0 },
    fiscalSar: { ...state.financialSandbox.fiscalSar, isrRatePct: 25.0, aportacionSolidariaPct: 5.0 }
  });

  const nextState = advanceGameMonth(state);
  assert.equal(nextState.gameMonth, state.gameMonth + 1);
  assert.ok(nextState.financials.totalAssets > 0);
  assert.ok(nextState.financials.cashAndBCHReserves > 0);
  assert.ok(nextState.dividendGovernance.historical10Years.length === 10);
  checkAllNumbersFinite(nextState);
});
