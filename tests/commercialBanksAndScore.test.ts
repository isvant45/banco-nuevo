import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateCompanyCreditScore,
  evaluateContractorEconomicCapacity,
  depositCashToCheckingAccount,
  withdrawCashFromCheckingAccount,
  negotiateCheckingAccountRate,
  negotiateLoanRate,
  makeExtraordinaryLoanPayment,
  processDailyLoanAmortization,
  processBiweeklyCardEvaluation,
  financeEquipmentLoan,
  liquidateTermDeposit,
  accrueTermDeposits,
  chargeCorporateCard,
  createDefaultBankRelationships,
  COMMERCIAL_BANKS_PROFILES
} from '../src/game/commercialBanksEngine';
import { 
  DEFAULT_MACHINERY_DEALERS, 
  getDealersForSector 
} from '../src/game/machineryAndSuppliersEngine';
import { DailySimulationState } from '../src/game/retroSimTypes';
import { DEFAULT_CONSTRUCTION_MATERIALS, DEFAULT_INITIAL_SAR_RECORD } from '../src/game/constructionEngine';

function createMockState(overrides: Partial<DailySimulationState> = {}): DailySimulationState {
  const base: DailySimulationState = {
    currentDay: 1,
    currentMonth: 1,
    currentYear: 2026,
    dailyHour: 9,
    isDayClosed: false,
    roleMode: 'empresario',
    lastClosingSummary: null,

    retailSector: 'constructora',
    storeName: 'Constructora Metropolitana S. de R.L.',
    storeCash: 80000,
    storeBankBalance: 1200000,
    storeReputation: 85,
    storeCleanliness: 90,
    products: [],
    supplierOrders: [],
    walkInQueue: [],
    dailyReceipts: [],
    staffCount: 12,
    dailyWages: 4800,
    dailyRent: 1500,
    monthlySalesAccumulated: 350000,

    constructionMaterials: DEFAULT_CONSTRUCTION_MATERIALS,
    constructionOrders: [],
    availableTenders: [],
    activeWorks: [],
    completedWorksHistory: [],

    sarTaxRecord: { ...DEFAULT_INITIAL_SAR_RECORD },
    fiscalSolvenciaActive: true,

    commercialBanks: createDefaultBankRelationships(1200000),
    ownedMachinery: [],
    machineryDealers: DEFAULT_MACHINERY_DEALERS,
    materialManufacturerQuotes: [],

    bankerVaultCash: 500000,
    bankerBchReserve: 540000,
    bankerTotalDeposits: 4500000,
    bankerDepositRatePct: 4.5,
    bankerMonthlyFee: 35,
    bankerAtmFee: 15,
    bankerReputation: 82,
    bankerRunRiskPct: 8,
    docketQueue: [],
    activeLoansCount: 10,
    totalLoanPortfolio: 5000000,
    delinquentLoansCount: 0,
    processedDocketsToday: 0,
    approvedAmountToday: 0,
    rejectedCountToday: 0,

    dailyHistory: []
  };

  return { ...base, ...overrides };
}

