import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DailySimulationState } from '../src/game/retroSimTypes';
import {
  createInitialTycoonAdvancedState,
  processDailyTycoonAdvancedStep,
  buyMarketIntelligenceTier,
  donateToPoliticalCampaign,
  enactImportTariffLobby,
  requestTooBigToFailBailout,
  retainCSuiteExecutive,
  fireCSuiteExecutive,
  buyCompetitorShares,
  executeDeepWebContract,
  transferPersonalCeoFunds,
  purchaseCeoLuxuryAsset,
  tradeTreasuryCommodity,
  DEFAULT_LUXURY_CATALOG,
  DEFAULT_AUREOAMP_TRACKS
} from '../src/game/tycoonAdvancedEngine';

function createMockState(): DailySimulationState {
  const defaults = createInitialTycoonAdvancedState();
  return {
    currentDay: 5,
    currentMonth: 1,
    currentYear: 2026,
    dailyHour: 10,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,
    retailSector: 'constructora',
    storeName: 'Constructora Metropolitana',
    storeCash: 50000,
    storeBankBalance: 1500000,
    storeReputation: 85,
    storeCleanliness: 90,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 35,
    dailyWages: 6000,
    dailyRent: 2000,
    monthlySalesAccumulated: 800000,
    smartBankOffers: [],
    smartBankCreditRating: 'AAA',
    commercialBanks: {} as any,
    sarTaxRecord: {} as any,
    fiscalSolvenciaActive: true,
    bankerVaultCash: 500000,
    bankerBchReserve: 500000,
    bankerTotalDeposits: 5000000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 85,
    bankerRunRiskPct: 5,
    docketQueue: [],
    activeLoansCount: 10,
    totalLoanPortfolio: 5000000,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,
    dailyHistory: [],
    ...defaults
  };
}

