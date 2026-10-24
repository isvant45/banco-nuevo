import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  toggleStrategicImprovement, 
  setStrategicInteractionMode,
  setStrategicFilter,
  checkAndUnlockMilestones,
  advanceStrategicImprovementsMonth,
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

test('1. Integridad de las 24 Mejoras Estratégicas en 3 Pilares Equitativos', () => {
  const state = fresh();
  assert.ok(state.strategicImprovements, 'strategicImprovements debe existir en el estado inicial');

  const items = state.strategicImprovements.items;
  assert.equal(items.length, 24, 'Deben existir exactamente 24 sugerencias/mejoras estratégicas');

  // Verificar que cada pilar tiene exactamente 8 mejoras
  const digitalPillar = items.filter(i => i.pillar === 'digital_inclusion');
  const compliancePillar = items.filter(i => i.pillar === 'prudential_cnbs');
  const treasuryPillar = items.filter(i => i.pillar === 'treasury_esg');

  assert.equal(digitalPillar.length, 8, 'Pilar 1 (Digital & Ciberseguridad) debe contener 8 mejoras');
  assert.equal(compliancePillar.length, 8, 'Pilar 2 (Prudencial CNBS / SAR) debe contener 8 mejoras');
  assert.equal(treasuryPillar.length, 8, 'Pilar 3 (Tesorería & ESG) debe contener 8 mejoras');

  // Verificar numeración secuencial del 1 al 24
  items.forEach((item, index) => {
    assert.equal(item.number, index + 1, `Mejora #${item.number} debe tener número ${index + 1}`);
    assert.ok(item.title.length > 5, `Título válido para mejora ${item.number}`);
    assert.ok(item.description.length > 10, `Descripción válida para mejora ${item.number}`);
    assert.ok(item.regulatoryReference.length > 3, `Referencia regulatoria presente en mejora ${item.number}`);
    assert.ok(item.capexCostHNL > 0, `CAPEX positivo en mejora ${item.number}`);
    assert.ok(item.monthlyOpexHNL > 0, `OPEX mensual positivo en mejora ${item.number}`);
    assert.ok(item.monthlyProfitBoostHNL > 0, `Retorno mensual positivo en mejora ${item.number}`);
    assert.ok(item.carImpactBps >= 0, `Impacto en CAR no negativo en mejora ${item.number}`);
    assert.ok(item.unlockMilestone, `Hito de desbloqueo configurado en mejora ${item.number}`);
  });

  checkAllNumbersFinite(state.strategicImprovements);
});

test('2. Activación Formal por Junta Directiva (CAPEX en Efectivo y Capitalización)', () => {
  const state = fresh();
  const initialCash = state.financials.cashAndBCHReserves;
  const initialFixedAssets = state.financials.fixedAssetsBranches;
  const initialCAR = state.financials.capitalAdequacyRatioCAR;

  // Seleccionar la mejora #04 (imp-04: Agencia Virtual, inicialmente inactiva)
  const itemToActivate = state.strategicImprovements.items.find(i => i.id === 'imp-04')!;
  assert.equal(itemToActivate.status, 'inactive');

  const { updatedState, successMessage } = toggleStrategicImprovement(state, 'imp-04', 'formal_board');

  // Verificaciones de estado financiero
  assert.equal(
    updatedState.financials.cashAndBCHReserves, 
    initialCash - itemToActivate.capexCostHNL, 
    'El CAPEX debe deducirse del efectivo en caja'
  );
  assert.equal(
    updatedState.financials.fixedAssetsBranches, 
    initialFixedAssets + itemToActivate.capexCostHNL, 
    'El CAPEX debe sumarse a activos fijos'
  );
  assert.ok(
    updatedState.financials.capitalAdequacyRatioCAR > initialCAR, 
    'El CAR debe incrementarse por el impacto de la mejora'
  );

  const updatedItem = updatedState.strategicImprovements.items.find(i => i.id === 'imp-04')!;
  assert.equal(updatedItem.status, 'active', 'La mejora debe quedar en estado activo');
  assert.ok(successMessage.includes('activada con éxito'), 'Mensaje de éxito retornado');

  checkAllNumbersFinite(updatedState.financials);
});