describe('Company Credit Score & Commercial Banking System', () => {
  it('calculates credit score within 300-850 range and assigns tier properly', () => {
    const state = createMockState({
      monthlySalesAccumulated: 500000,
      fiscalSolvenciaActive: true,
      storeBankBalance: 1500000,
      storeCash: 100000,
      storeReputation: 90
    });

    const score = calculateCompanyCreditScore(state);
    assert.ok(score.score >= 300 && score.score <= 850, `Score out of range: ${score.score}`);
    assert.ok(score.score >= 680, 'Strong financials should yield good score');
    assert.ok(['AAA_EXCELENTE', 'AA_MUY_BUENO', 'A_BUENO'].includes(score.tier));
    assert.strictEqual(score.autoLimitIncreaseUnlocked, true);
  });

  it('drops credit score if company has tax sanctions or high DTI', () => {
    const poorState = createMockState({
      fiscalSolvenciaActive: false,
      monthlySalesAccumulated: 10000,
      storeBankBalance: 5000,
      storeCash: 2000,
      storeReputation: 30,
      sarTaxRecord: {
        ...DEFAULT_INITIAL_SAR_RECORD,
        auditStatus: 'reparos_auditados',
        solvenciaFiscalIssued: false
      }
    });

    const score = calculateCompanyCreditScore(poorState);
    assert.ok(score.score <= 580, `Expected lower score with tax sanctions and low sales, got ${score.score}`);
    assert.ok(score.tier === 'B_ACEPTABLE' || score.tier === 'C_EN_RIESGO');
  });

  it('deposits cash to checking account and withdraws cash to register correctly', () => {
    const initial = createMockState({
      storeCash: 50000,
      storeBankBalance: 100000
    });

    // Depositar L 20,000 en Ficohsa
    const depRes = depositCashToCheckingAccount(initial, 'ficohsa', 20000);
    assert.strictEqual(depRes.success, true);
    assert.strictEqual(depRes.updatedState.storeCash, 30000);
    assert.strictEqual(depRes.updatedState.storeBankBalance, 120000);
    assert.strictEqual(depRes.updatedState.commercialBanks.ficohsa.checkingAccount?.balance, 120000);

    // Retirar L 10,000 de Ficohsa a caja
    const withRes = withdrawCashFromCheckingAccount(depRes.updatedState, 'ficohsa', 10000);
    assert.strictEqual(withRes.success, true);
    assert.strictEqual(withRes.updatedState.storeCash, 40000);
    assert.strictEqual(withRes.updatedState.storeBankBalance, 110000);
    assert.strictEqual(withRes.updatedState.commercialBanks.ficohsa.checkingAccount?.balance, 110000);

    // Intento de retiro superior al saldo
    const failWith = withdrawCashFromCheckingAccount(withRes.updatedState, 'ficohsa', 500000);
    assert.strictEqual(failWith.success, false);
  });

  it('allows rate negotiation on checking account based on credit score', () => {
    const state = createMockState({
      storeBankBalance: 2000000,
      monthlySalesAccumulated: 600000
    });

    const res = negotiateCheckingAccountRate(state, 'ficohsa', 4.0);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedState.commercialBanks.ficohsa.checkingAccount?.interestRateAnnual, 4.0);
  });

  it('allows loan interest rate discount negotiation for prime score companies', () => {
    const state = createMockState({
      storeBankBalance: 1500000,
      monthlySalesAccumulated: 800000,
      storeReputation: 95
    });

    const res = negotiateLoanRate(state, 'atlantida', 1.5);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedState.commercialBanks.atlantida.negotiatedRateDiscount, 1.5);
  });

  it('makes extraordinary principal prepayments and recalculates monthly quota', () => {
    const state = createMockState({
      storeBankBalance: 500000,
      storeCash: 50000
    });

    // Simular préstamo activo de L 300,000 en Atlántida
    state.commercialBanks.atlantida.activeLoan = {
      id: 'loan-test-1',
      bankId: 'atlantida',
      principalAmount: 300000,
      balanceRemaining: 300000,
      monthlyPayment: 14000,
      interestRateAnnual: 11.5,
      termMonthsRemaining: 24,
      purpose: 'Capital de Trabajo',
      amortizedPrincipalTotal: 0
    };

    // Abono extraordinario a capital de L 100,000
    const res = makeExtraordinaryLoanPayment(state, 'atlantida', 100000);
    assert.strictEqual(res.success, true);
    const updatedLoan = res.updatedState.commercialBanks.atlantida.activeLoan!;
    assert.strictEqual(updatedLoan.balanceRemaining, 200000);
    assert.strictEqual(updatedLoan.amortizedPrincipalTotal, 100000);
    assert.ok(updatedLoan.monthlyPayment < 14000, 'Monthly payment should be recalculated downward');
    assert.strictEqual(res.updatedState.storeBankBalance, 400000);
  });

  it('processes daily loan amortization automatically on day 15 and 30', () => {
    const state = createMockState({
      currentDay: 15,
      storeBankBalance: 200000
    });

    state.commercialBanks.ficohsa.activeLoan = {
      id: 'loan-test-ficohsa',
      bankId: 'ficohsa',
      principalAmount: 100000,
      balanceRemaining: 100000,
      monthlyPayment: 5000,
      interestRateAnnual: 12.0,
      termMonthsRemaining: 24,
      purpose: 'Equipo'
    };

    const res = processDailyLoanAmortization(state);
    assert.strictEqual(res.amortizationsDeducted, 1);
    assert.strictEqual(res.totalAmountDeducted, 5000);
    assert.strictEqual(res.updatedState.storeBankBalance, 195000);
    assert.ok(res.updatedState.commercialBanks.ficohsa.activeLoan!.balanceRemaining < 100000);
    assert.strictEqual(res.updatedState.commercialBanks.ficohsa.activeLoan!.termMonthsRemaining, 23);
  });

  it('processes biweekly credit card limit increases on day 15 or 30 for high-score companies', () => {
    const state = createMockState({
      currentDay: 15,
      monthlySalesAccumulated: 400000,
      storeBankBalance: 800000
    });

    state.commercialBanks.bac.corporateCard = {
      cardId: 'card-bac-01',
      bankId: 'bac',
      brand: 'Mastercard Corporativa BAC',
      creditLimit: 50000,
      currentBalance: 0,
      minPaymentMonthly: 0,
      interestRateAnnual: 24.0,
      lastLimitIncreaseDay: 0,
      limitIncreasesCount: 0,
      cashbackPct: 1.5
    };

    const updated = processBiweeklyCardEvaluation(state);
    const updatedCard = updated.commercialBanks.bac.corporateCard!;
    assert.ok(updatedCard.creditLimit > 50000, `Card limit should increase, got ${updatedCard.creditLimit}`);
    assert.strictEqual(updatedCard.lastLimitIncreaseDay, 15);
    assert.strictEqual(updatedCard.limitIncreasesCount, 1);
    assert.ok((updatedCard.cashbackPct ?? 0) >= 2.0);
    assert.ok(updated.creditNotifications && updated.creditNotifications.length > 0);
  });

  it('finances vehicle or heavy equipment loan directly from dealership', () => {
    const state = createMockState({
      storeBankBalance: 500000,
      storeCash: 50000,
      monthlySalesAccumulated: 500000
    });

    const equipment = {
      id: 'eq-camion-1',
      modelName: 'Hino 500 Chasis Cabina 14T',
      category: 'camion_refrigerado_3t' as const,
      icon: '🚚',
      ratingStars: 4 as const,
      priceHNL: 400000,
      hourlyFuelCost: 180
    };

    // Financiar con Ficohsa con prima del 20% (L 80,000) a 3 años
    const res = financeEquipmentLoan(
      state,
      'ficohsa',
      equipment,
      'hino_toyota_comercial',
      'Hino & Toyota Vehículos Comerciales',
      20,
      3
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedState.storeBankBalance, 420000); // 500,000 - 80,000 prima
    assert.strictEqual(res.updatedState.ownedMachinery.length, 1);
    assert.strictEqual(res.updatedState.ownedMachinery[0].modelName, 'Hino 500 Chasis Cabina 14T');
    assert.strictEqual(res.updatedState.ownedMachinery[0].financedWithBank, 'ficohsa');

    // Verificar préstamo generado
    const activeLoan = res.updatedState.commercialBanks.ficohsa.activeLoan!;
    assert.ok(activeLoan, 'Active loan must exist');
    assert.strictEqual(activeLoan.principalAmount, 320000); // 400,000 - 80,000
    assert.strictEqual(activeLoan.balanceRemaining, 320000);
    assert.strictEqual(activeLoan.loanType, 'vehicular_equipo');
    assert.strictEqual(activeLoan.termMonthsRemaining, 36);
    assert.ok(activeLoan.monthlyPayment > 0);
  });

  it('filters equipment dealers appropriately by sector', () => {
    const miniDealers = getDealersForSector(DEFAULT_MACHINERY_DEALERS, 'minimarket');
    assert.ok(miniDealers.some(d => d.id === 'hino_toyota_comercial'), 'Supermarkets should see Hino & Toyota');

    const foodDealers = getDealersForSector(DEFAULT_MACHINERY_DEALERS, 'bar_restaurante');
    assert.ok(foodDealers.some(d => d.id === 'frio_movil_gastronomia'), 'Restaurants should see Frio Movil');

    const constDealers = getDealersForSector(DEFAULT_MACHINERY_DEALERS, 'constructora');
    assert.ok(constDealers.some(d => d.id === 'covesa_cat'), 'Constructora should see COVESA CAT');
    assert.ok(constDealers.some(d => d.id === 'camosa_komatsu'), 'Constructora should see CAMOSA Komatsu');
  });

  it('liquidates matured DPF and accrues daily interest properly', () => {
    const state = createMockState({
      storeBankBalance: 100000
    });

    state.commercialBanks.occidente.termDeposits = [{
      id: 'dpf-occ-01',
      bankId: 'occidente',
      principalAmount: 200000,
      annualRatePct: 8.5,
      termDays: 90,
      daysRemaining: 1,
      accruedInterest: 0
    }];

    // Devengo de intereses por 1 día (el DPF vence)
    const accrued = accrueTermDeposits(state, 1);
    assert.strictEqual(accrued.maturedDepositsCount, 1);
    assert.ok(accrued.interestAccruedTotal > 0);
    assert.strictEqual(accrued.updatedState.commercialBanks.occidente.termDeposits[0].daysRemaining, 0);

    // Liquidar DPF vencido
    const res = liquidateTermDeposit(accrued.updatedState, 'occidente', 'dpf-occ-01', false);
    assert.strictEqual(res.success, true);
    assert.ok(res.totalReceived >= 200000);
    assert.strictEqual(res.updatedState.storeBankBalance, 100000 + res.totalReceived);
    assert.strictEqual(res.updatedState.commercialBanks.occidente.termDeposits.length, 0);
  });

  it('charges corporate credit card directly for purchases and accumulates cashback', () => {
    const state = createMockState();
    state.commercialBanks.bac.corporateCard = {
      cardId: 'card-bac-test',
      bankId: 'bac',
      brand: 'Mastercard Corporativa BAC',
      creditLimit: 100000,
      currentBalance: 10000,
      minPaymentMonthly: 500,
      interestRateAnnual: 22.0,
      cashbackPct: 2.0
    };

    const res = chargeCorporateCard(state, 'bac', 25000, 'Lote de Cemento');
    assert.strictEqual(res.success, true);
    const updatedCard = res.updatedState.commercialBanks.bac.corporateCard!;
    assert.strictEqual(updatedCard.currentBalance, 35000);
    assert.strictEqual(updatedCard.minPaymentMonthly, Math.round(35000 * 0.05));
  });
});