describe('Elite Tycoon Systems Test Suite (14 Masterpiece Features)', () => {

  it('1. Mercado de la Información: Niebla de Guerra, Suscripciones y Broker de Datos', () => {
    let state = createMockState();
    assert.equal(state.marketIntelligence?.subscriptionTier, 'none');

    // Comprar plan corporativo
    const buyRes = buyMarketIntelligenceTier(state, 'corporate');
    assert.equal(buyRes.success, true);
    assert.equal(buyRes.updatedState.marketIntelligence?.subscriptionTier, 'corporate');
    assert.equal(buyRes.updatedState.storeBankBalance, 1500000 - 120000);

    // Activar venta de datos de clientes (Broker de Datos)
    buyRes.updatedState.marketIntelligence!.dataBrokerOptIn = true;
    buyRes.updatedState.currentDay = 7; // Día de liquidación semanal

    const stepRes = processDailyTycoonAdvancedStep(buyRes.updatedState);
    assert.ok(stepRes.updatedState.marketIntelligence!.accumulatedDataRecords > 1250);
    assert.ok(stepRes.updatedState.marketIntelligence!.totalDataSalesRevenueHNL > 0);
  });

  it('2. Lobby Político y Manipulación del Entorno: Donaciones, Aranceles y Rescate Too Big to Fail', () => {
    let state = createMockState();

    // Donar a campañas políticas
    const donRes = donateToPoliticalCampaign(state, 200000);
    assert.equal(donRes.success, true);
    assert.equal(donRes.updatedState.politicalLobby?.campaignDonationsTotalHNL, 200000);
    assert.equal(donRes.updatedState.politicalLobby?.politicalInfluencePoints, 4);

    // Activar guerra de aranceles (requiere 4 puntos)
    const tariffRes = enactImportTariffLobby(donRes.updatedState);
    assert.equal(tariffRes.success, true);
    assert.equal(tariffRes.updatedState.politicalLobby?.importTariffActive, true);
    assert.equal(tariffRes.updatedState.politicalLobby?.importTariffDaysRemaining, 30);

    // Rescate "Too Big to Fail" (emplea al 8.5% de la fuerza laboral)
    const bailoutRes = requestTooBigToFailBailout(tariffRes.updatedState);
    assert.equal(bailoutRes.success, true);
    assert.equal(bailoutRes.updatedState.politicalLobby?.bailoutRequested, true);
    assert.equal(bailoutRes.updatedState.politicalLobby?.bailoutReceivedHNL, 2500000);
    assert.ok(bailoutRes.updatedState.storeBankBalance > tariffRes.updatedState.storeBankBalance);
  });

  it('3. Dinámicas RPG para el C-Suite: Ego, Estrés, Retención y El Topo', () => {
    let state = createMockState();
    const cfo = state.cSuiteExecutives!.find((e: any) => e.role === 'CFO')!;
    assert.ok(cfo);
    assert.equal(cfo.status, 'activo');

    // Retener con coche de empresa
    const retainRes = retainCSuiteExecutive(state, cfo.id, 'coche_empresa');
    assert.equal(retainRes.success, true);
    const updatedCfo = retainRes.updatedState.cSuiteExecutives!.find((e: any) => e.id === cfo.id)!;
    assert.ok(updatedCfo.perks.includes('coche_empresa'));
    assert.ok(updatedCfo.loyalty > cfo.loyalty);

    // Simular despido hostil de ejecutivo con baja lealtad -> fuga como "El Topo"
    updatedCfo.loyalty = 15;
    const fireRes = fireCSuiteExecutive(retainRes.updatedState, updatedCfo.id);
    assert.equal(fireRes.success, true);
    assert.ok(fireRes.message.includes('El Topo'));
    assert.ok(fireRes.updatedState.publicRelations!.tweets.some(t => t.handle === '@ElPulsoHN'));
  });

  it('4. Tomas Hostiles M&A: Adquisición fraccionada y absorción al 51%', () => {
    let state = createMockState();
    state.storeBankBalance = 5000000;
    const target = state.hostileMnaTargets![0];
    assert.equal(target.playerSharesOwned, 0);

    // Comprar 52,000 acciones (52%)
    const takeoverRes = buyCompetitorShares(state, target.id, 52000);
    assert.equal(takeoverRes.success, true);
    const updatedTarget = takeoverRes.updatedState.hostileMnaTargets!.find(t => t.id === target.id)!;
    assert.equal(updatedTarget.isHostileTakeoverComplete, true);
    assert.ok(takeoverRes.message.includes('TOMA HOSTIL CONSUMADA'));
    assert.ok(takeoverRes.updatedState.marketSharePct! > 15);
  });

  it('5. Sistema de Ética y Relaciones Públicas (ESG & TwitHN)', () => {
    let state = createMockState();
    assert.ok(state.publicRelations!.tweets.length >= 2);

    // Simular avance de días para generar viralidad
    state.currentDay = 6;
    const stepRes = processDailyTycoonAdvancedStep(state);
    assert.ok(stepRes.updatedState.publicRelations!.tweets.length >= 3);
  });

  it('6. Automatización Condicional (Macros "SI [Condición] ENTONCES [Acción]")', () => {
    let state = createMockState();
    state.storeCash = 8000; // Por debajo del umbral de 15,000 en la regla
    state.storeBankBalance = 400000;

    const stepRes = processDailyTycoonAdvancedStep(state);
    assert.ok(stepRes.updatedState.storeCash >= 50000, 'La macro debe haber transferido efectivo a caja chica');
    assert.ok(stepRes.events.some(e => e.includes('Auto-Macro')));
  });

  it('7. La Deep Web: Operaciones Encubiertas y Riesgo de Allanamiento', () => {
    let state = createMockState();
    const dwRes = executeDeepWebContract(
      state,
      'sabotaje_fabrica',
      'comp_distribuidora_valle',
      'Distribuidora del Valle'
    );
    assert.equal(dwRes.success, true);
    assert.equal(dwRes.updatedState.deepWeb?.activeContracts.length, 1);
    assert.ok(dwRes.updatedState.deepWeb!.ipTraceRiskPct > 0);
  });

  it('8. Eventos Cisne Negro: Impacto en costos y duración', () => {
    let state = createMockState();
    state.activeBlackSwan = {
      id: 'bs_test',
      type: 'bloqueo_canal_panama',
      title: 'Bloqueo Marítimo de Prueba',
      description: 'Prueba de estrés',
      daysRemaining: 2,
      rawMaterialsCostMultiplier: 1.35,
      b2cSalesDemandMultiplier: 0.9,
      interestRateSpreadShock: 1.0
    };

    const stepRes = processDailyTycoonAdvancedStep(state);
    assert.equal(stepRes.updatedState.activeBlackSwan?.daysRemaining, 1);

    const step2 = processDailyTycoonAdvancedStep(stepRes.updatedState);
    assert.equal(step2.updatedState.activeBlackSwan, null, 'El cisne negro debe expirar al llegar a 0 días');
  });

  it('9. Meta-Juego Personal del CEO: Dividendos (10% SAR), Activos de Lujo y Alivio de Estrés', () => {
    let state = createMockState();
    const initPersonal = state.ceoPersonalLife!.personalBankBalanceHNL;

    // Retiro de dividendos corporativos
    const divRes = transferPersonalCeoFunds(state, 500000, 'dividendo');
    assert.equal(divRes.success, true);
    // 500,000 menos 10% SAR (50,000) = 450,000 neto
    assert.equal(divRes.updatedState.ceoPersonalLife?.personalBankBalanceHNL, initPersonal + 450000);

    // Comprar activo de lujo (Membresía Golf Club L 1,200,000)
    divRes.updatedState.ceoPersonalLife!.personalBankBalanceHNL = 2000000;
    const golfAsset = DEFAULT_LUXURY_CATALOG.find(a => a.id === 'lux_golf_club')!;
    const buyAssetRes = purchaseCeoLuxuryAsset(divRes.updatedState, golfAsset.id);
    assert.equal(buyAssetRes.success, true);
    assert.equal(buyAssetRes.updatedState.ceoPersonalLife?.angelInvestorsUnlocked, true);
    assert.ok(buyAssetRes.updatedState.ceoPersonalLife!.ceoStress < 25);
  });

  it('10. Propiedad Intelectual: Regalías Pasivas Diarias', () => {
    let state = createMockState();
    const initBank = state.storeBankBalance;
    const stepRes = processDailyTycoonAdvancedStep(state);
    assert.equal(stepRes.updatedState.storeBankBalance, initBank + 450);
    assert.equal(stepRes.updatedState.patentPortfolio?.totalRoyaltiesEarnedHNL, 450);
  });

  it('11. Terminal de Trading de Tesorería: Operaciones de Commodities y Margen', () => {
    let state = createMockState();
    const initCash = state.treasuryTrading!.tradingAccountCashHNL;

    // Comprar 10 quintales de Café
    const buyRes = tradeTreasuryCommodity(state, 'CAFE-HN', 'comprar', 10);
    assert.equal(buyRes.success, true);
    const cafeHolding = buyRes.updatedState.treasuryTrading!.holdings.find(h => h.symbol === 'CAFE-HN')!;
    assert.equal(cafeHolding.units, 10);
    assert.ok(buyRes.updatedState.treasuryTrading!.tradingAccountCashHNL < initCash);

    // Vender 5 quintales
    const sellRes = tradeTreasuryCommodity(buyRes.updatedState, 'CAFE-HN', 'vender', 5);
    assert.equal(sellRes.success, true);
    const updatedCafe = sellRes.updatedState.treasuryTrading!.holdings.find(h => h.symbol === 'CAFE-HN')!;
    assert.equal(updatedCafe.units, 5);
  });

  it('12. Reproductor Multimedia ÁureoAmp: Pistas cargadas y lista de reproducción', () => {
    assert.ok(DEFAULT_AUREOAMP_TRACKS.length >= 5);
    assert.equal(DEFAULT_AUREOAMP_TRACKS[0].title, 'Silicon Tegucigalpa 1999');
  });

});
