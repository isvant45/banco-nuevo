import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { restoreGameState } from '../src/game/savedState';
import { advanceGameMonth, approveCreditByOfficer, approveCreditByExecutiveBoard, autoApproveAllOfficerEligibleCredits, buyInterbankPortfolio, updatePosMerchant, addPosMerchant, updatePayrollAgreement } from '../src/game/economyEngine';
const fresh = () => structuredClone(INITIAL_GAME_STATE);
function finite(value: any, path = 'state') {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), path);
  else if (value && typeof value === 'object') for (const [key, entry] of Object.entries(value)) finite(entry, `${path}.${key}`);
}
test('old saves acquire new modules without resetting balances, progress or empty lists', () => {
  const old: any = fresh(); delete old.innovations; delete old.interbankOffers;
  old.gameMonth = 7; old.clients[0].accountBalanceHNL = 123456; old.pendingApplications = [];
  old.payrollAgreements.forEach((p: any) => {delete p.bankAccountBalanceHNL; delete p.linkedDivision;});
  const restored = restoreGameState(old);
  assert.equal(restored.gameMonth, 7); assert.equal(restored.clients[0].accountBalanceHNL, 123456);
  assert.equal(restored.pendingApplications.length, 0); assert.ok(restored.innovations.fxDesk); finite(advanceGameMonth(restored));
  assert.deepEqual(restoreGameState(restored), restored);
});
test('24 monthly closes retain finite values and do not mutate input', () => {
  let state = fresh(); const initial = JSON.stringify(state);
  const random = Math.random; let seed = 17;
  Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  try { for (let i=0;i<24;i++) {state = advanceGameMonth(state);finite(state);} }
  finally {Math.random = random;}
  assert.equal(state.gameMonth, INITIAL_GAME_STATE.gameMonth + 24); assert.equal(JSON.stringify(INITIAL_GAME_STATE), initial);
});
test('credit approval creates unique clients, deducts full amount, enforces cash and capacity', () => {
  const state = fresh(); const template = state.pendingApplications[0];
  state.pendingApplications = Array.from({length: 3}, (_, i) => ({...template,id:`test-${i}`,requestedAmount:10000,termMonths:12,proposedRate:0,cnbsCategory:'I - Normal',calculatedDTI:20}));
  state.staff = state.staff.map(s => s.id === 'oficiales_credito' ? {...s,count:1} : s);
  state.advisorMonthlyLimitPerAdvisor = 2;
  const result = autoApproveAllOfficerEligibleCredits(state);
  assert.equal(result.count,2); assert.equal(result.updatedState.clients.length,state.clients.length+2);
  assert.equal(result.updatedState.financials.cashAndBCHReserves,state.financials.cashAndBCHReserves-20000);
  assert.equal(new Set(result.updatedState.clients.map(c=>c.id)).size,result.updatedState.clients.length);finite(result.updatedState);
  assert.equal(approveCreditByOfficer(result.updatedState,'test-0').updatedState,result.updatedState);
  state.financials.cashAndBCHReserves=0;assert.equal(approveCreditByOfficer(state,'test-0').updatedState,state);
});
test('credits between 20 and 21 million require the board and deduct cash', () => {
  const state = fresh();const app={...state.pendingApplications[0],id:'large',requestedAmount:20500000};state.pendingApplications=[app];
  assert.equal(approveCreditByOfficer(state,app.id).updatedState,state);
  const result=approveCreditByExecutiveBoard(state,app.id).updatedState;
  assert.equal(result.financials.cashAndBCHReserves,state.financials.cashAndBCHReserves-app.requestedAmount);assert.equal(result.clients[0].loanBalanceHNL,app.requestedAmount);
});
test('interbank acquisition records deposits or loans once and keeps division totals',()=>{
  for(const offer of fresh().interbankOffers){const state=fresh();const result=buyInterbankPortfolio(state,offer.id).updatedState;
    assert.notEqual(result,state); assert.equal(buyInterbankPortfolio(result,offer.id).updatedState,result);
    const assets=offer.portfolioType==='activos_creditos';
    assert.equal(result.financials.cashAndBCHReserves,state.financials.cashAndBCHReserves+(assets?-offer.offerPriceHNL:offer.faceValueHNL));
    const key=assets?'totalLoans':'totalDeposits';assert.equal(result.divisions.corporativa[key],state.divisions.corporativa[key]+offer.faceValueHNL);
  }
});
 test('merchant and payroll balance edits update cash and deposits',()=>{
  const state=fresh(); const m={...state.posMerchants[0],bankAccountBalanceHNL:state.posMerchants[0].bankAccountBalanceHNL+1000};
  const result=updatePosMerchant(state,m);assert.equal(result.financials.depositsPublicTotal,state.financials.depositsPublicTotal+1000);assert.equal(addPosMerchant(state,state.posMerchants[0]),state);
  const p={...state.payrollAgreements[0],bankAccountBalanceHNL:state.payrollAgreements[0].bankAccountBalanceHNL+2000};assert.equal(updatePayrollAgreement(state,p).financials.cashAndBCHReserves,state.financials.cashAndBCHReserves+2000);
 });

test('20 banking programs are present, advance each month and remain finite', () => {
  const state = fresh();
  assert.ok(state.bankingPrograms20.programs.length >= 20);
  const advanced = advanceGameMonth(state);
  assert.ok(advanced.bankingPrograms20.programs.length >= 20);
  finite(advanced.bankingPrograms20);
  for (const prog of advanced.bankingPrograms20.programs) {
    assert.ok(prog.monthlyVolumeHNL > 0, `Program ${prog.number} volume`);
    assert.ok(prog.monthlyNetIncomeHNL > 0, `Program ${prog.number} income`);
  }
});

