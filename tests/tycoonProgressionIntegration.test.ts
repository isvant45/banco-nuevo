import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  calculateCompanyValuation,
  getOrCreateCapTable,
  generateEquityRoundOffers,
  acceptEquityOffer,
  executeShareBuyback,
  distributeDividendsAtMonthEnd,
  evaluateIpoEligibility,
  executeIpo
} from '../src/game/equityMarketEngine';
import {
  NPC_BANK_PROFILES,
  evaluateNpcCreditAuction,
  disburseNpcLoan,
  payNpcLoanQuota,
  applySharkDailyRetention
} from '../src/game/npcBankingEngine';
import {
  CSUITE_CATALOG,
  hireExecutive,
  fireExecutive,
  calculateThreeTurnProjections,
  processMonthlyCSuitePayroll,
  injectDirtyMoneyClandestine,
  processUifTurnAudit
} from '../src/game/cSuiteEngine';
import { DailySimulationState } from '../src/game/retroSimTypes';

function createMockSimulationState(): DailySimulationState {
  return {
    currentDay: 15,
    currentMonth: 3,
    currentYear: 2026,
    dailyHour: 14,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,
    retailSector: 'constructora',
    storeName: 'Constructora Lempira S.A.',
    storeCash: 500000,
    storeBankBalance: 2500000,
    storeReputation: 85,
    storeCleanliness: 90,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 15,
    dailyWages: 6000,
    dailyRent: 2000,
    monthlySalesAccumulated: 850000,
    smartBankOffers: [],
    smartBankCreditRating: 'AA',
    constructionMaterials: [] as any,
    constructionOrders: [],
    availableTenders: [],
    activeWorks: [],
    completedWorksHistory: [],
    sarTaxRecord: {
      taxYear: 2026,
      grossRevenues: 1200000,
      deductibleMaterialsExpenses: 400000,
      deductiblePayrollExpenses: 300000,
      deductibleOtherCosts: 100000,
      netTaxableIncome: 400000,
      taxRatePct: 25,
      isrTaxAmount: 100000,
      hasPendingDeclaration: false,
      pendingTaxDue: 0,
      historicalAuditCount: 0,
      fiscalSolvenciaActive: true,
      solvenciaFiscalIssued: true,
      complianceScore: 95,
      isPaid: true,
      auditStatus: 'aprobada_conforme',
      solvenciaExpirationYear: 2027,
      auditNotes: []
    } as any,
    fiscalSolvenciaActive: true,
    commercialBanks: {
      ficohsa: {
        bankId: 'ficohsa',
        bankName: 'Banco Ficohsa',
        trustScore: 80,
        checkingAccount: {
          accountNumber: 'FIC-CHK-1001',
          balance: 2500000,
          interestRateAnnual: 3.5,
          monthlyFee: 50
        }
      }
    } as any,
    ownedMachinery: [
      {
        id: 'mach_1',
        machineryId: 'excavadora_cat_320',
        name: 'Excavadora CAT 320',
        purchaseCost: 1200000,
        purchasePrice: 1200000,
        conditionPct: 90,
        currentValueHNL: 1080000,
        status: 'disponible'
      }
    ] as any,
    machineryDealers: [],
    materialManufacturerQuotes: [],
    bankerVaultCash: 0,
    bankerBchReserve: 0,
    bankerTotalDeposits: 0,
    bankerDepositRatePct: 4,
    bankerMonthlyFee: 0,
    bankerAtmFee: 0,
    bankerReputation: 80,
    bankerRunRiskPct: 5,
    docketQueue: [],
    activeLoansCount: 0,
    totalLoanPortfolio: 0,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,
    realEstateCollaterals: [
      {
        id: 'col_terreno_valle',
        propertyName: 'Lote Industrial El Polvorín',
        location: 'San Pedro Sula',
        appraisalValueHNL: 3500000,
        marketValueHNL: 3500000,
        isPledged: false,
        isLockedForSale: false,
        appraisalDateMonth: 1,
        appraisalDateYear: 2026,
        status: 'libre_gravamen'
      }
    ] as any,
    simulatedEmails: [],
    transactionVouchers: [],
    dynamicBankOffers: [],
    fiscalPeriods: [],
    erpCorporateState: {} as any,
    macroEconomyState: {} as any,
    dailyHistory: [],
    historicalProfits: [180000, 220000, 250000],
    companyCreditProfile: {
      score: 720,
      classification: 'A',
      ratingCategory: 'Riesgo Mínimo',
      maxCreditLimitHNL: 5000000,
      recommendedRatePct: 9.5
    } as any
  };
}