test('3. Activación Rápida mediante Sandbox Instantáneo (Sin Deducción de Caja)', () => {
  const state = fresh();
  const initialCash = state.financials.cashAndBCHReserves;

  // Activar mejora #05 en modo sandbox
  const { updatedState, successMessage } = toggleStrategicImprovement(state, 'imp-05', 'sandbox_instant');

  // En sandbox no se deduce efectivo
  assert.equal(
    updatedState.financials.cashAndBCHReserves, 
    initialCash, 
    'El Sandbox no debe tocar las reservas de efectivo'
  );

  const updatedItem = updatedState.strategicImprovements.items.find(i => i.id === 'imp-05')!;
  assert.equal(updatedItem.status, 'active');
  assert.equal(updatedItem.activationMode, 'sandbox_instant');
  assert.ok(successMessage.includes('Sandbox Interactivo'), 'Mensaje contextual de Sandbox');

  // Pausar la misma mejora en sandbox
  const { updatedState: pausedState } = toggleStrategicImprovement(updatedState, 'imp-05', 'sandbox_instant');
  const pausedItem = pausedState.strategicImprovements.items.find(i => i.id === 'imp-05')!;
  assert.equal(pausedItem.status, 'inactive');
});

test('4. Mecanismo de Desbloqueo por Hitos Regulatorios Institucionales', () => {
  const state = fresh();

  // Buscar un ítem cuyo hito dependa de gameMonth > 1 (por ejemplo imp-08 con targetValue 3)
  const itemLocked = state.strategicImprovements.items.find(i => i.unlockMilestone?.targetValue === 3 && i.unlockMilestone?.metricType === 'gameMonth')!;
  
  // En mes 1 debe estar bloqueado para activación por hito
  assert.equal(itemLocked.unlockMilestone?.isAchieved, false);

  const { updatedState: failState, successMessage: failMsg } = toggleStrategicImprovement(state, itemLocked.id, 'milestone_unlocked');
  assert.ok(failMsg.includes('Requisito no cumplido'), 'Debe rebotar si no cumple el hito');
  assert.equal(failState.strategicImprovements.items.find(i => i.id === itemLocked.id)!.status, 'inactive');

  // Simular avance de hitos con checkAndUnlockMilestones
  const progressedState = {
    ...state,
    gameMonth: 4
  };
  const unlockedState = checkAndUnlockMilestones(progressedState);
  const unlockedItem = unlockedState.strategicImprovements.items.find(i => i.id === itemLocked.id)!;
  assert.equal(unlockedItem.unlockMilestone?.isAchieved, true, 'El hito debe haberse completado en mes 4');

  // Ahora la activación debe proceder exitosamente
  const { updatedState: successState } = toggleStrategicImprovement(unlockedState, itemLocked.id, 'milestone_unlocked');
  assert.equal(successState.strategicImprovements.items.find(i => i.id === itemLocked.id)!.status, 'active');
});

test('5. Evolución y Acumulación Mensual en advanceGameMonth', () => {
  let state = fresh();
  
  const currentActiveItems = state.strategicImprovements.items.filter(i => i.status === 'active');
  const initialActiveBoost = currentActiveItems.reduce((acc, i) => acc + i.monthlyProfitBoostHNL, 0);
  const initialActiveOpex = currentActiveItems.reduce((acc, i) => acc + i.monthlyOpexHNL, 0);

  // Activar 2 mejoras inactivas (imp-04 e imp-05) en sandbox
  const { updatedState: s1 } = toggleStrategicImprovement(state, 'imp-04', 'sandbox_instant');
  const { updatedState: s2 } = toggleStrategicImprovement(s1, 'imp-05', 'sandbox_instant');
  state = s2;

  const item4 = state.strategicImprovements.items.find(i => i.id === 'imp-04')!;
  const item5 = state.strategicImprovements.items.find(i => i.id === 'imp-05')!;
  const expectedProfitBoost = initialActiveBoost + item4.monthlyProfitBoostHNL + item5.monthlyProfitBoostHNL;
  const expectedOpex = initialActiveOpex + item4.monthlyOpexHNL + item5.monthlyOpexHNL;

  // Avanzar un mes
  const advancedState = advanceGameMonth(state);

  assert.equal(advancedState.gameMonth, 2, 'El mes avanzó de 1 a 2');
  assert.ok(advancedState.strategicImprovements, 'strategicImprovements persiste tras advanceGameMonth');
  assert.equal(
    advancedState.strategicImprovements.totalMonthlyProfitBoostHNL, 
    expectedProfitBoost, 
    'El boost de utilidades acumulado coincide con todos los ítems activos'
  );
  assert.equal(
    advancedState.strategicImprovements.totalMonthlyOpexHNL, 
    expectedOpex, 
    'El OPEX acumulado coincide con todos los ítems activos'
  );

  checkAllNumbersFinite(advancedState.strategicImprovements);
  checkAllNumbersFinite(advancedState.financials);
});
