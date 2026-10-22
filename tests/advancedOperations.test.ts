import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  advanceGameMonth, 
  openOrExpandDepartmentBranch, 
  issueSubordinatedBond, 
  executeAdvancedStressTest,
  installNewAtmUnit,
  affiliateBankingAgent,
  executeAlcoRateAdjustment,
  createCorporateFiduciaryTrust
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

test('1. Inicialización limpia de las 24 características del Centro de Operaciones Avanzadas', () => {
  const state = fresh();
  assert.ok(state.advancedOperations, 'advancedOperations debe existir en el estado inicial');
  
  // Eje 1: Red Física & Canales (Features 1 a 6)
  assert.equal(state.advancedOperations.departmentBranches.length, 18, 'Deben existir los 18 departamentos de Honduras');
  assert.ok(state.advancedOperations.atmFleet.length > 0, 'Flota de ATMs inicializada');
  assert.ok(state.advancedOperations.bankingAgents.length > 0, 'Red de agentes corresponsales inicializada');
  assert.ok(state.advancedOperations.armoredTransportFleet.cashInTransitInsuredHNL > 0, 'Flota de transporte blindado inicializada');
  assert.ok(state.advancedOperations.driveThruLanesCount > 0, 'Carriles de autobanco inicializados');
  assert.ok(state.advancedOperations.privateLoungesCount > 0, 'Salones de banca privada inicializados');

  // Eje 2: Mercado de Capitales & Tesorería (Features 7 a 12)
  assert.ok(Array.isArray(state.advancedOperations.subordinatedBonds), 'Lista de bonos subordinados inicializada');
  assert.ok(state.advancedOperations.sovereignHoldings.length > 0, 'Portafolio soberano BCH inicializado');
  assert.ok(state.advancedOperations.fxBchBids.length > 0, 'Mesa FX BCH inicializada');
  assert.ok(state.advancedOperations.multilateralLines.length > 0, 'Líneas multilaterales inicializadas');
  assert.ok(state.advancedOperations.mutualFunds.length > 0, 'Fondos mutuos inicializados');

  // Eje 3: Inteligencia Ejecutiva & Pruebas de Estrés (Features 13 a 18)
  assert.ok(state.advancedOperations.ifrs9ProvisionsLedger.totalExpectedLossHNL > 0, 'Matriz IFRS 9 inicializada');
  assert.ok(state.advancedOperations.cyberSecurityCenter.pciDssComplianceScorePct >= 90, 'Ciberseguridad inicializada');
  assert.ok(state.advancedOperations.amlCompliancePortal.complianceClearanceRatePct >= 90, 'Portal AML/CFT inicializado');
  assert.ok(state.advancedOperations.executiveAlcoMetrics.netInterestMarginNIM > 0, 'Métricas ALCO inicializadas');

  // Eje 4: Soluciones Corporativas & Clientes (Features 19 a 24)
  assert.ok(state.advancedOperations.corporateCashManagement.corporateClientsEnrolled > 0, 'Cash management corporativo inicializado');
  assert.ok(Array.isArray(state.advancedOperations.fiduciaryTrustContracts), 'Fideicomisos fiduciarios inicializados');
  assert.ok(state.advancedOperations.microInsurancePortfolio.length > 0, 'Microseguros inicializados');

  checkAllNumbersFinite(state.advancedOperations);
});

test('2. Apertura y expansión de sucursales departamentales con impacto exacto en balance', () => {
  const state = fresh();
  const targetDeptId = 'dep-el-paraiso';
  const initialCash = state.financials.cashAndBCHReserves;
  const initialFixedAssets = state.financials.fixedAssetsBranches;
  const initialDeposits = state.financials.depositsPublicTotal;

  const deptBefore = state.advancedOperations.departmentBranches.find(d => d.id === targetDeptId)!;
  assert.ok(deptBefore, 'Departamento El Paraíso debe existir');
  const expansionCost = deptBefore.expansionCostHNL;

  const { updatedState, successMessage } = openOrExpandDepartmentBranch(state, targetDeptId);

  assert.ok(successMessage.includes('El Paraíso'), 'Mensaje de éxito debe mencionar El Paraíso');
  assert.equal(updatedState.financials.cashAndBCHReserves, initialCash - expansionCost, 'La caja debe deducir el costo de adecuación');
  assert.equal(updatedState.financials.fixedAssetsBranches, initialFixedAssets + expansionCost, 'Los activos fijos deben sumar el valor invertido');
  assert.equal(updatedState.financials.depositsPublicTotal, initialDeposits + 75000000, 'Los depósitos del público deben aumentar');

  const deptAfter = updatedState.advancedOperations.departmentBranches.find(d => d.id === targetDeptId)!;
  assert.equal(deptAfter.activeBranches, deptBefore.activeBranches + 1, 'Debe aumentar 1 sucursal activa');
  assert.equal(deptAfter.totalEmployees, deptBefore.totalEmployees + 10, 'Deben sumarse 10 empleados locales');
  assert.equal(deptAfter.status, 'Operativa', 'El estado del departamento debe ser Operativa');

  checkAllNumbersFinite(updatedState);
});