describe('Motor de Equity, Valuación y Salida a Bolsa (IPO)', () => {
  test('calculateCompanyValuation calcula correctamente múltiplo de utilidades 10x más activos netos', () => {
    const state = createMockSimulationState();
    const val = calculateCompanyValuation(state);

    assert.ok(val.valuationHNL > 0, 'La valuación debe ser positiva');
    assert.strictEqual(val.averageMonthlyNetProfitHNL, Math.round((180000 + 220000 + 250000) / 3));
    assert.ok(val.breakdown.cashAndBanks >= 3000000, 'Debe incluir caja y bancos');
    assert.ok(val.breakdown.collaterals >= 3500000, 'Debe incluir colaterales');
    assert.ok(val.valuationHNL >= val.netEquityHNL, 'La valuación debe superar el equity neto');
  });

  test('getOrCreateCapTable auto-inicializa al fundador al 100%', () => {
    const state = createMockSimulationState();
    const cap = getOrCreateCapTable(state);

    assert.strictEqual(cap.length, 1);
    assert.strictEqual(cap[0].isPlayer, true);
    assert.strictEqual(cap[0].sharePercentage, 100);
  });

  test('generateEquityRoundOffers y acceptEquityOffer inyectan liquidez y actualizan Cap Table', () => {
    const state = createMockSimulationState();
    const offers = generateEquityRoundOffers(state);
    assert.ok(offers.length >= 3, 'Debe generar al menos 3 rondas (Ángel, VC, PE)');

    const targetOffer = offers[0]; // Ángel (10%)
    const res = acceptEquityOffer(state, targetOffer.id, 'bank');

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedState.storeBankBalance, state.storeBankBalance + targetOffer.cashInjectionHNL);
    
    // Validar Cap Table
    const updatedCap = res.updatedState.capTable || [];
    const founder = updatedCap.find(i => i.isPlayer);
    const investor = updatedCap.find(i => !i.isPlayer);

    assert.ok(founder);
    assert.ok(investor);
    assert.strictEqual(founder?.sharePercentage, 90);
    assert.strictEqual(investor?.sharePercentage, 10);
    assert.ok(res.voucher, 'Debe emitir comprobante oficial de inyección');
  });

  test('executeShareBuyback recompra participación y restituye el 100% al fundador', () => {
    const state = createMockSimulationState();
    const offers = generateEquityRoundOffers(state);
    const { updatedState: stateWithInvestor } = acceptEquityOffer(state, offers[0].id, 'bank');

    const investor = stateWithInvestor.capTable?.find(i => !i.isPlayer);
    assert.ok(investor);

    const buybackRes = executeShareBuyback(stateWithInvestor, investor!.id);
    assert.strictEqual(buybackRes.success, true);

    const founder = buybackRes.updatedState.capTable?.find(i => i.isPlayer);
    assert.strictEqual(founder?.sharePercentage, 100);
    assert.strictEqual(buybackRes.updatedState.capTable?.length, 1);
  });

  test('distributeDividendsAtMonthEnd reparte pro-rata a inversionistas externos si hay utilidad', () => {
    const state = createMockSimulationState();
    const offers = generateEquityRoundOffers(state);
    const { updatedState: stateWithInvestor } = acceptEquityOffer(state, offers[0].id, 'bank'); // 10%

    const monthlyProfit = 100000;
    const divRes = distributeDividendsAtMonthEnd(stateWithInvestor, monthlyProfit);

    // 40% de 100k = 40,000 pool. Inversionista tiene 10% = 4,000 Lempiras.
    assert.strictEqual(divRes.totalDividendsPaid, 4000);
    assert.strictEqual(divRes.distributions.length, 1);
    assert.strictEqual(divRes.updatedState.storeBankBalance, stateWithInvestor.storeBankBalance - 4000);
  });

  test('evaluateIpoEligibility y executeIpo completan la salida a bolsa (Endgame)', () => {
    const state = createMockSimulationState();
    // Aumentar histórico y activos para superar L 10 Millones
    state.historicalProfits = [600000, 750000, 800000];
    state.realEstateCollaterals!.push({
      id: 'col_edificio_corporativo',
      propertyName: 'Torre Corporativa Morazán',
      location: 'Tegucigalpa',
      appraisalValueHNL: 8000000,
      marketValueHNL: 8000000,
      isPledged: false,
      isLockedForSale: false,
      appraisalDateMonth: 1,
      appraisalDateYear: 2026,
      status: 'libre_gravamen'
    } as any);

    const eligibility = evaluateIpoEligibility(state);
    assert.strictEqual(eligibility.isEligible, true);
    assert.strictEqual(eligibility.requirements.minValuationMet, true);
    assert.strictEqual(eligibility.requirements.solvenciaFiscalActive, true);

    const ipoRes = executeIpo(state, 'LEMPIRA');
    assert.strictEqual(ipoRes.success, true);
    assert.strictEqual(ipoRes.updatedState.ipoStatus?.isIpoCompleted, true);
    assert.strictEqual(ipoRes.updatedState.ipoStatus?.tickerSymbol, 'LEMPIRA');
    assert.ok(ipoRes.updatedState.storeBankBalance > state.storeBankBalance, 'Debe haber levantado capital fresco');
  });
});

