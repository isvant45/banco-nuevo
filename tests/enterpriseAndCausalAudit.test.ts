import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  purchaseRawMaterials,
  adjustEnterprisePricing,
  hireEnterpriseStaff,
  fireEnterpriseStaff,
  requestEnterpriseBankLoan,
  repayEnterpriseBankLoan,
  startNewGame,
  advanceGameMonth
} from '../src/game/economyEngine';
import { restoreGameState } from '../src/game/savedState';
import { GameSetupProfile } from '../src/game/types';

test('1. Enterprise Purchases: Compra de materia prima aumenta existencias y reduce caja', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const entId = 'ent-001'; // Supermercado Los Próceres
  const enterprise = state.enterprises!.find(e => e.id === entId)!;
  const initialStock = enterprise.rawMaterialsStockUnits;
  const initialCash = enterprise.cashHNL;
  const unitsToBuy = 500;
  const expectedCost = unitsToBuy * enterprise.unitCostHNL;

  const res = purchaseRawMaterials(state, entId, unitsToBuy);
  assert.ok(res.successMessage.includes('Orden de compra completada'));

  const updatedEnt = res.updatedState.enterprises!.find(e => e.id === entId)!;
  assert.equal(updatedEnt.rawMaterialsStockUnits, initialStock + unitsToBuy);
  assert.equal(updatedEnt.cashHNL, initialCash - expectedCost);
});

test('2. Enterprise Purchases: Rechazo por fondos insuficientes', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const entId = 'ent-001';
  const hugeUnits = 1000000; // Requiere millones por encima de la caja

  const res = purchaseRawMaterials(state, entId, hugeUnits);
  assert.ok(res.successMessage.includes('Fondos insuficientes'));
  const updatedEnt = res.updatedState.enterprises!.find(e => e.id === entId)!;
  // Sin mutar caja
  assert.equal(updatedEnt.cashHNL, state.enterprises!.find(e => e.id === entId)!.cashHNL);
});

test('3. Enterprise Pricing: Ajuste de precio unitario de venta', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const entId = 'ent-002'; // Café Export Copán
  const newPrice = 280;

  const res = adjustEnterprisePricing(state, entId, newPrice);
  assert.ok(res.successMessage.includes('Política de precios actualizada'));

  const updatedEnt = res.updatedState.enterprises!.find(e => e.id === entId)!;
  assert.equal(updatedEnt.sellingPriceHNL, newPrice);
});

test('4. Enterprise Staff: Contratación de personal y aumento de capacidad', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const entId = 'ent-003'; // Tiendas Éxito Moda
  const entBefore = state.enterprises!.find(e => e.id === entId)!;
  const hireCount = 3;

  const res = hireEnterpriseStaff(state, entId, hireCount);
  assert.ok(res.successMessage.includes('Contratación exitosa'));

  const entAfter = res.updatedState.enterprises!.find(e => e.id === entId)!;
  assert.equal(entAfter.employeeCount, entBefore.employeeCount + hireCount);
  assert.ok(entAfter.monthlyProductionCapacityUnits > entBefore.monthlyProductionCapacityUnits);
  assert.ok(entAfter.cashHNL < entBefore.cashHNL); // Costo de inducción
});

test('5. Enterprise Staff: Despido con indemnización legal y preservación mínima', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const entId = 'ent-003';
  const entBefore = state.enterprises!.find(e => e.id === entId)!;

  // Intento de despedir a todo el personal debe ser rechazado
  const rejectRes = fireEnterpriseStaff(state, entId, entBefore.employeeCount);
  assert.ok(rejectRes.successMessage.includes('No se puede despedir a todo el personal'));

  // Despido normal de 2 personas
  const validRes = fireEnterpriseStaff(state, entId, 2);
  assert.ok(validRes.successMessage.includes('Ajuste de plantilla'));
  const entAfter = validRes.updatedState.enterprises!.find(e => e.id === entId)!;
  assert.equal(entAfter.employeeCount, entBefore.employeeCount - 2);
  assert.ok(entAfter.cashHNL < entBefore.cashHNL); // Pago de prestaciones legales
});

test('6. Intragroup Bank Financing: Áureo Bank presta a filial en modo grupo_empresarial', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  state.roleMode = 'grupo_empresarial';
  const entId = 'ent-004'; // Constructora
  const entBefore = state.enterprises!.find(e => e.id === entId)!;
  const bankCashBefore = state.financials.cashAndBCHReserves;
  const bankLoansBefore = state.financials.loanPortfolioCurrent;
  const loanAmount = 1000000;

  const res = requestEnterpriseBankLoan(state, entId, loanAmount, 24);
  assert.ok(res.successMessage.includes('Línea de crédito intragrupo aprobada'));

  const entAfter = res.updatedState.enterprises!.find(e => e.id === entId)!;
  assert.equal(entAfter.cashHNL, entBefore.cashHNL + loanAmount);
  assert.equal(entAfter.activeBankLoanHNL, entBefore.activeBankLoanHNL + loanAmount);

  // Áureo Bank transfirió la liquidez de reservas a cartera crediticia
  assert.equal(res.updatedState.financials.cashAndBCHReserves, bankCashBefore - loanAmount);
  assert.equal(res.updatedState.financials.loanPortfolioCurrent, bankLoansBefore + loanAmount);
});

