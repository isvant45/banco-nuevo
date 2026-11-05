import assert from 'node:assert/strict';
import { test } from 'node:test';
import { INITIAL_GAME_STATE } from '../src/game/initialState';
import { 
  executeMergersAcquisitionDeal,
  advanceGameMonth
} from '../src/game/economyEngine';
import { restoreGameState } from '../src/game/savedState';

test('1. M&A Deal Execution: Adquisición de Cartera de Tarjetas de Crédito de BAC con 18.33% de descuento', () => {
  const initialState = structuredClone(INITIAL_GAME_STATE);
  
  // Garantizar fondos y CAR suficiente
  initialState.financials.cashAndBCHReserves = 500000000;
  initialState.financials.capitalAdequacyRatioCAR = 14.5;

  const dealId = 'MA-2026-003'; // Compra de cartera BAC tarjetas
  const initialLoans = initialState.financials.loanPortfolioCurrent;
  const initialCash = initialState.financials.cashAndBCHReserves;
  const bacBefore = initialState.competitors.find(c => c.id === 'bac');
  assert.ok(bacBefore);

  const res = executeMergersAcquisitionDeal(initialState, dealId);
  assert.ok(res.successMessage);
  assert.equal(res.errorMessage, undefined);

  const updatedState = res.updatedState;
  const updatedDeal = updatedState.maDeals?.find(d => d.id === dealId);
  assert.equal(updatedDeal?.status, 'ejecutado');

  // Comprobar transferencia financiera
  const targetDeal = INITIAL_GAME_STATE.maDeals?.find(d => d.id === dealId)!;
  assert.equal(updatedState.financials.cashAndBCHReserves, initialCash - targetDeal.purchasePriceHNL);
  assert.equal(updatedState.financials.loanPortfolioCurrent, initialLoans + targetDeal.assetsAcquiredHNL);

  // Comprobar reducción en activos del competidor BAC
  const bacAfter = updatedState.competitors.find(c => c.id === 'bac');
  assert.ok(bacAfter);
  assert.equal(bacAfter.assets, bacBefore.assets - targetDeal.assetsAcquiredHNL);

  // Comprobar que se generó noticia y notificación institucional
  assert.ok(updatedState.notifications[0].title.includes('M&A Cerrado'));
  assert.ok(updatedState.macroNewsFeed?.[0].headline.includes('CNBS autoriza adquisición'));
});

test('2. M&A Deal Validation: Rechazo por fondos insuficientes en tesorería', () => {
  const stateLowCash = structuredClone(INITIAL_GAME_STATE);
  stateLowCash.financials.cashAndBCHReserves = 10000000; // Solo 10M, el deal requiere 98M o 130M

  const res = executeMergersAcquisitionDeal(stateLowCash, 'MA-2026-003');
  assert.ok(res.errorMessage?.includes('Fondos de tesorería insuficientes'));
  assert.equal(res.successMessage, undefined);
});

test('3. M&A Deal Validation: Rechazo regulatorio de la CNBS por CAR inferior al mínimo', () => {
  const stateLowCar = structuredClone(INITIAL_GAME_STATE);
  stateLowCar.financials.cashAndBCHReserves = 500000000;
  stateLowCar.financials.capitalAdequacyRatioCAR = 9.8; // Menor al 12.5% exigido

  const res = executeMergersAcquisitionDeal(stateLowCar, 'MA-2026-003');
  assert.ok(res.errorMessage?.includes('Objeción Regulatoria CNBS'));
  assert.equal(res.successMessage, undefined);
});

test('4. Ciclo Macroeconómico: Generación y rotación de noticias del BCH al avanzar mes', () => {
  const state = structuredClone(INITIAL_GAME_STATE);
  const initialNewsCount = (state.macroNewsFeed || []).length;
  assert.ok(initialNewsCount >= 3);

  const nextState = advanceGameMonth(state);
  assert.ok(nextState.macroNewsFeed);
  assert.ok(nextState.macroNewsFeed.length >= initialNewsCount);
  assert.equal(nextState.macroNewsFeed[0].month, state.gameMonth + 1);
});

test('5. Persistencia y retrocompatibilidad: restoreGameState inicializa maDeals y macroNewsFeed', () => {
  // Simular un guardado antiguo sin maDeals ni macroNewsFeed
  const legacySaved = {
    bankName: 'Áureo Bank Legacy',
    gameMonth: 3,
    financials: structuredClone(INITIAL_GAME_STATE.financials)
  };

  const restored = restoreGameState(legacySaved);
  assert.ok(restored.maDeals);
  assert.equal(restored.maDeals.length, 3);
  assert.ok(restored.macroNewsFeed);
  assert.equal(restored.macroNewsFeed.length, 3);
});