describe('Subasta Instantánea de Crédito & Banca Rival NPC', () => {
  test('evaluateNpcCreditAuction evalúa los 3 bancos con cuota francesa y requisitos diferenciados', () => {
    const state = createMockSimulationState();
    const auction = evaluateNpcCreditAuction(state, 500000, 36, ['col_terreno_valle']);

    assert.strictEqual(auction.length, 3);
    const bNacional = auction.find(b => b.bankId === 'banco_nacional');
    const bIntermedio = auction.find(b => b.bankId === 'banco_privado_intermedio');
    const tiburon = auction.find(b => b.bankId === 'tiburon_prestamista');

    assert.ok(bNacional);
    assert.ok(bIntermedio);
    assert.ok(tiburon);

    // Banco Nacional aprueba porque Score > 700 y colateral aportado (L 3.5M) supera el 150% (L 750k)
    assert.strictEqual(bNacional?.isApproved, true);
    assert.strictEqual(bNacional?.interestRateAnnual, 8.5);

    // Tiburón siempre aprueba con tasa del 34%
    assert.strictEqual(tiburon?.isApproved, true);
    assert.strictEqual(tiburon?.interestRateAnnual, 34.0);
  });

  test('disburseNpcLoan acredita fondos y crea crédito activo', () => {
    const state = createMockSimulationState();
    const res = disburseNpcLoan(state, 'banco_privado_intermedio', 300000, 24, 'bank');

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedState.storeBankBalance, state.storeBankBalance + 300000);
    assert.strictEqual(res.updatedState.npcLoans?.length, 1);
    assert.strictEqual(res.updatedState.npcLoans?.[0].principalAmount, 300000);
  });

  test('payNpcLoanQuota amortiza la cuota o cancela el saldo total', () => {
    const state = createMockSimulationState();
    const { updatedState: withLoan } = disburseNpcLoan(state, 'banco_privado_intermedio', 200000, 12, 'bank');
    const loan = withLoan.npcLoans![0];

    const payRes = payNpcLoanQuota(withLoan, loan.id, false, 'bank');
    assert.strictEqual(payRes.success, true);
    assert.ok(payRes.updatedState.npcLoans![0].balanceRemaining < 200000);
  });

  test('applySharkDailyRetention confisca el 50% de las ventas brutas diarias si está en mora con El Tiburón', () => {
    const state = createMockSimulationState();
    state.npcLoans = [
      {
        id: 'loan_shark_1',
        bankId: 'tiburon_prestamista',
        bankName: 'Prestamista Capital "El Tiburón"',
        principalAmount: 100000,
        balanceRemaining: 100000,
        monthlyQuota: 12000,
        interestRateAnnual: 34,
        termMonthsRemaining: 12,
        isSharkLoan: true,
        sharkBlockedCash: false,
        sharkRetainedAmount: 0,
        isDelinquent: true
      }
    ];

    state.dailyReceipts = [
      { id: 'rec_1', customerId: 'c1', totalAmount: 40000, timestamp: '10:00' } as any
    ];

    const updated = applySharkDailyRetention(state);
    const sharkLoan = updated.npcLoans![0];

    // Debe retener el 50% de 40,000 = 20,000 Lempiras
    assert.strictEqual(sharkLoan.sharkBlockedCash, true);
    assert.strictEqual(sharkLoan.sharkRetainedAmount, 20000);
  });
});

describe('Dirección Ejecutiva C-Suite, RRHH y Escudo Legal UIF', () => {
  test('hireExecutive incorpora ejecutivos y activa buff de Credit Score (+50 CFO)', () => {
    const state = createMockSimulationState();
    const originalScore = state.companyCreditProfile?.score || 720;

    const res = hireExecutive(state, 'CFO');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedState.cSuiteStaff?.includes('CFO'), true);
    assert.strictEqual(res.updatedState.companyCreditProfile?.score, originalScore + 50);
  });

  test('calculateThreeTurnProjections proyecta 3 meses de flujo de caja y detecta runway', () => {
    const state = createMockSimulationState();
    state.cSuiteStaff = ['CFO'];

    const proj = calculateThreeTurnProjections(state);
    assert.strictEqual(proj.projections.length, 3);
    assert.ok(proj.estimatedRunwayMonths > 0);
    assert.ok(proj.cfoAdvice.length > 0);
  });

  test('processMonthlyCSuitePayroll deduce sueldos o genera renuncias masivas por impago', () => {
    const state = createMockSimulationState();
    state.cSuiteStaff = ['CFO', 'ABOGADO']; // 25k + 20k = 45k
    const initialBank = state.storeBankBalance;

    const payRes = processMonthlyCSuitePayroll(state);
    assert.strictEqual(payRes.totalPayrollPaid, 45000);
    assert.strictEqual(payRes.updatedState.storeBankBalance, initialBank - 45000);
  });

  test('injectDirtyMoneyClandestine aumenta efectivo y sospecha UIF', () => {
    const state = createMockSimulationState();
    const initialCash = state.storeCash;

    const res = injectDirtyMoneyClandestine(state, 150000, 35);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedState.storeCash, initialCash + 150000);
    assert.strictEqual(res.updatedState.uifSuspicionScore, 35);
  });
});