test('3. Emisión de bonos subordinados en el mercado de capitales e incremento en solvencia (CAR Tier 2)', () => {
  const state = fresh();
  const faceValue = 50000000; // L. 50 Millones
  const initialCash = state.financials.cashAndBCHReserves;
  const initialEquity = state.financials.totalEquity;
  const initialCAR = state.financials.capitalAdequacyRatioCAR;
  const initialBondsCount = state.advancedOperations.subordinatedBonds.length;

  const { updatedState, successMessage } = issueSubordinatedBond(
    state,
    'Serie B-2026 Tier 2 Pro-Infraestructura',
    faceValue,
    8.75,
    5,
    'Tier 2 Complementario'
  );

  assert.ok(successMessage.includes('Emisión'), 'Mensaje debe confirmar la colocación');
  assert.equal(updatedState.financials.cashAndBCHReserves, initialCash + faceValue, 'La caja debe captar el 100% del valor nominal');
  assert.equal(updatedState.financials.totalEquity, initialEquity + Math.round(faceValue * 0.5), 'El patrimonio debe computar el 50% como Tier 2');
  assert.ok(updatedState.financials.capitalAdequacyRatioCAR > initialCAR, 'El ratio CAR debe fortalecerse');
  assert.equal(updatedState.advancedOperations.subordinatedBonds.length, initialBondsCount + 1, 'Debe agregarse a la lista de bonos');

  checkAllNumbersFinite(updatedState);
});

test('4. Ejecución del simulador de pruebas de estrés CNBS y cálculo matemático de solvencia (IAC)', () => {
  const state = fresh();
  const baseCAR = state.financials.capitalAdequacyRatioCAR;

  const scenarios: Array<'devaluacion_hnl' | 'sequia_el_nino' | 'shock_tpm_bch' | 'crisis_liquidez_retiros'> = [
    'devaluacion_hnl',
    'sequia_el_nino',
    'shock_tpm_bch',
    'crisis_liquidez_retiros'
  ];

  for (const sc of scenarios) {
    const { updatedState, successMessage } = executeAdvancedStressTest(state, sc);
    assert.ok(successMessage.includes('Prueba de estrés'), 'Confirmación de ejecución de simulación');
    
    const result = updatedState.advancedOperations.lastStressTest!;
    assert.ok(result, 'lastStressTest debe existir tras ejecutar la simulación');
    assert.equal(result.scenarioId, sc);
    assert.ok(result.simulatedCAR < baseCAR, 'El CAR simulado debe reflejar el impacto negativo del choque');
    assert.ok(result.provAdditionalHNL > 0, 'Las provisiones adicionales simuladas deben ser positivas');
    assert.ok(result.cnbsRegulatoryNotice.length > 10, 'Debe emitir dictamen regulatorio CNBS');
    checkAllNumbersFinite(result);
  }
});

test('5. Liquidación mensual automática sin discrepancias contables en operaciones avanzadas', () => {
  let state = fresh();
  
  // Agregar una sucursal, emitir un bono e instalar cajero para probar flujos mensuales
  const op1 = openOrExpandDepartmentBranch(state, 'dep-comayagua').updatedState;
  const op2 = issueSubordinatedBond(op1, 'Bono Verde 2026', 20000000, 7.5, 3, 'Bono Sostenible Verde').updatedState;
  const op3 = installNewAtmUnit(op2, 'Terminal Metropolitana SPS', 'Multifunción Smart').updatedState;
  const op4 = affiliateBankingAgent(op3, 'Pulpería La Bendición', 'Intibucá', ['Depósitos en Efectivo', 'Retiros con Tarjeta']).updatedState;
  const op5 = executeAlcoRateAdjustment(op4).updatedState;
  const op6 = createCorporateFiduciaryTrust(op5, 'Fideicomiso Residencial Los Pinos', 'Constructora Morazán S.A.', 45000000, 'Administración Inmobiliaria').updatedState;

  state = op6;

  // Avanzar 3 meses contables
  for (let m = 0; m < 3; m++) {
    const prevMonth = state.gameMonth;
    state = advanceGameMonth(state);
    assert.equal(state.gameMonth, prevMonth + 1, 'El mes de juego debe avanzar secuencialmente');
    checkAllNumbersFinite(state);
    assert.ok(state.financials.totalAssets > 0, 'Total activos debe ser positivo');
    assert.ok(state.financials.depositsPublicTotal > 0, 'Depósitos del público deben ser positivos');
    assert.ok(state.advancedOperations.departmentBranches.length === 18, 'Se mantienen los 18 departamentos');
  }
});