test('7. Enterprise Loan Repayment: Amortización de deuda bancaria', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  state.roleMode = 'grupo_empresarial';
  const entId = 'ent-001';
  const entBefore = state.enterprises!.find(e => e.id === entId)!;
  const repayAmount = 200000;

  const res = repayEnterpriseBankLoan(state, entId, repayAmount);
  assert.ok(res.successMessage.includes('Amortización de deuda procesada'));

  const entAfter = res.updatedState.enterprises!.find(e => e.id === entId)!;
  assert.equal(entAfter.cashHNL, entBefore.cashHNL - repayAmount);
  assert.equal(entAfter.activeBankLoanHNL, entBefore.activeBankLoanHNL - repayAmount);
});

test('8. New Game Setup: Inicialización limpia bajo los 3 roles', () => {
  // A. Rol Empresario
  const empresarioProfile: GameSetupProfile = {
    founderName: 'Mario Pineda',
    entityName: 'Grupo Retail Pineda',
    roleMode: 'empresario',
    startingCity: 'San Pedro Sula',
    difficulty: 'estandar',
    initialCapitalHNL: 4000000,
    isCustomGame: true
  };
  const empresarioGame = startNewGame(empresarioProfile);
  assert.equal(empresarioGame.roleMode, 'empresario');
  assert.equal(empresarioGame.gameMonth, 1);
  assert.ok(empresarioGame.enterprises!.length > 0);
  assert.ok(empresarioGame.enterprises![0].cashHNL >= 1000000);

  // B. Rol Banquero
  const banqueroProfile: GameSetupProfile = {
    founderName: 'Dra. Suyapa Flores',
    entityName: 'Banco Atlántico Hondureño',
    roleMode: 'banquero',
    startingCity: 'Tegucigalpa',
    difficulty: 'crisis',
    initialCapitalHNL: 15000000,
    isCustomGame: true
  };
  const banqueroGame = startNewGame(banqueroProfile);
  assert.equal(banqueroGame.roleMode, 'banquero');
  assert.equal(banqueroGame.bankName, 'Banco Atlántico Hondureño');
  assert.ok(banqueroGame.financials.cashAndBCHReserves > 0);

  // C. Rol Grupo Empresarial
  const conglomerateProfile: GameSetupProfile = {
    founderName: 'Don Roberto Facussé',
    entityName: 'Consorcio Continental',
    roleMode: 'grupo_empresarial',
    startingCity: 'Choloma',
    difficulty: 'estandar',
    initialCapitalHNL: 8000000,
    isCustomGame: true
  };
  const conglomerateGame = startNewGame(conglomerateProfile);
  assert.equal(conglomerateGame.roleMode, 'grupo_empresarial');
  assert.ok(conglomerateGame.enterprises!.length === 4);
});

test('9. Cierre Mensual: Generación dinámica de Estado de Flujo de Efectivo y Auditoría Causal', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  state.roleMode = 'grupo_empresarial';

  const nextState = advanceGameMonth(state);
  assert.equal(nextState.gameMonth, 2);

  // Validar Estado de Flujo de Efectivo
  const cf = nextState.lastCashFlowReport;
  assert.ok(cf);
  assert.equal(cf.month, 2);
  assert.ok(typeof cf.operatingCashFlowHNL === 'number');
  assert.ok(typeof cf.investingCashFlowHNL === 'number');
  assert.ok(typeof cf.financingCashFlowHNL === 'number');
  assert.ok(cf.breakdown.collectionsFromSalesHNL > 0);
  assert.ok(cf.breakdown.payrollPaidHNL > 0);

  // Validar Auditoría Causal ("¿Por qué gané o perdí dinero?")
  const audit = nextState.lastCausalAudit;
  assert.ok(audit);
  assert.equal(audit.month, 2);
  assert.ok(audit.summaryTitle.length > 10);
  assert.ok(audit.factors.length >= 3);
  assert.ok(audit.projectedObligations30DaysHNL > 0);
  assert.ok(audit.recommendedAction.length > 5);

  // Validar evolución operativa de las filiales
  for (const ent of (nextState.enterprises || [])) {
    assert.ok(ent.monthlyUnitsSold >= 0);
    assert.ok(ent.monthlyRevenueHNL >= 0);
    assert.ok(typeof ent.monthlyNetProfitHNL === 'number');
  }
});

test('10. Persistencia: restoreGameState inicializa enterprises, roleMode y reportes si faltan', () => {
  const minimalSaved = {
    bankName: 'Áureo Bank',
    gameMonth: 3
  };

  const restored = restoreGameState(minimalSaved);
  assert.ok(restored.roleMode);
  assert.ok(restored.enterprises);
  assert.equal(restored.enterprises.length, 4);
  assert.ok(restored.lastCashFlowReport);
  assert.ok(restored.lastCausalAudit);
  assert.ok(restored.gameSetup);
});
